import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { handleAPIError, Errors } from '@/lib/api-error-handler';
import { heroSlideSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { linkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// GET - List all hero slides (public — no auth required)
export async function GET() {
    try {
        const slides = await prisma.heroSlide.findMany({
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
        return handleAPIError(error);
    }
}

// POST - Create new hero slide (admin only)
export async function POST(request: NextRequest) {
    try {
        // Auth check
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            throw Errors.Unauthorized('يجب تسجيل الدخول كمسؤول');
        }

        const body = await request.json();

        // Validate with Zod
        const result = heroSlideSchema.safeParse(body);
        if (!result.success) {
            throw Errors.BadRequest(result.error.issues[0]?.message || 'بيانات غير صالحة');
        }

        const data = result.data;

        if (!data.imageDesktopAr && !data.imageDesktopEn) {
            throw Errors.BadRequest('At least one desktop image (AR or EN) is required');
        }

        const slide = await prisma.heroSlide.create({
            data: {
                imageDesktopAr: data.imageDesktopAr || '',
                imageDesktopEn: data.imageDesktopEn || '',
                imageMobile: data.imageMobile || '',
                titleAr: data.titleAr || null,
                titleEn: data.titleEn || null,
                subtitleAr: data.subtitleAr || null,
                subtitleEn: data.subtitleEn || null,
                descriptionAr: data.descriptionAr || null,
                descriptionEn: data.descriptionEn || null,
                order: data.order || 0
            }
        });

        // ── Media Library: link all images on creation ──
        if (data.imageDesktopAr) await linkMedia(data.imageDesktopAr, 'hero', slide.id);
        if (data.imageDesktopEn) await linkMedia(data.imageDesktopEn, 'hero', slide.id);
        if (data.imageMobile) await linkMedia(data.imageMobile, 'hero', slide.id);

        revalidatePath('/', 'layout');
        return NextResponse.json(slide, { status: 201 });
    } catch (error) {
        return handleAPIError(error);
    }
}
