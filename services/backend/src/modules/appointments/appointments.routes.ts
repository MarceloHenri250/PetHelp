import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type { PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../../db/index.js';
import type { AuthRequest } from '../../middlewares/auth.js';
import { requireAuth } from '../../middlewares/auth.js';
import { findClinicByUserId, findTutorByUserId, findVeterinarianByUserId } from '../users/users.service.js';

type AppointmentRow = RowDataPacket & {
  id: string;
  pet_id: string;
  pet_name: string;
  tutor_id: string;
  veterinarian_id: string | null;
  clinic_id: string | null;
  clinic_name: string | null;
  veterinarian_name: string | null;
  veterinarian_email: string | null;
  veterinarian_phone: string | null;
  appointment_date: Date | string;
  appointment_time: string;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
};

type DbClient = Pick<PoolConnection, 'execute' | 'query'>;

const router = Router();

function asTrimmedString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function formatDate(value: Date | string) {
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

async function loadPetById(db: DbClient, petId: string) {
  const [rows] = await db.query<RowDataPacket[]>(
    'SELECT id, current_tutor_id, linked_clinic_id, name FROM pets WHERE id = ? LIMIT 1',
    [petId]
  );

  return rows[0] as
    | { id: string; current_tutor_id: string | null; linked_clinic_id: string | null; name: string }
    | undefined;
}

async function resolveCurrentTutorId(user: AuthRequest['user']) {
  if (user?.userType !== 'tutor') return null;
  const tutor = await findTutorByUserId(user.id);
  return tutor?.id ?? null;
}

async function resolveCurrentClinicId(user: AuthRequest['user']) {
  if (user?.userType !== 'clinic') return null;
  const clinic = await findClinicByUserId(user.id);
  return clinic?.id ?? null;
}

async function resolveCurrentVeterinarianId(user: AuthRequest['user']) {
  if (user?.userType !== 'veterinarian') return null;
  const veterinarian = await findVeterinarianByUserId(user.id);
  return veterinarian?.id ?? null;
}

function normalizeAppointment(row: AppointmentRow) {
  return {
    id: row.id,
    petId: row.pet_id,
    petName: row.pet_name,
    tutorId: row.tutor_id,
    veterinarianId: row.veterinarian_id ?? undefined,
    clinicId: row.clinic_id ?? undefined,
    clinicName: row.clinic_name ?? undefined,
    veterinarianName: row.veterinarian_name ?? undefined,
    veterinarianEmail: row.veterinarian_email ?? undefined,
    veterinarianPhone: row.veterinarian_phone ?? undefined,
    date: formatDate(row.appointment_date),
    time: row.appointment_time,
    reason: row.reason,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function loadAppointmentById(db: DbClient, id: string) {
  const [rows] = await db.query<AppointmentRow[]>(
    `
      SELECT
        id,
        pet_id,
        pet_name,
        tutor_id,
        veterinarian_id,
        clinic_id,
        clinic_name,
        veterinarian_name,
        veterinarian_email,
        veterinarian_phone,
        appointment_date,
        appointment_time,
        reason,
        status,
        created_at,
        updated_at
      FROM appointments
      WHERE id = ?
      LIMIT 1
    `,
    [id]
  );

  return rows[0] ?? null;
}

async function canAccessPet(user: AuthRequest['user'], petId: string) {
  const pet = await loadPetById(pool, petId);
  if (!pet) return { allowed: false, status: 404, message: 'Pet not found' as const };

  if (user?.userType === 'tutor') {
    const tutorId = await resolveCurrentTutorId(user);
    if (!tutorId || pet.current_tutor_id !== tutorId) {
      return { allowed: false, status: 403, message: 'Forbidden' as const };
    }
  }

  if (user?.userType === 'clinic') {
    const clinicId = await resolveCurrentClinicId(user);
    if (!clinicId || pet.linked_clinic_id !== clinicId) {
      return { allowed: false, status: 403, message: 'Forbidden' as const };
    }
  }

  if (user?.userType === 'veterinarian') {
    const veterinarianId = await resolveCurrentVeterinarianId(user);
    if (!veterinarianId) {
      return { allowed: false, status: 403, message: 'Forbidden' as const };
    }
  }

  return { allowed: true, pet };
}

async function listAppointmentsForUser(user: AuthRequest['user']) {
  if (user?.userType === 'tutor') {
    const tutorId = await resolveCurrentTutorId(user);
    if (!tutorId) return [];
    const [rows] = await pool.query<AppointmentRow[]>(
      'SELECT * FROM appointments WHERE tutor_id = ? ORDER BY appointment_date DESC, appointment_time DESC',
      [tutorId]
    );
    return rows;
  }

  if (user?.userType === 'clinic') {
    const clinicId = await resolveCurrentClinicId(user);
    if (!clinicId) return [];
    const [rows] = await pool.query<AppointmentRow[]>(
      'SELECT * FROM appointments WHERE clinic_id = ? ORDER BY appointment_date DESC, appointment_time DESC',
      [clinicId]
    );
    return rows;
  }

  if (user?.userType === 'veterinarian') {
    const veterinarianId = await resolveCurrentVeterinarianId(user);
    if (!veterinarianId) return [];
    const [rows] = await pool.query<AppointmentRow[]>(
      'SELECT * FROM appointments WHERE veterinarian_id = ? ORDER BY appointment_date DESC, appointment_time DESC',
      [veterinarianId]
    );
    return rows;
  }

  return [];
}

router.use(requireAuth);

router.get('/me', async (req: AuthRequest, res, next) => {
  try {
    const rows = await listAppointmentsForUser(req.user);
    res.json({ data: rows.map(normalizeAppointment) });
  } catch (error) {
    next(error);
  }
});

router.get('/pet/:petId', async (req: AuthRequest, res, next) => {
  try {
    const access = await canAccessPet(req.user, String(req.params.petId));
    if (!access.allowed) {
      res.status(access.status ?? 403).json({ message: access.message });
      return;
    }

    const [rows] = await pool.query<AppointmentRow[]>(
      'SELECT * FROM appointments WHERE pet_id = ? ORDER BY appointment_date DESC, appointment_time DESC',
      [String(req.params.petId)]
    );

    res.json({ data: rows.map(normalizeAppointment) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req: AuthRequest, res, next) => {
  const connection = await pool.getConnection();

  try {
    const body = req.body ?? {};
    const petId = asTrimmedString(body.petId);
    const date = asTrimmedString(body.date ?? body.appointmentDate);
    const time = asTrimmedString(body.time ?? body.appointmentTime);
    const reason = asTrimmedString(body.reason);
    const targetType = asTrimmedString(body.targetType).toLowerCase();
    const clinicIdInput = asTrimmedString(body.clinicId);
    const veterinarianIdInput = asTrimmedString(body.veterinarianId);
    const clinicName = asTrimmedString(body.clinicName) || null;
    const veterinarianName = asTrimmedString(body.veterinarianName) || null;
    const veterinarianEmail = asTrimmedString(body.veterinarianEmail) || null;
    const veterinarianPhone = asTrimmedString(body.veterinarianPhone) || null;

    if (!petId || !date || !time || !reason) {
      res.status(400).json({ message: 'petId, date, time and reason are required' });
      return;
    }

    const resolvedTargetType = ['clinic', 'veterinarian'].includes(targetType)
      ? targetType
      : veterinarianIdInput
        ? 'veterinarian'
        : clinicIdInput
          ? 'clinic'
          : '';

    if (!resolvedTargetType) {
      res.status(400).json({ message: 'targetType, clinicId or veterinarianId are required' });
      return;
    }

    const access = await canAccessPet(req.user, petId);
    if (!access.allowed) {
      res.status(access.status ?? 403).json({ message: access.message });
      return;
    }

    const tutorId = await resolveCurrentTutorId(req.user);
    const clinicId = await resolveCurrentClinicId(req.user);
    const explicitTutorId = asTrimmedString(body.tutorId);
    const nextTutorId = tutorId ?? (explicitTutorId || access.pet?.current_tutor_id || null);

    if (!nextTutorId) {
      res.status(400).json({ message: 'Tutor could not be resolved for appointment creation' });
      return;
    }

    const nextClinicId = resolvedTargetType === 'veterinarian' ? null : (clinicId ?? clinicIdInput ?? null);
    const nextVeterinarianId = resolvedTargetType === 'clinic' ? null : (veterinarianIdInput || null);

    if (resolvedTargetType === 'clinic' && !nextClinicId) {
      res.status(400).json({ message: 'clinicId is required for clinic appointments' });
      return;
    }

    if (resolvedTargetType === 'veterinarian' && !nextVeterinarianId) {
      res.status(400).json({ message: 'veterinarianId is required for veterinarian appointments' });
      return;
    }

    await connection.beginTransaction();

    const id = randomUUID();
    await connection.execute(
      `
        INSERT INTO appointments (
          id,
          pet_id,
          pet_name,
          tutor_id,
          veterinarian_id,
          clinic_id,
          clinic_name,
          veterinarian_name,
          veterinarian_email,
          veterinarian_phone,
          appointment_date,
          appointment_time,
          reason,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        petId,
        access.pet?.name ?? (asTrimmedString(body.petName) || ''),
        nextTutorId,
        nextVeterinarianId,
        nextClinicId,
        resolvedTargetType === 'veterinarian' ? null : clinicName,
        resolvedTargetType === 'clinic' ? null : veterinarianName,
        resolvedTargetType === 'clinic' ? null : veterinarianEmail,
        resolvedTargetType === 'clinic' ? null : veterinarianPhone,
        date,
        time,
        reason,
        asTrimmedString(body.status) === 'completed' || asTrimmedString(body.status) === 'cancelled'
          ? asTrimmedString(body.status)
          : 'scheduled',
      ]
    );

    await connection.commit();

    const created = await loadAppointmentById(pool, id);
    if (!created) {
      res.status(500).json({ message: 'Appointment creation failed' });
      return;
    }

    res.status(201).json({ data: normalizeAppointment(created) });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

router.patch('/:id', async (req: AuthRequest, res, next) => {
  const connection = await pool.getConnection();

  try {
    const existing = await loadAppointmentById(connection, String(req.params.id));
    if (!existing) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    const access = await canAccessPet(req.user, existing.pet_id);
    if (!access.allowed) {
      res.status(access.status ?? 403).json({ message: access.message });
      return;
    }

    const body = req.body ?? {};
    const assignments: string[] = [];
    const values: Array<string | null> = [];

    if (body.date !== undefined || body.appointmentDate !== undefined) {
      const nextDate = asTrimmedString(body.date ?? body.appointmentDate);
      if (!nextDate) {
        res.status(400).json({ message: 'date cannot be empty' });
        return;
      }
      assignments.push('appointment_date = ?');
      values.push(nextDate);
    }

    if (body.time !== undefined || body.appointmentTime !== undefined) {
      const nextTime = asTrimmedString(body.time ?? body.appointmentTime);
      if (!nextTime) {
        res.status(400).json({ message: 'time cannot be empty' });
        return;
      }
      assignments.push('appointment_time = ?');
      values.push(nextTime);
    }

    if (body.reason !== undefined) {
      const nextReason = asTrimmedString(body.reason);
      if (!nextReason) {
        res.status(400).json({ message: 'reason cannot be empty' });
        return;
      }
      assignments.push('reason = ?');
      values.push(nextReason);
    }

    if (body.status !== undefined) {
      const nextStatus = asTrimmedString(body.status);
      if (!['scheduled', 'completed', 'cancelled'].includes(nextStatus)) {
        res.status(400).json({ message: 'status is invalid' });
        return;
      }
      assignments.push('status = ?');
      values.push(nextStatus);
    }

    if (body.veterinarianName !== undefined) {
      assignments.push('veterinarian_name = ?');
      values.push(asTrimmedString(body.veterinarianName) || null);
    }

    if (body.veterinarianEmail !== undefined) {
      assignments.push('veterinarian_email = ?');
      values.push(asTrimmedString(body.veterinarianEmail) || null);
    }

    if (body.veterinarianPhone !== undefined) {
      assignments.push('veterinarian_phone = ?');
      values.push(asTrimmedString(body.veterinarianPhone) || null);
    }

    if (assignments.length === 0) {
      res.status(400).json({ message: 'No fields provided to update' });
      return;
    }

    values.push(String(req.params.id));
    await connection.beginTransaction();

    const [result] = await connection.execute<ResultSetHeader>(
      `UPDATE appointments SET ${assignments.join(', ')} WHERE id = ?`,
      values
    );

    if ((result.affectedRows ?? 0) === 0) {
      await connection.rollback();
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    await connection.commit();

    const updated = await loadAppointmentById(pool, String(req.params.id));
    if (!updated) {
      res.status(500).json({ message: 'Appointment update failed' });
      return;
    }

    res.json({ data: normalizeAppointment(updated) });
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
});

router.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const existing = await loadAppointmentById(pool, String(req.params.id));
    if (!existing) {
      res.status(404).json({ message: 'Appointment not found' });
      return;
    }

    const access = await canAccessPet(req.user, existing.pet_id);
    if (!access.allowed) {
      res.status(access.status ?? 403).json({ message: access.message });
      return;
    }

    await pool.execute('DELETE FROM appointments WHERE id = ?', [String(req.params.id)]);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;


