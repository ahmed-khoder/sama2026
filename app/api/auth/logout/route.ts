import { NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clears the auth-token HttpOnly cookie.
 */
export async function POST() {
    const response = NextResponse.json({ success: true });

    // Clear the HttpOnly cookie
    response.cookies.set('auth-token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0, // Immediately expire the cookie
    });

    return response;
}
