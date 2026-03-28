'use client';

/**
 * Authenticated fetch utility for dashboard/admin API calls.
 * Relies on HttpOnly cookies sent automatically with same-origin requests.
 */

export async function authFetch(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const headers: HeadersInit = {
        ...options.headers as Record<string, string>,
    };

    // Auto-set Content-Type for JSON bodies (unless it's FormData)
    if (options.body && !(options.body instanceof FormData)) {
        (headers as Record<string, string>)['Content-Type'] =
            (headers as Record<string, string>)['Content-Type'] || 'application/json';
    }

    const res = await fetch(url, {
        ...options,
        headers,
        credentials: 'same-origin', // Ensures HttpOnly cookies are sent
    });

    // If 401, redirect to login
    if (res.status === 401) {
        window.location.href = '/auth';
        throw new Error('Session expired');
    }

    return res;
}

/**
 * Authenticated JSON fetch — convenience wrapper.
 * Returns parsed JSON and throws on non-OK responses.
 */
export async function authFetchJson<T = any>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const res = await authFetch(url, options);
    const data = await res.json();
    if (!res.ok) {
        throw new Error(data?.error?.message || data?.error || `Request failed: ${res.status}`);
    }
    return data as T;
}
