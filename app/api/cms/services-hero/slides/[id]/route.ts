import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia, unlinkAllForEntity } from '@/lib/media-library';

// Helper: sync a single slide image field
async function syncSlideImage(oldUrl: string | null | undefined, newUrl: string | null | undefined, entityId: string) {
    if (oldUrl && oldUrl !== newUrl) {
        await unlinkMedia(oldUrl, 'service', entityId);
    }
    if (newUrl && newUrl !== oldUrl) {
        await linkMedia(newUrl, 'service', entityId);
    }
}

// GET single slide
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const slide = await prisma.servicesHeroSlide.findUnique({
            where: { id: params.id }
        });

        if (!slide) {
            return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
        }

        return NextResponse.json(slide);
    } catch (error) {
        console.error('Error fetching slide:', error);
        return NextResponse.json({ error: 'Failed to fetch slide' }, { status: 500 });
    }
}

// PUT - Update slide (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Fetch existing record to detect replaced images
        const existing = await prisma.servicesHeroSlide.findUnique({
            where: { id: params.id },
            select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true }
        });

        const slide = await prisma.servicesHeroSlide.update({
            where: { id: params.id },
            data: {
                ...(body.imageDesktopAr !== undefined && { imageDesktopAr: body.imageDesktopAr }),
                ...(body.imageDesktopEn !== undefined && { imageDesktopEn: body.imageDesktopEn }),
                ...(body.imageMobile !== undefined && { imageMobile: body.imageMobile }),
                ...(body.order !== undefined && { order: body.order }),
                ...(body.isActive !== undefined && { isActive: body.isActive }),
            }
        });

        // ── Media Library: sync image links ──
        if (existing) {
            if (body.imageDesktopAr !== undefined) await syncSlideImage(existing.imageDesktopAr, body.imageDesktopAr, params.id);
            if (body.imageDesktopEn !== undefined) await syncSlideImage(existing.imageDesktopEn, body.imageDesktopEn, params.id);
            if (body.imageMobile !== undefined) await syncSlideImage(existing.imageMobile, body.imageMobile, params.id);
        }

        revalidatePath('/services', 'layout');
        return NextResponse.json(slide);
    } catch (error) {
        console.error('Error updating slide:', error);
        return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
    }
}

// DELETE slide (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ── Media Library: unlink all media before deleting ──
        await unlinkAllForEntity('service', params.id);

        await prisma.servicesHeroSlide.delete({
            where: { id: params.id }
        });

        revalidatePath('/services', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting slide:', error);
        return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
    }
}
