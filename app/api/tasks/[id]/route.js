import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// DELETE /api/tasks/[id]
export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = getDb();
  await sql`DELETE FROM tasks WHERE id = ${params.id} AND user_id = ${user.userId}`;

  return NextResponse.json({ success: true });
}

// PATCH /api/tasks/[id]
export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const updates = await request.json();
    const sql = getDb();

    const [task] = await sql`
      SELECT * FROM tasks WHERE id = ${params.id} AND user_id = ${user.userId}
    `;
    if (!task) return NextResponse.json({ error: 'Task not found.' }, { status: 404 });

    const [updated] = await sql`
      UPDATE tasks
      SET name = ${updates.name || task.name},
          description = ${updates.description || task.description},
          interval_days = ${updates.intervalDays || task.interval_days},
          priority = ${updates.priority || task.priority},
          next_due = ${updates.nextDue || task.next_due}
      WHERE id = ${params.id}
      RETURNING *
    `;

    return NextResponse.json({ task: updated });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 });
  }
}
