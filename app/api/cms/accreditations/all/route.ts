import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';

// ═══ GET — List ALL accreditations (admin only, includes hidden) ═══
export async function GET(req: NextRequest) {
    const auth = await getUserFromRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const items = await prisma.accreditation.findMany({
            orderBy: { order: 'asc' },
        });

        return NextResponse.json(items);
    } catch (error) {
        console.error('Failed to fetch all accreditations:', error);
        return NextResponse.json([], { status: 200 });
    }
}
