import { getDb } from '@/lib/db';
import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const sql = getDb();

    // Silently succeed even if email doesn't exist (security best practice)
    const [user] = await sql`SELECT id, first_name, email FROM users WHERE email = ${email.toLowerCase()}`;

    if (user) {
      const token = randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

      // Store the reset token
      await sql`
        INSERT INTO password_reset_tokens (user_id, token, expires_at)
        VALUES (${user.id}, ${token}, ${expiresAt.toISOString()})
      `;

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

      // Try to send email via Resend if API key exists
      if (process.env.RESEND_API_KEY) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: process.env.RESEND_FROM_EMAIL || 'Four Winds Home CMMS <noreply@homecmms.com>',
              to: [user.email],
              subject: 'Reset Your Password — Four Winds Home CMMS',
              html: `<p>Hi ${user.first_name},</p><p>Click the link below to reset your password. This link expires in 1 hour.</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you didn't request this, you can safely ignore this email.</p><p>— Four Winds Home CMMS</p>`,
            }),
          });
        } catch (emailError) {
          console.error('Failed to send reset email via Resend:', emailError);
          // Continue anyway - user can still use the URL
        }
      } else {
        // Log to console for development/testing
        console.log(`[Password Reset] ${user.email}: ${resetUrl}`);
      }
    }

    // Always return success message (don't reveal if email exists)
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
