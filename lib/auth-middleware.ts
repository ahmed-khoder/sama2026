import { NextRequest } from 'next/server';
import { APIError, Errors } from './api-error-handler';
import { prisma } from './db';
import { verifyToken, TokenPayload } from './jwt';

/**
 * Authentication Middleware for API Routes
 * Uses JWT verification via jose library.
 */

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

/**
 * Extract and verify JWT from cookies (primary) or Authorization header (fallback).
 */
export async function getUserFromRequest(req: NextRequest): Promise<AuthUser | null> {
  // 1. Try cookie first (HttpOnly cookie set by login)
  let token = req.cookies.get('auth-token')?.value;

  // 2. Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  try {
    // Verify JWT token
    const payload = await verifyToken(token);
    if (!payload || !payload.sub) {
      return null;
    }

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name || '',
      role: user.role,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication middleware
 */
export function requireAuth(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getUserFromRequest(req);

    if (!user) {
      throw Errors.Unauthorized('يجب تسجيل الدخول للوصول إلى هذا المورد');
    }

    return handler(req, user);
  };
}

/**
 * Require specific role(s)
 */
export function requireRole(
  roles: string[],
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getUserFromRequest(req);

    if (!user) {
      throw Errors.Unauthorized('يجب تسجيل الدخول للوصول إلى هذا المورد');
    }

    if (!roles.includes(user.role)) {
      throw Errors.Forbidden('ليس لديك صلاحية للوصول إلى هذا المورد');
    }

    return handler(req, user);
  };
}

/**
 * Require admin role
 */
export function requireAdmin(
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  return requireRole(['ADMIN'], handler);
}

/**
 * Optional authentication (user might be logged in or not)
 */
export function optionalAuth(
  handler: (req: NextRequest, user: AuthUser | null) => Promise<Response>
) {
  return async (req: NextRequest) => {
    const user = await getUserFromRequest(req);
    return handler(req, user);
  };
}

/**
 * Check if user owns resource
 */
export async function requireOwnership(
  userId: string,
  resourceUserId: string,
  allowAdmin: boolean = true
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  const isOwner = userId === resourceUserId;
  const isAdmin = allowAdmin && user?.role === 'ADMIN';

  if (!isOwner && !isAdmin) {
    throw Errors.Forbidden('ليس لديك صلاحية للوصول إلى هذا المورد');
  }
}

/**
 * Rate limit per user (more strict than IP-based)
 */
export function requireAuthWithRateLimit(
  limit: number,
  windowMs: number,
  handler: (req: NextRequest, user: AuthUser) => Promise<Response>
) {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return requireAuth(async (req: NextRequest, user: AuthUser) => {
    const now = Date.now();
    const userEntry = userRequests.get(user.id);

    if (!userEntry || now > userEntry.resetTime) {
      userRequests.set(user.id, {
        count: 1,
        resetTime: now + windowMs,
      });
    } else if (userEntry.count >= limit) {
      throw Errors.TooManyRequests('تجاوزت الحد المسموح من الطلبات');
    } else {
      userEntry.count++;
    }

    return handler(req, user);
  });
}
