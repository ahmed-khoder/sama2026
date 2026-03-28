import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET - List all active stats
export async function GET() {
    try {
        const stats = await prisma.servicesPageStat.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(stats);
    } catch (error: unknown) {
        console.error('Error fetching services page stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}

// POST - Create new stat (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.valueAr || !body.valueEn || !body.labelAr || !body.labelEn) {
            return NextResponse.json(
                { error: 'valueAr, valueEn, labelAr, and labelEn are required' },
                { status: 400 }
            );
        }

        const stat = await prisma.servicesPageStat.create({
            data: {
                icon: body.icon || 'Truck',
                valueAr: body.valueAr,
                valueEn: body.valueEn,
                labelAr: body.labelAr,
                labelEn: body.labelEn,
                order: body.order ?? 0,
            }
        });

        revalidatePath('/services', 'layout');
        return NextResponse.json(stat, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating stat:', error);
        return NextResponse.json({ error: 'Failed to create stat' }, { status: 500 });
    }
}
