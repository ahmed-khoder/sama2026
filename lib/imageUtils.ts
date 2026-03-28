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
