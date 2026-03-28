import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia, unlinkAllForEntity } from '@/lib/media-library';

/**
 * DELETE /api/cms/about-why/images/[id]
 * Delete an image (Admin only)
 */
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
        await unlinkAllForEntity('about', params.id);

        await prisma.aboutWhyImage.delete({
            where: { id: params.id }
        });

        revalidatePath('/about', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting image:', error);
        return NextResponse.json(
            { error: 'Failed to delete image' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/cms/about-why/images/[id]
 * Update image order or URL (Admin only)
 */
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Fetch existing record to detect replaced URL
        const existing = await prisma.aboutWhyImage.findUnique({
            where: { id: params.id },
            select: { url: true }
        });

        const updated = await prisma.aboutWhyImage.update({
            where: { id: params.id },
            data: body
        });

        // ── Media Library: sync image link/unlink ──
        if (existing && body.url !== undefined) {
            if (existing.url && existing.url !== body.url) {
                await unlinkMedia(existing.url, 'about', params.id);
            }
            if (body.url && body.url !== existing.url) {
                await linkMedia(body.url, 'about', params.id);
            }
        }

        revalidatePath('/about', 'layout');
        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating image:', error);
        return NextResponse.json(
            { error: 'Failed to update image' },
            { status: 500 }
        );
    }
}
