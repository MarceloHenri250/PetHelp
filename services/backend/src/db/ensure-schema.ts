import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
const sourceSchemaPath = fileURLToPath(new URL('../../src/db/schema.sql', import.meta.url));

/** Applies the idempotent PostgreSQL schema on startup. */
export async function ensureDatabaseSchema() {
  try {
    await pool.query(await readFile(schemaPath, 'utf8'));
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') throw error;
    await pool.query(await readFile(sourceSchemaPath, 'utf8'));
  }
}
