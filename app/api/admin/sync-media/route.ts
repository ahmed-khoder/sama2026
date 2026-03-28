import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { linkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/sync-media
 * One-time sync: scan ALL CMS entities and create missing MediaUsage records.
 * This fixes images uploaded before the media library was wired.
 */
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        let linked = 0;
        const errors: string[] = [];

        // Helper to safely link
        async function safeLink(url: string | null | undefined, entity: string, entityId: string) {
            if (!url || url.trim() === '') return;
            try {
                await linkMedia(url, entity as any, entityId);
                linked++;
            } catch (err: any) {
                errors.push(`${entity}/${entityId}: ${err.message}`);
            }
        }

        // ── 1. Hero Slides ─────────────────────────────────────
        const heroSlides = await prisma.heroSlide.findMany({
            select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true }
        });
        for (const s of heroSlides) {
            await safeLink(s.imageDesktopAr, 'hero', s.id);
            await safeLink(s.imageDesktopEn, 'hero', s.id);
            await safeLink(s.imageMobile, 'hero', s.id);
        }

        // ── 2. About Hero Slides ───────────────────────────────
        const aboutSlides = await prisma.aboutHeroSlide.findMany({
            select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true }
        });
        for (const s of aboutSlides) {
            await safeLink(s.imageDesktopAr, 'about', s.id);
            await safeLink(s.imageDesktopEn, 'about', s.id);
            await safeLink(s.imageMobile, 'about', s.id);
        }

        // ── 3. Services Hero Slides ────────────────────────────
        const servicesSlides = await prisma.servicesHeroSlide.findMany({
            select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true }
        });
        for (const s of servicesSlides) {
            await safeLink(s.imageDesktopAr, 'service', s.id);
            await safeLink(s.imageDesktopEn, 'service', s.id);
            await safeLink(s.imageMobile, 'service', s.id);
        }

        // ── 4. Careers Hero Slides ─────────────────────────────
        const careerSlides = await prisma.careersHeroSlide.findMany({
            select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true }
        });
        for (const s of careerSlides) {
            await safeLink(s.imageDesktopAr, 'career', s.id);
            await safeLink(s.imageDesktopEn, 'career', s.id);
            await safeLink(s.imageMobile, 'career', s.id);
        }

        // ── 5. Blog Hero ───────────────────────────────────────
        const blogHero = await prisma.blogHeroSettings.findUnique({
            where: { id: 'default' },
            select: { image: true }
        });
        if (blogHero?.image) {
            await safeLink(blogHero.image, 'blog', 'blog-hero-default');
        }

        // ── 6. Team Members ────────────────────────────────────
        const teamMembers = await prisma.teamMember.findMany({
            select: { id: true, image: true }
        });
        for (const m of teamMembers) {
            await safeLink(m.image, 'team', m.id);
        }

        // ── 7. Services (image + imageMobile) ──────────────────
        const services = await prisma.service.findMany({
            select: { id: true, image: true, imageMobile: true }
        });
        for (const s of services) {
            await safeLink(s.image, 'service', s.id);
            await safeLink(s.imageMobile, 'service', s.id);
        }

        // ── 8. Milestones ──────────────────────────────────────
        const milestones = await prisma.milestone.findMany({
            select: { id: true, image: true }
        });
        for (const m of milestones) {
            await safeLink(m.image, 'milestone', m.id);
        }

        // ── 9. Fleet Trucks ────────────────────────────────────
        const trucks = await prisma.fleetTruck.findMany({
            select: { id: true, image: true }
        });
        for (const t of trucks) {
            await safeLink(t.image, 'service', t.id);
        }

        // ── 10. Port Operations ────────────────────────────────
        const ports = await prisma.portOperation.findMany({
            select: { id: true, image: true }
        });
        for (const p of ports) {
            await safeLink(p.image, 'service', p.id);
        }

        // ── 11. About Why Images ───────────────────────────────
        const whyImages = await prisma.aboutWhyImage.findMany({
            select: { id: true, url: true }
        });
        for (const img of whyImages) {
            await safeLink(img.url, 'about', img.id);
        }

        // ── 12. Service Images (Gallery) ────────────────────────
        const serviceImages = await prisma.serviceImage.findMany({
            select: { id: true, url: true }
        });
        for (const img of serviceImages) {
            await safeLink(img.url, 'service', img.id);
        }

        // ── 13. MIGRATION: Fix existing 'hero' → 'about' ─────
        const aboutSlideIds = aboutSlides.map(s => s.id);
        const aboutWhyIds = whyImages.map(i => i.id);
        const aboutEntityIds = [...aboutSlideIds, ...aboutWhyIds];
        if (aboutEntityIds.length > 0) {
            const migrated = await prisma.mediaUsage.updateMany({
                where: {
                    entity: 'hero',
                    entityId: { in: aboutEntityIds },
                },
                data: { entity: 'about' },
            });
            console.log(`🔄 Migrated ${migrated.count} MediaUsage records from 'hero' → 'about'`);
        }

        // ── 14. HeroSettings.aboutSectionImages ──────────────────
        const heroSettingsRec = await prisma.heroSettings.findUnique({
            where: { id: 'default' },
            select: { aboutSectionImages: true },
        });
        if (heroSettingsRec?.aboutSectionImages) {
            const aboutUrls = heroSettingsRec.aboutSectionImages.split(',').filter(Boolean).map(u => u.trim());
            for (const url of aboutUrls) {
                await safeLink(url, 'about', 'default');
            }
        }

        console.log(`🔄 Media sync complete: ${linked} links created, ${errors.length} errors`);

        return NextResponse.json({
            success: true,
            linked,
            errors: errors.length > 0 ? errors : undefined,
            message: `Synced ${linked} media links across all CMS entities.`
        });
    } catch (error) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: 'Sync failed' }, { status: 500 });
    }
}

// GET - Check sync status (dry run count)
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [mediaCount, usageCount] = await Promise.all([
            prisma.media.count(),
            prisma.mediaUsage.count(),
        ]);

        return NextResponse.json({
            totalMedia: mediaCount,
            totalUsages: usageCount,
            status: usageCount === 0 ? 'NEEDS_SYNC' : 'OK',
        });
    } catch (error) {
        console.error('Sync check error:', error);
        return NextResponse.json({ error: 'Check failed' }, { status: 500 });
    }
}
