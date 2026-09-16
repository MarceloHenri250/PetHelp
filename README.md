# PetHelp

Monorepo do PetHelp, com frontend web em React e backend em Express + TypeScript.

## Visao geral

- `apps/web`: aplicacao web do PetHelp
- `services/backend`: API e acesso ao banco de dados
- `apps/mobile`: app mobile planejado, ainda nao inicializado

## Requisitos

- Node.js 20+ recomendado
- pnpm 11+ (o repo usa apenas pnpm; não versione `package-lock.json`)
- PostgreSQL 14+ para o backend

## Instalacao

```bash
pnpm install
```

## Comandos principais

```bash
pnpm dev:web
pnpm build:web
pnpm dev:backend
pnpm build:backend
pnpm start:backend
pnpm typecheck:backend
```

## Web

Frontend em React, Vite e TypeScript.

### Rodar localmente

```bash
pnpm dev:web
```

### Build

```bash
pnpm build:web
```

## Backend

API em Express, TypeScript e PostgreSQL.

### Rodar localmente

```bash
pnpm dev:backend
```

### Build

```bash
pnpm build:backend
```

### Producao local

```bash
pnpm start:backend
```

### Banco de dados

O backend usa **PostgreSQL** via [`pg`](https://node-postgres.com/) e migrações
versionadas com [`node-pg-migrate`](https://salsita.github.io/node-pg-migrate/).

1. Copie `services/backend/.env.example` para `services/backend/.env` e ajuste as
   variáveis `POSTGRES_*` / `DATABASE_URL`.
2. Aplique as migrações em um banco já criado:

   ```bash
   pnpm db:migrate
   ```

3. Ou recrie o banco de desenvolvimento do zero (DROP + CREATE + migrações):

   ```bash
   pnpm --dir services/backend run db:reset -- --yes
   ```

A implementação MySQL anterior está congelada em
`services/backend/legacy-mysql/` para eventual rollback.

### Verificacao de tipos

```bash
pnpm typecheck:backend
```

## Estrutura

```text
apps/
  web/                 app React + Vite (@pet-help/web)
    src/
      components/      common/ (primitivos), layout/, ui/ (shadcn), figma/
      screens/         auth/, tutor/, vet/, clinic/
      hooks/  lib/  styles/
  mobile/              planejado, ainda nao inicializado
services/
  backend/             API Express + PostgreSQL (@pethelp/backend)
    src/
      config/  db/  middlewares/  routes/
      modules/         health, auth, users, pets, appointments, ...
    migrations/        node-pg-migrate
    legacy-mysql/      snapshot MySQL (rollback)
```

## Observacoes

- O frontend web usa o pacote `@pet-help/web`.
- O backend usa o pacote `@pethelp/backend`.
- Os arquivos em `dist/` sao gerados e nao devem ser editados manualmente.
- O status do app mobile ainda e de base inicial, sem implementacao funcional.
