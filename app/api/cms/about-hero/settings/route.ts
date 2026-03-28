import { NextRequest, NextResponse } from 'next/server';
import { prisma as db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET - Fetch About Hero Settings
export async function GET() {
    try {
        let settings = await db.aboutHeroSettings.findUnique({
            where: { id: 'default' }
        });

        // Return default values if no settings exist
        if (!settings) {
            settings = await db.aboutHeroSettings.create({
                data: { id: 'default' }
            });
        }

        return NextResponse.json(settings, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
            }
        });
    } catch (error) {
        console.error('Error fetching about hero settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

// PUT - Update About Hero Settings (Admin only)
export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const settings = await db.aboutHeroSettings.upsert({
            where: { id: 'default' },
            update: {
                blurAmount: body.blurAmount,
                overlayOpacity: body.overlayOpacity,
                overlayColor: body.overlayColor,
                showGrid: body.showGrid,
                showParticles: body.showParticles,
                badgeAr: body.badgeAr,
                badgeEn: body.badgeEn,
                titleLine1Ar: body.titleLine1Ar,
                titleLine2Ar: body.titleLine2Ar,
                titleLine3Ar: body.titleLine3Ar,
                titleLine1En: body.titleLine1En,
                titleLine2En: body.titleLine2En,
                titleLine3En: body.titleLine3En,
                descriptionAr: body.descriptionAr,
                descriptionEn: body.descriptionEn,
                // Typography and colors
                titleFontSize: body.titleFontSize,
                titleFontWeight: body.titleFontWeight,
                titleColor: body.titleColor,
                titleLine1Color: body.titleLine1Color,
                titleLine2Color: body.titleLine2Color,
                titleLine3Color: body.titleLine3Color,
                highlightColor: body.highlightColor,
                titleFontFamilyAr: body.titleFontFamilyAr,
                titleFontFamilyEn: body.titleFontFamilyEn,
                highlightWordsAr: body.highlightWordsAr,
                highlightWordsEn: body.highlightWordsEn,
                ctaPrimaryTextAr: body.ctaPrimaryTextAr,
                ctaPrimaryTextEn: body.ctaPrimaryTextEn,
                ctaPrimaryLink: body.ctaPrimaryLink,
                ctaSecondaryTextAr: body.ctaSecondaryTextAr,
                ctaSecondaryTextEn: body.ctaSecondaryTextEn,
                ctaSecondaryLink: body.ctaSecondaryLink,
            },
            create: {
                id: 'default',
                blurAmount: body.blurAmount ?? 0,
                overlayOpacity: body.overlayOpacity ?? 85,
                overlayColor: body.overlayColor ?? 'marine',
                showGrid: body.showGrid ?? true,
                showParticles: body.showParticles ?? true,
                badgeAr: body.badgeAr ?? 'شريكك اللوجستي الموثوق منذ 2000',
                badgeEn: body.badgeEn ?? 'Your Trusted Logistics Partner Since 2000',
                titleLine1Ar: body.titleLine1Ar ?? 'نحن',
                titleLine2Ar: body.titleLine2Ar ?? 'سما',
                titleLine3Ar: body.titleLine3Ar ?? 'للخدمات اللوجستية',
                titleLine1En: body.titleLine1En ?? 'We Are',
                titleLine2En: body.titleLine2En ?? 'SAMA',
                titleLine3En: body.titleLine3En ?? 'Logistics',
                descriptionAr: body.descriptionAr ?? 'نحن أكثر من مجرد شركة شحن.. نحن شريكك الاستراتيجي في النجاح.',
                descriptionEn: body.descriptionEn ?? 'We are more than just a shipping company. We are your strategic partner.',
                // Typography and colors
                titleFontSize: body.titleFontSize ?? 'text-5xl',
                titleFontWeight: body.titleFontWeight ?? 'font-extrabold',
                titleColor: body.titleColor ?? '#ffffff',
                titleLine1Color: body.titleLine1Color ?? '#ffffff',
                titleLine2Color: body.titleLine2Color ?? '#F97316',
                titleLine3Color: body.titleLine3Color ?? '#ffffff',
                highlightColor: body.highlightColor ?? '#F97316',
                titleFontFamilyAr: body.titleFontFamilyAr ?? 'font-cairo',
                titleFontFamilyEn: body.titleFontFamilyEn ?? 'font-inter',
                highlightWordsAr: body.highlightWordsAr ?? '',
                highlightWordsEn: body.highlightWordsEn ?? '',
                ctaPrimaryTextAr: body.ctaPrimaryTextAr ?? 'تواصل معنا',
                ctaPrimaryTextEn: body.ctaPrimaryTextEn ?? 'Contact Us',
                ctaPrimaryLink: body.ctaPrimaryLink ?? '/contact',
                ctaSecondaryTextAr: body.ctaSecondaryTextAr ?? 'استكشف خدماتنا',
                ctaSecondaryTextEn: body.ctaSecondaryTextEn ?? 'Explore Services',
                ctaSecondaryLink: body.ctaSecondaryLink ?? '/services',
            }
        });

        revalidatePath('/about', 'layout');
        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating about hero settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
