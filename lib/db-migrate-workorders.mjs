/**
 * Migration: Add work_orders table for Honey-Do List feature.
 * Safe to run multiple times.
 * Usage: node lib/db-migrate-workorders.mjs
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
  console.log('Creating work_orders table...');

  await sql`
    CREATE TABLE IF NOT EXISTS work_orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      priority VARCHAR(20) DEFAULT 'medium',
      status VARCHAR(20) DEFAULT 'open',
      created_by VARCHAR(100),
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log('work_orders table created successfully!');
}

migrate().catch(console.error);
