# Backend Service

Backend do PetHelp em Express.js + TypeScript.

## Estrutura

```text
services/backend/
|-- package.json
|-- tsconfig.json
`-- src/
    |-- app.ts
    |-- server.ts
    |-- config/
    |   `-- env.ts
    |-- db/
    |   |-- index.ts
    |   |-- pool.ts
    |   |-- ensure-schema.ts
    |   |-- reset-db.ts
    |   `-- schema.sql
    |-- middlewares/
    |   |-- auth.ts
    |   `-- notFound.ts
    |-- routes/
    |   |-- health.ts
    |   `-- index.ts
    |-- modules/
    |   |-- appointments/
    |   |-- auth/
    |   |-- clinic-links/
    |   |-- medical-history/
    |   |-- notifications/
    |   |-- pets/
    |   |-- reviews/
    |   |-- users/
    |   |-- vaccines/
    |   `-- vet-passes/
    `-- types/
        |-- dotenv.d.ts
        `-- node-globals.d.ts
```

## Scripts

- `pnpm --filter @pethelp/backend dev`
- `pnpm --filter @pethelp/backend build`
- `pnpm --filter @pethelp/backend start`
- `pnpm --filter @pethelp/backend typecheck`
- `pnpm --filter @pethelp/backend db:reset`

## Environment

The backend reads these variables from `.env`:

- `PORT`
- `CORS_ORIGIN`
- `MYSQL_HOST`
- `MYSQL_PORT`
- `MYSQL_USER`
- `MYSQL_PASSWORD`
- `MYSQL_DATABASE`
- `JWT_SECRET`

## Database

- `src/db/reset-db.ts` drops and recreates the configured database, then applies `src/db/schema.sql`.
- `src/db/ensure-schema.ts` applies incremental schema adjustments used at startup.
- `src/db/pool.ts` exports the shared MySQL pool.

## Routes

Current HTTP routes exposed by the backend:

- `GET /`
- `GET /api/health`
- `GET /api/auth/*`
- `GET /api/users/*`
- `GET /api/pets/*`
- `GET /api/appointments/*`
- `GET /api/medical-records/*`
- `GET /api/vaccines/*`
- `GET /api/clinic-links/*`
- `GET /api/notifications/*`
- `GET /api/reviews/*`
- `GET /api/vet-passes/*`

## Notes

- `dist/` is generated output and should not be edited manually.
- The backend source of truth is `src/`.
