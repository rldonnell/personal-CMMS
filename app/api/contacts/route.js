import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/contacts
export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = getDb();

  try {
    const contacts = await sql`
      SELECT
        sc.id,
        sc.name,
        sc.company,
        sc.phone,
        sc.email,
        sc.specialty,
        sc.notes,
        sc.category_id,
        c.name as category_name,
        c.slug as category_slug,
        sc.created_at
      FROM service_contacts sc
      LEFT JOIN categories c ON sc.category_id = c.id
      WHERE sc.user_id = ${user.userId}
      ORDER BY sc.name ASC
    `;

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error('Fetch contacts error:', error);
    return NextResponse.json({ error: 'Failed to fetch contacts.' }, { status: 500 });
  }
}

// POST /api/contacts — create a new contact
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, company, phone, email, categoryId, specialty, notes } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
    }

    const sql = getDb();

    const [contact] = await sql`
      INSERT INTO service_contacts (user_id, name, company, phone, email, category_id, specialty, notes)
      VALUES (${user.userId}, ${name}, ${company || null}, ${phone || null}, ${email || null},
              ${categoryId || null}, ${specialty || null}, ${notes || null})
      RETURNING *
    `;

    // Fetch the full contact with category info
    const [fullContact] = await sql`
      SELECT
        sc.id,
        sc.name,
        sc.company,
        sc.phone,
        sc.email,
        sc.specialty,
        sc.notes,
        sc.category_id,
        c.name as category_name,
        c.slug as category_slug,
        sc.created_at
      FROM service_contacts sc
      LEFT JOIN categories c ON sc.category_id = c.id
      WHERE sc.id = ${contact.id}
    `;

    return NextResponse.json({ contact: fullContact }, { status: 201 });
  } catch (error) {
    console.error('Create contact error:', error);
    return NextResponse.json({ error: 'Failed to create contact.' }, { status: 500 });
  }
}
