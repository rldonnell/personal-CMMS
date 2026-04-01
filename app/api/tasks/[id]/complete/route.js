import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST /api/tasks/[id]/complete
export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { notes, cost } = await request.json().catch(() => ({}));
    const sql = getDb();
    const taskId = params.id;

    // Verify task belongs to user
    const [task] = await sql`
      SELECT * FROM tasks WHERE id = ${taskId} AND user_id = ${user.userId}
    `;
    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    const now = new Date();

    // Log completion
    await sql`
      INSERT INTO task_history (task_id, user_id, completed_at, notes, cost)
      VALUES (${taskId}, ${user.userId}, ${now.toISOString()}, ${notes || null}, ${cost || null})
    `;

    // Calculate next due date and update task
    const nextDue = new Date(now);
    if (task.interval_days) {
      nextDue.setDate(nextDue.getDate() + task.interval_days);
    }

    const [updated] = await sql`
      UPDATE tasks
      SET last_completed = ${now.toISOString()},
          next_due = ${nextDue.toISOString().slice(0, 10)},
          status = 'upcoming'
      WHERE id = ${taskId}
      RETURNING *
    `;

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error('Complete task error:', error);
    return NextResponse.json({ error: 'Failed to complete task.' }, { status: 500 });
  }
}
