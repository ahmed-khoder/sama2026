// Seed script for Services Page dynamic sections
// Run with: npx ts-node prisma/seed-services-page.ts

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Services Page data...');

    // ── 1. Capability Stats ──────────────────────────────
    const stats = [
        { icon: 'Truck', valueAr: '15+', valueEn: '15+', labelAr: 'شاحنة ثقيلة', labelEn: 'Heavy Trucks', order: 0 },
        { icon: 'Anchor', valueAr: '3', valueEn: '3', labelAr: 'ميناء استراتيجي', labelEn: 'Strategic Ports', order: 1 },
        { icon: 'Weight', valueAr: '60 طن', valueEn: '60 Tons', labelAr: 'أقصى حمولة', labelEn: 'Max Load', order: 2 },
        { icon: 'Clock', valueAr: '24/7', valueEn: '24/7', labelAr: 'عمليات مستمرة', labelEn: 'Non-Stop Ops', order: 3 },
    ];

    for (const stat of stats) {
        await prisma.servicesPageStat.create({ data: stat });
    }
    console.log(`✅ Created ${stats.length} capability stats`);

    // ── 2. Fleet Trucks ──────────────────────────────────
    const trucks = [
        {
            nameAr: 'مرسيدس-بنز أكتروس MP3',
            nameEn: 'Mercedes-Benz Actros MP3',
            descAr: 'قوة ألمانية مُصممة للأحمال الفائقة. الاختيار الأمثل لنقل الرخام والأحجار على مسافات طويلة.',
            descEn: 'German-engineered power built for extreme loads. The ideal choice for long-distance marble and stone transport.',
            specsJson: JSON.stringify([
                { labelAr: 'المحرك', labelEn: 'Engine', valueAr: 'OM 501 LA V6', valueEn: 'OM 501 LA V6' },
                { labelAr: 'القدرة', labelEn: 'Power', valueAr: '540 حصان', valueEn: '540 HP' },
                { labelAr: 'الحمولة', labelEn: 'Payload', valueAr: 'حتى 60 طن', valueEn: 'Up to 60 Tons' },
                { labelAr: 'المحاور', labelEn: 'Axle Config', valueAr: '6×4', valueEn: '6×4' },
            ]),
            order: 0,
        },
        {
            nameAr: 'فولفو FH500 (2020)',
            nameEn: 'Volvo FH500 (2020)',
            descAr: 'أحدث تقنيات الأمان السويدية مع كفاءة وقود استثنائية. مثالية لنقل الحاويات والبضائع الثقيلة.',
            descEn: 'Latest Swedish safety tech combined with exceptional fuel efficiency. Perfect for container and heavy cargo transport.',
            specsJson: JSON.stringify([
                { labelAr: 'المحرك', labelEn: 'Engine', valueAr: 'D13K500', valueEn: 'D13K500' },
                { labelAr: 'القدرة', labelEn: 'Power', valueAr: '500 حصان', valueEn: '500 HP' },
                { labelAr: 'الحمولة', labelEn: 'Payload', valueAr: 'حتى 55 طن', valueEn: 'Up to 55 Tons' },
                { labelAr: 'التقنيات', labelEn: 'Tech', valueAr: 'I-Shift مزدوج', valueEn: 'Dual I-Shift' },
            ]),
            order: 1,
        },
    ];

    for (const truck of trucks) {
        await prisma.fleetTruck.create({ data: truck });
    }
    console.log(`✅ Created ${trucks.length} fleet trucks`);

    // ── 3. Port Operations (incl. Damietta) ──────────────
    const ports = [
        {
            nameAr: 'ميناء بورسعيد',
            nameEn: 'Port Said',
            descAr: 'موقعنا الاستراتيجي عند مدخل قناة السويس يمنحنا وصولاً لا مثيل له إلى خطوط الشحن العالمية.',
            descEn: 'Our strategic position at the entrance of the Suez Canal gives us unparalleled access to global shipping lanes.',
            factsJson: JSON.stringify([
                { ar: 'بوابة قناة السويس', en: 'Gateway to the Suez Canal' },
                { ar: 'أكبر ميناء ترانزيت في مصر', en: "Egypt's largest transit port" },
                { ar: 'ربط بحري عالمي مباشر', en: 'Direct global maritime links' },
            ]),
            order: 0,
        },
        {
            nameAr: 'ميناء شرق بورسعيد',
            nameEn: 'East Port Said',
            descAr: 'مركز لوجستي من الجيل الجديد مُجهز بأحدث التقنيات لمعالجة الحاويات وعمليات التخليص الجمركي السريع.',
            descEn: 'A next-generation logistics hub equipped with cutting-edge container handling and fast customs clearance.',
            factsJson: JSON.stringify([
                { ar: 'منطقة اقتصادية خاصة', en: 'Special Economic Zone' },
                { ar: 'أحدث بنية تحتية للحاويات', en: 'State-of-the-art container infrastructure' },
                { ar: 'مركز لوجستي متكامل', en: 'Integrated logistics hub' },
            ]),
            order: 1,
        },
        {
            nameAr: 'ميناء دمياط',
            nameEn: 'Damietta Port',
            descAr: 'ميناء استراتيجي على البحر المتوسط يخدم حركة التجارة النشطة في دلتا النيل ويوفر خدمات متكاملة للحاويات والبضائع العامة.',
            descEn: 'A strategic Mediterranean port serving the active trade movement in the Nile Delta, offering integrated container and general cargo services.',
            factsJson: JSON.stringify([
                { ar: 'موقع استراتيجي على المتوسط', en: 'Strategic Mediterranean location' },
                { ar: 'مناولة حاويات وبضائع عامة', en: 'Container & General Cargo handling' },
                { ar: 'عمليات تخليص جمركي سريعة', en: 'Fast customs clearance operations' },
            ]),
            order: 2,
        },
    ];

    for (const port of ports) {
        await prisma.portOperation.create({ data: port });
    }
    console.log(`✅ Created ${ports.length} port operations (incl. Damietta)`);

    // ── 4. Specialized Cargo ─────────────────────────────
    const cargoTypes = [
        {
            icon: 'Weight',
            titleAr: 'رخام وأحجار',
            titleEn: 'Marble & Stone',
            badgeAr: '50-60 طن',
            badgeEn: '50-60 Tons',
            descAr: 'نقل آمن للأحمال الفائقة من الرخام والجرانيت بأسطول مخصص وطاقم محترف.',
            descEn: 'Safe transport of ultra-heavy marble and granite loads with a dedicated fleet and expert crew.',
            gradient: 'from-amber-500 to-orange-600',
            order: 0,
        },
        {
            icon: 'Container',
            titleAr: 'نقل حاويات',
            titleEn: 'Container Transport',
            badgeAr: '20 & 40 قدم',
            badgeEn: '20ft & 40ft',
            descAr: 'نقل حاويات بقياسات 20 و40 قدماً من وإلى الموانئ بكفاءة ودقة مواعيد.',
            descEn: 'Efficient 20ft and 40ft container transport to and from ports with on-time precision.',
            gradient: 'from-sky-500 to-blue-600',
            order: 1,
        },
        {
            icon: 'Package',
            titleAr: 'بضائع ثقيلة عامة',
            titleEn: 'General Heavy Cargo',
            badgeAr: 'متعدد',
            badgeEn: 'Multi-type',
            descAr: 'نقل وتوزيع البضائع الثقيلة والمعدات الصناعية بحلول مخصصة لكل شحنة.',
            descEn: 'Heavy cargo and industrial equipment transport with customized solutions for every shipment.',
            gradient: 'from-emerald-500 to-teal-600',
            order: 2,
        },
    ];

    for (const cargo of cargoTypes) {
        await prisma.specializedCargo.create({ data: cargo });
    }
    console.log(`✅ Created ${cargoTypes.length} specialized cargo types`);

    console.log('\n🎉 Services Page seeding complete!');
}

main()
    .catch(e => { console.error(e); process.exit(1); })
    .finally(() => prisma.$disconnect());
