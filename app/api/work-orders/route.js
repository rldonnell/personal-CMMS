import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/work-orders — list work orders, optional ?status=open|in_progress|completed|all
export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = getDb();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'active'; // active = open + in_progress

  let workOrders;
  if (status === 'all') {
    workOrders = await sql`
      SELECT wo.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM work_orders wo
      LEFT JOIN categories c ON wo.category_id = c.id
      WHERE wo.user_id = ${user.userId}
      ORDER BY
        CASE wo.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
        CASE wo.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        wo.created_at DESC
    `;
  } else if (status === 'completed') {
    workOrders = await sql`
      SELECT wo.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM work_orders wo
      LEFT JOIN categories c ON wo.category_id = c.id
      WHERE wo.user_id = ${user.userId} AND wo.status = 'completed'
      ORDER BY wo.completed_at DESC
      LIMIT 20
    `;
  } else {
    // active: open + in_progress
    workOrders = await sql`
      SELECT wo.*, c.name as category_name, c.slug as category_slug, c.color as category_color
      FROM work_orders wo
      LEFT JOIN categories c ON wo.category_id = c.id
      WHERE wo.user_id = ${user.userId} AND wo.status IN ('open', 'in_progress')
      ORDER BY
        CASE wo.status WHEN 'open' THEN 0 WHEN 'in_progress' THEN 1 ELSE 2 END,
        CASE wo.priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        wo.created_at DESC
    `;
  }

  return NextResponse.json({ workOrders });
}

// POST /api/work-orders — create a new work order
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = getDb();
  const { title, description, priority, categorySlug, createdBy } = await request.json();

  if (!title || !title.trim()) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  // Look up category by slug if provided
  let categoryId = null;
  if (categorySlug) {
    const [cat] = await sql`SELECT id FROM categories WHERE slug = ${categorySlug}`;
    if (cat) categoryId = cat.id;
  }

  const [wo] = await sql`
    INSERT INTO work_orders (user_id, category_id, title, description, priority, created_by, status)
    VALUES (${user.userId}, ${categoryId}, ${title.trim()}, ${description || null}, ${priority || 'medium'}, ${createdBy || null}, 'open')
    RETURNING *
  `;

  return NextResponse.json({ workOrder: wo }, { status: 201 });
}
