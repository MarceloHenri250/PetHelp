# Legacy MySQL backend (frozen 2026-09-10)

Snapshot of the backend as it was **before** the migration to PostgreSQL.
Kept only as a rollback reference — it is **not** compiled (`tsconfig.json`
excludes this folder) and is **not** wired into the running app.

## What's here

`src/` is a verbatim copy of `services/backend/src` on the last MySQL commit,
including:

- `src/db/pool.ts` — `mysql2` connection pool
- `src/db/schema.sql` — full MySQL schema (source of truth back then)
- `src/db/ensure-schema.ts` — runtime column/table patches
- `src/db/reset-db.ts` — MySQL drop/create + schema apply
- every `src/modules/**/*.routes.ts` with `?`-style queries and
  `mysql2/promise` types

## How to roll back to MySQL

1. `git rm -r services/backend/src` and `cp -r services/backend/legacy-mysql/src services/backend/src`
   (or `git checkout <last-mysql-commit> -- services/backend/src`).
2. In `services/backend/package.json`: replace `pg` with `mysql2`, drop
   `@types/pg` and `node-pg-migrate`, remove the `migrate` script, then
   `pnpm install`.
3. Restore the MySQL env vars (`MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`,
   `MYSQL_PASSWORD`, `MYSQL_DATABASE`) — see `src/config/env.ts` in this folder.
4. Re-add `await ensureDatabaseSchema()` to `src/server.ts`.
5. `npm --prefix services/backend run db:reset -- --yes`.
6. Delete `services/backend/migrations/` and this folder.
