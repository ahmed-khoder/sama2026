/**
 * Get the appropriate hero image based on current language and device
 * @param slide - Hero slide object with imageDesktopAr, imageDesktopEn, imageMobile
 * @param language - Current language ('ar' or 'en')
 * @param isMobile - Whether the current device is mobile
 * @returns The appropriate image URL
 */
export function getLanguageAwareImage(
    slide: {
        imageDesktopAr?: string | null;
        imageDesktopEn?: string | null;
        imageMobile?: string | null;
    },
    language: string,
    isMobile: boolean = false
): string | null {
    // Helper to check if image URL is valid (not null, undefined, or empty string)
    const isValidImage = (url: string | null | undefined): boolean => {
        return !!url && url.trim().length > 0;
    };

    // Mobile takes priority if available and on mobile device
    if (isMobile && isValidImage(slide.imageMobile)) {
        return slide.imageMobile!;
    }

    // Language-aware desktop image selection
    if (language === 'ar' && isValidImage(slide.imageDesktopAr)) {
        return slide.imageDesktopAr!;
    }

    if (language === 'en' && isValidImage(slide.imageDesktopEn)) {
        return slide.imageDesktopEn!;
    }

    // Fallback chain: try other desktop, then mobile
    if (isValidImage(slide.imageDesktopAr)) return slide.imageDesktopAr!;
    if (isValidImage(slide.imageDesktopEn)) return slide.imageDesktopEn!;
    if (isValidImage(slide.imageMobile)) return slide.imageMobile!;

    return null;
}

/** Default SVG avatar placeholder for team members */
const TEAM_AVATAR_FALLBACK =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400' fill='%23cbd5e1'%3E%3Crect width='300' height='400' fill='%23e2e8f0'/%3E%3Ccircle cx='150' cy='140' r='55' fill='%23cbd5e1'/%3E%3Cellipse cx='150' cy='300' rx='80' ry='70' fill='%23cbd5e1'/%3E%3C/svg%3E";

/**
 * Resolve a team member image path to ensure it's valid and correctly located.
 *
 * - Empty / missing → returns SVG avatar placeholder
 * - Legacy flat path (e.g. `/images/name.png`) → normalises to `/images/team/name.png`
 * - Already correct (`/images/team/…`) or external URL → returned as-is
 */
export function resolveTeamImage(imagePath: string | null | undefined): string {
    if (!imagePath || !imagePath.trim()) return TEAM_AVATAR_FALLBACK;

    const trimmed = imagePath.trim();

    // External URLs or data URIs — pass through
    if (trimmed.startsWith('http') || trimmed.startsWith('data:')) return trimmed;

    // Already in the correct directory
    if (trimmed.startsWith('/images/team/')) return trimmed;

    // Legacy flat path: /images/somefile.ext → /images/team/somefile.ext
    // ONLY matches files directly under /images/ (no subdirectory).
    // Paths like /images/services/x.png or /images/blog/y.webp are NEVER touched.
    const legacyFlatFile = trimmed.match(/^\/images\/([^/]+\.\w+)$/);
    if (legacyFlatFile) {
        return `/images/team/${legacyFlatFile[1]}`;
    }

    return trimmed;
}

export { TEAM_AVATAR_FALLBACK };
