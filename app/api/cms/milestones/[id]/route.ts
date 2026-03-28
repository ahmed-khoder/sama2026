import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia, unlinkAllForEntity } from '@/lib/media-library';

// GET single milestone
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const milestone = await prisma.milestone.findUnique({
            where: { id: params.id }
        });

        if (!milestone) {
            return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
        }

        return NextResponse.json(milestone);
    } catch (error) {
        console.error('Error fetching milestone:', error);
        return NextResponse.json({ error: 'Failed to fetch milestone' }, { status: 500 });
    }
}

// PUT - Update milestone (Admin only)
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
        const existing = await prisma.milestone.findUnique({
            where: { id: params.id },
            select: { image: true }
        });

        const milestone = await prisma.milestone.update({
            where: { id: params.id },
            data: {
                ...(body.year !== undefined && { year: body.year }),
                ...(body.titleAr !== undefined && { titleAr: body.titleAr }),
                ...(body.titleEn !== undefined && { titleEn: body.titleEn }),
                ...(body.descriptionAr !== undefined && { descriptionAr: body.descriptionAr }),
                ...(body.descriptionEn !== undefined && { descriptionEn: body.descriptionEn }),
                ...(body.image !== undefined && { image: body.image }),
                ...(body.order !== undefined && { order: body.order }),
                ...(body.isActive !== undefined && { isActive: body.isActive }),
            }
        });

        // ── Media Library: sync image link/unlink ──
        if (body.image !== undefined && existing) {
            // Unlink old image if it changed
            if (existing.image && existing.image !== body.image) {
                await unlinkMedia(existing.image, 'milestone', params.id);
            }
            // Link new image if it's set and different
            if (body.image && body.image !== existing.image) {
                await linkMedia(body.image, 'milestone', params.id);
            }
        }

        revalidatePath('/about', 'layout');
        return NextResponse.json(milestone);
    } catch (error) {
        console.error('Error updating milestone:', error);
        return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
    }
}

// DELETE milestone (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ── Media Library: unlink all media for this entity before deleting ──
        await unlinkAllForEntity('milestone', params.id);

        await prisma.milestone.delete({
            where: { id: params.id }
        });

        revalidatePath('/about', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting milestone:', error);
        return NextResponse.json({ error: 'Failed to delete milestone' }, { status: 500 });
    }
}
