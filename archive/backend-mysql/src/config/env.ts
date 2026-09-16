import dotenv from 'dotenv';

dotenv.config();

function toNumber(value: string | undefined, fallback: number) {
	const parsedValue = Number(value);
	return Number.isFinite(parsedValue) ? parsedValue : fallback;
}

export const env = {
	port: toNumber(process.env.PORT, 3333),
	corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
	mysql: {
		host: process.env.MYSQL_HOST ?? 'localhost',
		port: toNumber(process.env.MYSQL_PORT, 3306),
		user: process.env.MYSQL_USER ?? 'root',
		password: process.env.MYSQL_PASSWORD ?? 'Mysql123!',
		database: process.env.MYSQL_DATABASE ?? 'pethelp',
	},
	jwtSecret: process.env.JWT_SECRET ?? 'please-change-this-in-prod',
} as const;
