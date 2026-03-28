import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia, unlinkAllForEntity } from '@/lib/media-library';

// PUT - Update fleet truck (Admin only)
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

        // Explicitly map updatable fields
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = body;

        // Fetch existing record to detect replaced images
        const existing = await prisma.fleetTruck.findUnique({
            where: { id: params.id },
            select: { image: true }
        });

        const data: Record<string, unknown> = {};
        if (rest.nameAr !== undefined) data.nameAr = rest.nameAr;
        if (rest.nameEn !== undefined) data.nameEn = rest.nameEn;
        if (rest.image !== undefined) data.image = rest.image || null;
        if (rest.descAr !== undefined) data.descAr = rest.descAr;
        if (rest.descEn !== undefined) data.descEn = rest.descEn;
        if (rest.specsJson !== undefined) data.specsJson = rest.specsJson;
        if (rest.order !== undefined) data.order = rest.order;
        if (rest.isActive !== undefined) data.isActive = rest.isActive;

        const truck = await prisma.fleetTruck.update({
            where: { id: params.id },
            data
        });

        // ── Media Library: sync image link/unlink ──
        if (existing && rest.image !== undefined) {
            if (existing.image && existing.image !== rest.image) {
                await unlinkMedia(existing.image, 'service', params.id);
            }
            if (rest.image && rest.image !== existing.image) {
                await linkMedia(rest.image, 'service', params.id);
            }
        }

        revalidatePath('/services', 'layout');
        return NextResponse.json(truck);
    } catch (error: unknown) {
        console.error('Error updating fleet truck:', error);
        return NextResponse.json({ error: 'Failed to update fleet truck' }, { status: 500 });
    }
}

// DELETE - Delete fleet truck (Admin only)
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

        await prisma.fleetTruck.delete({
            where: { id: params.id }
        });

        revalidatePath('/services', 'layout');
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting fleet truck:', error);
        return NextResponse.json({ error: 'Failed to delete fleet truck' }, { status: 500 });
    }
}
