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
            titleAr: 'نقل الرخام والمواد المحجرية والتعدينية',
            titleEn: 'Marble, Quarry & Mining Transport',
            badgeAr: '50-60 طن',
            badgeEn: '50-60 Tons',
            descAr: 'نقل الرخام وجميع المواد المحجرية والتعدينية بأمان وكفاءة تشغيلية عالية، باستخدام أسطول متخصص يضمن التعامل مع الأحمال الثقيلة بكفاءة وموثوقية.',
            descEn: 'Marble and all quarry and mining materials transported with safety and high operational efficiency, using a specialized fleet that ensures reliable and dependable heavy load handling.',
            gradient: 'from-amber-500 to-orange-600',
            order: 0,
        },
        {
            icon: 'Container',
            titleAr: 'نقل الحاويات من وإلى الموانئ',
            titleEn: 'Port Container Transport',
            badgeAr: '20 & 40 قدم',
            badgeEn: '20ft & 40ft',
            descAr: 'نقل حاويات 20 و40 قدم من وإلى جميع الموانئ بكفاءة تشغيلية عالية، مع متابعة مستمرة والتزام دقيق بمواعيد الاستلام والتسليم.',
            descEn: 'Professional 20ft and 40ft container transport to and from all ports with high operational efficiency, continuous tracking, and strict adherence to pickup and delivery schedules.',
            gradient: 'from-sky-500 to-blue-600',
            order: 1,
        },
        {
            icon: 'Package',
            titleAr: 'نقل حاويات المصانع والقطاع الصناعي',
            titleEn: 'Factory & Industrial Container Transport',
            badgeAr: 'متعدد',
            badgeEn: 'Multi-type',
            descAr: 'نقل حاويات 40 قدم والبضائع الصناعية من وإلى المجمعات والمناطق الصناعية في جميع المحافظات بكفاءة تشغيلية عالية والتزام بالمواعيد.',
            descEn: 'Transport of 40ft containers and industrial cargo to and from industrial zones and complexes across all governorates with high operational efficiency and on-time delivery.',
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
