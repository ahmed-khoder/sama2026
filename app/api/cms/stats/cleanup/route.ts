import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

// POST - Cleanup duplicate stats (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all stats
        const allStats = await prisma.heroStat.findMany({
            orderBy: { createdAt: 'asc' }
        });

        // Group by order and keep only the first one
        const seenOrders = new Set<number>();
        const toDelete: string[] = [];

        for (const stat of allStats) {
            if (seenOrders.has(stat.order)) {
                toDelete.push(stat.id);
            } else {
                seenOrders.add(stat.order);
            }
        }

        // Delete duplicates
        if (toDelete.length > 0) {
            await prisma.heroStat.deleteMany({
                where: { id: { in: toDelete } }
            });
        }

        // Return remaining stats
        const remaining = await prisma.heroStat.findMany({
            orderBy: { order: 'asc' }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json({
            deleted: toDelete.length,
            remaining: remaining.length,
            stats: remaining
        });
    } catch (error) {
        console.error('Error cleaning stats:', error);
        return NextResponse.json({ error: 'Failed to clean stats' }, { status: 500 });
    }
}
