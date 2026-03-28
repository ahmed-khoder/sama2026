import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

// POST - Swap order of two services atomically
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { serviceId, targetServiceId } = await request.json();

        if (!serviceId || !targetServiceId) {
            return NextResponse.json(
                { error: 'Both serviceId and targetServiceId are required' },
                { status: 400 }
            );
        }

        // Fetch both services
        const [serviceA, serviceB] = await Promise.all([
            prisma.service.findUnique({ where: { id: serviceId }, select: { id: true, order: true } }),
            prisma.service.findUnique({ where: { id: targetServiceId }, select: { id: true, order: true } }),
        ]);

        if (!serviceA || !serviceB) {
            return NextResponse.json({ error: 'One or both services not found' }, { status: 404 });
        }

        // Swap orders atomically using $transaction
        await prisma.$transaction([
            prisma.service.update({
                where: { id: serviceA.id },
                data: { order: serviceB.order },
            }),
            prisma.service.update({
                where: { id: serviceB.id },
                data: { order: serviceA.order },
            }),
        ]);

        revalidatePath('/', 'layout');
        revalidatePath('/services', 'layout');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error swapping services:', error);
        return NextResponse.json({ error: 'Failed to swap services' }, { status: 500 });
    }
}
