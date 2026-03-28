import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

// GET future pulse settings (creates defaults if not exist)
export async function GET() {
    try {
        const settings = await prisma.futurePulseSettings.upsert({
            where: { id: 'default' },
            update: {},
            create: { id: 'default' }
        });
        return NextResponse.json(settings);
    } catch (error: unknown) {
        console.error('Error fetching future pulse settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT - Update future pulse settings (Admin only)
export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const settings = await prisma.futurePulseSettings.upsert({
            where: { id: 'default' },
            update: {
                badgeAr: body.badgeAr,
                badgeEn: body.badgeEn,
                titleAr: body.titleAr,
                titleEn: body.titleEn,
                descriptionAr: body.descriptionAr,
                descriptionEn: body.descriptionEn,
                image: body.image || null,
            },
            create: {
                id: 'default',
                badgeAr: body.badgeAr || 'المستقبل',
                badgeEn: body.badgeEn || 'The Future',
                titleAr: body.titleAr || 'طموحنا مستمر..',
                titleEn: body.titleEn || 'Our Ambition Continues..',
                descriptionAr: body.descriptionAr || 'نحو مستقبل لوجستي متكامل',
                descriptionEn: body.descriptionEn || 'Towards an Integrated Logistics Future',
                image: body.image || null,
            }
        });

        revalidatePath('/about', 'layout');
        return NextResponse.json(settings);
    } catch (error: unknown) {
        console.error('Error updating future pulse settings:', error);
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
