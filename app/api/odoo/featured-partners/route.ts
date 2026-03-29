import { NextResponse } from 'next/server';
import { getFeaturedPartners } from '@/lib/odooClient';
import { getOdooDataCacheVersion } from '@/lib/odooClient';

// ─── Simple in-memory cache with version-based invalidation ──────────────────
let _partnersCache: { data: any[]; version: number; expiresAt: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

async function getCachedFeaturedPartners() {
    const currentVersion = getOdooDataCacheVersion();
    
    // Return cached data if valid AND same version (settings haven't changed)
    if (_partnersCache && _partnersCache.version === currentVersion && Date.now() < _partnersCache.expiresAt) {
        return _partnersCache.data;
    }

    // Fetch fresh from Odoo
    const raw = await getFeaturedPartners();
    const partners = (raw as { name: string; image_128: string | false }[]).map(p => ({
        ...p,
        image_128: p.image_128 ? `data:image/png;base64,${p.image_128}` : null,
    }));

    // Store in cache with current version
    _partnersCache = { data: partners, version: currentVersion, expiresAt: Date.now() + CACHE_TTL_MS };
    return partners;
}

export async function GET() {
    try {
        const partners = await getCachedFeaturedPartners();

        return NextResponse.json(
            { partners, count: partners.length },
            { status: 200 }
        );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const isTimeout = message.includes('timeout');

        console.error('[/api/odoo/featured-partners] Fetch error:', message);

        // ── Graceful fallback: return empty array instead of crashing ──
        // The ClientsMarquee component handles an empty partners array gracefully.
        return NextResponse.json(
            {
                partners: [],
                count: 0,
                warning: isTimeout
                    ? 'Odoo timed out — showing cached or empty partner list.'
                    : `Odoo unavailable: ${message}`,
            },
            { status: 200 }  // 200 intentional: the page should still render
        );
    }
}
