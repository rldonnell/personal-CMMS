import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }

    const sql = getDb();

    // Look up the token
    const [resetToken] = await sql`
      SELECT id, user_id FROM password_reset_tokens
      WHERE token = ${token}
      AND used = false
      AND expires_at > NOW()
    `;

    if (!resetToken) {
      return NextResponse.json({
        error: 'This reset link is invalid or has expired. Please request a new one.',
      }, { status: 400 });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user password
    await sql`
      UPDATE users SET password_hash = ${passwordHash}
      WHERE id = ${resetToken.user_id}
    `;

    // Mark token as used
    await sql`
      UPDATE password_reset_tokens SET used = true
      WHERE id = ${resetToken.id}
    `;

    return NextResponse.json({ success: true, message: 'Password reset successfully!' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
