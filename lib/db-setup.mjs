/**
 * Run this once to create the database tables.
 * Usage: node lib/db-setup.mjs
 * Requires DATABASE_URL env var (reads from .env.local).
 */
import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

// Load .env.local
try {
  const envFile = readFileSync('.env.local', 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) process.env[key.trim()] = vals.join('=').trim();
  });
} catch {}

const sql = neon(process.env.DATABASE_URL);

async function setup() {
  console.log('Creating tables...');

  // Users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      first_name VARCHAR(100) NOT NULL,
      last_name VARCHAR(100) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      company VARCHAR(255),
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Equipment categories
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      icon VARCHAR(50),
      description TEXT,
      color VARCHAR(20)
    )
  `;

  // User equipment (instances of a category)
  await sql`
    CREATE TABLE IF NOT EXISTS equipment (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id),
      name VARCHAR(255) NOT NULL,
      make VARCHAR(255),
      model VARCHAR(255),
      install_date DATE,
      notes TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Maintenance task templates (pre-loaded defaults)
  await sql`
    CREATE TABLE IF NOT EXISTS task_templates (
      id SERIAL PRIMARY KEY,
      category_id INTEGER REFERENCES categories(id),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      interval_days INTEGER NOT NULL,
      priority VARCHAR(20) DEFAULT 'medium',
      is_default BOOLEAN DEFAULT true
    )
  `;

  // Scheduled maintenance tasks (user-specific)
  await sql`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      equipment_id INTEGER REFERENCES equipment(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id),
      template_id INTEGER REFERENCES task_templates(id),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      interval_days INTEGER,
      priority VARCHAR(20) DEFAULT 'medium',
      is_custom BOOLEAN DEFAULT false,
      next_due DATE NOT NULL,
      last_completed TIMESTAMPTZ,
      status VARCHAR(20) DEFAULT 'upcoming',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Completion history log
  await sql`
    CREATE TABLE IF NOT EXISTS task_history (
      id SERIAL PRIMARY KEY,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      completed_at TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT,
      cost DECIMAL(10,2)
    )
  `;

  console.log('All tables created successfully!');
}

setup().catch(console.error);
