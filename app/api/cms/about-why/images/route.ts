import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia } from '@/lib/media-library';

/**
 * GET /api/cms/about-why/images
 * Fetch all images for Why Choose Us section
 */
export async function GET() {
    try {
        const images = await prisma.aboutWhyImage.findMany({
            where: { sectionId: 'default' },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json(images);
    } catch (error) {
        console.error('Error fetching images:', error);
        return NextResponse.json(
            { error: 'Failed to fetch images' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/cms/about-why/images
 * Add a new image (Admin only)
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { url } = body;

        if (!url) {
            return NextResponse.json(
                { error: 'Image URL is required' },
                { status: 400 }
            );
        }

        // Get current max order
        const maxOrder = await prisma.aboutWhyImage.findFirst({
            where: { sectionId: 'default' },
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const newImage = await prisma.aboutWhyImage.create({
            data: {
                url,
                sectionId: 'default',
                order: (maxOrder?.order ?? -1) + 1
            }
        });

        // ── Media Library: link image on creation ──
        if (url) await linkMedia(url, 'about', newImage.id);

        revalidatePath('/about', 'layout');
        return NextResponse.json(newImage);
    } catch (error) {
        console.error('Error creating image:', error);
        return NextResponse.json(
            { error: 'Failed to create image' },
            { status: 500 }
        );
    }
}
