/**
 * Migration: Add service_contacts table and equipment columns for full CMMS features.
 * Also ensures work_orders table exists.
 * Safe to run multiple times (IF NOT EXISTS / ADD IF NOT EXISTS patterns).
 * Usage: node lib/db-migrate-fullcmms.mjs
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
  console.log('Running full CMMS migration...');

  // 1. Ensure work_orders table exists
  console.log('  → work_orders table...');
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

  // 2. Service contacts table
  console.log('  → service_contacts table...');
  await sql`
    CREATE TABLE IF NOT EXISTS service_contacts (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      company VARCHAR(255),
      phone VARCHAR(50),
      email VARCHAR(255),
      category_id INTEGER REFERENCES categories(id),
      specialty VARCHAR(255),
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // 3. Add serial_number and warranty_expiry to equipment (if not exists)
  console.log('  → equipment columns (serial_number, warranty_expiry)...');
  try {
    await sql`ALTER TABLE equipment ADD COLUMN IF NOT EXISTS serial_number VARCHAR(255)`;
  } catch (e) {
    console.log('    serial_number column may already exist, skipping.');
  }
  try {
    await sql`ALTER TABLE equipment ADD COLUMN IF NOT EXISTS warranty_expiry DATE`;
  } catch (e) {
    console.log('    warranty_expiry column may already exist, skipping.');
  }

  console.log('Full CMMS migration complete!');
}

migrate().catch(console.error);
