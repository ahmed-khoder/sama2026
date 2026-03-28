import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

// PUT - Update stat (Admin only)
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
        if (rest.valueAr !== undefined) data.valueAr = rest.valueAr;
        if (rest.valueEn !== undefined) data.valueEn = rest.valueEn;
        if (rest.labelAr !== undefined) data.labelAr = rest.labelAr;
        if (rest.labelEn !== undefined) data.labelEn = rest.labelEn;
        if (rest.order !== undefined) data.order = rest.order;
        if (rest.isActive !== undefined) data.isActive = rest.isActive;

        const stat = await prisma.servicesPageStat.update({
            where: { id: params.id },
            data
        });

        revalidatePath('/services', 'layout');
        return NextResponse.json(stat);
    } catch (error: unknown) {
        console.error('Error updating stat:', error);
        return NextResponse.json({ error: 'Failed to update stat' }, { status: 500 });
    }
}

// DELETE - Delete stat (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.servicesPageStat.delete({
            where: { id: params.id }
        });

        revalidatePath('/services', 'layout');
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting stat:', error);
        return NextResponse.json({ error: 'Failed to delete stat' }, { status: 500 });
    }
}
