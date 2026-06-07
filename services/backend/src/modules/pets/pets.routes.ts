import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import type { AuthRequest } from '../../middlewares/auth.js';
import { requireAuth } from '../../middlewares/auth.js';
import type { ResultSetHeader, RowDataPacket } from 'mysql2';
import { pool } from '../../db/index.js';

type PetRow = RowDataPacket & {
  id: string;
  owner_id: string;
  linked_clinic_id: string | null;
  name: string;
  species: string | null;
  breed: string;
  age: string;
  weight: string;
  photo: string | null;
  allergies: string | null;
  conditions: string | null;
  initial_health_history: string | null;
  created_at: Date;
  updated_at: Date;
};

const petSelectFields = `
  id,
  owner_id AS ownerId,
  linked_clinic_id AS linkedClinicId,
  name,
  species,
  breed,
  age,
  weight,
  photo,
  allergies,
  conditions,
  initial_health_history AS initialHealthHistory,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

function parseNullableJson(value: unknown): string | null {
  if (value === undefined) {
    return null;
  }

  if (value === null || value === '') {
    return null;
  }

  if (Array.isArray(value)) {
    return JSON.stringify(value);
  }

  return JSON.stringify(value);
}

function normalizePet(row: PetRow) {
  return {
    id: row.id,
    ownerId: row.owner_id,
    linkedClinicId: row.linked_clinic_id,
    name: row.name,
    species: row.species,
    breed: row.breed,
    age: row.age,
    weight: row.weight,
    photo: row.photo,
    allergies: row.allergies ? JSON.parse(row.allergies) : null,
    conditions: row.conditions ? JSON.parse(row.conditions) : null,
    initialHealthHistory: row.initial_health_history,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const petsRouter = Router();

// protect all pet routes
petsRouter.use(requireAuth);

petsRouter.get('/', async (req: AuthRequest, res, next) => {
  try {
    const { ownerId: qOwnerId, clinicId: qClinicId } = req.query;

    // if no query provided, default to the authenticated user's scope
    let ownerId = typeof qOwnerId === 'string' ? qOwnerId : null;
    let clinicId = typeof qClinicId === 'string' ? qClinicId : null;

    if (!ownerId && !clinicId) {
      const user = req.user;
      if (user.userType === 'owner') ownerId = user.id;
      if (user.userType === 'clinic') clinicId = user.id;
    }

    const conditions: string[] = [];
    const values: Array<string> = [];

    if (typeof ownerId === 'string' && ownerId.length > 0) {
      conditions.push('owner_id = ?');
      values.push(ownerId);
    }

    if (typeof clinicId === 'string' && clinicId.length > 0) {
      conditions.push('linked_clinic_id = ?');
      values.push(clinicId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const [rows] = await pool.query<PetRow[]>(`SELECT ${petSelectFields} FROM pets ${whereClause} ORDER BY created_at DESC`, values);

    res.json({
      data: rows.map(normalizePet),
    });
  } catch (error) {
    next(error);
  }
});

petsRouter.get('/:id', async (req: AuthRequest, res, next) => {
  try {
    const petId = String(req.params.id);
    const [rows] = await pool.query<PetRow[]>(`SELECT ${petSelectFields} FROM pets WHERE id = ? LIMIT 1`, [petId]);

    if (rows.length === 0) {
      res.status(404).json({ message: 'Pet not found' });
      return;
    }

    // authorization: owners see their pets, clinics see linked pets
    const user = req.user;
    const row = rows[0];
    if (user.userType === 'owner' && row.owner_id !== user.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    if (user.userType === 'clinic' && row.linked_clinic_id !== user.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    res.json({ data: normalizePet(rows[0]) });
  } catch (error) {
    next(error);
  }
});

petsRouter.post('/', async (req: AuthRequest, res, next) => {
  try {
    const {
      ownerId: bodyOwnerId,
      name,
      species,
      breed,
      age,
      weight,
      photo = null,
      linkedClinicId = null,
      allergies = null,
      conditions = null,
      initialHealthHistory = null,
    } = req.body ?? {};

    const user = req.user;
    // determine ownerId: owners create their own pets; clinics must provide ownerId
    const ownerId = user.userType === 'owner' ? user.id : bodyOwnerId;

    if (!ownerId || !name || !breed || !age || !weight) {
      res.status(400).json({
        message: 'ownerId, name, breed, age and weight are required',
      });
      return;
    }

    const id = randomUUID();
    await pool.execute(
      `
        INSERT INTO pets (
          id,
          owner_id,
          linked_clinic_id,
          name,
          species,
          breed,
          age,
          weight,
          photo,
          allergies,
          conditions,
          initial_health_history
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        ownerId,
        linkedClinicId,
        name,
        species ?? null,
        breed,
        age,
        weight,
        photo,
        parseNullableJson(allergies),
        parseNullableJson(conditions),
        initialHealthHistory,
      ]
    );

    const [rows] = await pool.query<PetRow[]>(`SELECT ${petSelectFields} FROM pets WHERE id = ? LIMIT 1`, [id]);

    res.status(201).json({ data: normalizePet(rows[0]) });
  } catch (error) {
    next(error);
  }
});

