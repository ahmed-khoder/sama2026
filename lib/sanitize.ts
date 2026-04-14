/**
 * CMS Data Sanitization Utilities
 * ─────────────────────────────────
 * Defensive sanitization applied at the data boundary (SSR / API response)
 * before CMS-driven data reaches UI components.
 *
 * Rules:
 *  - Strings → trimmed, nullish → '' (for text) or null (for URLs)
 *  - URL fields (detected by key name) → trimmed + control chars stripped
 *  - Numbers, booleans → passed through unchanged
 *  - Arrays → each element recursively sanitized
 *  - Nested objects → recursively sanitized
 *  - null/undefined at top level → returned as-is (caller handles defaults)
 */

// Keys that should be treated as URLs (sanitizeUrl instead of sanitizeString)
const URL_KEY_PATTERN =
    /image|logo|src|href|url|link|path|icon|thumbnail|photo|avatar|banner|cover/i;

/**
 * Trim a string value. Returns '' for null/undefined/non-string.
 */
export function sanitizeString(val: unknown): string {
    if (val == null) return '';
    if (typeof val !== 'string') return String(val);
    return val.trim();
}

/**
 * Trim and clean a URL value.
 * Returns null for empty/whitespace-only values.
 * Strips ASCII control characters (0x00-0x1F except tab/newline).
 */
export function sanitizeUrl(val: unknown): string | null {
    if (val == null) return null;
    if (typeof val !== 'string') return null;
    // eslint-disable-next-line no-control-regex
    const cleaned = val.trim().replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
    return cleaned.length > 0 ? cleaned : null;
}

/**
 * Recursively sanitize all string fields in a plain object or array.
 *
 * - Fields matching URL_KEY_PATTERN → sanitizeUrl
 * - Other string fields → sanitizeString
 * - Numbers, booleans → unchanged
 * - Nested objects/arrays → recursively processed
 *
 * Returns a new object (non-destructive).
 */
export function sanitizeRecord<T>(obj: T): T {
    if (obj == null) return obj;

    // Primitives
    if (typeof obj === 'string') return obj.trim() as unknown as T;
    if (typeof obj !== 'object') return obj;

    // Arrays
    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeRecord(item)) as unknown as T;
    }

    // Plain objects
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (value == null) {
            // Preserve null for URL fields, empty string for text fields
            result[key] = URL_KEY_PATTERN.test(key) ? null : value;
        } else if (typeof value === 'string') {
            result[key] = URL_KEY_PATTERN.test(key)
                ? sanitizeUrl(value)
                : sanitizeString(value);
        } else if (Array.isArray(value)) {
            result[key] = value.map(item => sanitizeRecord(item));
        } else if (typeof value === 'object') {
            result[key] = sanitizeRecord(value);
        } else {
            // numbers, booleans, etc.
            result[key] = value;
        }
    }
    return result as T;
}
