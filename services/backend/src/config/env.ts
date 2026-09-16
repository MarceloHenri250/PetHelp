import dotenv from 'dotenv';

dotenv.config();

function toNumber(value: string | undefined, fallback: number) {
	const parsedValue = Number(value);
	return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

const postgres = {
	host: process.env.POSTGRES_HOST ?? 'localhost',
	port: toNumber(process.env.POSTGRES_PORT, 5432),
	user: process.env.POSTGRES_USER ?? 'postgres',
	password: process.env.POSTGRES_PASSWORD ?? 'postgres',
	database: process.env.POSTGRES_DB ?? 'pethelp',
};

function buildConnectionString() {
	if (process.env.DATABASE_URL) {
		return process.env.DATABASE_URL;
	}

	const auth = `${encodeURIComponent(postgres.user)}:${encodeURIComponent(postgres.password)}`;
	return `postgres://${auth}@${postgres.host}:${postgres.port}/${postgres.database}`;
}

export const env = {
	port: toNumber(process.env.PORT, 3333),
	corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
	postgres,
	databaseUrl: buildConnectionString(),
	jwtSecret: process.env.JWT_SECRET ?? 'please-change-this-in-prod',
} as const;
