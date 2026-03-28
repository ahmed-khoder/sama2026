'use client';

import { useState, useEffect, useCallback } from 'react';

export interface BrandingSettings {
    logoDefault: string | null;
    logoOccasion: string | null;
    logoAnimated: string | null;
    occasionMode: boolean;
    animationEnabled: boolean;
    occasionLabelAr: string;
    occasionLabelEn: string;
}

const CACHE_KEY = 'branding_settings';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const defaultBranding: BrandingSettings = {
    logoDefault: null,
    logoOccasion: null,
    logoAnimated: null,
    occasionMode: false,
    animationEnabled: false,
    occasionLabelAr: '',
    occasionLabelEn: '',
};

export function useBranding() {
    const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check sessionStorage cache
        try {
            const cached = sessionStorage.getItem(CACHE_KEY);
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < CACHE_TTL) {
                    setBranding(data);
                    setLoading(false);
                    return;
                }
            }
        } catch { }

        // Fetch from API
        fetch('/api/cms/branding')
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                if (data) {
                    setBranding(data);
                    try {
                        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                            data,
                            timestamp: Date.now()
                        }));
                    } catch { }
                }
            })
            .catch(err => console.error('Failed to load branding:', err))
            .finally(() => setLoading(false));
    }, []);

    const invalidateCache = useCallback(() => {
        try { sessionStorage.removeItem(CACHE_KEY); } catch { }
    }, []);

    return { branding, loading, invalidateCache };
}

/**
 * Resolves which logo URL to display based on branding settings.
 * Returns null if no uploaded logo → DynamicLogo falls back to AnimatedLogo.
 */
export function resolveLogoUrl(branding: BrandingSettings): {
    url: string | null;
    isAnimated: boolean;
    type: 'animated' | 'occasion' | 'default' | 'fallback';
} {
    // Priority 1: Animation enabled + animated logo available
    if (branding.animationEnabled && branding.logoAnimated) {
        return { url: branding.logoAnimated, isAnimated: true, type: 'animated' };
    }

    // Priority 2: Occasion mode + occasion logo available
    if (branding.occasionMode && branding.logoOccasion) {
        return { url: branding.logoOccasion, isAnimated: false, type: 'occasion' };
    }

    // Priority 3: Default uploaded logo
    if (branding.logoDefault) {
        return { url: branding.logoDefault, isAnimated: false, type: 'default' };
    }

    // Priority 4: Fallback to inline SVG AnimatedLogo
    return { url: null, isAnimated: false, type: 'fallback' };
}
