/**
 * Migration: Initialize user category and task preferences
 * Creates the user_categories and user_task_prefs tables and populates defaults.
 * Usage: node lib/db-migrate-settings.mjs
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

async function migrate() {
  console.log('Running settings migration...');

  // Create user_categories table
  console.log('Creating user_categories table...');
  await sql`
    CREATE TABLE IF NOT EXISTS user_categories (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      category_id INTEGER REFERENCES categories(id),
      enabled BOOLEAN DEFAULT true,
      UNIQUE(user_id, category_id)
    )
  `;

  // Create user_task_prefs table
  console.log('Creating user_task_prefs table...');
  await sql`
    CREATE TABLE IF NOT EXISTS user_task_prefs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
      hidden BOOLEAN DEFAULT false,
      UNIQUE(user_id, task_id)
    )
  `;

  // Get all users
  console.log('Fetching users...');
  const users = await sql`SELECT id FROM users`;

  if (users.length === 0) {
    console.log('No users found, skipping category initialization.');
    console.log('Migration completed successfully!');
    return;
  }

  // Get all categories
  console.log('Fetching categories...');
  const categories = await sql`SELECT id FROM categories`;

  if (categories.length === 0) {
    console.log('No categories found, skipping category initialization.');
    console.log('Migration completed successfully!');
    return;
  }

  // For each user, insert enabled=true for all categories
  console.log(`Initializing categories for ${users.length} user(s)...`);
  for (const user of users) {
    for (const category of categories) {
      await sql`
        INSERT INTO user_categories (user_id, category_id, enabled)
        VALUES (${user.id}, ${category.id}, true)
        ON CONFLICT (user_id, category_id) DO NOTHING
      `;
    }
  }

  console.log('Migration completed successfully!');
}

migrate().catch(console.error);
