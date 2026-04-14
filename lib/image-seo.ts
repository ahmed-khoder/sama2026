/**
 * Image SEO Utilities
 * ─────────────────────
 * Generates descriptive alt text for CMS-driven images.
 *
 * Rules:
 *  1. If an explicit `name` or `title` is provided → use it directly
 *  2. Otherwise → extract a readable name from the image filename
 *  3. If the filename is generic (logo, image, img, etc.) → use the mandatory fallback
 *  4. The fallback is always required and always safe
 */

/** Filenames that are too generic to be useful as alt text */
const GENERIC_NAMES = new Set([
    'logo', 'image', 'img', 'photo', 'picture', 'pic',
    'icon', 'banner', 'bg', 'background', 'cover',
    'thumb', 'thumbnail', 'default', 'placeholder',
    'untitled', 'file', 'upload', 'media', 'asset',
]);

/**
 * Extract a human-readable name from an image URL.
 * e.g. "/images/accreditations/iso-9001.webp" → "ISO 9001"
 *
 * Returns null if the name is generic or extraction fails.
 */
function extractNameFromUrl(url: string): string | null {
    try {
        // Get the filename without extension
        const segments = url.split('/');
        const filename = segments[segments.length - 1] || '';
        const nameWithoutExt = filename.replace(/\.[^.]+$/, '');

        // Strip common prefixes/hashes (e.g., "1712345678_iso-9001" → "iso-9001")
        const cleaned = nameWithoutExt
            .replace(/^\d{10,}_/, '')   // unix timestamp prefix
            .replace(/^[a-f0-9]{8,}-/i, ''); // hash prefix

        if (!cleaned || cleaned.length < 2) return null;

        // Check if the remaining name is generic
        if (GENERIC_NAMES.has(cleaned.toLowerCase())) return null;

        // Convert kebab-case / snake_case to readable text
        const readable = cleaned
            .replace(/[-_]+/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase())
            .trim();

        return readable.length >= 2 ? readable : null;
    } catch {
        return null;
    }
}

/**
 * Generate a descriptive alt text for an image.
 *
 * @param url      - The image URL (used to extract filename-based alt)
 * @param fallback - **Required** static fallback text (used if extraction fails)
 * @param name     - Optional explicit name from CMS data (highest priority)
 * @returns A non-empty alt string — guaranteed.
 */
export function generateImageAlt(
    url: string | null | undefined,
    fallback: string,
    name?: string | null,
): string {
    // Priority 1: Explicit name from CMS
    if (name && name.trim().length > 0) {
        return name.trim();
    }

    // Priority 2: Extract from URL filename
    if (url) {
        const extracted = extractNameFromUrl(url);
        if (extracted) {
            return extracted;
        }
    }

    // Priority 3: Mandatory fallback (always safe)
    return fallback;
}
