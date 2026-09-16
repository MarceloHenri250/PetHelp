import pg from 'pg';
import { env } from '../config/env.js';

// Return JSON/JSONB columns as their raw string so the modules keep doing their
// own JSON.parse (mirrors how the previous MySQL layer behaved).
pg.types.setTypeParser(114, value => value); // json
pg.types.setTypeParser(3802, value => value); // jsonb
// Return DATE columns as 'YYYY-MM-DD' strings instead of Date objects.
pg.types.setTypeParser(1082, value => value);

export const pgPool = new pg.Pool({
  host: env.postgres.host,
  port: env.postgres.port,
  user: env.postgres.user,
  password: env.postgres.password,
  database: env.postgres.database,
  max: 10,
});
