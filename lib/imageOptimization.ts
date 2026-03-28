/**
 * Image Optimization Utilities
 * Provides helpers for optimized image loading with Next.js Image component
 */

/**
 * Get optimized image props based on priority and use case
 */
export function getOptimizedImageProps(
    src: string,
    priority: boolean = false,
    context: 'hero' | 'card' | 'thumbnail' | 'full' = 'full'
) {
    // Quality settings based on priority and context
    const quality = priority ? 85 : context === 'thumbnail' ? 70 : 75;

    // Sizes attribute for responsive images
    const sizes = {
        hero: '100vw',
        card: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
        thumbnail: '(max-width: 768px) 50vw, 25vw',
        full: '(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1920px',
    };

    return {
        src,
        quality,
        loading: (priority ? 'eager' : 'lazy') as 'eager' | 'lazy',
        sizes: sizes[context],
        priority,
    };
}

/**
 * Generate a simple blur data URL for placeholder
 * This is a lightweight alternative to actual image processing
 */
export function generateSimpleBlurDataURL(color: string = '#1a3552'): string {
    return `data:image/svg+xml;base64,${Buffer.from(
        `<svg width="700" height="475" xmlns="http://www.w3.org/2000/svg"><rect width="700" height="475" fill="${color}"/></svg>`
    ).toString('base64')}`;
}

/**
 * Get optimal image dimensions based on context
 */
export function getImageDimensions(context: 'hero' | 'card' | 'thumbnail') {
    const dimensions = {
        hero: { width: 1920, height: 1080 },
        card: { width: 640, height: 480 },
        thumbnail: { width: 256, height: 256 },
    };

    return dimensions[context];
}

/**
 * Check if an image URL is external
 */
export function isExternalImage(src: string): boolean {
    return src.startsWith('http://') || src.startsWith('https://');
}

/**
 * Optimize Unsplash URL parameters
 */
export function optimizeUnsplashUrl(
    url: string,
    width: number = 1920,
    quality: number = 75
): string {
    if (!url.includes('unsplash.com')) return url;

    const urlObj = new URL(url);
    urlObj.searchParams.set('w', width.toString());
    urlObj.searchParams.set('q', quality.toString());
    urlObj.searchParams.set('auto', 'format');
    urlObj.searchParams.set('fit', 'crop');

    return urlObj.toString();
}
