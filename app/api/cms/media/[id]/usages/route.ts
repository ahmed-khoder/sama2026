import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';

// GET - List all usages for a media item
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const usages = await prisma.mediaUsage.findMany({
            where: { mediaId: params.id },
            orderBy: { entity: 'asc' },
        });

        return NextResponse.json(usages);
    } catch (error) {
        console.error('Error fetching media usages:', error);
        return NextResponse.json({ error: 'Failed to fetch usages' }, { status: 500 });
    }
}
