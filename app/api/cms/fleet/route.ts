import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// GET - List all active fleet trucks
export async function GET() {
    try {
        const trucks = await prisma.fleetTruck.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(trucks);
    } catch (error: unknown) {
        console.error('Error fetching fleet:', error);
        return NextResponse.json({ error: 'Failed to fetch fleet' }, { status: 500 });
    }
}

// POST - Create new fleet truck (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.nameAr || !body.nameEn) {
            return NextResponse.json(
                { error: 'nameAr and nameEn are required' },
                { status: 400 }
            );
        }

        const truck = await prisma.fleetTruck.create({
            data: {
                nameAr: body.nameAr,
                nameEn: body.nameEn,
                image: body.image || null,
                descAr: body.descAr || '',
                descEn: body.descEn || '',
                specsJson: body.specsJson || '[]',
                order: body.order ?? 0,
            }
        });

        // ── Media Library: link image on creation ──
        if (body.image) await linkMedia(body.image, 'service', truck.id);

        revalidatePath('/services', 'layout');
        return NextResponse.json(truck, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating fleet truck:', error);
        return NextResponse.json({ error: 'Failed to create fleet truck' }, { status: 500 });
    }
}
