import { useState, useEffect } from 'react';

/**
 * Hook to detect if the user is on a mobile device
 * @param breakpoint - The width breakpoint to consider as mobile (default: 768px)
 * @returns boolean - true if on mobile, false otherwise
 */
export function useIsMobile(breakpoint: number = 768): boolean {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Function to check if mobile
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        // Check on mount
        checkIfMobile();

        // Add resize listener
        window.addEventListener('resize', checkIfMobile);

        // Cleanup
        return () => window.removeEventListener('resize', checkIfMobile);
    }, [breakpoint]);

    return isMobile;
}
