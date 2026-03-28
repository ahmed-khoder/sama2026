import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ============================================
  // 1. Create Admin User
  // ============================================
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@samalogistics.com' },
    update: {},
    create: {
      email: 'admin@samalogistics.com',
      password: hashedPassword,
      name: 'مدير النظام',
      role: 'ADMIN',
      isActive: true,
      preferredLanguage: 'ar',
      theme: 'system',
    },
  });
  console.log('✅ Admin user created:', adminUser.email);

  // ============================================
  // 2. Create Home Hero Slides
  // ============================================
  const homeSlides = [
    {
      imageDesktopAr: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
      imageDesktopEn: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
      imageMobile: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=800&auto=format&fit=crop',
      order: 0,
      isActive: true,
    },
    {
      imageDesktopAr: 'https://images.unsplash.com/photo-1494412574643-35d324698420?q=80&w=2070&auto=format&fit=crop',
      imageDesktopEn: 'https://images.unsplash.com/photo-1494412574643-35d324698420?q=80&w=2070&auto=format&fit=crop',
      imageMobile: 'https://images.unsplash.com/photo-1494412574643-35d324698420?q=80&w=800&auto=format&fit=crop',
      order: 1,
      isActive: true,
    },
    {
      imageDesktopAr: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop',
      imageDesktopEn: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=2070&auto=format&fit=crop',
      imageMobile: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?q=80&w=800&auto=format&fit=crop',
      order: 2,
      isActive: true,
    },
  ];

  // Clear and recreate home slides
  await prisma.heroSlide.deleteMany();
  for (const slide of homeSlides) {
    await prisma.heroSlide.create({ data: slide });
  }
  console.log('✅ Home Hero Slides created:', homeSlides.length);

  // ============================================
  // 3. Create Services Hero Slides
  // ============================================
  const servicesSlides = [
    {
      imageDesktopAr: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=2070&auto=format&fit=crop',
      imageDesktopEn: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=2070&auto=format&fit=crop',
      imageMobile: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?q=80&w=800&auto=format&fit=crop',
      order: 0,
      isActive: true,
    },
    {
      imageDesktopAr: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070&auto=format&fit=crop',
      imageDesktopEn: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=2070&auto=format&fit=crop',
      imageMobile: 'https://images.unsplash.com/photo-1553413077-190dd305871c?q=80&w=800&auto=format&fit=crop',
      order: 1,
      isActive: true,
    },
  ];

  await prisma.servicesHeroSlide.deleteMany();
  for (const slide of servicesSlides) {
    await prisma.servicesHeroSlide.create({ data: slide });
  }
  console.log('✅ Services Hero Slides created:', servicesSlides.length);

  // ============================================
  // 4. Create About Hero Slides
  // ============================================
  const aboutSlides = [
    {
      imageDesktopAr: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop',
      imageDesktopEn: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=2070&auto=format&fit=crop',
      imageMobile: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop',
      order: 0,
      isActive: true,
    },
    {
      imageDesktopAr: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2070&auto=format&fit=crop',
      imageDesktopEn: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=2070&auto=format&fit=crop',
      imageMobile: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=800&auto=format&fit=crop',
      order: 1,
      isActive: true,
    },
  ];

  await prisma.aboutHeroSlide.deleteMany();
  for (const slide of aboutSlides) {
    await prisma.aboutHeroSlide.create({ data: slide });
  }
  console.log('✅ About Hero Slides created:', aboutSlides.length);

  // ============================================
  // 5. Create Careers Hero Slides
  // ============================================
  const careersSlides = [
    {
      imageDesktopAr: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
      imageDesktopEn: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop',
      imageMobile: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop',
      order: 0,
      isActive: true,
    },
    {
      imageDesktopAr: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop',
      imageDesktopEn: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=2070&auto=format&fit=crop',
      imageMobile: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=800&auto=format&fit=crop',
      order: 1,
      isActive: true,
    },
  ];

  await prisma.careersHeroSlide.deleteMany();
  for (const slide of careersSlides) {
    await prisma.careersHeroSlide.create({ data: slide });
  }
  console.log('✅ Careers Hero Slides created:', careersSlides.length);

  // ============================================
  // 6. Create Hero Settings (if not exists)
  // ============================================
  await prisma.heroSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      blurAmount: 0,
      overlayOpacity: 30,
      overlayColor: 'marine',
      showGrid: true,
    },
  });
  console.log('✅ Hero Settings created/verified');

  // Services Hero Settings
  await prisma.servicesHeroSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      blurAmount: 0,
      overlayOpacity: 85,
      overlayColor: '#1e3a5f',
      showGrid: true,
      showParticles: true,
    },
  });
  console.log('✅ Services Hero Settings created/verified');

  // About Hero Settings
  await prisma.aboutHeroSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      blurAmount: 0,
      overlayOpacity: 85,
      overlayColor: '#1e3a5f',
      showGrid: true,
      showParticles: true,
    },
  });
  console.log('✅ About Hero Settings created/verified');

  // Careers Hero Settings
  await prisma.careersHeroSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      blurAmount: 0,
      overlayOpacity: 80,
      overlayColor: '#1e3a5f',
      showGrid: true,
      showParticles: true,
    },
  });
  console.log('✅ Careers Hero Settings created/verified');

  // ============================================
  // 7. Create Sample Services
  // ============================================
  const services = [
    {
      slug: 'sea-freight',
      iconName: 'Ship',
      titleAr: 'الشحن البحري',
      titleEn: 'Sea Freight',
      shortDescAr: 'خدمات شحن بحري موثوقة لجميع أنحاء العالم',
      shortDescEn: 'Reliable sea freight services worldwide',
      descriptionAr: 'نقدم خدمات الشحن البحري بأعلى معايير الجودة والأمان',
      descriptionEn: 'We provide sea freight services with the highest quality and safety standards',
      color: '#0369a1',
      order: 0,
      isActive: true,
    },
    {
      slug: 'air-freight',
      iconName: 'Plane',
      titleAr: 'الشحن الجوي',
      titleEn: 'Air Freight',
      shortDescAr: 'شحن جوي سريع وآمن لشحناتك العاجلة',
      shortDescEn: 'Fast and safe air freight for urgent shipments',
      descriptionAr: 'خدمات الشحن الجوي السريع مع تتبع مباشر',
      descriptionEn: 'Express air freight services with real-time tracking',
      color: '#7c3aed',
      order: 1,
      isActive: true,
    },
    {
      slug: 'land-transport',
      iconName: 'Truck',
      titleAr: 'النقل البري',
      titleEn: 'Land Transport',
      shortDescAr: 'نقل بري آمن داخل مصر والشرق الأوسط',
      shortDescEn: 'Safe land transport within Egypt and Middle East',
      descriptionAr: 'أسطول حديث للنقل البري مع سائقين محترفين',
      descriptionEn: 'Modern fleet for land transport with professional drivers',
      color: '#059669',
      order: 2,
      isActive: true,
    },
    {
      slug: 'customs-clearance',
      iconName: 'FileCheck',
      titleAr: 'التخليص الجمركي',
      titleEn: 'Customs Clearance',
      shortDescAr: 'تخليص جمركي سريع ودقيق',
      shortDescEn: 'Fast and accurate customs clearance',
      descriptionAr: 'فريق متخصص في التخليص الجمركي بكل الموانئ المصرية',
      descriptionEn: 'Specialized team for customs clearance at all Egyptian ports',
      color: '#dc2626',
      order: 3,
      isActive: true,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { slug: service.slug },
      update: service,
      create: service,
    });
  }
  console.log('✅ Services created:', services.length);

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('📧 Admin Login: admin@samalogistics.com');
  console.log('🔑 Password: admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
