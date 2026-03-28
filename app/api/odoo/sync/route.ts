import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { connectToOdoo } from '@/lib/odooClient';

/**
 * POST /api/odoo/sync
 *
 * Purges the 'odoo-data' Next.js cache tag so all unstable_cache-wrapped
 * Odoo fetches (featured-partners, customers, etc.) will be refreshed on
 * the next incoming request.
 *
 * Optionally verifies Odoo connectivity before flushing the cache.
 */
export async function POST() {
    try {
        // 1. Verify Odoo is actually reachable (8s timeout built into connectToOdoo)
        const uid = await connectToOdoo();

        // 2. Purge ALL cached Odoo data in one shot
        revalidateTag('odoo-data');

        return NextResponse.json({
            success: true,
            message: 'Odoo cache cleared. Data will refresh on next page load.',
            odooUid: uid,
            timestamp: new Date().toISOString(),
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        const isTimeout = message.includes('timeout');

        console.error('[/api/odoo/sync] Sync failed:', message);

        return NextResponse.json(
            {
                success: false,
                error: isTimeout
                    ? 'Odoo is not responding (timeout). Cache was NOT cleared.'
                    : `Failed to connect to Odoo: ${message}`,
            },
            { status: isTimeout ? 504 : 502 }
        );
    }
}
