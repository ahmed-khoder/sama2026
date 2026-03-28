import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';
import { NextRequest } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET - List all blog hero slides (public)
export async function GET() {
    try {
        const slides = await db.blogHeroSlide.findMany({
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
        console.error('Error fetching blog hero slides:', error);
        return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
    }
}

// POST - Create new blog hero slide (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Get max order
        const maxOrder = await db.blogHeroSlide.aggregate({
            _max: { order: true },
            where: { isActive: true },
        });

        const slide = await db.blogHeroSlide.create({
            data: {
                imageDesktopAr: body.imageDesktopAr || '',
                imageDesktopEn: body.imageDesktopEn || '',
                imageMobile: body.imageMobile || '',
                order: (maxOrder._max.order ?? -1) + 1,
            }
        });

        revalidatePath('/blog', 'layout');
        return NextResponse.json(slide, { status: 201 });
    } catch (error) {
        console.error('Error creating blog hero slide:', error);
        return NextResponse.json({ error: 'Failed to create slide' }, { status: 500 });
    }
}
