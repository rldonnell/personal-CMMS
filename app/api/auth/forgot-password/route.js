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

      const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').trim().replace(/\/+$/, '');
      const resetUrl = `${baseUrl}/reset-password?token=${token}`;

      // Send email via Postmark if server token exists
      if (process.env.POSTMARK_SERVER_TOKEN) {
        try {
          await fetch('https://api.postmarkapp.com/email', {
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Postmark-Server-Token': process.env.POSTMARK_SERVER_TOKEN,
            },
            body: JSON.stringify({
              From: process.env.POSTMARK_FROM_EMAIL || 'noreply@homecmms.com',
              To: user.email,
              Subject: 'Reset Your Password - Home CMMS',
              HtmlBody: `<div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;"><div style="background: #154289; padding: 20px; border-radius: 8px 8px 0 0;"><h1 style="color: #fff; margin: 0; font-size: 18px;">Home CMMS</h1></div><div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;"><p>Hi ${user.first_name},</p><p>We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.</p><p style="text-align: center; margin: 24px 0;"><a href="${resetUrl}" style="background: #154289; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">Reset My Password</a></p><p style="font-size: 13px; color: #666;">If the button doesn't work, copy and paste this link:<br/><a href="${resetUrl}" style="color: #154289;">${resetUrl}</a></p><p style="font-size: 13px; color: #999; margin-top: 24px;">If you didn't request this, you can safely ignore this email.</p></div></div>`,
              TextBody: `Hi ${user.first_name},\n\nWe received a request to reset your password. Visit the link below to choose a new one (expires in 1 hour):\n\n${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.\n\n- Home CMMS`,
              MessageStream: 'outbound',
            }),
          });
        } catch (emailError) {
          console.error('Failed to send reset email via Postmark:', emailError);
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
