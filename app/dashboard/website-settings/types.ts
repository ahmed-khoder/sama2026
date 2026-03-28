// ==================== TYPES ====================

export interface HeroSettings {
    blurAmount: number;
    overlayOpacity: number;
    overlayColor: string;
    showGrid: boolean;
    titleArLine1?: string;
    titleArLine2?: string;
    titleEnLine1?: string;
    titleEnLine2?: string;
    subtitleAr?: string;
    subtitleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
    titleFontSize?: string;
    titleFontWeight?: string;
    titleColor?: string;
    titleFontFamilyAr?: string;
    titleFontFamilyEn?: string;
    titleLine1Color?: string;
    titleLine2Color?: string;
    highlightColor?: string;
    highlightWordsAr?: string;
    highlightWordsEn?: string;
    aboutSectionImages?: string;
}

export interface HeroSlide {
    id: string;
    imageDesktopAr?: string;
    imageDesktopEn?: string;
    imageMobile?: string;
    titleAr?: string;
    titleEn?: string;
    order: number;
    isActive: boolean;
}

export interface StatItem {
    id: string;
    value: string;
    labelAr: string;
    labelEn: string;
    icon: string;
    order: number;
}

export interface FeatureItem {
    ar: string;
    en: string;
}

export interface AboutSettings {
    badgeAr: string;
    badgeEn: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    ctaTextAr: string;
    ctaTextEn: string;
    ctaLink: string;
    features: FeatureItem[];
    statsValue: string;
    statsLabelAr: string;
    statsLabelEn: string;
}

export interface TeamMember {
    id: string;
    nameAr: string;
    nameEn: string;
    roleAr: string;
    roleEn: string;
    image: string;
    linkedin?: string;
    twitter?: string;
    order: number;
    isActive: boolean;
}

export interface ServiceImage {
    id: string;
    url: string;
    caption?: string;
    captionEn?: string;
    order: number;
}

export interface ServiceItem {
    id: string;
    slug: string;
    iconName: string;
    titleAr: string;
    titleEn: string;
    shortDescAr: string;
    shortDescEn: string;
    descriptionAr: string;
    descriptionEn: string;
    featuresJson: string;
    image?: string;        // Desktop image (default)
    imageMobile?: string;  // Mobile-specific image (optional)
    color: string;
    order: number;
    isActive: boolean;
    features: { ar: string; en: string }[];
    images?: ServiceImage[];
}

// ── Services Page Dynamic Sections ──────────────────────

export interface ServicesPageStatItem {
    id: string;
    icon: string;
    valueAr: string;
    valueEn: string;
    labelAr: string;
    labelEn: string;
    order: number;
    isActive: boolean;
}

export interface FleetTruckItem {
    id: string;
    nameAr: string;
    nameEn: string;
    image?: string;
    descAr: string;
    descEn: string;
    specsJson: string;
    order: number;
    isActive: boolean;
}

export interface PortOperationItem {
    id: string;
    nameAr: string;
    nameEn: string;
    image?: string;
    descAr: string;
    descEn: string;
    factsJson: string;
    order: number;
    isActive: boolean;
}

export interface SpecializedCargoItem {
    id: string;
    icon: string;
    titleAr: string;
    titleEn: string;
    badgeAr: string;
    badgeEn: string;
    descAr: string;
    descEn: string;
    gradient: string;
    order: number;
    isActive: boolean;
}

export interface MilestoneItem {
    id: string;
    year: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    image?: string;
    order: number;
    isActive: boolean;
}

export interface FuturePulseSettings {
    badgeAr: string;
    badgeEn: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    image?: string;
}

export interface CareersHeroSettings {
    blurAmount: number;
    overlayOpacity: number;
    overlayColor: string;
    showGrid: boolean;
    showParticles: boolean;
    // Typography
    titleFontSize: string;
    titleFontWeight: string;
    titleColor: string;
    titleLine1Color: string;
    titleLine2Color: string;
    highlightColor: string;
    titleFontFamilyAr: string;
    titleFontFamilyEn: string;
    // Content
    badgeAr: string;
    badgeEn: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    highlightWordsAr: string;  // Comma-separated words to highlight
    highlightWordsEn: string;  // Comma-separated words to highlight
    statsJson: string;
}

