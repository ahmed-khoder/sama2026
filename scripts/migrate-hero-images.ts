import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateHeroImages() {
    console.log('🚀 Starting Hero Images Migration...\n');

    try {
        // Migrate HeroSlide (Home page)
        console.log('📄 Migrating HeroSlide (Home)...');
        const heroSlides = await prisma.$queryRaw<any[]>`SELECT * FROM HeroSlide`;
        let homeCount = 0;
        for (const slide of heroSlides) {
            if (slide.imageDesktop) {
                await prisma.$executeRaw`
          UPDATE HeroSlide 
          SET imageDesktopAr = ${slide.imageDesktop},
              imageDesktopEn = ${slide.imageDesktop}
          WHERE id = ${slide.id}
        `;
                homeCount++;
            }
        }
        console.log(`✅ Migrated ${homeCount} Home hero slides\n`);

        // Migrate ServicesHeroSlide
        console.log('📄 Migrating ServicesHeroSlide...');
        const servicesSlides = await prisma.$queryRaw<any[]>`SELECT * FROM ServicesHeroSlide`;
        let servicesCount = 0;
        for (const slide of servicesSlides) {
            if (slide.imageDesktop) {
                await prisma.$executeRaw`
          UPDATE ServicesHeroSlide 
          SET imageDesktopAr = ${slide.imageDesktop},
              imageDesktopEn = ${slide.imageDesktop}
          WHERE id = ${slide.id}
        `;
                servicesCount++;
            }
        }
        console.log(`✅ Migrated ${servicesCount} Services hero slides\n`);

        // Migrate CareersHeroSlide
        console.log('📄 Migrating CareersHeroSlide...');
        const careersSlides = await prisma.$queryRaw<any[]>`SELECT * FROM CareersHeroSlide`;
        let careersCount = 0;
        for (const slide of careersSlides) {
            if (slide.imageDesktop) {
                await prisma.$executeRaw`
          UPDATE CareersHeroSlide 
          SET imageDesktopAr = ${slide.imageDesktop},
              imageDesktopEn = ${slide.imageDesktop}
          WHERE id = ${slide.id}
        `;
                careersCount++;
            }
        }
        console.log(`✅ Migrated ${careersCount} Careers hero slides\n`);

        // Migrate AboutHeroSlide
        console.log('📄 Migrating AboutHeroSlide...');
        const aboutSlides = await prisma.$queryRaw<any[]>`SELECT * FROM AboutHeroSlide`;
        let aboutCount = 0;
        for (const slide of aboutSlides) {
            if (slide.imageDesktop) {
                await prisma.$executeRaw`
          UPDATE AboutHeroSlide 
          SET imageDesktopAr = ${slide.imageDesktop},
              imageDesktopEn = ${slide.imageDesktop}
          WHERE id = ${slide.id}
        `;
                aboutCount++;
            }
        }
        console.log(`✅ Migrated ${aboutCount} About hero slides\n`);

        console.log('🎉 Migration completed successfully!');
        console.log(`📊 Total slides migrated: ${homeCount + servicesCount + careersCount + aboutCount}`);
        console.log('\n⚠️  Next steps:');
        console.log('   1. Run: npx prisma db push');
        console.log('   2. Verify data in Prisma Studio');
        console.log('   3. Test image uploads in dashboard\n');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrateHeroImages()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
