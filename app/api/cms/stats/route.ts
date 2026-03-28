import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { heroStatSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

// GET all hero stats
export async function GET() {
    try {
        const stats = await prisma.heroStat.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(stats);
    } catch (error: unknown) {
        console.error('Error fetching hero stats:', error);
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
        const result = heroStatSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.issues },
                { status: 400 }
            );
        }

        // Get highest order number
        const maxOrder = await prisma.heroStat.findFirst({
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const stat = await prisma.heroStat.create({
            data: {
                value: result.data.value,
                labelAr: result.data.labelAr,
                labelEn: result.data.labelEn,
                icon: result.data.icon || 'Clock',
                order: result.data.order ?? (maxOrder?.order ?? 0) + 1,
                isActive: result.data.isActive ?? true,
            }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json(stat, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating hero stat:', error);
        return NextResponse.json({ error: 'Failed to create stat' }, { status: 500 });
    }
}
