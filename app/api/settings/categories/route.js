import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/settings/categories — Returns all categories with their enabled/disabled status
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = getDb();

  const categories = await sql`
    SELECT c.*, COALESCE(uc.enabled, true) as enabled
    FROM categories c
    LEFT JOIN user_categories uc ON uc.category_id = c.id AND uc.user_id = ${user.userId}
    ORDER BY c.id
  `;

  return NextResponse.json({ categories });
}

// PATCH /api/settings/categories — Toggle a category on/off
export async function PATCH(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { categoryId, enabled } = await request.json();

    if (categoryId === undefined || enabled === undefined) {
      return NextResponse.json({ error: 'categoryId and enabled are required.' }, { status: 400 });
    }

    const sql = getDb();

    await sql`
      INSERT INTO user_categories (user_id, category_id, enabled)
      VALUES (${user.userId}, ${categoryId}, ${enabled})
      ON CONFLICT (user_id, category_id) DO UPDATE SET enabled = ${enabled}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle category error:', error);
    return NextResponse.json({ error: 'Failed to toggle category.' }, { status: 500 });
  }
}
