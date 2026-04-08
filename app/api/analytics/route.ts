/**
 * SAMA Logistics — Analytics API (GA4 Proxy)
 * ═══════════════════════════════════════════
 * Secure backend proxy for Google Analytics 4 data.
 * Returns visitor stats and event counts for the dashboard.
 *
 * NOTE: GA4 Data API requires a service account with
 * "Viewer" access on the GA4 property. Without credentials,
 * this endpoint returns mock/fallback data gracefully.
 *
 * ⚠️ Isolated module — no existing routes affected.
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { hasPermission, parsePermissions } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// GA4 Property ID (numeric, from GA4 Admin → Property Settings)
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '';
const GA4_CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL || '';
const GA4_PRIVATE_KEY = (process.env.GA4_PRIVATE_KEY || '').replace(/\\n/g, '\n');

// Timeout for GA API calls (5 seconds)
const API_TIMEOUT = 5000;

/**
 * Generate a JWT token for Google API authentication.
 * Uses the service account credentials from environment variables.
 */
async function getAccessToken(): Promise<string | null> {
    if (!GA4_CLIENT_EMAIL || !GA4_PRIVATE_KEY) {
        return null;
    }

    try {
        const now = Math.floor(Date.now() / 1000);
        const header = { alg: 'RS256', typ: 'JWT' };
        const payload = {
            iss: GA4_CLIENT_EMAIL,
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600,
        };

        const { createSign } = await import('crypto');

        const encode = (obj: object) =>
            Buffer.from(JSON.stringify(obj)).toString('base64url');

        const headerB64 = encode(header);
        const payloadB64 = encode(payload);
        const signatureInput = `${headerB64}.${payloadB64}`;

        const sign = createSign('RSA-SHA256');
        sign.update(signatureInput);
        const signature = sign.sign(GA4_PRIVATE_KEY, 'base64url');

        const jwt = `${signatureInput}.${signature}`;

        // Exchange JWT for access token
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
            signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!tokenRes.ok) return null;
        const tokenData = await tokenRes.json();
        return tokenData.access_token || null;
    } catch {
        return null;
    }
}

/**
 * Fetch GA4 report data using the Data API v1.
 */
async function fetchGA4Report(
    accessToken: string,
    dateRange: { startDate: string; endDate: string },
    metrics: { name: string }[],
    dimensions?: { name: string }[],
    dimensionFilter?: any
): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const body: any = {
            dateRanges: [dateRange],
            metrics,
        };

        if (dimensions) body.dimensions = dimensions;
        if (dimensionFilter) body.dimensionFilter = dimensionFilter;

        const res = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            }
        );

        clearTimeout(timeout);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        clearTimeout(timeout);
        return null;
    }
}

/**
 * Fetch real-time active users from GA4.
 */
async function fetchRealtimeUsers(accessToken: string): Promise<number> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const res = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runRealtimeReport`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    metrics: [{ name: 'activeUsers' }],
                }),
                signal: controller.signal,
            }
        );

        clearTimeout(timeout);
        if (!res.ok) return 0;
        const data = await res.json();
        return parseInt(data?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
    } catch {
        clearTimeout(timeout);
        return 0;
    }
}

// ─── GET /api/analytics ─────────────────────────────────────────────────────
export async function GET(req: Request) {
    try {
        // Auth guard — requires view_analytics permission
        const user = await getUserFromRequest(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userPermissions = parsePermissions(user.permissions);
        if (!hasPermission(user.role, userPermissions, 'view_analytics')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Default fallback response
        const fallback = {
            activeUsers: 0,
            todayUsers: 0,
            pdfDownloads: 0,
            topCountries: [] as { name: string; users: number }[],
            topCities: [] as { name: string; users: number }[],
            source: 'fallback' as const,
        };

        // Check if GA credentials are configured
        if (!GA4_PROPERTY_ID || !GA4_CLIENT_EMAIL || !GA4_PRIVATE_KEY) {
            return NextResponse.json({
                ...fallback,
                source: 'no-credentials',
                message: 'GA4 credentials not configured. Set GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY.',
            });
        }

        // Get access token
        const accessToken = await getAccessToken();
        if (!accessToken) {
            return NextResponse.json({
                ...fallback,
                source: 'auth-failed',
                message: 'Failed to authenticate with Google Analytics.',
            });
        }

        // Fetch all data in parallel with individual error handling
        const [activeUsers, todayReport, pdfReport, countriesReport, citiesReport] = await Promise.all([
            fetchRealtimeUsers(accessToken).catch(() => 0),
            fetchGA4Report(
                accessToken,
                { startDate: 'today', endDate: 'today' },
                [{ name: 'totalUsers' }]
            ).catch(() => null),
            fetchGA4Report(
                accessToken,
                { startDate: 'today', endDate: 'today' },
                [{ name: 'eventCount' }],
                [{ name: 'eventName' }],
                {
                    filter: {
                        fieldName: 'eventName',
                        stringFilter: { value: 'download_pdf' },
                    },
                }
            ).catch(() => null),
            // Top 5 Countries
            fetchGA4Report(
                accessToken,
                { startDate: '30daysAgo', endDate: 'today' },
                [{ name: 'totalUsers' }],
                [{ name: 'country' }]
            ).catch(() => null),
            // Top 5 Cities
            fetchGA4Report(
                accessToken,
                { startDate: '30daysAgo', endDate: 'today' },
                [{ name: 'totalUsers' }],
                [{ name: 'city' }]
            ).catch(() => null),
        ]);

        const todayUsers = parseInt(todayReport?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);
        const pdfDownloads = parseInt(pdfReport?.rows?.[0]?.metricValues?.[0]?.value || '0', 10);

        // Parse geographic data — top 5, sorted descending
        const parseGeoRows = (report: any): { name: string; users: number }[] => {
            if (!report?.rows) return [];
            return report.rows
                .map((row: any) => ({
                    name: row.dimensionValues?.[0]?.value || 'Unknown',
                    users: parseInt(row.metricValues?.[0]?.value || '0', 10),
                }))
                .filter((r: any) => r.name !== '(not set)' && r.users > 0)
                .sort((a: any, b: any) => b.users - a.users)
                .slice(0, 5);
        };

        return NextResponse.json({
            activeUsers,
            todayUsers,
            pdfDownloads,
            topCountries: parseGeoRows(countriesReport),
            topCities: parseGeoRows(citiesReport),
            source: 'ga4',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[Analytics API] Error:', error);
        return NextResponse.json({
            activeUsers: 0,
            todayUsers: 0,
            pdfDownloads: 0,
            topCountries: [],
            topCities: [],
            source: 'error',
        });
    }
}
