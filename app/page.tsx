import { prisma } from '@/lib/db';
import { sanitizeRecord, sanitizeUrl } from '@/lib/sanitize';
import { getFeaturedPartners } from '@/lib/odooClient';
import HomePageClient from '@/components/home/HomePageClient';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';

// ─── Dynamic bilingual SEO metadata ───
export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const title = isArabic
        ? 'سما لوجيستك | شحن وتخليص جمركي ونقل حاويات في مصر'
        : 'SAMA Logistics | Freight Forwarding & Container Transport Egypt';
    const description = isArabic
        ? 'خدمات احترافية في نقل الحاويات والشحن والتخليص الجمركي في بورسعيد. حلول لوجستية سريعة وآمنة وموثوقة من شركة سما لوجيستك.'
        : 'Freight forwarding, customs clearance, and container transport from Port Said, Egypt. Fast, secure logistics backed by 25+ years of experience.';

    return {
        title,
        description,
        keywords: isArabic
            ? 'نقل حاويات مصر, شركة لوجستية بورسعيد, شحن بحري مصر, تخليص جمركي, خدمات شحن'
            : 'logistics Egypt, freight forwarding Egypt, customs clearance Egypt, container transport Port Said, shipping company Egypt, SAMA Logistics',
        openGraph: {
            title,
            description,
            type: 'website',
        },
    };
}

// ISR: أعد بناء الصفحة كل 5 دقائق فقط بدلاً من كل طلب
// يقلل ضغط قاعدة البيانات بنسبة 99%+
export const revalidate = 300;

// ─── Default fallback data (used only if DB is completely empty) ───
const defaultStats = [
    { value: '25+', labelAr: 'سنة خبرة', labelEn: 'Years Experience', icon: 'Clock' },
    { value: '50+', labelAr: 'ميناء عالمي', labelEn: 'Global Ports', icon: 'Globe2' },
    { value: '10K+', labelAr: 'شحنة ناجحة', labelEn: 'Successful Shipments', icon: 'Package' },
    { value: '24/7', labelAr: 'دعم متواصل', labelEn: 'Support Available', icon: 'Phone' },
];

const defaultTeamMembers = [
    { nameAr: 'أحمد خضير', nameEn: 'Ahmed Khoder', roleAr: 'الرئيس التنفيذي', roleEn: 'Chief Executive Officer', image: '/images/akhoder.png', linkedin: '', twitter: '' },
    { nameAr: 'محمد خضير', nameEn: 'Mohammed Khoder', roleAr: 'مدير العمليات', roleEn: 'Chief Operations Officer – COO', image: '/images/m_khoder.png', linkedin: '', twitter: '' },
    { nameAr: 'علي خضير', nameEn: 'Ali Khoder', roleAr: 'المدير المالي', roleEn: 'Chief Financial Officer', image: '/images/ali.png', linkedin: '', twitter: '' },
    { nameAr: 'سلمى جمال', nameEn: 'Salma Jamal', roleAr: 'مسؤول المتابعة والتشغيل', roleEn: 'Operations Supervisor', image: '/images/team/salma.png', linkedin: '', twitter: '' },
    { nameAr: 'أيات عاشور', nameEn: 'Ayat Ashour', roleAr: 'مدير التخليص الجمركي', roleEn: 'Customs Clearance Manager', image: '/images/team/aya.png', linkedin: '', twitter: '' },
    { nameAr: 'ايه جبر', nameEn: 'Aya Gabr', roleAr: 'منسق مستندات جمركية', roleEn: 'Customs Documentation Coordinator', image: '/images/aya gapr.png', linkedin: '', twitter: '' },
];

const defaultAboutContent = {
    badgeAr: 'من نحن', badgeEn: 'About Us',
    titleAr: 'شريكك الاستراتيجي للحلول اللوجستية المتكاملة',
    titleEn: 'Your Strategic Partner for Integrated Logistics Solutions',
    descriptionAr: 'منذ عام 2000، نقدم خدمات لوجستية متميزة للسوق المصري والعربي.',
    descriptionEn: 'Since 2000, we have been providing outstanding logistics services.',
    ctaTextAr: 'اعرف المزيد عنا', ctaTextEn: 'Learn More About Us', ctaLink: '/about',
    features: [
        { ar: 'شحن بحري وجوي وبري', en: 'Sea, Air & Land Freight' },
        { ar: 'تخليص جمركي سريع', en: 'Fast Customs Clearance' },
        { ar: 'تخزين وتوزيع', en: 'Warehousing & Distribution' },
        { ar: 'تأمين شامل للبضائع', en: 'Comprehensive Cargo Insurance' },
    ],
    statsValue: '25+', statsLabelAr: 'سنة من التميز', statsLabelEn: 'Years of Excellence',
};

const defaultAboutImages = [
    'https://images.unsplash.com/photo-1494412574643-35d324698420?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200',
    'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80&w=1200',
];

