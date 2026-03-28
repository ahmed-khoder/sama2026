import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// GET all careers hero slides
export async function GET() {
    try {
        const slides = await prisma.careersHeroSlide.findMany({
            where: { isActive: true },
            select: {
                id: true,
                imageDesktopAr: true,
                imageDesktopEn: true,
                imageMobile: true,
                order: true,
            },
            orderBy: { order: 'asc' },
            take: 10,
        });

        return NextResponse.json(slides, {
            headers: {
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error fetching careers hero slides:', error);
        return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
    }
}

// POST - Add new slide (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Get max order
        const maxOrder = await prisma.careersHeroSlide.aggregate({
            _max: { order: true }
        });

        const slide = await prisma.careersHeroSlide.create({
            data: {
                imageDesktopAr: body.imageDesktopAr || '',
                imageDesktopEn: body.imageDesktopEn || '',
                imageMobile: body.imageMobile || '',
                order: (maxOrder._max.order || 0) + 1,
                isActive: true
            }
        });

        // ── Media Library: link all images on creation ──
        if (body.imageDesktopAr) await linkMedia(body.imageDesktopAr, 'career', slide.id);
        if (body.imageDesktopEn) await linkMedia(body.imageDesktopEn, 'career', slide.id);
        if (body.imageMobile) await linkMedia(body.imageMobile, 'career', slide.id);

        revalidatePath('/careers', 'layout');
        return NextResponse.json(slide);
    } catch (error) {
        console.error('Error creating careers hero slide:', error);
        return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
    }
}
