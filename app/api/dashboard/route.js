import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// GET /api/dashboard — summary stats for the dashboard
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = getDb();

  const today = new Date().toISOString().slice(0, 10);
  const weekFromNow = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);

  // Overdue tasks
  const [overdueCount] = await sql`
    SELECT COUNT(*)::int as count FROM tasks
    WHERE user_id = ${user.userId} AND next_due < ${today}
  `;

  // Due this week
  const [dueThisWeek] = await sql`
    SELECT COUNT(*)::int as count FROM tasks
    WHERE user_id = ${user.userId} AND next_due >= ${today} AND next_due <= ${weekFromNow}
  `;

  // Total active tasks
  const [totalTasks] = await sql`
    SELECT COUNT(*)::int as count FROM tasks WHERE user_id = ${user.userId}
  `;

  // Completed this month
  const monthStart = new Date();
  monthStart.setDate(1);
  const [completedThisMonth] = await sql`
    SELECT COUNT(*)::int as count FROM task_history
    WHERE user_id = ${user.userId} AND completed_at >= ${monthStart.toISOString()}
  `;

  // Tasks by category
  const categoryStats = await sql`
    SELECT c.name, c.slug, c.color, c.icon,
           COUNT(t.id)::int as total_tasks,
           COUNT(CASE WHEN t.next_due < ${today} THEN 1 END)::int as overdue,
           COUNT(CASE WHEN t.next_due >= ${today} AND t.next_due <= ${weekFromNow} THEN 1 END)::int as due_soon
    FROM categories c
    LEFT JOIN tasks t ON t.category_id = c.id AND t.user_id = ${user.userId}
    GROUP BY c.id, c.name, c.slug, c.color, c.icon
    ORDER BY c.id
  `;

  // Upcoming tasks (next 5)
  const upcomingTasks = await sql`
    SELECT t.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM tasks t
    JOIN categories c ON t.category_id = c.id
    WHERE t.user_id = ${user.userId}
    ORDER BY t.next_due ASC
    LIMIT 5
  `;

  return NextResponse.json({
    stats: {
      overdue: overdueCount.count,
      dueThisWeek: dueThisWeek.count,
      totalTasks: totalTasks.count,
      completedThisMonth: completedThisMonth.count,
    },
    categories: categoryStats,
    upcomingTasks,
  });
}
