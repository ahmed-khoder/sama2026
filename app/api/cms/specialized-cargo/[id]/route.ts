import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

// PUT - Update specialized cargo type (Admin only)
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

        // Explicitly map updatable fields — never pass raw body to Prisma
        const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = body;
        const data: Record<string, unknown> = {};
        if (rest.icon !== undefined) data.icon = rest.icon;
        if (rest.titleAr !== undefined) data.titleAr = rest.titleAr;
        if (rest.titleEn !== undefined) data.titleEn = rest.titleEn;
        if (rest.badgeAr !== undefined) data.badgeAr = rest.badgeAr;
        if (rest.badgeEn !== undefined) data.badgeEn = rest.badgeEn;
        if (rest.descAr !== undefined) data.descAr = rest.descAr;
        if (rest.descEn !== undefined) data.descEn = rest.descEn;
        if (rest.gradient !== undefined) data.gradient = rest.gradient;
        if (rest.order !== undefined) data.order = rest.order;
        if (rest.isActive !== undefined) data.isActive = rest.isActive;

        const cargo = await prisma.specializedCargo.update({
            where: { id: params.id },
            data
        });

        revalidatePath('/services', 'layout');
        return NextResponse.json(cargo);
    } catch (error: unknown) {
        console.error('Error updating cargo type:', error);
        return NextResponse.json({ error: 'Failed to update cargo type' }, { status: 500 });
    }
}

// DELETE - Delete specialized cargo type (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.specializedCargo.delete({
            where: { id: params.id }
        });

        revalidatePath('/services', 'layout');
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting cargo type:', error);
        return NextResponse.json({ error: 'Failed to delete cargo type' }, { status: 500 });
    }
}
