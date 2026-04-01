import { getDb } from '@/lib/db';
import { createToken } from '@/lib/auth';
import { TEMPLATES } from '@/lib/seed-data';
import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { firstName, lastName, email, company } = await request.json();

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'First name, last name, and email are required.' }, { status: 400 });
    }

    const sql = getDb();

    // Check if email already exists
    const existing = await sql`SELECT id FROM users WHERE email = ${email.toLowerCase()}`;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists. Please sign in.' }, { status: 409 });
    }

    // Create a simple password hash (email-based for this freebie — no password needed)
    const passwordHash = await bcrypt.hash(email.toLowerCase(), 10);

    // Insert user
    const [user] = await sql`
      INSERT INTO users (first_name, last_name, email, company, password_hash)
      VALUES (${firstName}, ${lastName}, ${email.toLowerCase()}, ${company || null}, ${passwordHash})
      RETURNING id, first_name, last_name, email
    `;

    // Get categories
    const categories = await sql`SELECT id, slug FROM categories`;
    const catMap = {};
    categories.forEach(c => { catMap[c.slug] = c.id; });

    // Auto-create default equipment for each category
    for (const cat of categories) {
      const defaultNames = {
        'hvac': 'My HVAC System',
        'water-heater': 'My Water Heater',
        'pool': 'My Pool',
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
        VALUES (${user.id}, ${cat.id}, ${defaultNames[cat.slug] || cat.slug})
        RETURNING id
      `;

      // Auto-create tasks from templates
      const templates = TEMPLATES[cat.slug] || [];
      for (const tmpl of templates) {
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + tmpl.interval_days);

        await sql`
          INSERT INTO tasks (user_id, equipment_id, category_id, name, description, interval_days, priority, next_due, status)
          VALUES (
            ${user.id}, ${equip.id}, ${cat.id},
            ${tmpl.name}, ${tmpl.description}, ${tmpl.interval_days},
            ${tmpl.priority}, ${dueDate.toISOString().slice(0, 10)}, 'upcoming'
          )
        `;
      }
    }

    // Create JWT and set cookie
    const token = await createToken(user);

    const response = NextResponse.json({ success: true, user: { id: user.id, firstName: user.first_name, email: user.email } });
    response.cookies.set('fw-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
