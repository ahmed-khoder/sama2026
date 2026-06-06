/**
 * Industrial Transport Page — Server-Side Data Pipeline
 *
 * Identical architecture to marble-transport.data.ts:
 *   1. FETCH  → Prisma query wrapped in unstable_cache (tag: 'industrial-transport')
 *   2. VALIDATE → Zod safeParse with full fallback on failure
 *   3. MAP    → Returns typed MarbleTransportContent ready for UI
 *
 * Reuses the same Zod schemas as marble — both pages share the same data shape.
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

// ── Static fallback data (current hardcoded content from IndustrialTransportClient) ──
const STATIC_HERO = {
    badgeAr: 'متخصصون في خدمة القطاع الصناعي',
    badgeEn: 'Specialized in Industrial Sector Services',
    titleLine1Ar: 'نقل حاويات المصانع',
    titleLine1En: 'Factory Container Transport',
    titleLine2Ar: 'في جميع المناطق الصناعية',
    titleLine2En: 'Across All Industrial Zones',
    descAr: 'خدمات نقل حاويات 40 قدم والبضائع الصناعية من وإلى المصانع والمجمعات الصناعية في جميع المحافظات بكفاءة تشغيلية عالية والتزام كامل بالمواعيد.',
    descEn: 'Professional 40ft container and industrial cargo transport to and from factories and industrial complexes across all governorates with high operational efficiency and full schedule commitment.',
    image: '/images/fleet/1772066646569-ggbkgl.webp',
    overlayOpacity: 0.4,
    blurAmount: 0,
    overlayColor: 'blue',
};

const STATIC_STATS = [
    { valueAr: '+25', valueEn: '25+', labelAr: 'سنة خبرة', labelEn: 'Years Experience' },
    { valueAr: '15+', valueEn: '15+', labelAr: 'شاحنة مخصصة', labelEn: 'Dedicated Trucks' },
    { valueAr: '+500', valueEn: '500+', labelAr: 'مصنع وشركة', labelEn: 'Factories & Companies' },
    { valueAr: '98%', valueEn: '98%', labelAr: 'التزام بالمواعيد', labelEn: 'On-Time Rate' },
];

const STATIC_TRUST = [
    { valueAr: '+25', valueEn: '25+', labelAr: 'سنة في السوق المصري', labelEn: 'Years in Egyptian Market' },
    { valueAr: '15+', valueEn: '15+', labelAr: 'شاحنة ثقيلة مجهزة', labelEn: 'Equipped Heavy Trucks' },
    { valueAr: '+500', valueEn: '500+', labelAr: 'مصنع وشركة صناعية', labelEn: 'Factories & Industrial Companies' },
    { valueAr: '3', valueEn: '3', labelAr: 'موانئ رئيسية مغطاة', labelEn: 'Major Ports Covered' },
];

const STATIC_SOLUTIONS = [
    { titleAr: 'نقل حاويات 40 قدم', titleEn: '40ft Container Transport', descAr: 'نقل حاويات 40 قدم الكاملة من وإلى المصانع والموانئ بشاحنات مجهزة وسائقين محترفين.', descEn: 'Full 40ft container transport to and from factories and ports with equipped trucks and professional drivers.' },
    { titleAr: 'نقل منتجات صناعية', titleEn: 'Industrial Product Transport', descAr: 'نقل المنتجات الصناعية بمختلف أنواعها مع تأمين شامل وتحميل احترافي يحافظ على سلامة البضاعة.', descEn: 'Transport of industrial products of all types with comprehensive insurance and professional loading that preserves cargo integrity.' },
    { titleAr: 'نقل من وإلى المناطق الصناعية', titleEn: 'Industrial Zone Logistics', descAr: 'خدمات نقل متكاملة تربط المصانع بالموانئ ومراكز التوزيع عبر جميع المحافظات المصرية.', descEn: 'Integrated transport services connecting factories to ports and distribution centers across all Egyptian governorates.' },
    { titleAr: 'تشغيل منتظم للمصانع', titleEn: 'Regular Factory Operations', descAr: 'عقود تشغيل يومية وأسبوعية مصممة حسب جدول إنتاج المصنع مع مرونة كاملة في التعديل.', descEn: "Daily and weekly operation contracts designed around the factory's production schedule with full flexibility for adjustments." },
];

const STATIC_PROBLEMS = {
    sectionTitleAr: 'مشاكل تكلف المصانع خسائر يومية',
    sectionTitleEn: 'Problems Costing Factories Daily Losses',
    items: [
        { titleAr: 'تأخير في استلام أو تسليم الحاويات', titleEn: 'Container Pickup & Delivery Delays', descAr: 'التأخير يُعطل خطوط الإنتاج ويكلف المصنع خسائر يومية. نضمن مواعيد محددة ومنتظمة لكل شحنة.', descEn: 'Delays disrupt production lines and cost factories daily losses. We guarantee fixed, regular schedules for every shipment.' },
        { titleAr: 'صعوبة التنسيق داخل المناطق الصناعية', titleEn: 'Complex Industrial Zone Coordination', descAr: 'المناطق الصناعية لها متطلبات دخول وتصاريح خاصة. فريقنا يعرف كل منطقة وإجراءاتها بالتفصيل.', descEn: 'Industrial zones have special entry requirements and permits. Our team knows every zone and its procedures in detail.' },
        { titleAr: 'تلف أو تحميل غير آمن', titleEn: 'Damaged Cargo or Unsafe Loading', descAr: 'التحميل العشوائي يسبب تلف المنتجات وخسائر مالية. نستخدم فرق تحميل متخصصة ومعدات مناسبة لكل نوع بضاعة.', descEn: 'Random loading causes product damage and financial losses. We use specialized loading teams and equipment suited for each cargo type.' },
        { titleAr: 'عدم الالتزام بالمواعيد', titleEn: 'Schedule Non-Compliance', descAr: 'المصانع تعمل بجداول إنتاج محددة. أي تأخير يعني توقف. نعمل بنظام تشغيل منتظم مع التزام صارم بالمواعيد.', descEn: 'Factories operate on tight production schedules. Any delay means downtime. We operate with regular schedules and strict time commitments.' },
    ],
};

const STATIC_FEATURES = {
    sectionTitleAr: 'لماذا سما لوجيستك؟',
    sectionTitleEn: 'Why SAMA Logistics?',
    cards: [
        { titleAr: 'أسطول مخصص للحاويات', titleEn: 'Dedicated Container Fleet', descAr: 'أسطول من الشاحنات الثقيلة المجهزة خصيصاً لنقل حاويات 20 و40 قدم بكفاءة وأمان.', descEn: 'A fleet of heavy trucks specially equipped for efficient and safe transport of 20ft and 40ft containers.' },
        { titleAr: 'خبرة في التعامل مع المصانع', titleEn: 'Factory Operations Expertise', descAr: 'نفهم متطلبات القطاع الصناعي — من جداول الإنتاج والتحميل إلى إجراءات المناطق الصناعية.', descEn: 'We understand industrial sector needs — from production schedules and loading to industrial zone procedures.' },
        { titleAr: 'التزام بالمواعيد', titleEn: 'On-Time Commitment', descAr: "نسبة التزام 98% بالمواعيد المحددة. خطوط إنتاجك لن تتوقف بسبب تأخير النقل.", descEn: "98% on-time delivery rate. Your production lines won't stop due to transport delays." },
        { titleAr: 'تغطية جميع المناطق الصناعية', titleEn: 'Full Industrial Zone Coverage', descAr: 'العاشر من رمضان، 6 أكتوبر، مدينة السادات، بورسعيد، برج العرب — نغطي كل المناطق الصناعية.', descEn: '10th of Ramadan, 6th of October, Sadat City, Port Said, Borg El Arab — we cover all industrial zones.' },
    ],
};

// ══════════════════════════════════════════════
//  Layer 1: FETCH (cached with tag)
// ══════════════════════════════════════════════
const fetchIndustrialSettings = unstable_cache(
    async () => {
        const settings = await prisma.siteSetting.findMany({
            where: { section: 'industrial-page', isActive: true },
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
    ['industrial-transport-data'],
    {
        tags: ['industrial-transport'],
        revalidate: 600,
    }
);

// ══════════════════════════════════════════════
//  Layer 2 + 3: VALIDATE + MAP
// ══════════════════════════════════════════════

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
 * Returns fully validated content. NEVER throws.
 */
export async function getIndustrialTransportContent(): Promise<MarbleTransportContent> {
    let raw: Record<string, unknown> = {};

    try {
        raw = await fetchIndustrialSettings();
    } catch (err) {
        console.error('[industrial-transport] Failed to fetch CMS data, using full static fallback:', err);
        return {
            hero: STATIC_HERO,
            stats: STATIC_STATS,
            problems: STATIC_PROBLEMS,
            features: STATIC_FEATURES,
            trust: STATIC_TRUST,
            solutions: STATIC_SOLUTIONS,
        } as MarbleTransportContent;
    }

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
