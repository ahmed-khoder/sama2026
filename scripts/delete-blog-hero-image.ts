import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🔴 Deleting Blog Hero background image...');

    // 1. Set image to null
    console.log('Step 1: Setting BlogHeroSettings.image to null...');
    await prisma.blogHeroSettings.upsert({
        where: { id: 'default' },
        update: { image: null },
        create: { id: 'default', image: null },
    });
    console.log('   ✅ Done.');

    // 2. Delete MediaUsage records
    console.log('Step 2: Deleting MediaUsage records for blog-hero-default...');
    const deleted = await prisma.mediaUsage.deleteMany({
        where: { entity: 'blog', entityId: 'blog-hero-default' },
    });
    console.log(`   ✅ Deleted ${deleted.count} MediaUsage record(s).`);

    console.log('\n🎉 Blog Hero image removed. Refresh the page.');
    await prisma.$disconnect();
    process.exit(0);
}

main().catch(async (err) => {
    console.error('💥 Error:', err);
    await prisma.$disconnect();
    process.exit(1);
});
