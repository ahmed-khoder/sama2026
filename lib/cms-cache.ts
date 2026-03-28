'use client';

/**
 * Simple in-memory + sessionStorage cache for CMS API calls.
 * Prevents redundant fetches on page transitions.
 * TTL: 2 minutes for public pages (data doesn't change often).
 */

const DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes
const memoryCache = new Map<string, { data: any; timestamp: number }>();

export async function cachedFetch<T = any>(
    url: string,
    options?: {
        ttl?: number;
        forceRefresh?: boolean;
    }
): Promise<T> {
    const ttl = options?.ttl ?? DEFAULT_TTL;
    const cacheKey = `cms_cache_${url}`;

    // Skip cache if forced refresh
    if (!options?.forceRefresh) {
        // 1. Check memory cache (fastest)
        const memEntry = memoryCache.get(cacheKey);
        if (memEntry && Date.now() - memEntry.timestamp < ttl) {
            return memEntry.data as T;
        }

        // 2. Check sessionStorage (persists across in-app navigation)
        try {
            const stored = sessionStorage.getItem(cacheKey);
            if (stored) {
                const parsed = JSON.parse(stored);
                if (Date.now() - parsed.timestamp < ttl) {
                    // Also populate memory cache
                    memoryCache.set(cacheKey, parsed);
                    return parsed.data as T;
                }
            }
        } catch {
            // sessionStorage unavailable or corrupt, continue to fetch
        }
    }

    // 3. Fetch from API
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
    }
    const data = await res.json();

    // Store in both caches
    const entry = { data, timestamp: Date.now() };
    memoryCache.set(cacheKey, entry);
    try {
        sessionStorage.setItem(cacheKey, JSON.stringify(entry));
    } catch {
        // sessionStorage full or unavailable
    }

    return data as T;
}

/**
 * Fetch multiple URLs in parallel with caching.
 * Returns results in same order as URLs.
 */
export async function cachedFetchAll<T = any>(
    urls: string[],
    options?: { ttl?: number; forceRefresh?: boolean }
): Promise<(T | null)[]> {
    const results = await Promise.allSettled(
        urls.map(url => cachedFetch<T>(url, options))
    );
    return results.map(r => r.status === 'fulfilled' ? r.value : null);
}

/**
 * Invalidate cache for a specific URL or all URLs matching a prefix.
 */
export function invalidateCache(urlOrPrefix?: string) {
    if (!urlOrPrefix) {
        // Clear all
        memoryCache.clear();
        try {
            const keysToRemove: string[] = [];
            for (let i = 0; i < sessionStorage.length; i++) {
                const key = sessionStorage.key(i);
                if (key?.startsWith('cms_cache_')) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(k => sessionStorage.removeItem(k));
        } catch { }
        return;
    }

    const prefix = `cms_cache_${urlOrPrefix}`;
    // Memory cache
    for (const key of memoryCache.keys()) {
        if (key.startsWith(prefix)) {
            memoryCache.delete(key);
        }
    }
    // Session storage
    try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key?.startsWith(prefix)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => sessionStorage.removeItem(k));
    } catch { }
}
