import type { RowDataPacket } from 'mysql2/promise';
import { pool } from './pool.js';

type ColumnRow = RowDataPacket & {
  count: number;
  is_nullable: 'YES' | 'NO';
};

async function ensureNullableColumn(tableName: string, columnName: string, columnDefinition: string) {
  const [rows] = await pool.query<ColumnRow[]>(
    `
      SELECT COUNT(*) AS count, MAX(IS_NULLABLE) AS is_nullable
      FROM information_schema.columns
      WHERE table_schema = DATABASE()
        AND table_name = ?
        AND column_name = ?
    `,
    [tableName, columnName]
  );

  if ((rows[0]?.count ?? 0) === 0) {
    await pool.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnDefinition}`);
    return;
  }

  if (rows[0]?.is_nullable === 'YES') {
    return;
  }

  await pool.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${columnDefinition}`);
}

export async function ensureDatabaseSchema() {
  await ensureNullableColumn('clinics', 'address', 'address VARCHAR(255) NULL');
  await ensureNullableColumn('clinics', 'services', 'services JSON NULL');
  await ensureNullableColumn('clinics', 'working_hours', 'working_hours JSON NULL');
  await ensureNullableColumn('pets', 'linked_clinic_id', 'linked_clinic_id CHAR(36) NULL');
  await ensureNullableColumn('appointments', 'pet_name', 'pet_name VARCHAR(120) NOT NULL');
  await ensureNullableColumn('appointments', 'veterinarian_id', 'veterinarian_id CHAR(36) NULL');
  await ensureNullableColumn('appointments', 'clinic_name', 'clinic_name VARCHAR(180) NULL');
  await ensureNullableColumn('appointments', 'veterinarian_name', 'veterinarian_name VARCHAR(120) NULL');
  await ensureNullableColumn('appointments', 'veterinarian_email', 'veterinarian_email VARCHAR(180) NULL');
  await ensureNullableColumn('appointments', 'veterinarian_phone', 'veterinarian_phone VARCHAR(30) NULL');
  await ensureNullableColumn('medical_records', 'treatment', 'treatment TEXT NULL');
  await ensureNullableColumn('medical_records', 'documents', 'documents JSON NULL');
  await ensureNullableColumn('medical_records', 'veterinarian_name', 'veterinarian_name VARCHAR(120) NULL');
  await ensureNullableColumn('medical_records', 'clinic_name', 'clinic_name VARCHAR(180) NULL');
  await ensureNullableColumn('vaccines', 'veterinarian_name', 'veterinarian_name VARCHAR(120) NULL');
  await ensureNullableColumn('vaccines', 'clinic_name', 'clinic_name VARCHAR(180) NULL');
  await ensureNullableColumn('vaccines', 'next_dose_date', 'next_dose_date DATE NULL');
  await ensureNullableColumn('notifications', 'source_key', 'source_key VARCHAR(120) NULL');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id CHAR(36) PRIMARY KEY,
      appointment_id CHAR(36) NOT NULL UNIQUE,
      pet_id CHAR(36) NOT NULL,
      tutor_id CHAR(36) NOT NULL,
      veterinarian_id CHAR(36) NOT NULL,
      clinic_name VARCHAR(180) NULL,
      rating TINYINT NOT NULL,
      comment TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      CONSTRAINT chk_reviews_rating CHECK (rating BETWEEN 1 AND 5)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS vet_passes (
      id CHAR(36) PRIMARY KEY,
      pass_code VARCHAR(64) NOT NULL UNIQUE,
      tutor_id CHAR(36) NOT NULL,
      pet_id CHAR(36) NOT NULL,
      pet_name VARCHAR(120) NOT NULL,
      documents JSON NOT NULL,
      redeemed_by_user_id CHAR(36) NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP NOT NULL,
      redeemed_at TIMESTAMP NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
}

