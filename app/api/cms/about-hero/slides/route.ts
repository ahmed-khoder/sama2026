import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// GET - Fetch all About Hero Slides
export async function GET() {
    try {
        const slides = await db.aboutHeroSlide.findMany({
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
        console.error('Error fetching about hero slides:', error);
        return NextResponse.json(
            { error: 'Failed to fetch slides' },
            { status: 500 }
        );
    }
}

// POST - Create new About Hero Slide (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Get the next order number
        const lastSlide = await db.aboutHeroSlide.findFirst({
            orderBy: { order: 'desc' }
        });
        const nextOrder = (lastSlide?.order ?? -1) + 1;

        const slide = await db.aboutHeroSlide.create({
            data: {
                imageDesktopAr: body.imageDesktopAr || '',
                imageDesktopEn: body.imageDesktopEn || '',
                imageMobile: body.imageMobile || '',
                order: nextOrder,
                isActive: true
            }
        });

        // ── Media Library: link all images on creation ──
        if (body.imageDesktopAr) await linkMedia(body.imageDesktopAr, 'about', slide.id);
        if (body.imageDesktopEn) await linkMedia(body.imageDesktopEn, 'about', slide.id);
        if (body.imageMobile) await linkMedia(body.imageMobile, 'about', slide.id);

        revalidatePath('/about', 'layout');
        return NextResponse.json(slide, { status: 201 });
    } catch (error) {
        console.error('Error creating about hero slide:', error);
        return NextResponse.json(
            { error: 'Failed to create slide' },
            { status: 500 }
        );
    }
}
