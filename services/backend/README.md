# Backend Service

Base inicial do backend do PetHelp em Express.js + TypeScript.

## Estrutura

```text
services/backend/
Environment variables (example):

- `PORT` - server port (default 3333)
- `CORS_ORIGIN` - allowed origin for CORS
- `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE`
- `JWT_SECRET` - secret used to sign JWT tokens (set in production)

├─ package.json
├─ tsconfig.json
├─ .env.example
└─ src/
	├─ app.ts
	├─ server.ts
	├─ config/
	│  └─ env.ts
	├─ middlewares/
	│  └─ notFound.ts
	├─ routes/
	│  ├─ health.ts
	│  └─ index.ts
	└─ modules/
		├─ appointments/
		├─ auth/
		├─ medical-history/
		├─ notifications/
		├─ pets/
		├─ users/
		└─ vaccines/
```

## Objetivo

Deixar o backend preparado para receber os CRUDs principais da entrega, mantendo uma separação por domínio desde o início.

## Banco de dados

O backend foi preparado para MySQL.

- Configure as variáveis de ambiente em `.env` com as credenciais do seu MySQL.
- Para recriar o banco do zero, use `pnpm --filter @pethelp/backend db:reset`.
- O script vai derrubar e recriar `pethelp` e depois aplicar `src/db/schema.sql`.
- O novo schema separa autenticação e perfis em `users`, `tutors`, `clinics` e `veterinarians`.
- As demais tabelas cobrem pets, histórico de posse, consultas, prontuários, vacinas, encaminhamentos e notificações.
- Se preferir fazer manualmente, execute o `DROP DATABASE`, `CREATE DATABASE` e depois rode o schema.

## Próximos passos sugeridos

1. Adicionar autenticação e controle de acesso.
2. Criar rotas e serviços para histórico, vacinas e consultas.
3. Integrar o web com a API.

## API atual

- `GET /api/health`
- `GET /api/pets`
- `GET /api/pets/:id`
- `POST /api/pets`
- `PATCH /api/pets/:id`
- `DELETE /api/pets/:id`
