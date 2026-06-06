/**
 * Marble Transport Page — Server-Side Data Pipeline
 *
 * 3-layer architecture:
 *   1. FETCH  → Prisma query wrapped in unstable_cache (tag: 'marble-transport')
 *   2. VALIDATE → Zod safeParse with full fallback on failure
 *   3. MAP    → Returns typed MarbleTransportContent ready for UI
 *
 * This runs ONLY on the server (RSC). Never import from client components.
 */

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/db';
import {
    MarbleHeroSchema,
    MarbleStatSchema,
    MarbleProblemsSchema,
    MarbleFeaturesSchema,
    MarbleTrustStatSchema,
    MarbleSolutionSchema,
    type MarbleTransportContent,
} from '@/lib/schemas/marble-transport.schema';

// ── Static fallback data (current hardcoded content) ──
// Used when CMS data is missing or invalid
const STATIC_HERO = {
    badgeAr: 'متخصصون في نقل المواد المحجرية والتعدينية',
    badgeEn: 'Specialized in Quarry & Mining Transport',
    titleLine1Ar: 'نقل الرخام والمواد المحجرية والتعدينية',
    titleLine1En: 'Marble, Quarry & Mining',
    titleLine2Ar: 'بأعلى درجات الأمان',
    titleLine2En: 'Transport — Maximum Safety',
    descAr: 'نقل الرخام والجرانيت وجميع المواد المحجرية من مواقع الإنتاج مثل شق الثعبان إلى مواقع العمل باستخدام أسطول متخصص للأحمال الثقيلة.',
    descEn: "Marble, granite, and all quarry materials transport from production sites like Shaq El-Tue'ban to worksites using a specialized heavy-load fleet.",
    image: '/images/fleet/1772066646569-ggbkgl.webp',
    overlayOpacity: 0.2,
    blurAmount: 0,
    overlayColor: 'blue',
};

const STATIC_STATS = [
    { valueAr: '+25', valueEn: '25+', labelAr: 'سنة خبرة', labelEn: 'Years Experience' },
    { valueAr: '60', valueEn: '60', labelAr: 'طن أقصى حمولة', labelEn: 'Ton Max Load' },
    { valueAr: '+1000', valueEn: '1000+', labelAr: 'شحنة منجزة', labelEn: 'Shipments Completed' },
    { valueAr: '0%', valueEn: '0%', labelAr: 'نسبة تلف', labelEn: 'Damage Rate' },
];

const STATIC_TRUST = [
    { valueAr: '+25', valueEn: '25+', labelAr: 'سنة في نقل المحاجر', labelEn: 'Years in Quarry Transport' },
    { valueAr: '20+', valueEn: '20+', labelAr: 'شاحنة ثقيلة مجهزة', labelEn: 'Equipped Heavy Trucks' },
    { valueAr: '+1000', valueEn: '1000+', labelAr: 'مشروع بناء وتشطيب', labelEn: 'Construction Projects Served' },
    { valueAr: '60', valueEn: '60', labelAr: 'طن أقصى حمولة', labelEn: 'Ton Max Payload' },
];

const STATIC_SOLUTIONS = [
    { titleAr: 'نقل رخام وجرانيت', titleEn: 'Marble & Granite Transport', descAr: 'نقل ألواح وبلوكات الرخام والجرانيت بعناية فائقة من المصانع والمحاجر إلى مواقع التركيب ومعارض البيع.', descEn: 'Careful transport of marble and granite slabs and blocks from factories and quarries to installation sites and showrooms.' },
    { titleAr: 'نقل مواد محجرية', titleEn: 'Quarry Materials Transport', descAr: 'نقل الحجر الجيري والبازلت والرمال والكسر من المحاجر إلى مواقع البناء والمصانع.', descEn: 'Transport of limestone, basalt, sand, and aggregate from quarries to construction sites and factories.' },
    { titleAr: 'نقل خامات تعدين', titleEn: 'Mining Materials Transport', descAr: 'نقل الخامات التعدينية من مواقع الاستخراج إلى المصانع ومراكز المعالجة عبر جميع المحافظات.', descEn: 'Transport of mining materials from extraction sites to factories and processing centers across all governorates.' },
    { titleAr: 'نقل أحمال ثقيلة', titleEn: 'Heavy Load Transport', descAr: 'نقل الأحمال الثقيلة غير النمطية (حتى 60 طن) بشاحنات مخصصة وتصاريح خاصة وفريق عمليات محترف.', descEn: 'Non-standard heavy load transport (up to 60 tons) with specialized trucks, special permits, and a professional operations team.' },
];

