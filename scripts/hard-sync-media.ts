/**
 * HARD SYNC — Rebuild MediaUsage Table from Scratch
 *
 * Run: npx tsx scripts/hard-sync-media.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function link(url: string | null | undefined, entity: string, entityId: string) {
    if (!url || !url.trim()) return;
    const trimmed = url.trim();

    // ── IMMUNITY WHITELIST — Static infrastructure images ──────────
    // Container images are static assets in public/container/.
    // They must NEVER be deleted, unlinked, or re-synced.
    const WHITELISTED_PREFIXES = ['/images/container/'];
    if (WHITELISTED_PREFIXES.some(prefix => trimmed.startsWith(prefix))) return;

    let media = await prisma.media.findFirst({ where: { url: trimmed } });
    if (!media) {
        media = await prisma.media.create({ data: { url: trimmed, fileName: trimmed.split('/').pop() || null } });
        console.log(`   📦 Auto-registered Media: ${trimmed}`);
    }

    try {
        await prisma.mediaUsage.create({
            data: { mediaId: media.id, entity, entityId },
        });
    } catch (err: any) {
        if (err.code === 'P2002') return;
        throw err;
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  🔄 HARD SYNC — Rebuilding MediaUsage Table');
    console.log('═══════════════════════════════════════════════════════════');

    // ── WIPE ───────────────────────────────────────────────────────
    console.log('\n🗑️  Step 1: Wiping all MediaUsage records...');
    const { count: deletedCount } = await prisma.mediaUsage.deleteMany({});
    console.log(`   Done. Deleted ${deletedCount} records.\n`);

    // ── HeroSlide ──────────────────────────────────────────────────
    console.log('🔗 [2/15] Starting HeroSlide...');
    const heroSlides = await prisma.heroSlide.findMany({ select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true } });
    for (const s of heroSlides) {
        await link(s.imageDesktopAr, 'hero', s.id);
        await link(s.imageDesktopEn, 'hero', s.id);
        await link(s.imageMobile, 'hero', s.id);
    }
    console.log(`   ✅ Finished HeroSlide: ${heroSlides.length} records\n`);

    // ── AboutHeroSlide ─────────────────────────────────────────────
    console.log('🔗 [3/15] Starting AboutHeroSlide...');
    const aboutSlides = await prisma.aboutHeroSlide.findMany({ select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true } });
    for (const s of aboutSlides) {
        await link(s.imageDesktopAr, 'about', s.id);
        await link(s.imageDesktopEn, 'about', s.id);
        await link(s.imageMobile, 'about', s.id);
    }
    console.log(`   ✅ Finished AboutHeroSlide: ${aboutSlides.length} records\n`);

    // ── AboutWhyImage ──────────────────────────────────────────────
    console.log('🔗 [4/15] Starting AboutWhyImage...');
    const aboutWhyImages = await prisma.aboutWhyImage.findMany({ select: { id: true, url: true } });
    for (const img of aboutWhyImages) {
        await link(img.url, 'about', img.id);
    }
    console.log(`   ✅ Finished AboutWhyImage: ${aboutWhyImages.length} records\n`);

    // ── HeroSettings.aboutSectionImages ────────────────────────────
    console.log('🔗 [5/15] Starting HeroSettings.aboutSectionImages...');
    const heroSettings = await prisma.heroSettings.findUnique({ where: { id: 'default' }, select: { aboutSectionImages: true } });
    if (heroSettings && heroSettings.aboutSectionImages && heroSettings.aboutSectionImages.trim().length > 0) {
        const urls = heroSettings.aboutSectionImages.split(',').map((u: string) => u.trim()).filter((u: string) => u.length > 0);
        console.log(`   Found ${urls.length} comma-separated URLs`);
        for (let i = 0; i < urls.length; i++) {
            console.log(`   Linking URL ${i + 1}/${urls.length}: ${urls[i].substring(0, 60)}...`);
            await link(urls[i], 'about', 'default');
        }
        console.log(`   ✅ Finished aboutSectionImages: ${urls.length} URLs\n`);
    } else {
        console.log('   ⏭️  No aboutSectionImages found\n');
    }

    // ── ServicesHeroSlide ──────────────────────────────────────────
    console.log('🔗 [6/15] Starting ServicesHeroSlide...');
    const svcSlides = await prisma.servicesHeroSlide.findMany({ select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true } });
    for (const s of svcSlides) {
        await link(s.imageDesktopAr, 'service', s.id);
        await link(s.imageDesktopEn, 'service', s.id);
        await link(s.imageMobile, 'service', s.id);
    }
    console.log(`   ✅ Finished ServicesHeroSlide: ${svcSlides.length} records\n`);

    // ── Service ────────────────────────────────────────────────────
    console.log('🔗 [7/15] Starting Service...');
    const services = await prisma.service.findMany({ select: { id: true, image: true, imageMobile: true } });
    for (const s of services) {
        await link(s.image, 'service', s.id);
        await link(s.imageMobile, 'service', s.id);
    }
    console.log(`   ✅ Finished Service: ${services.length} records\n`);

    // ── ServiceImage (Gallery) ─────────────────────────────────────
    console.log('🔗 [8/15] Starting ServiceImage...');
    const svcImages = await prisma.serviceImage.findMany({ select: { id: true, url: true } });
    for (const img of svcImages) {
        await link(img.url, 'service', img.id);
    }
    console.log(`   ✅ Finished ServiceImage: ${svcImages.length} records\n`);

    // ── FleetTruck ─────────────────────────────────────────────────
    console.log('🔗 [9/15] Starting FleetTruck...');
    const trucks = await prisma.fleetTruck.findMany({ select: { id: true, image: true } });
    for (const t of trucks) {
        await link(t.image, 'service', t.id);
    }
    console.log(`   ✅ Finished FleetTruck: ${trucks.length} records\n`);

    // ── PortOperation ──────────────────────────────────────────────
    console.log('🔗 [10/15] Starting PortOperation...');
    const ports = await prisma.portOperation.findMany({ select: { id: true, image: true } });
    for (const p of ports) {
        await link(p.image, 'service', p.id);
    }
    console.log(`   ✅ Finished PortOperation: ${ports.length} records\n`);

    // ── CareersHeroSlide ───────────────────────────────────────────
    console.log('🔗 [11/15] Starting CareersHeroSlide...');
    const careerSlides = await prisma.careersHeroSlide.findMany({ select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true } });
    for (const s of careerSlides) {
        await link(s.imageDesktopAr, 'career', s.id);
        await link(s.imageDesktopEn, 'career', s.id);
        await link(s.imageMobile, 'career', s.id);
    }
    console.log(`   ✅ Finished CareersHeroSlide: ${careerSlides.length} records\n`);

    // ── TeamMember ─────────────────────────────────────────────────
    console.log('🔗 [12/15] Starting TeamMember...');
    const teamMembers = await prisma.teamMember.findMany({ select: { id: true, image: true } });
    for (const t of teamMembers) {
        await link(t.image, 'team', t.id);
    }
    console.log(`   ✅ Finished TeamMember: ${teamMembers.length} records\n`);

    // ── Milestone ──────────────────────────────────────────────────
    console.log('🔗 [13/15] Starting Milestone...');
    const milestones = await prisma.milestone.findMany({ select: { id: true, image: true } });
    for (const m of milestones) {
        await link(m.image, 'milestone', m.id);
    }
    console.log(`   ✅ Finished Milestone: ${milestones.length} records\n`);

    // ── BlogPost ───────────────────────────────────────────────────
    console.log('🔗 [14/15] Starting BlogPost...');
    const blogPosts = await prisma.blogPost.findMany({ select: { id: true, image: true } });
    for (const b of blogPosts) {
        await link(b.image, 'blog', b.id);
    }
    console.log(`   ✅ Finished BlogPost: ${blogPosts.length} records\n`);

    // ── BlogHeroSettings ───────────────────────────────────────────
    console.log('🔗 [15/15] Starting BlogHeroSettings...');
    const blogHero = await prisma.blogHeroSettings.findUnique({ where: { id: 'default' }, select: { image: true } });
    if (blogHero && blogHero.image) {
        await link(blogHero.image, 'blog', 'blog-hero-default');
        console.log('   ✅ Finished BlogHeroSettings: 1 image\n');
    } else {
        console.log('   ⏭️  No blog hero image\n');
    }

    // ── Final Count ────────────────────────────────────────────────
    console.log('📊 Counting final MediaUsage records...');
    const finalCount = await prisma.mediaUsage.count();

    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  🗑️  Old usages wiped:   ${deletedCount}`);
    console.log(`  🔗 New usages created:  ${finalCount}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n🎉 Hard sync complete! Refresh your Storage dashboard.');

    await prisma.$disconnect();
    process.exit(0);
}

main().catch(async (err) => {
    console.error('💥 Fatal error:', err);
    await prisma.$disconnect();
    process.exit(1);
});
