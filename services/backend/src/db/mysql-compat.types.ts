// Minimal compatibility shims that replace the types previously imported from
// `mysql2/promise`, so the module code keeps compiling against the Postgres
// compatibility layer in `./client.ts`.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RowDataPacket = Record<string, any>;

export interface ResultSetHeader {
  affectedRows: number;
  rows: unknown[];
}

export interface QueryExecutor {
  query<T = RowDataPacket[]>(sql: string, params?: unknown[]): Promise<[T, unknown[]]>;
  execute<T = ResultSetHeader>(sql: string, params?: unknown[]): Promise<[T, unknown[]]>;
}

export interface PoolConnection extends QueryExecutor {
  beginTransaction(): Promise<void>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
  release(): void;
}

export type DbClient = Pick<PoolConnection, 'execute' | 'query'>;
