'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to detect if component is mounted
 * Useful for avoiding hydration mismatches with client-only content
 */
export function useMounted() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return mounted;
}
