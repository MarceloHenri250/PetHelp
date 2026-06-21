# PetHelp

Monorepo do PetHelp, com frontend web em React e backend em Express + TypeScript.

## Visao geral

- `apps/web`: aplicacao web do PetHelp
- `services/backend`: API e acesso ao banco de dados
- `apps/mobile`: app mobile planejado, ainda nao inicializado

## Requisitos

- Node.js 20+ recomendado
- pnpm 11+
- MySQL para o backend

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

API em Express, TypeScript e MySQL.

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

### Verificacao de tipos

```bash
pnpm typecheck:backend
```

## Estrutura

```text
apps/
  web/
  mobile/
services/
  backend/
```

## Observacoes

- O frontend web usa o pacote `@pet-help/web`.
- O backend usa o pacote `@pethelp/backend`.
- Os arquivos em `dist/` sao gerados e nao devem ser editados manualmente.
- O status do app mobile ainda e de base inicial, sem implementacao funcional.
