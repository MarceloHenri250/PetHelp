import { randomUUID } from 'node:crypto';
import { pool } from '../../db/index.js';

export type CreateUserInput = {
  name: string;
  email: string;
  password_hash: string;
  user_type: 'owner' | 'clinic';
  clinic_name?: string | null;
  phone?: string | null;
  address?: string | null;
  connection_code?: string | null;
};

export async function createUser(input: CreateUserInput) {
  const id = randomUUID();
  await pool.execute(
    `INSERT INTO users (id, name, email, password_hash, user_type, clinic_name, phone, address, connection_code)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.name,
      input.email,
      input.password_hash,
      input.user_type,
      input.clinic_name ?? null,
      input.phone ?? null,
      input.address ?? null,
      input.connection_code ?? null,
    ]
  );
  return id;
}

export async function findUserByEmail(email: string) {
  const [rows] = await pool.query<any[]>(`SELECT * FROM users WHERE email = ? LIMIT 1`, [email]);
  return rows.length ? rows[0] : null;
}

export async function findUserById(id: string) {
  const [rows] = await pool.query<any[]>(`SELECT * FROM users WHERE id = ? LIMIT 1`, [id]);
  return rows.length ? rows[0] : null;
}
