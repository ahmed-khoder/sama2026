import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

// PUT - Update setting (Admin only)
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

        const setting = await prisma.siteSetting.update({
            where: { id: params.id },
            data: body
        });

        revalidatePath('/', 'layout');
        return NextResponse.json(setting);
    } catch (error: unknown) {
        console.error('Error updating setting:', error);
        return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
    }
}

// DELETE - Delete setting (Admin only, soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.siteSetting.update({
            where: { id: params.id },
            data: { isActive: false }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting setting:', error);
        return NextResponse.json({ error: 'Failed to delete setting' }, { status: 500 });
    }
}