const STATIC_PROBLEMS = {
    sectionTitleAr: 'مشاكل تكلف المقاولين خسائر كبيرة',
    sectionTitleEn: 'Problems Costing Contractors Major Losses',
    items: [
        { titleAr: 'تلف الأحمال أثناء النقل', titleEn: 'Cargo Damage During Transport', descAr: 'الرخام والجرانيت مواد حساسة رغم ثقلها. نستخدم تقنيات تثبيت متقدمة وفرق تحميل متخصصة تضمن وصول الشحنة بدون أي خدش.', descEn: 'Marble and granite are fragile despite their weight. We use advanced securing techniques and specialized loading teams to ensure scratch-free delivery.' },
        { titleAr: 'صعوبة تحميل الأحجار الثقيلة', titleEn: 'Difficulty Loading Heavy Stones', descAr: 'التحميل العشوائي يسبب كسر وتلف. فريقنا مدرب على التعامل مع البلوكات والألواح الثقيلة باستخدام معدات مناسبة.', descEn: 'Random loading causes breakage and damage. Our team is trained to handle heavy blocks and slabs using proper equipment.' },
        { titleAr: 'تأخير التسليم', titleEn: 'Delivery Delays', descAr: 'مشاريع البناء تعتمد على مواعيد محددة. أي تأخير يكلف المقاول خسائر. نلتزم بالمواعيد المتفق عليها بنسبة 98%.', descEn: 'Construction projects depend on precise schedules. Any delay costs the contractor losses. We maintain a 98% on-time delivery rate.' },
        { titleAr: 'نقص الخبرة في التعامل مع المواد الثقيلة', titleEn: 'Lack of Heavy Materials Expertise', descAr: 'شركات النقل العادية لا تفهم طبيعة المواد المحجرية. لدينا 25 سنة خبرة في شق الثعبان ومناطق المحاجر.', descEn: "Regular transport companies don't understand quarry materials. We have 25 years of experience at Shaq El-Tue'ban and quarry zones." },
    ],
};

const STATIC_FEATURES = {
    sectionTitleAr: 'لماذا سما لوجيستك؟',
    sectionTitleEn: 'Why SAMA Logistics?',
    cards: [
        { titleAr: 'خبرة في شق الثعبان والمحاجر', titleEn: "Shaq El-Tue'ban & Quarry Expertise", descAr: 'نعمل في شق الثعبان ومناطق المحاجر منذ أكثر من 25 سنة. نعرف كل طريق وكل تحدي.', descEn: "We've been operating in Shaq El-Tue'ban and quarry zones for over 25 years. We know every route and every challenge." },
        { titleAr: 'أسطول مخصص للأوزان الثقيلة', titleEn: 'Fleet Specialized for Heavy Loads', descAr: 'شاحنات مجهزة خصيصاً لنقل أحمال تصل إلى 60 طن — مع نظام تثبيت احترافي يحمي كل شحنة.', descEn: 'Trucks specially equipped for loads up to 60 tons — with professional securing systems that protect every shipment.' },
        { titleAr: 'تأمين عالي أثناء النقل', titleEn: 'Premium Transport Insurance', descAr: 'تأمين شامل على كل شحنة رخام ومواد محجرية. راحة البال من لحظة التحميل حتى التسليم.', descEn: 'Comprehensive insurance on every marble and quarry shipment. Peace of mind from loading to delivery.' },
        { titleAr: 'التزام بالمواعيد', titleEn: 'On-Time Commitment', descAr: 'نسبة التزام 98% بالمواعيد. مشروعك لن يتأخر بسبب النقل.', descEn: "98% on-time delivery rate. Your project won't be delayed because of transport." },
    ],
};

