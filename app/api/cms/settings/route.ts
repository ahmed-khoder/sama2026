import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET - List all settings or filter by section
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const section = searchParams.get('section');

        const settings = await prisma.siteSetting.findMany({
            where: section ? { section, isActive: true } : { isActive: true },
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(settings);
    } catch (error: unknown) {
        console.error('Error fetching settings:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// POST - Create new setting (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { section, key, valueAr, valueEn, extra, order } = body;

        if (!section || !key || !valueAr || !valueEn) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const setting = await prisma.siteSetting.create({
            data: {
                section,
                key,
                valueAr,
                valueEn,
                extra: extra || null,
                order: order || 0
            }
        });

        revalidatePath('/', 'layout');
        return NextResponse.json(setting, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating setting:', error);
        return NextResponse.json({ error: 'Failed to create setting' }, { status: 500 });
    }
}
