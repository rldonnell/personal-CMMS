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

  // Overdue tasks (excluding hidden and disabled categories)
  const [overdueCount] = await sql`
    SELECT COUNT(*)::int as count FROM tasks t
    LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
    LEFT JOIN user_categories uc ON uc.category_id = t.category_id AND uc.user_id = ${user.userId}
    WHERE t.user_id = ${user.userId} AND t.next_due < ${today}
    AND COALESCE(utp.hidden, false) = false AND COALESCE(uc.enabled, true) = true
  `;

  // Due this week (excluding hidden and disabled categories)
  const [dueThisWeek] = await sql`
    SELECT COUNT(*)::int as count FROM tasks t
    LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
    LEFT JOIN user_categories uc ON uc.category_id = t.category_id AND uc.user_id = ${user.userId}
    WHERE t.user_id = ${user.userId} AND t.next_due >= ${today} AND t.next_due <= ${weekFromNow}
    AND COALESCE(utp.hidden, false) = false AND COALESCE(uc.enabled, true) = true
  `;

  // Total active tasks (excluding hidden and disabled categories)
  const [totalTasks] = await sql`
    SELECT COUNT(*)::int as count FROM tasks t
    LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
    LEFT JOIN user_categories uc ON uc.category_id = t.category_id AND uc.user_id = ${user.userId}
    WHERE t.user_id = ${user.userId}
    AND COALESCE(utp.hidden, false) = false AND COALESCE(uc.enabled, true) = true
  `;

  // Completed this month
  const monthStart = new Date();
  monthStart.setDate(1);
  const [completedThisMonth] = await sql`
    SELECT COUNT(*)::int as count FROM task_history
    WHERE user_id = ${user.userId} AND completed_at >= ${monthStart.toISOString()}
  `;

  // Tasks by category (excluding hidden tasks and disabled categories)
  const categoryStats = await sql`
    SELECT c.name, c.slug, c.color, c.icon, COALESCE(uc.enabled, true) as enabled,
           COUNT(t.id)::int as total_tasks,
           COUNT(CASE WHEN t.next_due < ${today} THEN 1 END)::int as overdue,
           COUNT(CASE WHEN t.next_due >= ${today} AND t.next_due <= ${weekFromNow} THEN 1 END)::int as due_soon
    FROM categories c
    LEFT JOIN user_categories uc ON uc.category_id = c.id AND uc.user_id = ${user.userId}
    LEFT JOIN tasks t ON t.category_id = c.id AND t.user_id = ${user.userId}
    LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
    WHERE COALESCE(utp.hidden, false) = false
    GROUP BY c.id, c.name, c.slug, c.color, c.icon, uc.enabled
    ORDER BY c.id
  `;

  // Upcoming tasks (next 5, excluding hidden and disabled categories)
  const upcomingTasks = await sql`
    SELECT t.*, c.name as category_name, c.slug as category_slug, c.color as category_color
    FROM tasks t
    JOIN categories c ON t.category_id = c.id
    LEFT JOIN user_task_prefs utp ON utp.task_id = t.id AND utp.user_id = ${user.userId}
    LEFT JOIN user_categories uc ON uc.category_id = t.category_id AND uc.user_id = ${user.userId}
    WHERE t.user_id = ${user.userId}
    AND COALESCE(utp.hidden, false) = false AND COALESCE(uc.enabled, true) = true
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
