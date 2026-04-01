/**
 * Migration: Add password_reset_tokens table for password reset flow.
 * Safe to run multiple times (IF NOT EXISTS pattern).
 * Usage: node lib/db-migrate-reset-tokens.mjs
 */
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

try {
  const envFile = readFileSync('.env.local', 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  console.log('Running password reset tokens migration...');

  console.log('  → password_reset_tokens table...');
  await sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      token VARCHAR(255) UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN DEFAULT false,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('Password reset tokens migration complete!');
}

migrate().catch(console.error);
