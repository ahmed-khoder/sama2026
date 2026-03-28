'use client';

import { useState, useEffect } from 'react';

type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionOptions {
    threshold?: number;
    initialDirection?: ScrollDirection;
}

/**
 * Hook to detect scroll direction
 * Returns 'up' when scrolling up, 'down' when scrolling down, null initially
 */
export function useScrollDirection(options: UseScrollDirectionOptions = {}) {
    const { threshold = 10, initialDirection = null } = options;
    const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(initialDirection);
    const [prevScrollY, setPrevScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (Math.abs(currentScrollY - prevScrollY) < threshold) {
                return;
            }

            const direction = currentScrollY > prevScrollY ? 'down' : 'up';
            setScrollDirection(direction);
            setPrevScrollY(currentScrollY);
        };

        // Set initial scroll position
        setPrevScrollY(window.scrollY);

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [prevScrollY, threshold]);

    return scrollDirection;
}
