/**
 * Marble Transport Page — Zod v4 Data Contract
 * 
 * Defines the validated shape of ALL CMS data for /services/marble-transport.
 * Every field has a fallback that matches the current static content,
 * so safeParse never breaks the page — it always returns valid data.
 */

import { z } from 'zod/v4';

// ── Helper: string field with fallback for empty/null/undefined ──
const str = (fallback: string) =>
    z.preprocess(
        (val) => {
            if (val === null || val === undefined) return fallback;
            const s = String(val).trim();
            return s || fallback;
        },
        z.string()
    );

// ══════════════════════════════════════════════
//  Hero Section
// ══════════════════════════════════════════════
export const MarbleHeroSchema = z.object({
    badgeAr: str('متخصصون في نقل المواد المحجرية والتعدينية'),
    badgeEn: str('Specialized in Quarry & Mining Transport'),
    titleLine1Ar: str('نقل الرخام والمواد المحجرية والتعدينية'),
    titleLine1En: str('Marble, Quarry & Mining'),
    titleLine2Ar: str('بأعلى درجات الأمان'),
    titleLine2En: str('Transport — Maximum Safety'),
    descAr: str('نقل الرخام والجرانيت وجميع المواد المحجرية من مواقع الإنتاج مثل شق الثعبان إلى مواقع العمل باستخدام أسطول متخصص للأحمال الثقيلة.'),
    descEn: str("Marble, granite, and all quarry materials transport from production sites like Shaq El-Tue'ban to worksites using a specialized heavy-load fleet."),
    image: str('/images/fleet/1772066646569-ggbkgl.webp'),
    overlayOpacity: z.preprocess((v) => {
        if (typeof v !== 'number') return 0.4;
        // Auto-convert percentage (0-100) to decimal (0-1)
        return v > 1 ? v / 100 : v;
    }, z.number().min(0).max(1)),
    blurAmount: z.preprocess((v) => (typeof v === 'number' ? v : 0), z.number().min(0).max(20)),
    overlayColor: str('blue'),
});

// ══════════════════════════════════════════════
//  Stats Bar
// ══════════════════════════════════════════════
export const MarbleStatSchema = z.object({
    valueAr: str('+25'),
    valueEn: str('25+'),
    labelAr: str('سنة خبرة'),
    labelEn: str('Years Experience'),
});

// ══════════════════════════════════════════════
//  Problems / Challenges
// ══════════════════════════════════════════════
export const MarbleProblemItemSchema = z.object({
    titleAr: str(''),
    titleEn: str(''),
    descAr: str(''),
    descEn: str(''),
});

export const MarbleProblemsSchema = z.object({
    sectionTitleAr: str('مشاكل تكلف المقاولين خسائر كبيرة'),
    sectionTitleEn: str('Problems Costing Contractors Major Losses'),
    items: z.array(MarbleProblemItemSchema).default([]),
});

// ══════════════════════════════════════════════
//  Features / Why Us
// ══════════════════════════════════════════════
export const MarbleFeatureCardSchema = z.object({
    titleAr: str(''),
    titleEn: str(''),
    descAr: str(''),
    descEn: str(''),
});

export const MarbleFeaturesSchema = z.object({
    sectionTitleAr: str('لماذا سما لوجيستك؟'),
    sectionTitleEn: str('Why SAMA Logistics?'),
    cards: z.array(MarbleFeatureCardSchema).default([]),
});

// ══════════════════════════════════════════════
//  Trust Statistics
// ══════════════════════════════════════════════
export const MarbleTrustStatSchema = z.object({
    valueAr: str('+25'),
    valueEn: str('25+'),
    labelAr: str('سنة في نقل المحاجر'),
    labelEn: str('Years in Quarry Transport'),
});

// ══════════════════════════════════════════════
//  Transport Solutions
// ══════════════════════════════════════════════
export const MarbleSolutionSchema = z.object({
    titleAr: str(''),
    titleEn: str(''),
    descAr: str(''),
    descEn: str(''),
});

// ══════════════════════════════════════════════
//  Complete Content Schema (not used for parsing,
//  only for type inference — parsing is per-section)
// ══════════════════════════════════════════════
export const MarbleTransportContentSchema = z.object({
    hero: MarbleHeroSchema,
    stats: z.array(MarbleStatSchema),
    problems: MarbleProblemsSchema,
    features: MarbleFeaturesSchema,
    trust: z.array(MarbleTrustStatSchema),
    solutions: z.array(MarbleSolutionSchema),
});

// ── TypeScript types inferred from schema ──
export type MarbleHero = z.infer<typeof MarbleHeroSchema>;
export type MarbleStat = z.infer<typeof MarbleStatSchema>;
export type MarbleProblems = z.infer<typeof MarbleProblemsSchema>;
export type MarbleFeatures = z.infer<typeof MarbleFeaturesSchema>;
export type MarbleTrustStat = z.infer<typeof MarbleTrustStatSchema>;
export type MarbleSolution = z.infer<typeof MarbleSolutionSchema>;
export type MarbleTransportContent = z.infer<typeof MarbleTransportContentSchema>;

