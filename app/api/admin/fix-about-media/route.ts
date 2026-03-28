import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { linkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/fix-about-media
 * Complete fix for About Company images:
 * 1. Register ALL AboutHeroSlide images into Media + MediaUsage (entity: 'about')
 * 2. Register ALL AboutWhyImage images into Media + MediaUsage (entity: 'about')
 * 3. Register HeroSettings.aboutSectionImages (entity: 'about', entityId: 'default')
 * 4. Migrate any existing MediaUsage records from entity='hero' → 'about'
 *
 * Visit in browser: http://localhost:3000/api/admin/fix-about-media
 */
export async function GET() {
    try {
        let linked = 0;
        let migrated = 0;
        const errors: string[] = [];

        // Helper to safely link (creates Media record if missing + creates MediaUsage)
        async function safeLink(url: string | null | undefined, entity: string, entityId: string) {
            if (!url || url.trim() === '') return;
            try {
                await linkMedia(url, entity as 'about', entityId);
                linked++;
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                if (!msg.includes('already linked')) {
                    errors.push(`${entity}/${entityId}: ${msg}`);
                }
            }
        }

        // ── 1. AboutHeroSlide (imageDesktopAr, imageDesktopEn, imageMobile) ──
        const aboutSlides = await prisma.aboutHeroSlide.findMany({
            select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true }
        });
        for (const s of aboutSlides) {
            await safeLink(s.imageDesktopAr, 'about', s.id);
            await safeLink(s.imageDesktopEn, 'about', s.id);
            await safeLink(s.imageMobile, 'about', s.id);
        }

        // ── 2. AboutWhyImage ──
        const aboutWhyImages = await prisma.aboutWhyImage.findMany({
            select: { id: true, url: true }
        });
        for (const img of aboutWhyImages) {
            await safeLink(img.url, 'about', img.id);
        }

        // ── 3. HeroSettings.aboutSectionImages (comma-separated URLs) ──
        const heroSettings = await prisma.heroSettings.findUnique({
            where: { id: 'default' },
            select: { aboutSectionImages: true },
        });
        if (heroSettings?.aboutSectionImages) {
            const urls = heroSettings.aboutSectionImages.split(',').filter(Boolean).map(u => u.trim());
            for (const url of urls) {
                await safeLink(url, 'about', 'default');
            }
        }

        // ── 4. Migrate any leftover hero→about records ──
        const aboutSlideIds = aboutSlides.map(s => s.id);
        const aboutWhyIds = aboutWhyImages.map(i => i.id);
        const allAboutIds = [...aboutSlideIds, ...aboutWhyIds, 'default'];
        if (allAboutIds.length > 0) {
            const result = await prisma.mediaUsage.updateMany({
                where: {
                    entity: 'hero',
                    entityId: { in: allAboutIds },
                },
                data: { entity: 'about' },
            });
            migrated = result.count;
        }

        // ── 5. Final stats ──
        const heroCount = await prisma.mediaUsage.count({ where: { entity: 'hero' } });
        const aboutCount = await prisma.mediaUsage.count({ where: { entity: 'about' } });

        return NextResponse.json({
            success: true,
            linked,
            migrated,
            aboutSlides: aboutSlides.length,
            aboutWhyImages: aboutWhyImages.length,
            errors: errors.length > 0 ? errors : undefined,
            totals: { hero: heroCount, about: aboutCount },
        });
    } catch (error: unknown) {
        console.error('Fix about media error:', error);
        return NextResponse.json({ error: 'Migration failed', details: String(error) }, { status: 500 });
    }
}
