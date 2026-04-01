/**
 * Default maintenance templates organized by category.
 * Used both for DB seeding and for the signup flow to auto-create tasks.
 */
export const CATEGORIES = [
  { name: 'HVAC', slug: 'hvac', icon: 'thermometer', color: '#1e3a5f', description: 'Heating, ventilation, and air conditioning systems' },
  { name: 'Water Heater', slug: 'water-heater', icon: 'droplets', color: '#dd6b20', description: 'Hot water heater maintenance and care' },
  { name: 'Pool', slug: 'pool', icon: 'waves', color: '#2c5282', description: 'Swimming pool equipment and water chemistry' },
];

export const TEMPLATES = {
  hvac: [
    { name: 'Replace Air Filter', description: 'Replace or clean HVAC air filter. Check for dust buildup and proper fit.', interval_days: 90, priority: 'high' },
    { name: 'Clean Supply Vents', description: 'Remove vent covers and wash. Vacuum inside ducts.', interval_days: 90, priority: 'medium' },
    { name: 'Check Thermostat Battery', description: 'Replace thermostat batteries. Verify programming for season.', interval_days: 180, priority: 'low' },
    { name: 'Clean Condensate Drain', description: 'Pour bleach/vinegar down condensate drain to prevent clogs.', interval_days: 90, priority: 'medium' },
    { name: 'Inspect Outdoor Unit', description: 'Clear debris within 2ft of condenser. Gently hose coils.', interval_days: 180, priority: 'medium' },
    { name: 'Professional Tune-Up', description: 'Schedule professional HVAC tune-up. AC in spring, heating in fall.', interval_days: 365, priority: 'high' },
    { name: 'Check Ductwork for Leaks', description: 'Inspect visible ductwork for gaps or damaged insulation.', interval_days: 365, priority: 'medium' },
    { name: 'Test CO Detectors', description: 'Test all CO detectors near HVAC equipment. Replace batteries annually.', interval_days: 180, priority: 'high' },
  ],
  'water-heater': [
    { name: 'Test T&P Relief Valve', description: 'Lift valve lever — water should flow briefly then stop.', interval_days: 180, priority: 'high' },
    { name: 'Flush Sediment', description: 'Drain 2-3 gallons until water runs clear to remove sediment.', interval_days: 180, priority: 'high' },
    { name: 'Check Anode Rod', description: 'Inspect sacrificial anode rod. Replace if thin or calcium-coated.', interval_days: 365, priority: 'medium' },
    { name: 'Inspect for Leaks', description: 'Check connections, tank base, and T&P discharge pipe for water.', interval_days: 90, priority: 'medium' },
    { name: 'Check Temperature Setting', description: 'Verify thermostat at 120°F for safety and efficiency.', interval_days: 180, priority: 'low' },
    { name: 'Inspect Venting (Gas Units)', description: 'Check flue and venting for blockages or corrosion.', interval_days: 365, priority: 'high' },
    { name: 'Clean Intake Filter (Tankless)', description: 'Clean inlet water filter screen. Check for scale buildup.', interval_days: 90, priority: 'medium' },
  ],
  pool: [
    { name: 'Test Water Chemistry', description: 'Test pH, chlorine, alkalinity, and cyanuric acid. Adjust as needed.', interval_days: 7, priority: 'high' },
    { name: 'Skim & Empty Baskets', description: 'Skim surface debris. Empty skimmer and pump strainer baskets.', interval_days: 3, priority: 'medium' },
    { name: 'Brush Walls & Floor', description: 'Brush pool surfaces to prevent algae. Focus on corners and shade.', interval_days: 7, priority: 'medium' },
    { name: 'Vacuum Pool', description: 'Vacuum floor manually or run automatic cleaner.', interval_days: 7, priority: 'medium' },
    { name: 'Backwash/Clean Filter', description: 'Backwash when pressure rises 8-10 PSI above clean baseline.', interval_days: 30, priority: 'high' },
    { name: 'Check Water Level', description: 'Keep water at mid-skimmer. Too low damages pump.', interval_days: 7, priority: 'low' },
    { name: 'Inspect Pool Equipment', description: 'Check pump, filter, heater for leaks or unusual noises.', interval_days: 30, priority: 'medium' },
    { name: 'Shock the Pool', description: 'Super-chlorinate to break down chloramines. Do in the evening.', interval_days: 14, priority: 'high' },
    { name: 'Clean Tile Line', description: 'Scrub waterline tile to remove calcium and oil deposits.', interval_days: 30, priority: 'low' },
    { name: 'Seasonal Opening/Closing', description: 'Full seasonal service: cover, equipment, chemistry, prime system.', interval_days: 182, priority: 'high' },
  ],
};
