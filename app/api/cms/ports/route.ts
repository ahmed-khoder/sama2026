import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// GET - List all active port operations
export async function GET() {
    try {
        const ports = await prisma.portOperation.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(ports);
    } catch (error: unknown) {
        console.error('Error fetching ports:', error);
        return NextResponse.json({ error: 'Failed to fetch ports' }, { status: 500 });
    }
}

// POST - Create new port operation (Admin only)
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

        const port = await prisma.portOperation.create({
            data: {
                nameAr: body.nameAr,
                nameEn: body.nameEn,
                image: body.image || null,
                descAr: body.descAr || '',
                descEn: body.descEn || '',
                factsJson: body.factsJson || '[]',
                order: body.order ?? 0,
            }
        });

        // ── Media Library: link image on creation ──
        if (body.image) await linkMedia(body.image, 'service', port.id);

        revalidatePath('/services', 'layout');
        return NextResponse.json(port, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating port:', error);
        return NextResponse.json({ error: 'Failed to create port' }, { status: 500 });
    }
}
