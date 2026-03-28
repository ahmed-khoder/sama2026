/**
 * Migration: Move MediaUsage records from entity='hero' → 'about'
 * for AboutHeroSlide, AboutWhyImage, and HeroSettings.aboutSectionImages
 *
 * Run:  npx tsx scripts/move-about-media.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Starting migration: hero → about ...\n');

    // 1. Collect all AboutHeroSlide IDs
    const aboutSlides = await prisma.aboutHeroSlide.findMany({ select: { id: true } });
    const aboutSlideIds = aboutSlides.map(s => s.id);
    console.log(`   Found ${aboutSlideIds.length} AboutHeroSlide records`);

    // 2. Collect all AboutWhyImage IDs
    const aboutWhyImages = await prisma.aboutWhyImage.findMany({ select: { id: true } });
    const aboutWhyIds = aboutWhyImages.map(i => i.id);
    console.log(`   Found ${aboutWhyIds.length} AboutWhyImage records`);

    // 3. Merge + add 'default' (HeroSettings.aboutSectionImages)
    const aboutEntityIds = [...aboutSlideIds, ...aboutWhyIds, 'default'];

    // 4. Update all matching MediaUsage records
    const result = await prisma.mediaUsage.updateMany({
        where: {
            entity: 'hero',
            entityId: { in: aboutEntityIds },
        },
        data: { entity: 'about' },
    });

    console.log(`\n✅ Migrated ${result.count} MediaUsage records from 'hero' → 'about'`);

    // 5. Verify
    const remaining = await prisma.mediaUsage.count({
        where: { entity: 'hero', entityId: { in: aboutEntityIds } },
    });
    console.log(`   Remaining hero records for about entities: ${remaining}`);

    const aboutCount = await prisma.mediaUsage.count({ where: { entity: 'about' } });
    console.log(`   Total 'about' records now: ${aboutCount}`);
}

main()
    .catch((e) => {
        console.error('❌ Migration failed:', e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
