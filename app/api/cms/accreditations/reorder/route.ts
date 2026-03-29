import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';

// ═══ PUT — Batch reorder accreditations ═══
export async function PUT(req: NextRequest) {
    const auth = await getUserFromRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { ids } = await req.json() as { ids: string[] };

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        await Promise.all(
            ids.map((id, index) =>
                prisma.accreditation.update({
                    where: { id },
                    data: { order: index },
                })
            )
        );

        // Purge cached pages so reordered logos appear correctly
        revalidatePath('/');
        revalidatePath('/about');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to reorder accreditations:', error);
        return NextResponse.json({ error: 'Reorder failed' }, { status: 500 });
    }
}