export interface CareersHeroSlide {
    id: string;
    imageDesktopAr?: string;
    imageDesktopEn?: string;
    imageMobile?: string;
    order: number;
    isActive: boolean;
}

export interface CareersStat {
    value: string;
    labelAr: string;
    labelEn: string;
}

export interface ServicesHeroSettings {
    blurAmount: number;
    overlayOpacity: number;
    overlayColor: string;
    showGrid: boolean;
    showParticles: boolean;
    // Typography
    titleFontSize: string;
    titleFontWeight: string;
    titleColor: string;
    titleLine1Color: string;
    titleLine2Color: string;
    highlightColor: string;
    titleFontFamilyAr: string;
    titleFontFamilyEn: string;
    // Content
    badgeAr: string;
    badgeEn: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    highlightWordsAr: string;  // Comma-separated words to highlight
    highlightWordsEn: string;  // Comma-separated words to highlight
}

export interface ServicesHeroSlide {
    id: string;
    imageDesktopAr?: string;
    imageDesktopEn?: string;
    imageMobile?: string | null;
    order: number;
}

export interface AboutHeroSettings {
    blurAmount: number;
    overlayOpacity: number;
    overlayColor: string;
    showGrid: boolean;
    showParticles: boolean;
    // Typography
    titleFontSize: string;
    titleFontWeight: string;
    titleColor: string;
    titleLine1Color: string;
    titleLine2Color: string;
    titleLine3Color: string;
    highlightColor: string;
    titleFontFamilyAr: string;
    titleFontFamilyEn: string;
    // Content
    badgeAr: string;
    badgeEn: string;
    titleLine1Ar: string;
    titleLine2Ar: string;
    titleLine3Ar: string;
    titleLine1En: string;
    titleLine2En: string;
    titleLine3En: string;
    descriptionAr: string;
    descriptionEn: string;
    highlightWordsAr: string;  // Comma-separated words to highlight
    highlightWordsEn: string;  // Comma-separated words to highlight
    ctaPrimaryTextAr: string;
    ctaPrimaryTextEn: string;
    ctaPrimaryLink: string;
    ctaSecondaryTextAr: string;
    ctaSecondaryTextEn: string;
    ctaSecondaryLink: string;
}

export interface AboutHeroSlide {
    id: string;
    imageDesktopAr?: string;
    imageDesktopEn?: string;
    imageMobile?: string | null;
    order: number;
}

export const defaultAboutHeroSettings: AboutHeroSettings = {
    blurAmount: 0,
    overlayOpacity: 85,
    overlayColor: '#1e3a5f',
    showGrid: true,
    showParticles: true,
    // Typography
    titleFontSize: 'text-5xl',
    titleFontWeight: 'font-extrabold',
    titleColor: '#ffffff',
    titleLine1Color: '#ffffff',
    titleLine2Color: '#F97316',
    titleLine3Color: '#ffffff',
    highlightColor: '#F97316',
    titleFontFamilyAr: 'font-cairo',
    titleFontFamilyEn: 'font-inter',
    // Content
    badgeAr: 'شريكك اللوجستي الموثوق منذ 2000',
    badgeEn: 'Your Trusted Logistics Partner Since 2000',
    titleLine1Ar: 'نحن',
    titleLine2Ar: 'سما',
    titleLine3Ar: 'للخدمات اللوجستية',
    titleLine1En: 'We Are',
    titleLine2En: 'SAMA',
    titleLine3En: 'Logistics',
    descriptionAr: 'نحن أكثر من مجرد شركة شحن.. نحن شريكك الاستراتيجي في النجاح.',
    descriptionEn: 'We are more than just a shipping company. We are your strategic partner.',
    highlightWordsAr: '',
    highlightWordsEn: '',
    ctaPrimaryTextAr: 'تواصل معنا',
    ctaPrimaryTextEn: 'Contact Us',
    ctaPrimaryLink: '/contact',
    ctaSecondaryTextAr: 'استكشف خدماتنا',
    ctaSecondaryTextEn: 'Explore Services',
    ctaSecondaryLink: '/services',
};

// ==================== CONSTANTS ====================

import { Ship, Plane, Truck, FileCheck, Warehouse, Shield } from 'lucide-react';

