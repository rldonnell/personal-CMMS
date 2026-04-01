/**
 * Migration: Add Irrigation & Sprinklers category and tasks.
 * Safe to run multiple times.
 * Usage: node lib/db-migrate-irrigation.mjs
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

const IRRIGATION_TEMPLATES = [
  { name: 'Spring System Startup', description: 'Slowly pressurize the system. Open main valve gradually to avoid water hammer. Check each zone.', interval_days: 365, priority: 'high' },
  { name: 'Check Sprinkler Heads', description: 'Run each zone and inspect every head for clogs, misalignment, or damage. Adjust spray patterns.', interval_days: 90, priority: 'medium' },
  { name: 'Inspect for Leaks', description: 'With system running, walk all zones. Look for soggy spots, pooling, or geysers.', interval_days: 90, priority: 'medium' },
  { name: 'Adjust Controller Schedule', description: 'Update timer for current season. Set watering for early morning (4-6 AM).', interval_days: 90, priority: 'medium' },
  { name: 'Check Rain Sensor', description: 'Test rain sensor — system should suspend watering. Replace batteries in wireless models.', interval_days: 180, priority: 'low' },
  { name: 'Inspect Valve Boxes', description: 'Check for standing water, damaged wires, or cracked valves.', interval_days: 180, priority: 'medium' },
  { name: 'Clean or Replace Filters', description: 'Clean inline and drip filters. Replace if torn or clogged.', interval_days: 180, priority: 'medium' },
  { name: 'Flush Drip Lines', description: 'Open end caps and flush 2-3 minutes to clear sediment from emitters.', interval_days: 180, priority: 'low' },
  { name: 'Check Backflow Preventer', description: 'Inspect for leaks. Schedule annual testing by certified technician.', interval_days: 365, priority: 'high' },
  { name: 'Winterize / Blow Out System', description: 'Use compressed air to blow out all water before freezing temps. Max 80 PSI poly, 50 PSI PVC.', interval_days: 365, priority: 'high' },
];

async function migrate() {
  console.log('Adding Irrigation category...');

  await sql`
    INSERT INTO categories (name, slug, icon, description, color)
    VALUES ('Irrigation & Sprinklers', 'irrigation', 'droplet', 'Lawn sprinkler systems, drip irrigation, and outdoor watering', '#2f855a')
    ON CONFLICT (slug) DO NOTHING
  `;

  const [cat] = await sql`SELECT id FROM categories WHERE slug = 'irrigation'`;
  if (!cat) { console.error('Failed to create irrigation category'); return; }

  console.log('Adding irrigation task templates...');
  for (const tmpl of IRRIGATION_TEMPLATES) {
    await sql`
      INSERT INTO task_templates (category_id, name, description, interval_days, priority)
      VALUES (${cat.id}, ${tmpl.name}, ${tmpl.description}, ${tmpl.interval_days}, ${tmpl.priority})
      ON CONFLICT DO NOTHING
    `;
  }

  console.log('Adding irrigation for existing users...');
  const users = await sql`SELECT id FROM users`;

  for (const user of users) {
    const existing = await sql`
      SELECT id FROM equipment WHERE user_id = ${user.id} AND category_id = ${cat.id}
    `;
    if (existing.length > 0) { console.log(`  User ${user.id} already has irrigation, skipping`); continue; }

    const [equip] = await sql`
      INSERT INTO equipment (user_id, category_id, name)
      VALUES (${user.id}, ${cat.id}, 'My Irrigation System')
      RETURNING id
    `;

    for (const tmpl of IRRIGATION_TEMPLATES) {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + tmpl.interval_days);
      await sql`
        INSERT INTO tasks (user_id, equipment_id, category_id, name, description, interval_days, priority, next_due, status)
        VALUES (${user.id}, ${equip.id}, ${cat.id}, ${tmpl.name}, ${tmpl.description},
                ${tmpl.interval_days}, ${tmpl.priority}, ${dueDate.toISOString().slice(0, 10)}, 'upcoming')
      `;
    }

    // Add to user_categories as enabled
    await sql`
      INSERT INTO user_categories (user_id, category_id, enabled)
      VALUES (${user.id}, ${cat.id}, true)
      ON CONFLICT (user_id, category_id) DO NOTHING
    `;

    console.log(`  Added ${IRRIGATION_TEMPLATES.length} irrigation tasks for user ${user.id}`);
  }

  console.log('Irrigation migration complete!');
}

migrate().catch(console.error);
