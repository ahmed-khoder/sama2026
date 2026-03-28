'use client';

import { useEffect } from 'react';

/**
 * HashScroll — watches for hash fragments in the URL and scrolls to the
 * target element after a short delay (to let React finish rendering).
 * 
 * Drop this component anywhere on the page that contains hash-target
 * elements (e.g., `<section id="team">`).
 */
export default function HashScroll() {
    useEffect(() => {
        const hash = window.location.hash;
        if (!hash) return;

        // Delay to allow lazy/animated components to mount
        const timer = setTimeout(() => {
            const id = hash.replace('#', '');
            const el = document.getElementById(id);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
            }
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    return null;
}
