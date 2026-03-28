import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// GET - List all images for a service
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const images = await prisma.serviceImage.findMany({
            where: { serviceId: params.id },
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(images);
    } catch (error: unknown) {
        console.error('Error fetching service images:', error);
        return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
    }
}

// POST - Add new image to service (Admin only)
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Get max order
        const maxOrder = await prisma.serviceImage.findFirst({
            where: { serviceId: params.id },
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const image = await prisma.serviceImage.create({
            data: {
                url: body.url,
                caption: body.caption || null,
                captionEn: body.captionEn || null,
                order: (maxOrder?.order ?? -1) + 1,
                serviceId: params.id
            }
        });

        // ── Media Library: link image on creation ──
        if (body.url) await linkMedia(body.url, 'service', image.id);

        revalidatePath('/services', 'layout');
        return NextResponse.json(image, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating service image:', error);
        return NextResponse.json({ error: 'Failed to create image' }, { status: 500 });
    }
}
