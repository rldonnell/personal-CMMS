import { getDb } from '@/lib/db';
import { createToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const sql = getDb();
    const [user] = await sql`SELECT id, first_name, last_name, email FROM users WHERE email = ${email.toLowerCase()}`;

    if (!user) {
      return NextResponse.json({ error: 'No account found with this email.' }, { status: 404 });
    }

    const token = await createToken(user);

    const response = NextResponse.json({ success: true, user: { id: user.id, firstName: user.first_name, email: user.email } });
    response.cookies.set('fw-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}
