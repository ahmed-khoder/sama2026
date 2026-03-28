import { SignJWT, jwtVerify, JWTPayload } from 'jose';

/**
 * JWT Utility — uses the 'jose' library (Edge-compatible, works in Next.js middleware).
 * Tokens are signed with HS256 using a secret from JWT_SECRET env var.
 */

function getSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is required. Set it in your .env file.');
    }
    return new TextEncoder().encode(secret);
}

export interface TokenPayload extends JWTPayload {
    sub: string;  // user ID
    email: string;
    role: string;
    name: string;
    permissions: string[];
}

/**
 * Create a signed JWT access token.
 * Default expiry: 24 hours.
 */
export async function signToken(payload: {
    userId: string;
    email: string;
    role: string;
    name: string;
    permissions?: string[];
}, expiresIn: string = '24h'): Promise<string> {
    const token = await new SignJWT({
        email: payload.email,
        role: payload.role,
        name: payload.name,
        permissions: payload.permissions || [],
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(payload.userId)
        .setIssuedAt()
        .setExpirationTime(expiresIn)
        .setIssuer('sama-logistics')
        .sign(getSecret());

    return token;
}

/**
 * Verify and decode a JWT token.
 * Returns the decoded payload or null if invalid/expired.
 */
export async function verifyToken(token: string): Promise<TokenPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret(), {
            issuer: 'sama-logistics',
        });
        return payload as TokenPayload;
    } catch {
        return null;
    }
}

/**
 * Create a refresh token with longer expiry.
 * Default: 7 days.
 */
export async function signRefreshToken(userId: string): Promise<string> {
    const token = await new SignJWT({})
        .setProtectedHeader({ alg: 'HS256' })
        .setSubject(userId)
        .setIssuedAt()
        .setExpirationTime('7d')
        .setIssuer('sama-logistics-refresh')
        .sign(getSecret());

    return token;
}

/**
 * Verify a refresh token.
 */
export async function verifyRefreshToken(token: string): Promise<string | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret(), {
            issuer: 'sama-logistics-refresh',
        });
        return payload.sub || null;
    } catch {
        return null;
    }
}
