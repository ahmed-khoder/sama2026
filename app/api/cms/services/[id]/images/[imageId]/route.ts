import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { deletePhysicalFile } from '@/lib/delete-file';
import { unlinkAllForEntity } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// PUT - Update image (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string; imageId: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const image = await prisma.serviceImage.update({
            where: { id: params.imageId },
            data: {
                caption: body.caption,
                captionEn: body.captionEn,
                order: body.order
            }
        });

        revalidatePath('/services', 'layout');
        return NextResponse.json(image);
    } catch (error: unknown) {
        console.error('Error updating service image:', error);
        return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
    }
}

// DELETE - Remove image (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string; imageId: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ── Media Library: unlink all media before deleting ──
        await unlinkAllForEntity('service', params.imageId);

        // Fetch image record to get URL before deleting
        const image = await prisma.serviceImage.findUnique({
            where: { id: params.imageId },
            select: { url: true }
        });

        await prisma.serviceImage.delete({
            where: { id: params.imageId }
        });

        // Delete physical file
        if (image) {
            deletePhysicalFile(image.url);
        }

        revalidatePath('/services', 'layout');
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting service image:', error);
        return NextResponse.json({ error: 'Failed to delete image' }, { status: 500 });
    }
}
