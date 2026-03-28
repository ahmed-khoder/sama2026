import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/db';
import { parsePermissions } from '@/lib/permissions';

/**
 * GET /api/auth/me
 * Validates the JWT cookie and returns the current user's info.
 * Returns 401 if token is missing, invalid, or expired.
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // Fetch fresh user data from DB
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        phone: true,
        isActive: true,
        permissions: true,
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User not found or inactive' }, { status: 401 });
    }

    // Parse permissions from JSON string
    const { permissions: permissionsJson, ...userData } = user;
    const permissions = parsePermissions(permissionsJson);

    return NextResponse.json({ user: { ...userData, permissions } });
  } catch (error) {
    console.error('Auth /me error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