const defaultHeroSettings = {
    blurAmount: 0,
    overlayOpacity: 30,
    overlayColor: 'marine',
    showGrid: true,
    showParticles: false,
    badgeAr: '', badgeEn: '',
    titleAr: '', titleEn: '',
    descriptionAr: '', descriptionEn: '',
    highlightWordsAr: '', highlightWordsEn: '',
    highlightColor: '#F97316',
};

// ─── Server Component — fetches ALL CMS data before rendering ───
export default async function Home() {
    // Fetch all data in parallel, directly from the database on the server
    const [heroSlides, heroSettings, teamMembersRaw, statsRaw, aboutRaw, partnersRaw] = await Promise.all([
        prisma.heroSlide.findMany({
            where: { isActive: true },
            select: { id: true, imageDesktopAr: true, imageDesktopEn: true, imageMobile: true, order: true },
            orderBy: { order: 'asc' },
            take: 10,
        }).catch(() => []),
        prisma.heroSettings.findUnique({ where: { id: 'default' } }).catch(() => null),
        prisma.teamMember.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }).catch(() => []),
        prisma.heroStat.findMany({ orderBy: { order: 'asc' } }).catch(() => []),
        prisma.aboutSettings.findUnique({ where: { id: 'default' } }).catch(() => null),
        getFeaturedPartners().catch(() => []),
    ]);

    // Process hero slides — map to HomeHeroSlide shape (plain serializable objects)
    const slides = heroSlides.map(s => ({
        imageDesktopAr: s.imageDesktopAr || '',
        imageDesktopEn: s.imageDesktopEn || '',
        imageMobile: s.imageMobile || undefined,
    }));

    // Process hero settings
    const settings = heroSettings
        ? JSON.parse(JSON.stringify(heroSettings))  // Serialize Prisma object to plain JSON
        : defaultHeroSettings;

    // Process team
    const teamMembers = teamMembersRaw.length > 0
        ? teamMembersRaw.map(m => ({
            nameAr: m.nameAr, nameEn: m.nameEn,
            roleAr: m.roleAr, roleEn: m.roleEn,
            image: m.image,
            linkedin: m.linkedin || '', twitter: m.twitter || '',
        }))
        : defaultTeamMembers;

    // Process stats
    const stats = statsRaw.length > 0
        ? statsRaw.sort((a, b) => a.order - b.order).map(s => ({
            value: s.value, labelAr: s.labelAr, labelEn: s.labelEn, icon: s.icon || 'Clock',
        }))
        : defaultStats;

    // Process about content
    const aboutContent = aboutRaw
        ? {
            badgeAr: aboutRaw.badgeAr, badgeEn: aboutRaw.badgeEn,
            titleAr: aboutRaw.titleAr, titleEn: aboutRaw.titleEn,
            descriptionAr: aboutRaw.descriptionAr, descriptionEn: aboutRaw.descriptionEn,
            ctaTextAr: aboutRaw.ctaTextAr, ctaTextEn: aboutRaw.ctaTextEn,
            ctaLink: '/about', // hardcoded — DB value intentionally ignored
            features: (() => {
                try {
                    return JSON.parse(aboutRaw.featuresJson || '[]');
                } catch {
                    return [];
                }
            })(),
            statsValue: aboutRaw.statsValue, statsLabelAr: aboutRaw.statsLabelAr, statsLabelEn: aboutRaw.statsLabelEn,
        }
        : defaultAboutContent;

    // About images from hero settings
    const aboutImages = settings.aboutSectionImages
        ? settings.aboutSectionImages.split(',').filter(Boolean)
        : defaultAboutImages;

    // Process featured partners (same mapping ClientsMarquee was doing client-side)
    const clients = (partnersRaw as { name: string; image_128: string | false }[])
        .map(p => ({
            name: p.name,
            logo: p.image_128 ? (p.image_128.startsWith('data:image') ? p.image_128 : `data:image/png;base64,${p.image_128}`) : '',
        }))
        .filter(p => p.logo !== '');

    // ─── Sanitize all CMS data at the boundary before passing to client ───
    const safeSlides = sanitizeRecord(slides);
    const safeSettings = sanitizeRecord(settings);
    const safeTeamMembers = sanitizeRecord(teamMembers);
    const safeStats = sanitizeRecord(stats);
    const safeAboutContent = sanitizeRecord(aboutContent);
    const safeAboutImages = aboutImages.map((url: string) => sanitizeUrl(url) || url);
    const safeClients = sanitizeRecord(clients);

    return (
        <HomePageClient
            initialHeroSlides={safeSlides}
            initialHeroSettings={safeSettings}
            initialTeamMembers={safeTeamMembers}
            initialStats={safeStats}
            initialAboutContent={safeAboutContent}
            initialAboutImages={safeAboutImages}
            initialClients={safeClients}
        />
    );
}
