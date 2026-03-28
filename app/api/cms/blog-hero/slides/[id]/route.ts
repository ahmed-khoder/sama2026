import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

// PUT - Update blog hero slide (admin only)
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

        const slide = await db.blogHeroSlide.update({
            where: { id: params.id },
            data: body
        });

        revalidatePath('/blog', 'layout');
        return NextResponse.json(slide);
    } catch (error) {
        console.error('Error updating blog hero slide:', error);
        return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
    }
}

// DELETE - Soft delete blog hero slide (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await db.blogHeroSlide.update({
            where: { id: params.id },
            data: { isActive: false }
        });

        revalidatePath('/blog', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting blog hero slide:', error);
        return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
    }
}
