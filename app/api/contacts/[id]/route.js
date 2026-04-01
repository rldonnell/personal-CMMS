import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// PATCH /api/contacts/[id]
export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;

  try {
    const { name, company, phone, email, categoryId, specialty, notes } = await request.json();

    const sql = getDb();

    // Verify ownership
    const [existing] = await sql`
      SELECT id FROM service_contacts WHERE id = ${id} AND user_id = ${user.userId}
    `;

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
    }

    // Update contact
    await sql`
      UPDATE service_contacts
      SET
        name = ${name !== undefined ? name : existing.name},
        company = ${company !== undefined ? company : null},
        phone = ${phone !== undefined ? phone : null},
        email = ${email !== undefined ? email : null},
        category_id = ${categoryId !== undefined ? categoryId : null},
        specialty = ${specialty !== undefined ? specialty : null},
        notes = ${notes !== undefined ? notes : null}
      WHERE id = ${id}
    `;

    // Fetch updated contact with category info
    const [updated] = await sql`
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
      WHERE sc.id = ${id}
    `;

    return NextResponse.json({ contact: updated });
  } catch (error) {
    console.error('Update contact error:', error);
    return NextResponse.json({ error: 'Failed to update contact.' }, { status: 500 });
  }
}

// DELETE /api/contacts/[id]
export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;

  try {
    const sql = getDb();

    // Verify ownership
    const [existing] = await sql`
      SELECT id FROM service_contacts WHERE id = ${id} AND user_id = ${user.userId}
    `;

    if (!existing) {
      return NextResponse.json({ error: 'Contact not found.' }, { status: 404 });
    }

    // Delete contact
    await sql`
      DELETE FROM service_contacts WHERE id = ${id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete contact error:', error);
    return NextResponse.json({ error: 'Failed to delete contact.' }, { status: 500 });
  }
}
