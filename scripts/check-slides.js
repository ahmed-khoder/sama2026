const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSlides() {
    try {
        const slides = await prisma.servicesHeroSlide.findMany({
            orderBy: { order: 'asc' }
        });

        console.log('\n=== Services Hero Slides ===\n');
        slides.forEach((slide, index) => {
            console.log(`Slide ${index + 1}:`);
            console.log(`  ID: ${slide.id}`);
            console.log(`  Order: ${slide.order}`);
            console.log(`  isActive: ${slide.isActive}`);
            console.log(`  imageDesktopAr: ${slide.imageDesktopAr || '(empty)'}`);
            console.log(`  imageDesktopEn: ${slide.imageDesktopEn || '(empty)'}`);
            console.log(`  imageMobile: ${slide.imageMobile || '(empty)'}`);
            console.log('');
        });

        console.log(`Total: ${slides.length} slides`);
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkSlides();
