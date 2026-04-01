import { getDb } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { NextResponse } from 'next/server';

// Admin emails that can access user data
const ADMIN_EMAILS = [
  'rdonnell@p5marketing.com',
];

// GET /api/admin/users — list all registered users (admin only)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check admin access
  const sql = getDb();
  const [currentUser] = await sql`SELECT email FROM users WHERE id = ${user.userId}`;
  if (!currentUser || !ADMIN_EMAILS.includes(currentUser.email.toLowerCase())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const users = await sql`
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.company,
        u.created_at,
        COUNT(DISTINCT th.id)::int as tasks_completed,
        MAX(th.completed_at) as last_activity
      FROM users u
      LEFT JOIN task_history th ON th.user_id = u.id
      GROUP BY u.id, u.first_name, u.last_name, u.email, u.company, u.created_at
      ORDER BY u.created_at DESC
    `;

    return NextResponse.json({ users, total: users.length });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users.' }, { status: 500 });
  }
}
