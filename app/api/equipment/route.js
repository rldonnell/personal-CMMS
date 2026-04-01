import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/equipment?categorySlug=hvac
export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const categorySlug = searchParams.get('categorySlug');

  if (!categorySlug) {
    return NextResponse.json({ error: 'categorySlug is required' }, { status: 400 });
  }

  const sql = getDb();

  try {
    // Get category by slug
    const [category] = await sql`
      SELECT id FROM categories WHERE slug = ${categorySlug}
    `;

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    // Get equipment for user and category
    const [equipment] = await sql`
      SELECT id, user_id, category_id, name, make, model, install_date, notes, created_at
      FROM equipment
      WHERE user_id = ${user.userId} AND category_id = ${category.id}
      LIMIT 1
    `;

    return NextResponse.json({ equipment: equipment || null });
  } catch (error) {
    console.error('Fetch equipment error:', error);
    return NextResponse.json({ error: 'Failed to fetch equipment' }, { status: 500 });
  }
}

// PATCH /api/equipment
export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id, make, model, install_date, notes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Equipment id is required' }, { status: 400 });
    }

    const sql = getDb();

    // Verify equipment belongs to user
    const [equipment] = await sql`
      SELECT * FROM equipment WHERE id = ${id} AND user_id = ${user.userId}
    `;

    if (!equipment) {
      return NextResponse.json({ error: 'Equipment not found' }, { status: 404 });
    }

    // Update equipment
    const [updated] = await sql`
      UPDATE equipment
      SET make = ${make || null},
          model = ${model || null},
          install_date = ${install_date || null},
          notes = ${notes || null}
      WHERE id = ${id}
      RETURNING id, user_id, category_id, name, make, model, install_date, notes, created_at
    `;

    return NextResponse.json({ equipment: updated });
  } catch (error) {
    console.error('Update equipment error:', error);
    return NextResponse.json({ error: 'Failed to update equipment' }, { status: 500 });
  }
}
