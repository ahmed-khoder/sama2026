import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// GET - Fetch Blog Hero Settings
export async function GET() {
    try {
        let settings = await db.blogHeroSettings.findUnique({
            where: { id: 'default' }
        });

        // Return default values if no settings exist
        if (!settings) {
            settings = await db.blogHeroSettings.create({
                data: { id: 'default' }
            });
        }

        return NextResponse.json(settings, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('Error fetching blog hero settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// PUT - Update Blog Hero Settings (Admin only)
export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Fetch existing to detect image changes
        const existing = await db.blogHeroSettings.findUnique({
            where: { id: 'default' },
            select: { image: true }
        });

        const settings = await db.blogHeroSettings.upsert({
            where: { id: 'default' },
            update: {
                blurAmount: body.blurAmount,
                overlayOpacity: body.overlayOpacity,
                overlayColor: body.overlayColor,
                showGrid: body.showGrid,
                titleFontSize: body.titleFontSize,
                titleFontWeight: body.titleFontWeight,
                titleColor: body.titleColor,
                subtitleColor: body.subtitleColor,
                badgeColor: body.badgeColor,
                highlightColor: body.highlightColor,
                titleFontFamilyAr: body.titleFontFamilyAr,
                titleFontFamilyEn: body.titleFontFamilyEn,
                highlightWordsAr: body.highlightWordsAr,
                highlightWordsEn: body.highlightWordsEn,
                titleAr: body.titleAr,
                titleEn: body.titleEn,
                subtitleAr: body.subtitleAr,
                subtitleEn: body.subtitleEn,
                badgeAr: body.badgeAr,
                badgeEn: body.badgeEn,
                image: body.image,
                articleLayout: body.articleLayout,
                cardSize: body.cardSize,
            },
            create: {
                id: 'default',
                blurAmount: body.blurAmount ?? 0,
                overlayOpacity: body.overlayOpacity ?? 75,
                overlayColor: body.overlayColor ?? 'marine',
                showGrid: body.showGrid ?? true,
                titleFontSize: body.titleFontSize ?? 'text-5xl',
                titleFontWeight: body.titleFontWeight ?? 'font-bold',
                titleColor: body.titleColor ?? '#ffffff',
                subtitleColor: body.subtitleColor ?? '#ffffffcc',
                badgeColor: body.badgeColor ?? '#F97316',
                highlightColor: body.highlightColor ?? '#F97316',
                titleFontFamilyAr: body.titleFontFamilyAr ?? 'font-cairo',
                titleFontFamilyEn: body.titleFontFamilyEn ?? 'font-inter',
                highlightWordsAr: body.highlightWordsAr ?? '',
                highlightWordsEn: body.highlightWordsEn ?? '',
                titleAr: body.titleAr ?? 'آخر الأخبار والمقالات',
                titleEn: body.titleEn ?? 'Latest News & Articles',
                subtitleAr: body.subtitleAr ?? 'تابع أحدث أخبار الشحن، اتجاهات السوق، ونصائح الخبراء لتعزيز سلسلة الإمداد الخاصة بك.',
                subtitleEn: body.subtitleEn ?? 'Stay updated with the latest shipping news, market trends, and expert tips to optimize your supply chain.',
                badgeAr: body.badgeAr ?? 'المدونة والأخبار',
                badgeEn: body.badgeEn ?? 'Blog & News',
                image: body.image ?? null,
                articleLayout: body.articleLayout ?? 'grid',
                cardSize: body.cardSize ?? 'medium',
            }
        });

        // ── Media Library: sync blog hero image link/unlink ──
        if (body.image !== undefined) {
            const oldImage = existing?.image ?? null;
            // Unlink old image if changed
            if (oldImage && oldImage !== body.image) {
                await unlinkMedia(oldImage, 'blog', 'blog-hero-default');
            }
            // Link new image if set and different
            if (body.image && body.image !== oldImage) {
                await linkMedia(body.image, 'blog', 'blog-hero-default');
            }
        }

        revalidatePath('/blog', 'layout');
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating blog hero settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