petsRouter.patch('/:id', async (req: AuthRequest, res, next) => {
  try {
    const user = req.user;
    const updates = req.body ?? {};
    const allowedFields = [
      'ownerId',
      'linkedClinicId',
      'name',
      'species',
      'breed',
      'age',
      'weight',
      'photo',
      'allergies',
      'conditions',
      'initialHealthHistory',
    ] as const;

    const assignments: string[] = [];
    const values: Array<string | null> = [];

    for (const field of allowedFields) {
      if (updates[field] === undefined) {
        continue;
      }

      const columnMap: Record<(typeof allowedFields)[number], string> = {
        ownerId: 'owner_id',
        linkedClinicId: 'linked_clinic_id',
        name: 'name',
        species: 'species',
        breed: 'breed',
        age: 'age',
        weight: 'weight',
        photo: 'photo',
        allergies: 'allergies',
        conditions: 'conditions',
        initialHealthHistory: 'initial_health_history',
      };

      assignments.push(`${columnMap[field]} = ?`);
      values.push(
        field === 'allergies' || field === 'conditions'
          ? parseNullableJson(updates[field])
          : (updates[field] as string | null)
      );
    }

    if (assignments.length === 0) {
      res.status(400).json({ message: 'No fields provided to update' });
      return;
    }

    values.push(String(req.params.id));

    // ensure the requester is allowed to update this pet
    const [existing] = await pool.query<PetRow[]>(`SELECT * FROM pets WHERE id = ? LIMIT 1`, [req.params.id]);
    if (existing.length === 0) {
      res.status(404).json({ message: 'Pet not found' });
      return;
    }
    const existingPet = existing[0];
    if (user.userType === 'owner' && existingPet.owner_id !== user.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    if (user.userType === 'clinic' && existingPet.linked_clinic_id !== user.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }

    const [result] = await pool.execute<ResultSetHeader>(`UPDATE pets SET ${assignments.join(', ')} WHERE id = ?`, values);

    const affectedRows = result.affectedRows ?? 0;

    if (affectedRows === 0) {
      res.status(404).json({ message: 'Pet not found' });
      return;
    }

    const [rows] = await pool.query<PetRow[]>(`SELECT ${petSelectFields} FROM pets WHERE id = ? LIMIT 1`, [String(req.params.id)]);

    res.json({ data: normalizePet(rows[0]) });
  } catch (error) {
    next(error);
  }
});

petsRouter.delete('/:id', async (req: AuthRequest, res, next) => {
  try {
    const user = req.user;
    const [existing] = await pool.query<PetRow[]>(`SELECT * FROM pets WHERE id = ? LIMIT 1`, [String(req.params.id)]);
    if (existing.length === 0) {
      res.status(404).json({ message: 'Pet not found' });
      return;
    }
    const existingPet = existing[0];
    if (user.userType === 'owner' && existingPet.owner_id !== user.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    if (user.userType === 'clinic' && existingPet.linked_clinic_id !== user.id) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    const [result] = await pool.execute<ResultSetHeader>('DELETE FROM pets WHERE id = ?', [String(req.params.id)]);
    const affectedRows = result.affectedRows ?? 0;

    if (affectedRows === 0) {
      res.status(404).json({ message: 'Pet not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});