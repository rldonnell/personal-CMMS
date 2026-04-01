/**
 * Seed the database with categories and default task templates.
 * Usage: node lib/db-seed.mjs
 * Requires DATABASE_URL env var.
 */
import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log('Seeding categories...');

  // Insert categories
  await sql`
    INSERT INTO categories (name, slug, icon, description, color) VALUES
      ('HVAC', 'hvac', 'thermometer', 'Heating, ventilation, and air conditioning systems', '#1e3a5f'),
      ('Water Heater', 'water-heater', 'droplets', 'Hot water heater maintenance and care', '#dd6b20'),
      ('Pool', 'pool', 'waves', 'Swimming pool equipment and water chemistry', '#2c5282')
    ON CONFLICT (slug) DO NOTHING
  `;

  console.log('Seeding task templates...');

  // HVAC templates
  await sql`
    INSERT INTO task_templates (category_id, name, description, interval_days, priority) VALUES
      ((SELECT id FROM categories WHERE slug='hvac'), 'Replace Air Filter', 'Replace or clean HVAC air filter. Check for dust buildup and proper fit. Use the correct MERV rating for your system.', 90, 'high'),
      ((SELECT id FROM categories WHERE slug='hvac'), 'Clean Supply Vents', 'Remove vent covers and wash with warm soapy water. Vacuum inside ducts as far as you can reach.', 90, 'medium'),
      ((SELECT id FROM categories WHERE slug='hvac'), 'Check Thermostat Battery', 'Replace thermostat batteries if applicable. Verify programming is correct for the season.', 180, 'low'),
      ((SELECT id FROM categories WHERE slug='hvac'), 'Clean Condensate Drain', 'Pour a cup of bleach or vinegar down the condensate drain line to prevent algae buildup and clogs.', 90, 'medium'),
      ((SELECT id FROM categories WHERE slug='hvac'), 'Inspect Outdoor Unit', 'Clear debris, leaves, and vegetation within 2 feet of the outdoor condenser unit. Hose down coils gently.', 180, 'medium'),
      ((SELECT id FROM categories WHERE slug='hvac'), 'Professional Tune-Up', 'Schedule a professional HVAC tune-up. Ideally: AC in spring, heating in fall.', 365, 'high'),
      ((SELECT id FROM categories WHERE slug='hvac'), 'Check Ductwork for Leaks', 'Inspect visible ductwork for gaps, disconnections, or damaged insulation. Seal with mastic or foil tape.', 365, 'medium'),
      ((SELECT id FROM categories WHERE slug='hvac'), 'Test Carbon Monoxide Detectors', 'Press the test button on all CO detectors near HVAC equipment. Replace batteries annually.', 180, 'high')
    ON CONFLICT DO NOTHING
  `;

  // Water Heater templates
  await sql`
    INSERT INTO task_templates (category_id, name, description, interval_days, priority) VALUES
      ((SELECT id FROM categories WHERE slug='water-heater'), 'Test T&P Relief Valve', 'Lift the lever on the temperature and pressure relief valve and let it snap back. Water should flow briefly and stop. If it drips continuously, replace the valve.', 180, 'high'),
      ((SELECT id FROM categories WHERE slug='water-heater'), 'Flush Sediment', 'Attach a hose to the drain valve and flush 2-3 gallons until water runs clear. This removes sediment that reduces efficiency.', 180, 'high'),
      ((SELECT id FROM categories WHERE slug='water-heater'), 'Check Anode Rod', 'Inspect the sacrificial anode rod. Replace if it is less than 1/2 inch thick or coated with calcium. This prevents tank corrosion.', 365, 'medium'),
      ((SELECT id FROM categories WHERE slug='water-heater'), 'Inspect for Leaks', 'Check all connections, the base of the tank, and the T&P valve discharge pipe for any signs of water or corrosion.', 90, 'medium'),
      ((SELECT id FROM categories WHERE slug='water-heater'), 'Check Temperature Setting', 'Verify the thermostat is set to 120°F (49°C) for safety and energy efficiency. Adjust if needed.', 180, 'low'),
      ((SELECT id FROM categories WHERE slug='water-heater'), 'Inspect Venting (Gas Units)', 'Check the flue and venting for blockages, corrosion, or improper connections. Ensure adequate combustion air supply.', 365, 'high'),
      ((SELECT id FROM categories WHERE slug='water-heater'), 'Clean Intake Filter (Tankless)', 'For tankless units: remove and clean the inlet water filter screen. Check for scale buildup.', 90, 'medium')
    ON CONFLICT DO NOTHING
  `;

  // Pool templates
  await sql`
    INSERT INTO task_templates (category_id, name, description, interval_days, priority) VALUES
      ((SELECT id FROM categories WHERE slug='pool'), 'Test Water Chemistry', 'Test pH (7.2-7.6), chlorine (1-3 ppm), alkalinity (80-120 ppm), and cyanuric acid (30-50 ppm). Adjust as needed.', 7, 'high'),
      ((SELECT id FROM categories WHERE slug='pool'), 'Skim Surface & Empty Baskets', 'Skim leaves and debris from the water surface. Empty the skimmer basket and pump strainer basket.', 3, 'medium'),
      ((SELECT id FROM categories WHERE slug='pool'), 'Brush Walls & Floor', 'Brush the pool walls, floor, steps, and behind ladders to prevent algae growth. Focus on corners and shaded areas.', 7, 'medium'),
      ((SELECT id FROM categories WHERE slug='pool'), 'Vacuum Pool', 'Vacuum the pool floor manually or run the automatic cleaner. Check for dead spots the cleaner misses.', 7, 'medium'),
      ((SELECT id FROM categories WHERE slug='pool'), 'Backwash/Clean Filter', 'Backwash DE or sand filters when pressure rises 8-10 PSI above clean baseline. Clean cartridge filters with a hose.', 30, 'high'),
      ((SELECT id FROM categories WHERE slug='pool'), 'Check Water Level', 'Ensure water level is at the middle of the skimmer opening. Too low can damage the pump; too high reduces skimming efficiency.', 7, 'low'),
      ((SELECT id FROM categories WHERE slug='pool'), 'Inspect Pool Equipment', 'Check pump, filter, heater, and chlorinator for leaks, unusual noises, or error codes. Lubricate o-rings if dry.', 30, 'medium'),
      ((SELECT id FROM categories WHERE slug='pool'), 'Shock the Pool', 'Super-chlorinate the pool to break down chloramines and kill bacteria. Do this in the evening for best results.', 14, 'high'),
      ((SELECT id FROM categories WHERE slug='pool'), 'Clean Tile Line', 'Scrub the tile line at the waterline to remove calcium deposits and oils. Use a pool tile cleaner and stiff brush.', 30, 'low'),
      ((SELECT id FROM categories WHERE slug='pool'), 'Seasonal Opening/Closing', 'Full seasonal service: remove/install cover, inspect all equipment, balance chemistry, and prime the system.', 182, 'high')
    ON CONFLICT DO NOTHING
  `;

  console.log('Seed complete!');
}

seed().catch(console.error);
