import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getPermissionForRoute } from '@/lib/permissions';

// ─── JWT Secret ──────────────────────────────────────────────────────────────
const getSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET environment variable is required.');
    return new TextEncoder().encode(secret);
};

// ─── Admin-only routes ───────────────────────────────────────────────────────
const ADMIN_ONLY_ROUTES = [
    '/dashboard/website-settings',
    '/dashboard/settings',
];

/**
 * Returns true if the given role satisfies the required access level.
 * Role hierarchy: ADMIN > EMPLOYEE > CLIENT
 */
function hasRequiredRole(userRole: string, requiredRole: 'ADMIN' | 'EMPLOYEE'): boolean {
    if (requiredRole === 'ADMIN') return userRole === 'ADMIN';
    if (requiredRole === 'EMPLOYEE') return userRole === 'ADMIN' || userRole === 'EMPLOYEE';
    return true;
}

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const response = NextResponse.next();

    // ── Dashboard route protection ────────────────────────────────────────────
    if (pathname.startsWith('/dashboard')) {
        const token =
            request.cookies.get('auth-token')?.value ||
            request.headers.get('authorization')?.replace('Bearer ', '');

        // 1. No token → redirect to login
        if (!token) {
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        let payload: { role?: string; permissions?: string[] } = {};

        try {
            const result = await jwtVerify(token, getSecret(), { issuer: 'sama-logistics' });
            payload = result.payload as { role?: string; permissions?: string[] };
        } catch {
            // Token expired or invalid → redirect to login
            const loginUrl = new URL('/auth/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            const redirectResponse = NextResponse.redirect(loginUrl);
            redirectResponse.cookies.delete('auth-token');
            return redirectResponse;
        }

        const userRole = (payload.role as string) || 'CLIENT';
        const userPermissions: string[] = (payload.permissions as string[]) || [];

        // 2. Admin-only routes check
        for (const adminRoute of ADMIN_ONLY_ROUTES) {
            if (pathname.startsWith(adminRoute)) {
                if (!hasRequiredRole(userRole, 'ADMIN')) {
                    const dashboardUrl = new URL('/dashboard', request.url);
                    dashboardUrl.searchParams.set('error', 'unauthorized');
                    return NextResponse.redirect(dashboardUrl);
                }
                break;
            }
        }

        // 3. Permission-based access control (for EMPLOYEE role)
        if (userRole === 'EMPLOYEE') {
            const requiredPermission = getPermissionForRoute(pathname);
            if (requiredPermission && !userPermissions.includes(requiredPermission)) {
                const dashboardUrl = new URL('/dashboard', request.url);
                dashboardUrl.searchParams.set('error', 'unauthorized');
                return NextResponse.redirect(dashboardUrl);
            }
        }

        // 4. CLIENT role — only allowed specific routes
        if (userRole === 'CLIENT') {
            const allowedClientPrefixes = ['/dashboard/shipments', '/dashboard/quotes'];
            const isClientAllowed = pathname === '/dashboard' || pathname === '/dashboard/' ||
                allowedClientPrefixes.some(prefix => pathname.startsWith(prefix));
            if (!isClientAllowed) {
                const dashboardUrl = new URL('/dashboard', request.url);
                dashboardUrl.searchParams.set('error', 'unauthorized');
                return NextResponse.redirect(dashboardUrl);
            }
        }
    }

    // ── Redirect logged-in users away from login page ─────────────────────────
    if (pathname === '/auth/login') {
        const token = request.cookies.get('auth-token')?.value;
        if (token) {
            try {
                await jwtVerify(token, getSecret(), { issuer: 'sama-logistics' });
                return NextResponse.redirect(new URL('/dashboard', request.url));
            } catch {
                // Token invalid, let them access login page
            }
        }
    }

    // ── Cache static assets aggressively ─────────────────────────────────────
    if (pathname.match(/\.(jpg|jpeg|png|gif|svg|ico|webp|avif|woff|woff2|ttf|eot)$/)) {
        response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    }

    // ── Cache CSS and JS with shorter cache ───────────────────────────────────
    if (pathname.match(/\.(css|js)$/)) {
        response.headers.set('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    }

    // ── Security headers ──────────────────────────────────────────────────────
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // ── Content Security Policy (CSP) — يمنع حقن سكريبتات خبيثة ────────────
    response.headers.set('Content-Security-Policy', [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",  // Next.js يحتاج unsafe-eval في dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob: https://images.unsplash.com https://ui-avatars.com",
        "connect-src 'self' https://cdn.jsdelivr.net",
        "frame-ancestors 'none'",
    ].join('; '));

    // ── HSTS — يفرض HTTPS لمدة سنة ──────────────────────────────────────────
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

    // ── Permissions Policy — يمنع الوصول للكاميرا والميكروفون ─────────────────
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes (they have their own auth)
         * - _next/static (already optimized by Next.js)
         * - _next/image (Next.js image optimization)
         * - favicon.ico
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
