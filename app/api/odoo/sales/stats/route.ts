import { NextResponse } from 'next/server';
import { getSalesStats } from '@/lib/odoo/sales';

// Cache configuration (5 minutes)
let cachedData: { stats: any; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET() {
    try {
        // Check if we have valid cached data
        const now = Date.now();
        if (cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
            return NextResponse.json({
                success: true,
                data: cachedData.stats,
                lastUpdated: new Date(cachedData.timestamp).toISOString(),
                cached: true,
            });
        }

        // Fetch fresh data from Odoo
        const stats = await getSalesStats();

        // Update cache
        cachedData = {
            stats,
            timestamp: now,
        };

        return NextResponse.json({
            success: true,
            data: stats,
            lastUpdated: new Date(now).toISOString(),
            cached: false,
        });
    } catch (error) {
        console.error('Error in sales stats API:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'فشل في جلب إحصائيات المبيعات من Odoo',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

// Force refresh cache (POST request)
export async function POST() {
    try {
        const stats = await getSalesStats();
        const now = Date.now();

        // Update cache
        cachedData = {
            stats,
            timestamp: now,
        };

        return NextResponse.json({
            success: true,
            data: stats,
            lastUpdated: new Date(now).toISOString(),
            message: 'تم تحديث البيانات بنجاح',
        });
    } catch (error) {
        console.error('Error refreshing sales stats:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'فشل في تحديث إحصائيات المبيعات',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
