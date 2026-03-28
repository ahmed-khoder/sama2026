import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia, unlinkAllForEntity } from '@/lib/media-library';

// Helper: sync a single slide image field
async function syncSlideImage(oldUrl: string | null | undefined, newUrl: string | null | undefined, entityId: string) {
    if (oldUrl && oldUrl !== newUrl) {
        await unlinkMedia(oldUrl, 'career', entityId);
    }
    if (newUrl && newUrl !== oldUrl) {
        await linkMedia(newUrl, 'career', entityId);
    }
}

// PUT - Update slide (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();

        // Fetch existing record to detect replaced images
        const existing = await prisma.careersHeroSlide.findUnique({
            where: { id },
            select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true }
        });

        const slide = await prisma.careersHeroSlide.update({
            where: { id },
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
            if (body.imageDesktopAr !== undefined) await syncSlideImage(existing.imageDesktopAr, body.imageDesktopAr, id);
            if (body.imageDesktopEn !== undefined) await syncSlideImage(existing.imageDesktopEn, body.imageDesktopEn, id);
            if (body.imageMobile !== undefined) await syncSlideImage(existing.imageMobile, body.imageMobile, id);
        }

        revalidatePath('/careers', 'layout');
        return NextResponse.json(slide);
    } catch (error) {
        console.error('Error updating careers hero slide:', error);
        return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
    }
}

// DELETE - Delete slide (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // ── Media Library: unlink all media before deleting ──
        await unlinkAllForEntity('career', id);

        await prisma.careersHeroSlide.delete({
            where: { id }
        });

        revalidatePath('/careers', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting careers hero slide:', error);
        return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
    }
}
