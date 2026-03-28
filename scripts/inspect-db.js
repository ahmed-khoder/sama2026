// Quick database inspection script
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectDatabase() {
    console.log('\n=== 🔍 DATABASE INSPECTION ===\n');

    try {
        // 1. Check Users
        const users = await prisma.user.findMany({
            select: { id: true, email: true, name: true, role: true }
        });
        console.log('👤 USERS:', users.length);
        users.forEach(u => console.log(`   - ${u.email} (${u.role})`));

        // 2. Check Home Hero Slides
        const heroSlides = await prisma.heroSlide.findMany();
        console.log('\n🏠 HOME HERO SLIDES:', heroSlides.length);
        heroSlides.forEach(s => console.log(`   - ID: ${s.id}, Active: ${s.isActive}, Desktop AR: ${s.imageDesktopAr ? '✅' : '❌'}, Desktop EN: ${s.imageDesktopEn ? '✅' : '❌'}, Mobile: ${s.imageMobile ? '✅' : '❌'}`));

        // 3. Check Hero Settings
        const heroSettings = await prisma.heroSettings.findFirst();
        console.log('\n⚙️ HERO SETTINGS:', heroSettings ? '✅ EXISTS' : '❌ MISSING');
        if (heroSettings) {
            console.log(`   - Overlay: ${heroSettings.overlayOpacity}%, Blur: ${heroSettings.blurAmount}px, Grid: ${heroSettings.showGrid}`);
        }

        // 4. Check Services Hero
        const servicesSlides = await prisma.servicesHeroSlide.findMany();
        console.log('\n🛠️ SERVICES HERO SLIDES:', servicesSlides.length);

        const servicesSettings = await prisma.servicesHeroSettings.findFirst();
        console.log('⚙️ SERVICES HERO SETTINGS:', servicesSettings ? '✅ EXISTS' : '❌ MISSING');

        // 5. Check About Hero
        const aboutSlides = await prisma.aboutHeroSlide.findMany();
        console.log('\n📖 ABOUT HERO SLIDES:', aboutSlides.length);

        const aboutSettings = await prisma.aboutHeroSettings.findFirst();
        console.log('⚙️ ABOUT HERO SETTINGS:', aboutSettings ? '✅ EXISTS' : '❌ MISSING');

        // 6. Check Careers Hero
        const careersSlides = await prisma.careersHeroSlide.findMany();
        console.log('\n💼 CAREERS HERO SLIDES:', careersSlides.length);

        const careersSettings = await prisma.careersHeroSettings.findFirst();
        console.log('⚙️ CAREERS HERO SETTINGS:', careersSettings ? '✅ EXISTS' : '❌ MISSING');

        // 7. Check Services
        const services = await prisma.service.findMany({
            select: { id: true, slug: true, titleAr: true, isActive: true }
        });
        console.log('\n📦 SERVICES:', services.length);
        services.forEach(s => console.log(`   - ${s.slug}: ${s.titleAr} (Active: ${s.isActive})`));

        // 8. Check Stats
        const stats = await prisma.heroStat.findMany();
        console.log('\n📊 HERO STATS:', stats.length);

        // 9. Check Team
        const team = await prisma.teamMember.findMany();
        console.log('👥 TEAM MEMBERS:', team.length);

        console.log('\n=== INSPECTION COMPLETE ===\n');

    } catch (error) {
        console.error('❌ ERROR:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

inspectDatabase();
