/**
 * Migration: Add 7 new categories and their task templates.
 * Also adds default equipment and tasks for existing users.
 * Safe to run multiple times (uses ON CONFLICT DO NOTHING).
 *
 * Usage: node lib/db-migrate-categories.mjs
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

const NEW_CATEGORIES = [
  { name: 'Plumbing', slug: 'plumbing', icon: 'wrench', color: '#2b6cb0', description: 'Pipes, fixtures, valves, and water supply systems' },
  { name: 'Electrical', slug: 'electrical', icon: 'zap', color: '#d69e2e', description: 'Electrical systems, outlets, panels, and safety devices' },
  { name: 'Septic System', slug: 'septic', icon: 'layers', color: '#744210', description: 'Septic tank, drain field, and wastewater management' },
  { name: 'Roof & Gutters', slug: 'roof-gutters', icon: 'home', color: '#718096', description: 'Roofing, gutters, downspouts, and drainage' },
  { name: 'Appliances', slug: 'appliances', icon: 'settings', color: '#4a5568', description: 'Major household appliances and their maintenance' },
  { name: 'Exterior & Foundation', slug: 'exterior', icon: 'shield', color: '#276749', description: 'Siding, foundation, driveway, deck, and outdoor structures' },
  { name: 'Garage Door', slug: 'garage-door', icon: 'square', color: '#6b46c1', description: 'Garage door system, opener, tracks, and hardware' },
];

const NEW_TEMPLATES = {
  plumbing: [
    { name: 'Exercise Main Water Shut-Off Valve', description: 'Turn the main shut-off valve fully closed then open again. Prevents seizing.', interval_days: 180, priority: 'high' },
    { name: 'Exercise Individual Fixture Shut-Offs', description: 'Turn each sink, toilet, and appliance shut-off valve closed and open.', interval_days: 180, priority: 'medium' },
    { name: 'Check Under Sinks for Leaks', description: 'Inspect under all sinks for moisture, drips, water stains, or mold.', interval_days: 90, priority: 'high' },
    { name: 'Inspect Toilet Flappers', description: 'Check flappers for wear or mineral buildup. A leaking flapper wastes 200+ gal/day.', interval_days: 180, priority: 'medium' },
    { name: 'Check Toilet for Silent Leaks', description: 'Add food coloring to tank. Wait 15 min — if color appears in bowl, flapper is leaking.', interval_days: 180, priority: 'medium' },
    { name: 'Inspect Washing Machine Hoses', description: 'Check supply hoses for bulges or cracks. Replace rubber with braided stainless steel.', interval_days: 180, priority: 'high' },
    { name: 'Clean Faucet Aerators', description: 'Unscrew aerators and soak in vinegar to dissolve mineral deposits.', interval_days: 180, priority: 'low' },
    { name: 'Flush Supply Lines', description: 'Open each faucet fully for 30 seconds to flush sediment.', interval_days: 180, priority: 'low' },
    { name: 'Test Sump Pump', description: 'Pour water into sump pit to trigger float switch. Verify pump activates and drains.', interval_days: 90, priority: 'high' },
    { name: 'Inspect Caulking (Tubs & Showers)', description: 'Check caulk around tubs and showers for cracks. Re-caulk to prevent water damage.', interval_days: 180, priority: 'medium' },
    { name: 'Clean Drain Stoppers & Screens', description: 'Remove stoppers, clear hair/debris, clean with vinegar and baking soda.', interval_days: 90, priority: 'low' },
    { name: 'Check Water Pressure', description: 'Use pressure gauge on outdoor spigot. Normal: 40-60 PSI. Over 80 PSI needs a regulator.', interval_days: 365, priority: 'medium' },
  ],
  electrical: [
    { name: 'Test GFCI Outlets', description: 'Press TEST on all GFCI outlets. RESET should pop out. Replace if it doesn\'t trip.', interval_days: 90, priority: 'high' },
    { name: 'Test Smoke Detectors', description: 'Press test button on every detector. Replace batteries annually, units every 10 years.', interval_days: 180, priority: 'high' },
    { name: 'Test Carbon Monoxide Detectors', description: 'Press test button on all CO detectors. Check expiration (5-7 year lifespan).', interval_days: 180, priority: 'high' },
    { name: 'Inspect Breaker Panel', description: 'Check for scorch marks, corrosion, or burning smell. Verify labels. Don\'t touch bus bars.', interval_days: 365, priority: 'medium' },
    { name: 'Check for Warm/Discolored Outlets', description: 'Feel outlets for unusual warmth. Look for discoloration — indicates loose wiring.', interval_days: 180, priority: 'high' },
    { name: 'Test AFCI Breakers', description: 'Press TEST on arc-fault breakers. They should trip immediately. Reset after.', interval_days: 180, priority: 'medium' },
    { name: 'Check Fire Extinguishers', description: 'Verify pressure gauge in green zone. Check pin and tamper seal. Shake dry chemical units.', interval_days: 180, priority: 'high' },
    { name: 'Inspect Outdoor Outlets & Lighting', description: 'Check weatherproof covers, test GFCI, replace bulbs, check fixture seals.', interval_days: 180, priority: 'medium' },
    { name: 'Check Surge Protectors', description: 'Verify indicator lights active. Replace every 3-5 years — they degrade with each surge.', interval_days: 365, priority: 'low' },
    { name: 'Inspect Extension Cord Usage', description: 'No cords as permanent wiring. Check for frayed cords or cords under rugs.', interval_days: 365, priority: 'medium' },
  ],
  septic: [
    { name: 'Schedule Tank Pumping', description: 'Have tank pumped by licensed service. Typical: every 3-5 years.', interval_days: 1095, priority: 'high' },
    { name: 'Inspect Tank Baffles', description: 'During pumping, have tech inspect inlet/outlet baffles for damage.', interval_days: 1095, priority: 'high' },
    { name: 'Check Drain Field for Problems', description: 'Walk the area. Look for soggy spots, odor, or unusually lush green patches.', interval_days: 180, priority: 'medium' },
    { name: 'Inspect Tank Lid & Risers', description: 'Check lid is secure and not cracked. Verify risers are sealed.', interval_days: 365, priority: 'medium' },
    { name: 'Monitor Water Usage', description: 'Track usage. Fix running toilets promptly. Spread laundry loads through the week.', interval_days: 90, priority: 'low' },
    { name: 'Check Effluent Filter', description: 'Clean effluent filter by hosing it off. Clogged filter causes backups.', interval_days: 365, priority: 'high' },
    { name: 'Review Septic-Safe Products', description: 'Verify cleaners and toilet paper are septic-safe. Avoid bleach-heavy products.', interval_days: 365, priority: 'low' },
    { name: 'Protect the Drain Field', description: 'No vehicles on drain field. Keep trees 30ft away. No structures over it.', interval_days: 365, priority: 'medium' },
  ],
  'roof-gutters': [
    { name: 'Clean Gutters & Downspouts', description: 'Remove leaves and debris. Flush downspouts with hose. Do in fall and spring.', interval_days: 180, priority: 'high' },
    { name: 'Inspect Roof from Ground', description: 'Use binoculars to scan for missing, cracked, or curling shingles.', interval_days: 180, priority: 'medium' },
    { name: 'Check Flashing & Seals', description: 'Inspect flashing around chimneys, vents, skylights for rust or gaps.', interval_days: 365, priority: 'high' },
    { name: 'Inspect Attic for Leaks', description: 'Check attic after heavy rain for water stains or damp insulation.', interval_days: 180, priority: 'medium' },
    { name: 'Trim Overhanging Branches', description: 'Cut branches within 6ft of roof. They drop debris and damage shingles in storms.', interval_days: 365, priority: 'medium' },
    { name: 'Check Gutter Fasteners & Slope', description: 'Verify gutters slope toward downspouts. Tighten loose fasteners.', interval_days: 365, priority: 'low' },
    { name: 'Inspect Downspout Extensions', description: 'Ensure downspouts discharge 4-6ft from foundation. Add extensions if needed.', interval_days: 180, priority: 'medium' },
    { name: 'Check for Moss or Algae', description: 'Look for moss/algae on roof. Treat with moss killer or zinc strips.', interval_days: 365, priority: 'low' },
    { name: 'Professional Roof Inspection', description: 'Schedule pro inspection every 3-5 years or after major storms.', interval_days: 1095, priority: 'high' },
  ],
  appliances: [
    { name: 'Clean Dryer Vent & Duct', description: 'Clean lint from full vent length. Lint buildup is a leading cause of house fires.', interval_days: 180, priority: 'high' },
    { name: 'Clean Dryer Lint Trap Housing', description: 'Vacuum inside housing. Wash screen to remove dryer sheet residue.', interval_days: 90, priority: 'medium' },
    { name: 'Clean Dishwasher Filter', description: 'Remove and clean filter at bottom. Rinse under water, scrub with soft brush.', interval_days: 90, priority: 'medium' },
    { name: 'Clean Dishwasher Interior', description: 'Run empty cycle with vinegar, then baking soda. Cleans residue and odors.', interval_days: 90, priority: 'low' },
    { name: 'Clean Refrigerator Coils', description: 'Vacuum/brush condenser coils (back or underneath). Dirty coils waste energy.', interval_days: 180, priority: 'medium' },
    { name: 'Check Refrigerator Door Seals', description: 'Dollar bill test — if it slides out easily, gasket needs replacing.', interval_days: 180, priority: 'low' },
    { name: 'Flush Ice Maker Line', description: 'Shut off ice maker, disconnect and flush water line to remove mineral buildup.', interval_days: 365, priority: 'low' },
    { name: 'Clean Range Hood Filter', description: 'Soak grease filter in hot soapy water or dishwasher. Clogged filter reduces ventilation.', interval_days: 90, priority: 'medium' },
    { name: 'Inspect Washing Machine', description: 'Run clean cycle with vinegar. Wipe door gasket. Check hoses for bulges.', interval_days: 90, priority: 'medium' },
    { name: 'Clean Garbage Disposal', description: 'Grind ice and citrus peels. Pour baking soda + vinegar, flush with hot water.', interval_days: 90, priority: 'low' },
  ],
  exterior: [
    { name: 'Inspect Foundation for Cracks', description: 'Walk perimeter. Check for new or widening cracks. Widening cracks need a pro.', interval_days: 180, priority: 'high' },
    { name: 'Check Grading & Drainage', description: 'Ground should slope away from foundation — 6in drop over first 10ft.', interval_days: 365, priority: 'medium' },
    { name: 'Inspect Siding & Exterior Walls', description: 'Look for cracks, holes, loose sections, or rot. Check paint for peeling.', interval_days: 365, priority: 'medium' },
    { name: 'Clean Siding & Exterior', description: 'Power wash or hand-wash siding. Remove mildew and dirt. Bottom to top.', interval_days: 365, priority: 'low' },
    { name: 'Inspect & Reseal Driveway', description: 'Check for cracks. Fill and reseal asphalt driveways every 2-3 years.', interval_days: 730, priority: 'medium' },
    { name: 'Inspect Deck or Patio', description: 'Check for loose boards, rot, popped nails. Clean and reseal wood decks.', interval_days: 365, priority: 'medium' },
    { name: 'Check Exterior Caulking', description: 'Inspect caulk around windows, doors, and penetrations. Replace cracked caulk.', interval_days: 365, priority: 'medium' },
    { name: 'Inspect Outdoor Faucets', description: 'Check hose bibs for drips. Before winter, disconnect hoses and shut off valves.', interval_days: 180, priority: 'medium' },
    { name: 'Test Exterior Drainage Systems', description: 'Run water through French drains or channel drains. Check for clogs.', interval_days: 365, priority: 'low' },
  ],
  'garage-door': [
    { name: 'Lubricate Moving Parts', description: 'Apply lithium grease to hinges, rollers, springs, track. Do NOT use WD-40.', interval_days: 180, priority: 'medium' },
    { name: 'Test Auto-Reverse Safety', description: 'Place 2x4 under door. It should reverse on contact. Test photo-eye sensors too.', interval_days: 90, priority: 'high' },
    { name: 'Inspect Rollers', description: 'Check for chips, cracks, or wear. Replace nylon/steel rollers every 5-7 years.', interval_days: 365, priority: 'medium' },
    { name: 'Check Weatherstripping', description: 'Inspect bottom seal and frame weatherstripping. Replace if cracked or brittle.', interval_days: 365, priority: 'low' },
    { name: 'Inspect Cables & Springs', description: 'Look for fraying cables and spring gaps. Never repair springs yourself — call a pro.', interval_days: 180, priority: 'high' },
    { name: 'Tighten Hardware', description: 'Check and tighten bolts and brackets on door and track. Vibration loosens them.', interval_days: 365, priority: 'low' },
    { name: 'Test Door Balance', description: 'Disconnect opener, lift door halfway. Should stay put. If not, springs need adjustment.', interval_days: 365, priority: 'medium' },
    { name: 'Clean & Align Photo-Eye Sensors', description: 'Wipe lenses. Check alignment (steady lights, not blinking).', interval_days: 180, priority: 'medium' },
  ],
};

async function migrate() {
  console.log('Adding new categories...');

  for (const cat of NEW_CATEGORIES) {
    await sql`
      INSERT INTO categories (name, slug, icon, description, color)
      VALUES (${cat.name}, ${cat.slug}, ${cat.icon}, ${cat.description}, ${cat.color})
      ON CONFLICT (slug) DO NOTHING
    `;
  }

  console.log('Adding task templates for new categories...');

  for (const [slug, templates] of Object.entries(NEW_TEMPLATES)) {
    const [cat] = await sql`SELECT id FROM categories WHERE slug = ${slug}`;
    if (!cat) { console.warn(`Category ${slug} not found, skipping`); continue; }

    for (const tmpl of templates) {
      await sql`
        INSERT INTO task_templates (category_id, name, description, interval_days, priority)
        VALUES (${cat.id}, ${tmpl.name}, ${tmpl.description}, ${tmpl.interval_days}, ${tmpl.priority})
        ON CONFLICT DO NOTHING
      `;
    }
  }

  // Add default equipment + tasks for existing users
  console.log('Adding new categories for existing users...');

  const users = await sql`SELECT id FROM users`;

  for (const user of users) {
    for (const cat of NEW_CATEGORIES) {
      const [catRow] = await sql`SELECT id FROM categories WHERE slug = ${cat.slug}`;
      if (!catRow) continue;

      // Check if user already has equipment for this category
      const existing = await sql`
        SELECT id FROM equipment WHERE user_id = ${user.id} AND category_id = ${catRow.id}
      `;
      if (existing.length > 0) continue;

      const defaultNames = {
        'plumbing': 'My Plumbing',
        'electrical': 'My Electrical',
        'septic': 'My Septic System',
        'roof-gutters': 'My Roof & Gutters',
        'appliances': 'My Appliances',
        'exterior': 'My Exterior',
        'garage-door': 'My Garage Door',
      };

      const [equip] = await sql`
        INSERT INTO equipment (user_id, category_id, name)
        VALUES (${user.id}, ${catRow.id}, ${defaultNames[cat.slug]})
        RETURNING id
      `;

      const templates = NEW_TEMPLATES[cat.slug] || [];
      for (const tmpl of templates) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + tmpl.interval_days);

        await sql`
          INSERT INTO tasks (user_id, equipment_id, category_id, name, description, interval_days, priority, next_due, status)
          VALUES (${user.id}, ${equip.id}, ${catRow.id}, ${tmpl.name}, ${tmpl.description},
                  ${tmpl.interval_days}, ${tmpl.priority}, ${dueDate.toISOString().slice(0, 10)}, 'upcoming')
        `;
      }

      console.log(`  Added ${templates.length} tasks for user ${user.id} → ${cat.name}`);
    }
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