// ══════════════════════════════════════════════
//  Layer 1: FETCH (cached with tag)
// ══════════════════════════════════════════════
const fetchMarbleSettings = unstable_cache(
    async () => {
        const settings = await prisma.siteSetting.findMany({
            where: { section: 'marble-page', isActive: true },
        });

        const raw: Record<string, unknown> = {};
        for (const s of settings) {
            try {
                raw[s.key] = JSON.parse(s.extra || '{}');
            } catch {
                // Malformed JSON — skip this key, fallback will be used
            }
        }
        return raw;
    },
    ['marble-transport-data'],
    {
        tags: ['marble-transport'],
        revalidate: 600, // 10 min hard fallback — tag revalidation is the primary mechanism
    }
);

// ══════════════════════════════════════════════
//  Layer 2 + 3: VALIDATE + MAP
// ══════════════════════════════════════════════

/**
 * Safe parser that validates a single section.
 * Returns validated data or the static fallback on any failure.
 */
function safeParseSection<T>(
    schema: { safeParse: (data: unknown) => { success: boolean; data?: T; error?: unknown } },
    raw: unknown,
    fallback: T
): T {
    if (raw === undefined || raw === null) return fallback;
    const result = schema.safeParse(raw);
    return result.success ? (result.data as T) : fallback;
}

/**
 * Main entry point — called from page.tsx (Server Component only).
 *
 * Returns fully validated MarbleTransportContent.
 * NEVER throws — always returns valid data.
 */
export async function getMarbleTransportContent(): Promise<MarbleTransportContent> {
    let raw: Record<string, unknown> = {};

    try {
        raw = await fetchMarbleSettings();
    } catch (err) {
        console.error('[marble-transport] Failed to fetch CMS data, using full static fallback:', err);
        // Return full static defaults — no parsing needed
        return {
            hero: STATIC_HERO,
            stats: STATIC_STATS,
            problems: STATIC_PROBLEMS,
            features: STATIC_FEATURES,
            trust: STATIC_TRUST,
            solutions: STATIC_SOLUTIONS,
        } as MarbleTransportContent;
    }

    // Validate each section independently — partial CMS data won't break anything
    const hero = safeParseSection(MarbleHeroSchema, raw.hero, STATIC_HERO as any);
    const stats = raw.stats && Array.isArray(raw.stats) && raw.stats.length > 0
        ? (raw.stats as unknown[]).map(s => safeParseSection(MarbleStatSchema, s, STATIC_STATS[0]!))
        : STATIC_STATS;
    const problems = safeParseSection(MarbleProblemsSchema, raw.problems, STATIC_PROBLEMS as any);
    const features = safeParseSection(MarbleFeaturesSchema, raw.features, STATIC_FEATURES as any);
    const trust = raw.trust && Array.isArray(raw.trust) && raw.trust.length > 0
        ? (raw.trust as unknown[]).map(s => safeParseSection(MarbleTrustStatSchema, s, STATIC_TRUST[0]!))
        : STATIC_TRUST;
    const solutions = raw.solutions && Array.isArray(raw.solutions) && raw.solutions.length > 0
        ? (raw.solutions as unknown[]).map(s => safeParseSection(MarbleSolutionSchema, s, STATIC_SOLUTIONS[0]!))
        : STATIC_SOLUTIONS;

    return { hero, stats, problems, features, trust, solutions };
}
