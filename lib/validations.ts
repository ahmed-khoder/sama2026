import { z } from 'zod';

/**
 * Shared Zod validation schemas for API input validation.
 */

// ── Auth ──
export const loginSchema = z.object({
    email: z.string().email('البريد الإلكتروني غير صالح'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
});

// ── Hero Slide ──
export const heroSlideSchema = z.object({
    imageDesktopAr: z.string().min(1).optional().or(z.literal('')),
    imageDesktopEn: z.string().min(1).optional().or(z.literal('')),
    imageMobile: z.string().min(1).optional().or(z.literal('')).nullable(),
    titleAr: z.string().max(200).optional(),
    titleEn: z.string().max(200).optional(),
    subtitleAr: z.string().max(300).optional(),
    subtitleEn: z.string().max(300).optional(),
    descriptionAr: z.string().max(1000).optional(),
    descriptionEn: z.string().max(1000).optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

// ── Hero Settings ──
export const heroSettingsSchema = z.object({
    blurAmount: z.number().int().min(0).max(20).optional(),
    overlayOpacity: z.number().int().min(0).max(100).optional(),
    overlayColor: z.enum(['marine', 'black', 'orange']).optional(),
    showGrid: z.boolean().optional(),
    titleArLine1: z.string().max(200).optional(),
    titleArLine2: z.string().max(200).optional(),
    titleEnLine1: z.string().max(200).optional(),
    titleEnLine2: z.string().max(200).optional(),
    titleFontSize: z.string().max(50).optional(),
    titleFontWeight: z.string().max(50).optional(),
    titleColor: z.string().max(20).optional(),
    titleLine1Color: z.string().max(20).optional(),
    titleLine2Color: z.string().max(20).optional(),
    highlightColor: z.string().max(20).optional(),
    highlightWordsAr: z.string().max(500).optional(),
    highlightWordsEn: z.string().max(500).optional(),
    subtitleAr: z.string().max(300).optional(),
    subtitleEn: z.string().max(300).optional(),
    descriptionAr: z.string().max(2000).optional(),
    descriptionEn: z.string().max(2000).optional(),
    aboutSectionImages: z.string().max(5000).optional(),
}).strip(); // حذف أي حقل غير معرّف لمنع حقن بيانات خبيثة // Allow extra settings fields

// ── Service ──
export const createServiceSchema = z.object({
    slug: z.string().max(200).optional(),
    iconName: z.string().max(50).optional(),
    titleAr: z.string().min(1, 'العنوان بالعربية مطلوب').max(200),
    titleEn: z.string().min(1, 'English title is required').max(200),
    shortDescAr: z.string().max(500).optional(),
    shortDescEn: z.string().max(500).optional(),
    descriptionAr: z.string().max(5000).optional(),
    descriptionEn: z.string().max(5000).optional(),
    features: z.array(z.object({
        ar: z.string(),
        en: z.string(),
    })).optional(),
    image: z.string().optional(),
    imageMobile: z.string().optional(),
    color: z.string().max(20).optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

// ── Contact Message ──
export const contactMessageSchema = z.object({
    type: z.enum(['INQUIRY', 'QUOTE_REQUEST']),
    name: z.string().min(2, 'الاسم مطلوب').max(100),
    email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
    phone: z.string().min(5, 'رقم الهاتف مطلوب').max(30),
    countryCode: z.string().max(10).optional().or(z.literal('')),
    dialCode: z.string().max(10).optional(),
    message: z.string().max(2000).optional().nullable(),
    origin: z.string().max(200).optional().nullable(),
    destination: z.string().max(200).optional().nullable(),
    containerType: z.string().max(50).optional().nullable(),
    containerQty: z.number().int().min(1).max(999).optional().nullable(),
});

// ── Job Application ──
export const jobApplicationSchema = z.object({
    fullName: z.string().min(2, 'الاسم مطلوب').max(100),
    email: z.string().email('البريد الإلكتروني غير صالح'),
    phone: z.string().min(5, 'رقم الهاتف مطلوب').max(20),
    mobile: z.string().max(20).optional(),
    coverLetter: z.string().max(5000).optional(),
    cvUrl: z.string().min(1, 'السيرة الذاتية مطلوبة'),
    jobId: z.string().cuid(),
});

// ── Team Member ──
export const teamMemberSchema = z.object({
    nameAr: z.string().min(1, 'الاسم بالعربية مطلوب').max(100),
    nameEn: z.string().min(1, 'English name is required').max(100),
    roleAr: z.string().min(1, 'المسمى الوظيفي بالعربية مطلوب').max(100),
    roleEn: z.string().min(1, 'English role is required').max(100),
    image: z.string().min(1, 'صورة العضو مطلوبة'),
    linkedin: z.string().url().optional().or(z.literal('')).nullable(),
    twitter: z.string().url().optional().or(z.literal('')).nullable(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

// ── Hero Stat ──
export const heroStatSchema = z.object({
    value: z.string().min(1, 'القيمة مطلوبة').max(50),
    labelAr: z.string().min(1, 'التسمية بالعربية مطلوبة').max(100),
    labelEn: z.string().min(1, 'English label is required').max(100),
    icon: z.string().max(50).optional(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

// ── Milestone ──
export const milestoneSchema = z.object({
    year: z.string().min(1, 'السنة مطلوبة').max(20),
    titleAr: z.string().min(1, 'العنوان بالعربية مطلوب').max(200),
    titleEn: z.string().min(1, 'English title is required').max(200),
    descriptionAr: z.string().max(1000).optional(),
    descriptionEn: z.string().max(1000).optional(),
    image: z.string().optional().nullable(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
});

// ── About Settings ──
export const aboutSettingsSchema = z.object({
    badgeAr: z.string().max(100).optional(),
    badgeEn: z.string().max(100).optional(),
    titleAr: z.string().max(300).optional(),
    titleEn: z.string().max(300).optional(),
    descriptionAr: z.string().max(5000).optional(),
    descriptionEn: z.string().max(5000).optional(),
    ctaTextAr: z.string().max(100).optional(),
    ctaTextEn: z.string().max(100).optional(),
    ctaLink: z.string().max(200).optional(),
    features: z.array(z.object({
        ar: z.string(),
        en: z.string(),
    })).optional(),
    statsValue: z.string().max(50).optional(),
    statsLabelAr: z.string().max(100).optional(),
    statsLabelEn: z.string().max(100).optional(),
}).strip(); // حذف أي حقل غير معرّف لمنع حقن بيانات خبيثة
