import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/history?page=1&limit=20&year=2024
export async function GET(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);
  const year = searchParams.get('year') ? parseInt(searchParams.get('year'), 10) : null;

  const offset = (page - 1) * limit;
  const sql = getDb();

  try {
    // Build year filter if provided
    const yearCondition = year ? `AND EXTRACT(YEAR FROM th.completed_at) = ${year}` : '';

    // Get task history with joins
    const history = await sql`
      SELECT
        th.id,
        th.task_id,
        th.completed_at,
        th.notes,
        th.cost,
        t.name as task_name,
        c.id as category_id,
        c.name as category_name,
        c.slug as category_slug
      FROM task_history th
      JOIN tasks t ON th.task_id = t.id
      JOIN categories c ON t.category_id = c.id
      WHERE th.user_id = ${user.userId} ${yearCondition}
      ORDER BY th.completed_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    // Get total count for the year/all time
    const [countResult] = await sql`
      SELECT COUNT(*) as total FROM task_history th
      JOIN tasks t ON th.task_id = t.id
      WHERE th.user_id = ${user.userId} ${yearCondition}
    `;

    // Get summary stats for the selected year
    const [summaryResult] = await sql`
      SELECT
        COUNT(*) as total_tasks,
        COALESCE(SUM(th.cost), 0) as total_cost
      FROM task_history th
      WHERE th.user_id = ${user.userId} ${yearCondition}
    `;

    return NextResponse.json({
      history,
      total: countResult.total,
      page,
      limit,
      summary: {
        totalTasks: summaryResult.total_tasks,
        totalCost: parseFloat(summaryResult.total_cost),
      },
    });
  } catch (error) {
    console.error('Fetch history error:', error);
    return NextResponse.json({ error: 'Failed to fetch history.' }, { status: 500 });
  }
}
