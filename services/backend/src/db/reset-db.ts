import { spawnSync } from 'node:child_process';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import pg from 'pg';
import { env } from '../config/env.js';

const databaseName = env.postgres.database;
const forceReset = process.argv.includes('--yes') || process.argv.includes('-y');

function quoteIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function confirmReset() {
  if (forceReset) {
    return;
  }

  if (!input.isTTY || !output.isTTY) {
    throw new Error(`Refusing to reset ${databaseName} without an interactive terminal. Re-run with --yes.`);
  }

  const rl = createInterface({ input, output });

  try {
    const answer = await rl.question(
      `This will DROP and recreate database "${databaseName}". Type ${databaseName} to continue: `,
    );

    if (answer.trim() !== databaseName) {
      throw new Error('Database reset cancelled.');
    }
  } finally {
    rl.close();
  }
}

async function main() {
  await confirmReset();

  const client = new pg.Client({
    host: env.postgres.host,
    port: env.postgres.port,
    user: env.postgres.user,
    password: env.postgres.password,
    database: 'postgres',
  });

  await client.connect();

  const quotedDatabase = quoteIdentifier(databaseName);

  try {
    console.log(`Dropping database ${databaseName}...`);
    await client.query(
      `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = $1 AND pid <> pg_backend_pid()`,
      [databaseName],
    );
    await client.query(`DROP DATABASE IF EXISTS ${quotedDatabase}`);

    console.log(`Creating database ${databaseName}...`);
    await client.query(`CREATE DATABASE ${quotedDatabase} ENCODING 'UTF8'`);
  } finally {
    await client.end();
  }

  console.log('Applying migrations...');
  const result = spawnSync('npx node-pg-migrate up --envPath .env', {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, DATABASE_URL: env.databaseUrl },
  });

  if (result.status !== 0) {
    throw new Error('Migrations failed.');
  }

  console.log(`Database ${databaseName} reset successfully.`);
}

main().catch((error: unknown) => {
  console.error('Database reset failed.');

  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error(error);
  }

  process.exitCode = 1;
});
