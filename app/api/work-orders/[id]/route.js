import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// PATCH /api/work-orders/[id] — update status, priority, etc.
export async function PATCH(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = getDb();
  const { id } = params;
  const body = await request.json();

  // Verify ownership
  const [existing] = await sql`SELECT id FROM work_orders WHERE id = ${id} AND user_id = ${user.userId}`;
  if (!existing) {
    return NextResponse.json({ error: 'Work order not found.' }, { status: 404 });
  }

  // Update status
  if (body.status) {
    if (body.status === 'completed') {
      await sql`UPDATE work_orders SET status = 'completed', completed_at = NOW() WHERE id = ${id}`;
    } else {
      await sql`UPDATE work_orders SET status = ${body.status}, completed_at = NULL WHERE id = ${id}`;
    }
  }

  // Update priority
  if (body.priority) {
    await sql`UPDATE work_orders SET priority = ${body.priority} WHERE id = ${id}`;
  }

  const [updated] = await sql`SELECT * FROM work_orders WHERE id = ${id}`;
  return NextResponse.json({ workOrder: updated });
}

// DELETE /api/work-orders/[id]
export async function DELETE(request, { params }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sql = getDb();
  const { id } = params;

  await sql`DELETE FROM work_orders WHERE id = ${id} AND user_id = ${user.userId}`;
  return NextResponse.json({ success: true });
}
