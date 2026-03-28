import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateWhyChooseUsImages() {
    try {
        console.log('🔄 Starting migration...');

        // 1. Get the current image from AboutWhySection
        const section = await prisma.aboutWhySection.findUnique({
            where: { id: 'default' }
        });

        if (!section) {
            console.log('⚠️  No AboutWhySection found, skipping migration');
            return;
        }

        console.log(`📷 Found image: ${section.image}`);

        // 2. Check if image field exists and has value
        if (section.image && section.image.trim() !== '') {
            console.log('📤 Creating new image record...');

            // Create new image record in AboutWhyImage table
            await prisma.aboutWhyImage.create({
                data: {
                    url: section.image,
                    order: 0,
                    sectionId: 'default'
                }
            });

            console.log('✅ Image migrated successfully!');
        } else {
            console.log('ℹ️  No image to migrate');
        }

        console.log('✨ Migration completed!');
        console.log('');
        console.log('Now you can run: npx prisma db push --accept-data-loss');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

migrateWhyChooseUsImages();
