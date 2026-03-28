/**
 * Seed Services Data
 * إضافة الخدمات الأساسية للشركة
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const services = [
  {
    slug: 'sea-freight',
    iconName: 'Ship',
    titleAr: 'شحن بحري',
    titleEn: 'Sea Freight',
    shortDescAr: 'خدمات شحن بحري موثوقة وآمنة لجميع أنواع البضائع حول العالم',
    shortDescEn: 'Reliable and secure sea freight services for all types of cargo worldwide',
    descriptionAr: 'نقدم خدمات الشحن البحري المتكاملة التي تغطي جميع الموانئ الرئيسية في العالم. نضمن لك نقل بضائعك بأمان تام وبأسعار تنافسية مع توفير خدمات التتبع المباشر والتأمين الشامل على جميع الشحنات.',
    descriptionEn: 'We provide comprehensive sea freight services covering all major ports worldwide. We guarantee safe transportation of your goods at competitive prices with direct tracking services and comprehensive insurance on all shipments.',
    featuresJson: JSON.stringify([
      { ar: 'تغطية شاملة لجميع الموانئ العالمية', en: 'Comprehensive coverage of all global ports' },
      { ar: 'نظام تتبع إلكتروني متقدم', en: 'Advanced electronic tracking system' },
      { ar: 'تأمين شامل على البضائع', en: 'Comprehensive cargo insurance' },
      { ar: 'تخليص جمركي سريع', en: 'Fast customs clearance' },
      { ar: 'أسعار تنافسية', en: 'Competitive prices' },
      { ar: 'فريق دعم متاح 24/7', en: '24/7 support team' },
    ]),
    color: '#1e40af', // marine blue
    order: 1,
    isActive: true,
  },
  {
    slug: 'air-freight',
    iconName: 'Plane',
    titleAr: 'شحن جوي',
    titleEn: 'Air Freight',
    shortDescAr: 'حلول شحن جوي سريعة وفعالة للشحنات العاجلة والبضائع ذات القيمة العالية',
    shortDescEn: 'Fast and efficient air freight solutions for urgent shipments and high-value cargo',
    descriptionAr: 'خدمات الشحن الجوي المتخصصة توفر لك أسرع الحلول لنقل بضائعك. نعمل مع أفضل شركات الطيران العالمية لضمان وصول شحناتك في الوقت المحدد مع الحفاظ على أعلى معايير الأمان والجودة.',
    descriptionEn: 'Specialized air freight services provide you with the fastest solutions for transporting your goods. We work with the best global airlines to ensure your shipments arrive on time while maintaining the highest safety and quality standards.',
    featuresJson: JSON.stringify([
      { ar: 'توصيل سريع للشحنات العاجلة', en: 'Fast delivery for urgent shipments' },
      { ar: 'شبكة واسعة من المطارات الدولية', en: 'Wide network of international airports' },
      { ar: 'معاملة خاصة للبضائع الحساسة', en: 'Special handling for sensitive cargo' },
      { ar: 'تتبع مباشر لحظة بلحظة', en: 'Real-time tracking' },
      { ar: 'تنسيق كامل للشحنات المركبة', en: 'Full coordination for combined shipments' },
      { ar: 'خدمات لوجستية متكاملة', en: 'Integrated logistics services' },
    ]),
    color: '#ea580c', // orange
    order: 2,
    isActive: true,
  },
  {
    slug: 'land-transportation',
    iconName: 'Truck',
    titleAr: 'نقل برى',
    titleEn: 'Land Transportation',
    shortDescAr: 'خدمات نقل بري شاملة داخل المدن وبين الدول مع أسطول حديث ومجهز',
    shortDescEn: 'Comprehensive land transportation services within cities and between countries with a modern fleet',
    descriptionAr: 'نوفر خدمات النقل البري المتكاملة بأسطول من الشاحنات الحديثة المجهزة بأحدث أنظمة التتبع والتبريد. نغطي جميع المناطق الداخلية ونقدم حلول نقل مرنة تناسب جميع أنواع البضائع.',
    descriptionEn: 'We provide integrated land transportation services with a fleet of modern trucks equipped with the latest tracking and refrigeration systems. We cover all inland areas and offer flexible transportation solutions suitable for all types of cargo.',
    featuresJson: JSON.stringify([
      { ar: 'أسطول حديث ومتنوع من الشاحنات', en: 'Modern and diverse fleet of trucks' },
      { ar: 'خدمات تبريد للمنتجات الحساسة', en: 'Refrigeration services for sensitive products' },
      { ar: 'تغطية شاملة للمناطق الداخلية', en: 'Comprehensive coverage of inland areas' },
      { ar: 'مرونة في مواعيد الاستلام والتسليم', en: 'Flexible pickup and delivery schedules' },
      { ar: 'تأمين كامل على الشحنات', en: 'Full insurance on shipments' },
      { ar: 'سائقون محترفون مدربون', en: 'Professional trained drivers' },
    ]),
    color: '#16a34a', // green
    order: 3,
    isActive: true,
  },
  {
    slug: 'customs-clearance',
    iconName: 'FileCheck',
    titleAr: 'تخليص جمركى',
    titleEn: 'Customs Clearance',
    shortDescAr: 'خدمات تخليص جمركي سريعة واحترافية بخبرة واسعة في القوانين الدولية',
    shortDescEn: 'Fast and professional customs clearance services with extensive experience in international regulations',
    descriptionAr: 'فريقنا المتخصص في التخليص الجمركي يمتلك خبرة واسعة في التعامل مع جميع أنواع البضائع والقوانين الجمركية. نضمن لك إجراءات سريعة وسلسة لتوفير الوقت والتكاليف مع الالتزام الكامل بجميع المتطلبات القانونية.',
    descriptionEn: 'Our customs clearance team has extensive experience in handling all types of goods and customs regulations. We guarantee fast and smooth procedures to save time and costs with full compliance with all legal requirements.',
    featuresJson: JSON.stringify([
      { ar: 'خبراء متخصصون في القوانين الجمركية', en: 'Experts specialized in customs regulations' },
      { ar: 'إجراءات سريعة ودقيقة', en: 'Fast and accurate procedures' },
      { ar: 'تنسيق كامل مع السلطات الجمركية', en: 'Full coordination with customs authorities' },
      { ar: 'استشارات جمركية مجانية', en: 'Free customs consultations' },
      { ar: 'إدارة المستندات والأوراق الثبوتية', en: 'Document and paperwork management' },
      { ar: 'متابعة مستمرة حتى الإفراج الكامل', en: 'Continuous follow-up until full release' },
    ]),
    color: '#7c3aed', // purple
    order: 4,
    isActive: true,
  },
  {
    slug: 'warehousing',
    iconName: 'Warehouse',
    titleAr: 'تخزين وتوزيع',
    titleEn: 'Warehousing & Distribution',
    shortDescAr: 'مستودعات حديثة مجهزة بأنظمة أمنية متطورة وخدمات توزيع احترافية',
    shortDescEn: 'Modern warehouses equipped with advanced security systems and professional distribution services',
    descriptionAr: 'نوفر مساحات تخزين واسعة ومجهزة بأحدث أنظمة الأمان والمراقبة وإدارة المخزون. نقدم أيضاً خدمات التوزيع المرنة التي تساعدك على إدارة سلسلة الإمداد بكفاءة عالية وتكاليف مخفضة.',
    descriptionEn: 'We provide spacious storage facilities equipped with the latest security, monitoring, and inventory management systems. We also offer flexible distribution services that help you manage your supply chain with high efficiency and reduced costs.',
    featuresJson: JSON.stringify([
      { ar: 'مستودعات مجهزة بأنظمة تحكم في درجات الحرارة', en: 'Warehouses equipped with temperature control systems' },
      { ar: 'أنظمة أمنية متطورة على مدار الساعة', en: 'Advanced security systems 24/7' },
      { ar: 'إدارة مخزون إلكترونية', en: 'Electronic inventory management' },
      { ar: 'خدمات توزيع مرنة', en: 'Flexible distribution services' },
      { ar: 'تغليف وإعادة تعبئة', en: 'Packaging and repackaging' },
      { ar: 'تقارير دورية مفصلة', en: 'Detailed periodic reports' },
    ]),
    color: '#dc2626', // red
    order: 5,
    isActive: true,
  },
  {
    slug: 'cargo-insurance',
    iconName: 'Shield',
    titleAr: 'تأمين شامل للبضائع',
    titleEn: 'Comprehensive Cargo Insurance',
    shortDescAr: 'تغطية تأمينية شاملة لحماية بضائعك ضد جميع المخاطر المحتملة',
    shortDescEn: 'Comprehensive insurance coverage to protect your cargo against all potential risks',
    descriptionAr: 'نتعاون مع أفضل شركات التأمين لتوفير تغطية شاملة لبضائعك ضد جميع المخاطر. سواء كان شحن بحري أو جوي أو بري، نضمن لك حماية كاملة وتعويضات عادلة في حالة حدوث أي ضرر أو فقدان.',
    descriptionEn: 'We partner with the best insurance companies to provide comprehensive coverage for your cargo against all risks. Whether sea, air, or land shipping, we guarantee full protection and fair compensation in case of any damage or loss.',
    featuresJson: JSON.stringify([
      { ar: 'تغطية شاملة لجميع أنواع البضائع', en: 'Comprehensive coverage for all cargo types' },
      { ar: 'حماية ضد الكوارث الطبيعية', en: 'Protection against natural disasters' },
      { ar: 'تعويضات سريعة وعادلة', en: 'Fast and fair compensation' },
      { ar: 'تغطية عالمية', en: 'Global coverage' },
      { ar: 'خيارات تأمين مرنة', en: 'Flexible insurance options' },
      { ar: 'دعم في حالات الطوارئ', en: 'Emergency support' },
    ]),
    color: '#0891b2', // cyan
    order: 6,
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Starting services seed...');

  try {
    // Clear existing services (optional - comment out if you want to keep existing)
    // await prisma.service.deleteMany();
    // console.log('🗑️  Cleared existing services');

    // Create services
    for (const service of services) {
      const existing = await prisma.service.findUnique({
        where: { slug: service.slug },
      });

      if (existing) {
        // Update existing service
        await prisma.service.update({
          where: { slug: service.slug },
          data: service,
        });
        console.log(`✅ Updated: ${service.titleAr} (${service.titleEn})`);
      } else {
        // Create new service
        await prisma.service.create({
          data: service,
        });
        console.log(`🆕 Created: ${service.titleAr} (${service.titleEn})`);
      }
    }

    console.log('\n✨ Services seed completed successfully!');
    console.log(`📦 Total services: ${services.length}`);
  } catch (error) {
    console.error('❌ Error seeding services:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
