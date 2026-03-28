import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

// GET single stat
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const stat = await prisma.heroStat.findUnique({
            where: { id: params.id }
        });

        if (!stat) {
            return NextResponse.json({ error: 'Stat not found' }, { status: 404 });
        }

        return NextResponse.json(stat);
    } catch (error) {
        console.error('Error fetching stat:', error);
        return NextResponse.json({ error: 'Failed to fetch stat' }, { status: 500 });
    }
}

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

        const stat = await prisma.heroStat.update({
            where: { id: params.id },
            data: {
                ...(body.value !== undefined && { value: body.value }),
                ...(body.labelAr !== undefined && { labelAr: body.labelAr }),
                ...(body.labelEn !== undefined && { labelEn: body.labelEn }),
                ...(body.icon !== undefined && { icon: body.icon }),
                ...(body.order !== undefined && { order: body.order }),
                ...(body.isActive !== undefined && { isActive: body.isActive }),
            }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json(stat);
    } catch (error) {
        console.error('Error updating stat:', error);
        return NextResponse.json({ error: 'Failed to update stat' }, { status: 500 });
    }
}

// DELETE stat (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.heroStat.delete({
            where: { id: params.id }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting stat:', error);
        return NextResponse.json({ error: 'Failed to delete stat' }, { status: 500 });
    }
}
