import { readFile } from 'node:fs/promises';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const schemaPath = fileURLToPath(new URL('./schema.sql', import.meta.url));
const databaseName = env.mysql.database;
const forceReset = process.argv.includes('--yes') || process.argv.includes('-y');

function quoteIdentifier(identifier: string) {
  return `\`${identifier.replace(/`/g, '``')}\``;
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

  const connection = await mysql.createConnection({
    host: env.mysql.host,
    port: env.mysql.port,
    user: env.mysql.user,
    password: env.mysql.password,
    multipleStatements: true,
  });

  const quotedDatabase = quoteIdentifier(databaseName);

  try {
    console.log(`Dropping database ${databaseName}...`);
    await connection.query(`DROP DATABASE IF EXISTS ${quotedDatabase};`);

    console.log(`Creating database ${databaseName}...`);
    await connection.query(
      `CREATE DATABASE ${quotedDatabase} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );

    const schemaSql = await readFile(schemaPath, 'utf8');

    console.log(`Applying schema from ${schemaPath}...`);
    await connection.query(schemaSql);

    console.log(`Database ${databaseName} reset successfully.`);
  } finally {
    await connection.end();
  }
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
