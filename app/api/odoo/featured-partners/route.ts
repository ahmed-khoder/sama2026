import { NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { getFeaturedPartners } from '@/lib/odooClient';

// ─── Cached fetcher (server-side, shared across all requests) ────────────────
// Revalidates every hour, or instantly on POST /api/odoo/sync (revalidateTag)
const getCachedFeaturedPartners = unstable_cache(
    async () => {
        const raw = await getFeaturedPartners();
        // Convert base64 images to data URIs for frontend consumption
        return (raw as { name: string; image_128: string | false }[]).map(p => ({
            ...p,
            image_128: p.image_128 ? `data:image/png;base64,${p.image_128}` : null,
        }));
    },
    ['odoo-featured-partners'],          // cache key
    {
        tags: ['odoo-data'],             // tag used by revalidateTag in /api/odoo/sync
        revalidate: 3600,                // background revalidate every 1 hour
    }
);

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
