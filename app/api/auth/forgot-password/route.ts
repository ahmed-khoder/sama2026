import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendPasswordResetEmail } from '@/lib/email';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/forgot-password
 * Generates a reset token, stores it hashed in DB, and sends email.
 * Always returns success to avoid leaking whether an email exists.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // Only allow password reset via email for ADMIN accounts
    // Other users (EMPLOYEE, CLIENT) should contact their admin
    if (user && user.isActive && user.role === 'ADMIN') {
      // Generate a secure random token
      const rawToken = crypto.randomBytes(32).toString('hex');

      // Hash it before storing (so DB leak doesn't expose tokens)
      const hashedToken = await bcrypt.hash(rawToken, 10);

      // Store in DB with 1-hour expiry
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: hashedToken,
          resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      // Build reset URL
      const appUrl = process.env.APP_URL || 'http://localhost:3000';
      const resetUrl = `${appUrl}/auth/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

      // Send email
      try {
        await sendPasswordResetEmail(email, resetUrl, user.name || undefined);
      } catch (emailErr) {
        console.error('Failed to send reset email:', emailErr);
        return NextResponse.json(
          { error: 'فشل في إرسال البريد الإلكتروني. تأكد من إعدادات SMTP.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني.',
      });
    }

    // Non-admin user or user not found — tell them to contact admin
    if (user && user.isActive && user.role !== 'ADMIN') {
      return NextResponse.json({
        success: false,
        contactAdmin: true,
        message: 'لاستعادة كلمة المرور، يرجى التواصل مع مدير النظام.',
      });
    }

    // Unknown email — generic success (don't leak info)
    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد مسجلاً، سيتم إرسال رابط إعادة التعيين.',
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
