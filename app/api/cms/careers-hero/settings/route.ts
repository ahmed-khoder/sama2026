import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET careers hero settings
export async function GET() {
    try {
        let settings = await prisma.careersHeroSettings.findUnique({
            where: { id: 'default' }
        });

        // Create default settings if not exists
        if (!settings) {
            settings = await prisma.careersHeroSettings.create({
                data: { id: 'default' }
            });
        }

        return NextResponse.json(settings, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('Error fetching careers hero settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT - Update settings (Admin only)
export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const settings = await prisma.careersHeroSettings.upsert({
            where: { id: 'default' },
            create: {
                id: 'default',
                ...body
            },
            update: body
        });

        // Revalidate the careers page
        revalidatePath('/careers', 'layout');

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating careers hero settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
