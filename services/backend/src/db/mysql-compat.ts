import type { Pool, PoolClient } from 'pg';
import { pgPool } from './pool.js';
import type { PoolConnection, ResultSetHeader } from './types.js';

/**
 * Converts MySQL-style positional placeholders (`?`) into Postgres ones
 * (`$1`, `$2`, ...). The modules never embed a literal `?` inside a string
 * literal, so a plain sequential replacement is safe here.
 */
function toPgPlaceholders(sql: string): string {
  let index = 0;
  return sql.replace(/\?/g, () => `$${(index += 1)}`);
}

type PgQueryable = Pick<Pool, 'query'> | Pick<PoolClient, 'query'>;

function createExecutor(queryable: PgQueryable) {
  return {
    async query<T = unknown>(sql: string, params: unknown[] = []): Promise<[T, unknown[]]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (queryable as any).query(toPgPlaceholders(sql), params);
      return [result.rows as T, (result.fields ?? []) as unknown[]];
    },
    async execute<T = ResultSetHeader>(sql: string, params: unknown[] = []): Promise<[T, unknown[]]> {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (queryable as any).query(toPgPlaceholders(sql), params);
      const header: ResultSetHeader = {
        affectedRows: result.rowCount ?? 0,
        rows: result.rows ?? [],
      };
      return [header as T, (result.fields ?? []) as unknown[]];
    },
  };
}

async function getConnection(): Promise<PoolConnection> {
  const client = await pgPool.connect();
  const executor = createExecutor(client);

  return {
    query: executor.query,
    execute: executor.execute,
    async beginTransaction() {
      await client.query('BEGIN');
    },
    async commit() {
      await client.query('COMMIT');
    },
    async rollback() {
      await client.query('ROLLBACK');
    },
    release() {
      client.release();
    },
  };
}

export const pool = {
  ...createExecutor(pgPool),
  getConnection,
};