export const serviceIconOptions = [
    { name: 'Ship', label: 'Ship' },
    { name: 'Plane', label: 'Plane' },
    { name: 'Truck', label: 'Truck' },
    { name: 'FileCheck', label: 'FileCheck' },
    { name: 'Warehouse', label: 'Warehouse' },
    { name: 'Shield', label: 'Shield' },
];

export const serviceIconMap: Record<string, any> = {
    Ship,
    Plane,
    Truck,
    FileCheck,
    Warehouse,
    Shield
};

// ==================== DEFAULT VALUES ====================

export const defaultHeroSettings: HeroSettings = {
    blurAmount: 0,
    overlayOpacity: 30,
    overlayColor: 'marine',
    showGrid: true,
};

export const defaultAboutSettings: AboutSettings = {
    badgeAr: 'من نحن',
    badgeEn: 'About Us',
    titleAr: 'شريكك الاستراتيجي للحلول اللوجستية المتكاملة',
    titleEn: 'Your Strategic Partner for Integrated Logistics Solutions',
    descriptionAr: 'منذ عام 2000، نقدم خدمات لوجستية متميزة للسوق المصري والعربي.',
    descriptionEn: 'Since 2000, we have been providing outstanding logistics services.',
    ctaTextAr: 'اعرف المزيد عنا',
    ctaTextEn: 'Learn More About Us',
    ctaLink: '/about',
    features: [
        { ar: 'شحن بحري وجوي وبري', en: 'Sea, Air & Land Freight' },
        { ar: 'تخليص جمركي سريع', en: 'Fast Customs Clearance' },
        { ar: 'تخزين وتوزيع', en: 'Warehousing & Distribution' },
        { ar: 'تأمين شامل للبضائع', en: 'Comprehensive Cargo Insurance' },
    ],
    statsValue: '25+',
    statsLabelAr: 'سنة من التميز',
    statsLabelEn: 'Years of Excellence'
};

export const defaultServicesHeroSettings: ServicesHeroSettings = {
    blurAmount: 0,
    overlayOpacity: 85,
    overlayColor: '#1e3a5f',
    showGrid: true,
    showParticles: true,
    // Typography
    titleFontSize: 'text-5xl',
    titleFontWeight: 'font-extrabold',
    titleColor: '#ffffff',
    titleLine1Color: '#ffffff',
    titleLine2Color: '#ffffff',
    highlightColor: '#F97316',
    titleFontFamilyAr: 'font-cairo',
    titleFontFamilyEn: 'font-inter',
    // Content
    badgeAr: 'حلول لوجستية متكاملة',
    badgeEn: 'Integrated Logistics Solutions',
    titleAr: 'خدماتنا اللوجستية',
    titleEn: 'Our Logistics Services',
    descriptionAr: 'نقدم مجموعة متكاملة من الخدمات اللوجستية لتلبية جميع احتياجات شحنك وتخزينك',
    descriptionEn: 'We offer a comprehensive range of logistics services to meet all your shipping and storage needs',
    highlightWordsAr: '',
    highlightWordsEn: '',
};

export const defaultCareersHeroSettings: CareersHeroSettings = {
    blurAmount: 0,
    overlayOpacity: 80,
    overlayColor: '#1e3a5f',
    showGrid: true,
    showParticles: true,
    // Typography
    titleFontSize: 'text-5xl',
    titleFontWeight: 'font-extrabold',
    titleColor: '#ffffff',
    titleLine1Color: '#ffffff',
    titleLine2Color: '#ffffff',
    highlightColor: '#F97316',
    titleFontFamilyAr: 'font-cairo',
    titleFontFamilyEn: 'font-inter',
    // Content
    badgeAr: 'نحن نوظف!',
    badgeEn: "We're Hiring!",
    titleAr: 'انضم إلى فريق سما',
    titleEn: 'Join the Sama Team',
    descriptionAr: 'ابدأ رحلة مهنية استثنائية مع فريق من المبتكرين والمحترفين في عالم اللوجستيات',
    descriptionEn: 'Start an exceptional career journey with a team of innovators and professionals in the logistics world',
    highlightWordsAr: '',
    highlightWordsEn: '',
    statsJson: '[{"value":"100+","labelAr":"موظف","labelEn":"Employees"},{"value":"25+","labelAr":"سنة خبرة","labelEn":"Years"},{"value":"50+","labelAr":"دولة","labelEn":"Countries"}]'
};

