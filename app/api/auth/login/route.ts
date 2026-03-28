import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { signToken } from '@/lib/jwt';
import bcrypt from 'bcryptjs';
import { loginSchema } from '@/lib/validations';
import { loginLimiter, getClientIP } from '@/lib/rate-limiter';
import { parsePermissions } from '@/lib/permissions';

export async function POST(request: Request) {
  try {
    // Rate Limiting: 5 محاولات كل 15 دقيقة لكل IP
    const ip = getClientIP(request);
    const rateCheck = loginLimiter.check(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `تجاوزت الحد المسموح. حاول مرة أخرى بعد ${rateCheck.resetInSeconds} ثانية` },
        { 
          status: 429,
          headers: { 'Retry-After': String(rateCheck.resetInSeconds) },
        }
      );
    }
    const body = await request.json();

    // Validate input with Zod
    const result = loginSchema.safeParse(body);
    if (!result.success) {
      const firstError = result.error.issues[0]?.message || 'بيانات غير صالحة';
      return NextResponse.json(
        { error: firstError },
        { status: 400 }
      );
    }

    const { email, password } = result.data;

    // 1. Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // 2. Check user exists
    if (!user) {
      return NextResponse.json(
        { error: 'بيانات الدخول غير صحيحة' },
        { status: 401 }
      );
    }

    // 3. Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'هذا الحساب معطل. يرجى التواصل مع الإدارة' },
        { status: 403 }
      );
    }

    // 4. Verify password with bcrypt only (no plaintext fallback)
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // 5. Generate JWT token
    const userPermissions = parsePermissions(user.permissions);
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || '',
      permissions: userPermissions,
    });

    // 6. Return user data (without password or token)
    // التوكن يُرسل فقط عبر HttpOnly cookie — لا نكشفه في body لحماية من XSS
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });

    // 7. Set HttpOnly cookie for secure auth
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours (matches JWT expiry)
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
