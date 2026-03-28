import React from 'react';

/**
 * Shared Hero Utilities — used across Home, Services, About, and Careers pages.
 * Centralizes duplicated logic for hero overlays, text highlighting, and settings.
 */

// ── Hero Settings Interface ──
export interface HeroSettings {
    blurAmount: number;
    overlayOpacity: number;
    overlayColor: string;
    showGrid: boolean;
    showParticles: boolean;
    badgeAr: string;
    badgeEn: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    highlightWordsAr: string;
    highlightWordsEn: string;
    highlightColor: string;
    // Typography
    titleFontSize?: string;
    titleFontWeight?: string;
    titleColor?: string;
    titleLine1Color?: string;
    titleLine2Color?: string;
    titleFontFamilyAr?: string;
    titleFontFamilyEn?: string;
}

export interface HeroSlide {
    id: string;
    imageDesktopAr?: string;
    imageDesktopEn?: string;
    imageMobile?: string | null;
    order?: number;
}

// ── Default Settings ──
export const defaultHeroSettings: HeroSettings = {
    blurAmount: 0,
    overlayOpacity: 85,
    overlayColor: 'marine',
    showGrid: true,
    showParticles: true,
    badgeAr: '',
    badgeEn: '',
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    highlightWordsAr: '',
    highlightWordsEn: '',
    highlightColor: '#F97316',
    titleFontSize: 'text-5xl',
    titleFontWeight: 'font-black',
    titleColor: '#ffffff',
    titleLine1Color: '#ffffff',
    titleLine2Color: '#ffffff',
    titleFontFamilyAr: 'font-cairo',
    titleFontFamilyEn: 'font-inter',
};

export const defaultSlides: HeroSlide[] = [
    {
        id: 'default',
        imageDesktopAr: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070',
        imageDesktopEn: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070',
        imageMobile: null,
    }
];

// ── Overlay Color Map for Tailwind gradient classes ──
export const overlayColorClasses: Record<string, string> = {
    marine: 'from-marine-900/95 via-marine-800/90 to-slate-900/95',
    black: 'from-black/95 via-gray-900/90 to-black/95',
    orange: 'from-orange-900/95 via-orange-800/90 to-slate-900/95',
};

/**
 * Get overlay color as rgba string (for inline styles).
 */
export function getOverlayColor(colorName: string, opacity: number): string {
    const normalizedOpacity = opacity / 100;
    switch (colorName) {
        case 'black':
            return `rgba(0, 0, 0, ${normalizedOpacity})`;
        case 'orange':
            return `rgba(249, 115, 22, ${normalizedOpacity * 0.8})`;
        case 'marine':
            return `rgba(3, 37, 65, ${normalizedOpacity})`;
        default:
            // Handle hex values (e.g. "#1e3a5f" from About Hero schema)
            if (colorName && colorName.startsWith('#')) {
                const hex = colorName.replace('#', '');
                const r = parseInt(hex.substring(0, 2), 16);
                const g = parseInt(hex.substring(2, 4), 16);
                const b = parseInt(hex.substring(4, 6), 16);
                if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
                    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`;
                }
            }
            return `rgba(3, 37, 65, ${normalizedOpacity})`;
    }
}

/**
 * Highlight specific words in a string with a given color.
 * Used in hero titles and descriptions across all pages.
 */
export function highlightText(
    text: string | undefined,
    wordsToHighlight: string | undefined,
    highlightColor: string | undefined
): React.ReactNode {
    if (!text) return null;
    if (!wordsToHighlight || !highlightColor) return text;

    // Support both comma-separated and double-space-separated words
    // e.g. "word1, word2" or "word1  word2" (2+ spaces)
    const words = wordsToHighlight.includes(',')
        ? wordsToHighlight.split(',').map(w => w.trim()).filter(Boolean)
        : wordsToHighlight.split(/\s{2,}/).map(w => w.trim()).filter(Boolean);
    if (words.length === 0) return text;

    const pattern = new RegExp(`(${words.join('|')})`, 'gi');
    const parts = text.split(pattern);

    return (
        <>
            {parts.map((part, i) => {
                const isMatch = words.some(w => w.toLowerCase() === part.toLowerCase());
                return isMatch ? (
                    <span key={i} style={{ color: highlightColor }}>{part}</span>
                ) : (
                    <React.Fragment key={i}>{part}</React.Fragment>
                );
            })}
        </>
    );
}

/**
 * Get current background image — language-aware (respects AR/EN).
 * Fixes bug where Career/About pages always returned imageDesktopAr.
 */
export function getCurrentBackgroundImage(
    slides: HeroSlide[],
    currentSlideIndex: number,
    isMobile: boolean,
    language: string
): string | null {
    if (slides.length > 0 && slides[currentSlideIndex]) {
        const slide = slides[currentSlideIndex];
        // Mobile image
        if (isMobile && slide.imageMobile) {
            return slide.imageMobile;
        }
        // Language-aware desktop image
        if (language === 'en' && slide.imageDesktopEn) {
            return slide.imageDesktopEn;
        }
        return slide.imageDesktopAr || slide.imageDesktopEn || null;
    }
    return null;
}

// ── Home Page Hero Types ──
// Extended interface for the Home page which has extra hero fields
export interface HomeHeroSettings extends HeroSettings {
    titleArLine1?: string;
    titleArLine2?: string;
    titleEnLine1?: string;
    titleEnLine2?: string;
    subtitleAr?: string;
    subtitleEn?: string;
    aboutSectionImages?: string;
}

// Home page slide type (no id required, has text fields)
export interface HomeHeroSlide {
    imageDesktopAr?: string;
    imageDesktopEn?: string;
    imageMobile?: string;
    titleAr?: string;
    titleEn?: string;
    subtitleAr?: string;
    subtitleEn?: string;
    descriptionAr?: string;
    descriptionEn?: string;
}

// ── Careers Hero Types ──
export interface CareersHeroSettings extends HeroSettings {
    statsJson: string;
}

export interface HeroStat {
    value: string;
    labelAr: string;
    labelEn: string;
}
