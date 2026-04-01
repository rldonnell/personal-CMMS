import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// POST /api/tasks/[id]/toggle — Toggle a task's hidden status
export async function POST(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { hidden } = await request.json();
    const taskId = parseInt(params.id);

    if (hidden === undefined) {
      return NextResponse.json({ error: 'hidden is required.' }, { status: 400 });
    }

    const sql = getDb();

    await sql`
      INSERT INTO user_task_prefs (user_id, task_id, hidden)
      VALUES (${user.userId}, ${taskId}, ${hidden})
      ON CONFLICT (user_id, task_id) DO UPDATE SET hidden = ${hidden}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Toggle task error:', error);
    return NextResponse.json({ error: 'Failed to toggle task.' }, { status: 500 });
  }
}
