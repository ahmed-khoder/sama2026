import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET - List all active specialized cargo types
export async function GET() {
    try {
        const cargo = await prisma.specializedCargo.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(cargo);
    } catch (error: unknown) {
        console.error('Error fetching specialized cargo:', error);
        return NextResponse.json({ error: 'Failed to fetch cargo types' }, { status: 500 });
    }
}

// POST - Create new cargo type (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.titleAr || !body.titleEn) {
            return NextResponse.json(
                { error: 'titleAr and titleEn are required' },
                { status: 400 }
            );
        }

        const cargo = await prisma.specializedCargo.create({
            data: {
                icon: body.icon || 'Package',
                titleAr: body.titleAr,
                titleEn: body.titleEn,
                badgeAr: body.badgeAr || '',
                badgeEn: body.badgeEn || '',
                descAr: body.descAr || '',
                descEn: body.descEn || '',
                gradient: body.gradient || 'from-sky-500 to-blue-600',
                order: body.order ?? 0,
            }
        });

        revalidatePath('/services', 'layout');
        return NextResponse.json(cargo, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating cargo type:', error);
        return NextResponse.json({ error: 'Failed to create cargo type' }, { status: 500 });
    }
}