// ==================== TAB CATEGORIES ====================

export const getTabCategories = (isRTL: boolean) => [
    {
        id: 'home',
        labelAr: '🏠 الصفحة الرئيسية',
        labelEn: '🏠 Home Page',
        descAr: 'إعدادات البانر والإحصائيات والمظهر والفريق',
        descEn: 'Hero, stats, styling, team, and homepage sections',
        tabs: [
            { id: 'hero', labelAr: 'هيرو الصفحة', labelEn: 'Hero Section' },
            { id: 'styling', labelAr: 'التنسيق والألوان', labelEn: 'Styling & Colors' },
            { id: 'content', labelAr: 'نصوص الهيرو', labelEn: 'Hero Content' },
            { id: 'stats', labelAr: 'الإحصائيات', labelEn: 'Statistics' },
            { id: 'about', labelAr: 'قسم من نحن', labelEn: 'About Section' },
            { id: 'team', labelAr: 'فريق العمل', labelEn: 'Team' },
            { id: 'branding', labelAr: '🎨 الشعارات', labelEn: '🎨 Branding' },
        ]
    },
    {
        id: 'services',
        labelAr: '🚢 الخدمات',
        labelEn: '🚢 Services',
        descAr: 'إدارة خدمات الشركة والهيرو والتنسيق',
        descEn: 'Manage services, hero, and styling',
        tabs: [
            { id: 'services-hero', labelAr: 'هيرو الصفحة', labelEn: 'Page Hero' },
            { id: 'services-styling', labelAr: 'التنسيق والألوان', labelEn: 'Styling & Colors' },
            { id: 'services-content', labelAr: 'نصوص الهيرو', labelEn: 'Hero Content' },
            { id: 'services', labelAr: 'إدارة الخدمات', labelEn: 'Services Management' },
            { id: 'services-stats', labelAr: 'إحصائيات القدرات', labelEn: 'Capability Stats' },
            { id: 'services-fleet', labelAr: 'أسطول الشاحنات', labelEn: 'Fleet Showcase' },
            { id: 'services-ports', labelAr: 'عمليات الموانئ', labelEn: 'Port Operations' },
            { id: 'services-cargo', labelAr: 'البضائع المتخصصة', labelEn: 'Specialized Cargo' },
        ]
    },
    {
        id: 'aboutpage',
        labelAr: 'ℹ️ عن الشركة',
        labelEn: 'ℹ️ About Page',
        descAr: 'إعدادات صفحة عن الشركة والهيرو والتنسيق',
        descEn: 'About page hero, styling, and milestones',
        tabs: [
            { id: 'about-hero', labelAr: 'هيرو الصفحة', labelEn: 'Page Hero' },
            { id: 'about-styling', labelAr: 'التنسيق والألوان', labelEn: 'Styling & Colors' },
            { id: 'about-content', labelAr: 'نصوص الهيرو', labelEn: 'Hero Content' },
            { id: 'milestones', labelAr: 'مراحل النجاح', labelEn: 'Milestones' },
            { id: 'why-choose-us', labelAr: 'لماذا نحن؟', labelEn: 'Why Choose Us' },
        ]
    },
    {
        id: 'careers',
        labelAr: '💼 الوظائف',
        labelEn: '💼 Careers',
        descAr: 'إدارة صفحة الوظائف والهيرو والتنسيق',
        descEn: 'Manage careers page, hero, and styling',
        tabs: [
            { id: 'careers-hero', labelAr: 'هيرو الصفحة', labelEn: 'Page Hero' },
            { id: 'careers-styling', labelAr: 'التنسيق والألوان', labelEn: 'Styling & Colors' },
            { id: 'careers-content', labelAr: 'نصوص الهيرو', labelEn: 'Hero Content' },
        ]
    },
    {
        id: 'blog',
        labelAr: '📝 المدونة',
        labelEn: '📝 Blog',
        descAr: 'إعدادات صفحة المدونة والهيرو',
        descEn: 'Blog page hero and settings',
        tabs: [
            { id: 'blog-settings', labelAr: 'إعدادات الهيرو', labelEn: 'Hero Settings' },
        ]
    }
];
