import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/tasks?category=hvac&status=upcoming&showHidden=true
export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');
  const showHidden = searchParams.get('showHidden') === 'true';

  const sql = getDb();

  try {
    let tasks;
    if (showHidden) {
      // Show ALL tasks including hidden ones (for settings page)
      if (category && status) {
        tasks = await sql`
          SELECT t.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                 e.name as equipment_name, COALESCE(utp.hidden, false) as hidden
          FROM tasks t
          JOIN categories c ON t.category_id = c.id
          LEFT JOIN equipment e ON t.equipment_id = e.id
          LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
          WHERE t.user_id = ${user.userId} AND c.slug = ${category} AND t.status = ${status}
          ORDER BY t.next_due ASC
        `;
      } else if (category) {
        tasks = await sql`
          SELECT t.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                 e.name as equipment_name, COALESCE(utp.hidden, false) as hidden
          FROM tasks t
          JOIN categories c ON t.category_id = c.id
          LEFT JOIN equipment e ON t.equipment_id = e.id
          LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
          WHERE t.user_id = ${user.userId} AND c.slug = ${category}
          ORDER BY t.next_due ASC
        `;
      } else {
        tasks = await sql`
          SELECT t.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                 e.name as equipment_name, COALESCE(utp.hidden, false) as hidden
          FROM tasks t
          JOIN categories c ON t.category_id = c.id
          LEFT JOIN equipment e ON t.equipment_id = e.id
          LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
          WHERE t.user_id = ${user.userId}
          ORDER BY t.next_due ASC
        `;
      }
    } else {
      // Normal mode: hide hidden tasks
      if (category && status) {
        tasks = await sql`
          SELECT t.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                 e.name as equipment_name
          FROM tasks t
          JOIN categories c ON t.category_id = c.id
          LEFT JOIN equipment e ON t.equipment_id = e.id
          LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
          WHERE t.user_id = ${user.userId} AND c.slug = ${category} AND t.status = ${status}
            AND COALESCE(utp.hidden, false) = false
          ORDER BY t.next_due ASC
        `;
      } else if (category) {
        tasks = await sql`
          SELECT t.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                 e.name as equipment_name
          FROM tasks t
          JOIN categories c ON t.category_id = c.id
          LEFT JOIN equipment e ON t.equipment_id = e.id
          LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
          WHERE t.user_id = ${user.userId} AND c.slug = ${category}
            AND COALESCE(utp.hidden, false) = false
          ORDER BY t.next_due ASC
        `;
      } else {
        tasks = await sql`
          SELECT t.*, c.name as category_name, c.slug as category_slug, c.color as category_color,
                 e.name as equipment_name
          FROM tasks t
          JOIN categories c ON t.category_id = c.id
          LEFT JOIN equipment e ON t.equipment_id = e.id
          LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
          WHERE t.user_id = ${user.userId}
            AND COALESCE(utp.hidden, false) = false
          ORDER BY t.next_due ASC
        `;
      }
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks.', tasks: [] }, { status: 500 });
  }
}

// POST /api/tasks — create a custom task
export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { name, description, categorySlug, intervalDays, priority, nextDue } = await request.json();

    if (!name || !categorySlug) {
      return NextResponse.json({ error: 'Name and category are required.' }, { status: 400 });
    }

    const sql = getDb();

    // Get category
    const [cat] = await sql`SELECT id FROM categories WHERE slug = ${categorySlug}`;
    if (!cat) return NextResponse.json({ error: 'Invalid category.' }, { status: 400 });

    // Get user's equipment for this category
    const [equip] = await sql`
      SELECT id FROM equipment WHERE user_id = ${user.userId} AND category_id = ${cat.id} LIMIT 1
    `;

    const dueDate = nextDue || new Date(Date.now() + (intervalDays || 30) * 86400000).toISOString().slice(0, 10);

    const [task] = await sql`
      INSERT INTO tasks (user_id, equipment_id, category_id, name, description, interval_days, priority, next_due, is_custom, status)
      VALUES (${user.userId}, ${equip?.id || null}, ${cat.id}, ${name}, ${description || null},
              ${intervalDays || 30}, ${priority || 'medium'}, ${dueDate}, true, 'upcoming')
      RETURNING *
    `;

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json({ error: 'Failed to create task.' }, { status: 500 });
  }
}
