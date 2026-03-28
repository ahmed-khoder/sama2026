import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { handleAPIError, Errors } from '@/lib/api-error-handler';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia } from '@/lib/media-library';

// Helper: sync media links for a hero slide image field
async function syncHeroImage(
    oldUrl: string | null | undefined,
    newUrl: string | null | undefined,
    entityId: string
) {
    // If old URL existed and is different from new, unlink old
    if (oldUrl && oldUrl !== newUrl) {
        await unlinkMedia(oldUrl, 'hero', entityId);
    }
    // If new URL is set and different from old, link new
    if (newUrl && newUrl !== oldUrl) {
        await linkMedia(newUrl, 'hero', entityId);
    }
}

// PUT - Update hero slide (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            throw Errors.Unauthorized('يجب تسجيل الدخول كمسؤول');
        }

        const body = await request.json();

        // Fetch existing record to detect replaced images
        const existing = await prisma.heroSlide.findUnique({
            where: { id: params.id },
            select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true }
        });

        const slide = await prisma.heroSlide.update({
            where: { id: params.id },
            data: body
        });

        // ── Media Library: sync links for changed image fields ──
        if (existing) {
            if (body.imageDesktopAr !== undefined) {
                await syncHeroImage(existing.imageDesktopAr, body.imageDesktopAr, params.id);
            }
            if (body.imageDesktopEn !== undefined) {
                await syncHeroImage(existing.imageDesktopEn, body.imageDesktopEn, params.id);
            }
            if (body.imageMobile !== undefined) {
                await syncHeroImage(existing.imageMobile, body.imageMobile, params.id);
            }
        }

        revalidatePath('/', 'layout');
        return NextResponse.json(slide);
    } catch (error) {
        return handleAPIError(error);
    }
}

// DELETE - Delete hero slide / soft delete (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            throw Errors.Unauthorized('يجب تسجيل الدخول كمسؤول');
        }

        await prisma.heroSlide.update({
            where: { id: params.id },
            data: { isActive: false }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        return handleAPIError(error);
    }
}
