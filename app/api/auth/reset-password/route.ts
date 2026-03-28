import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

/**
 * POST /api/auth/reset-password
 * Validates the reset token and sets a new password.
 */
export async function POST(request: Request) {
  try {
    const { email, token, newPassword } = await request.json();

    if (!email || !token || !newPassword) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return NextResponse.json(
        { error: 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية' },
        { status: 400 }
      );
    }

    // Check token expiry
    if (new Date() > user.resetTokenExpiry) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: null, resetTokenExpiry: null },
      });
      return NextResponse.json(
        { error: 'انتهت صلاحية رابط إعادة التعيين. يرجى طلب رابط جديد.' },
        { status: 400 }
      );
    }

    // Verify token matches (compare raw token with hashed one in DB)
    const isValidToken = await bcrypt.compare(token, user.resetToken);
    if (!isValidToken) {
      return NextResponse.json(
        { error: 'رابط إعادة التعيين غير صالح' },
        { status: 400 }
      );
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح',
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
