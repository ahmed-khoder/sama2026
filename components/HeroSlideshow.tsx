'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

interface HeroSlide {
    imageDesktopAr?: string;
    imageDesktopEn?: string;
    imageMobile?: string | null;
    [key: string]: any;
}

interface HeroSlideshowProps {
    slides: HeroSlide[];
    language: string;
    isMobile: boolean;
    interval?: number;
    getImageUrl: (slide: HeroSlide, language: string, isMobile?: boolean) => string | null;
    fallbackImage?: string;
    blurAmount?: number;
    // Controlled mode — parent drives the slide index
    currentIndex?: number;
    onIndexChange?: (idx: number) => void;
}

/**
 * Optimized Hero Slideshow Component
 * Features:
 * - Preloads the NEXT image on every index change
 * - Pure opacity crossfade (no scale/translate) for zero layout jitter
 * - GPU-accelerated via will-change-opacity
 * - Stable fixed container (absolute inset-0)
 */
export function HeroSlideshow({
    slides,
    language,
    isMobile,
    interval = 5000,
    getImageUrl,
    fallbackImage = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop',
    blurAmount = 0,
    currentIndex: controlledIndex,
    onIndexChange,
}: HeroSlideshowProps) {
    const [internalIndex, setInternalIndex] = useState(0);
    // Use controlled index when provided, otherwise internal
    const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;
    const currentIndexRef = useRef(currentIndex);
    useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
    const setCurrentIndex = (idx: number) => {
        if (onIndexChange) onIndexChange(idx);
        else setInternalIndex(idx);
    };

    // Get all image URLs — memoized to prevent re-creation on every render
    const imageUrls = useMemo(
        () => slides.map(slide => getImageUrl(slide, language, isMobile) || fallbackImage),
        [slides, language, isMobile, fallbackImage, getImageUrl]
    );

    // Track whether the first (LCP) slide has loaded
    const firstSlideLoadedRef = useRef(false);
    const handleFirstSlideLoad = useCallback(() => {
        firstSlideLoadedRef.current = true;
    }, []);

    // ─── Immediate preload of slide 1 only — ensures interaction readiness ───
    // Uses low priority (no fetchpriority hint) so the browser naturally
    // prioritizes the LCP image (fetchpriority="high") over this.
    const slide1PreloadedRef = useRef(false);
    useEffect(() => {
        if (slides.length <= 1 || slide1PreloadedRef.current) return;
        slide1PreloadedRef.current = true;
        const nextUrl = imageUrls[1];
        if (nextUrl) {
            const img = new window.Image();
            img.src = nextUrl;
        }
    }, [slides.length, imageUrls]);

    // ─── Preload the NEXT image on every slide change ───
    useEffect(() => {
        if (slides.length <= 1) return;
        // On initial render (index 0), slide 1 is already handled above
        if (currentIndex === 0) return;
        const nextIndex = (currentIndex + 1) % slides.length;
        const nextUrl = imageUrls[nextIndex];
        if (nextUrl) {
            const img = new window.Image();
            img.src = nextUrl;
        }
    }, [currentIndex, slides.length, imageUrls]);

    // ─── Progressive preload: stagger remaining slides AFTER first slide loads ───
    useEffect(() => {
        if (slides.length <= 2) return; // slides 0 and 1 already handled
        const timers: ReturnType<typeof setTimeout>[] = [];
        const startPreloading = () => {
            imageUrls.forEach((url, i) => {
                if (i <= 1) return; // slide 0 (LCP) and slide 1 (immediate) already handled
                const timer = setTimeout(() => {
                    const img = new window.Image();
                    img.src = url;
                }, (i - 1) * 1000); // stagger by 1s each, starting sooner
                timers.push(timer);
            });
        };
        if (firstSlideLoadedRef.current) {
            startPreloading();
        } else {
            const check = setInterval(() => {
                if (firstSlideLoadedRef.current) {
                    clearInterval(check);
                    startPreloading();
                }
            }, 200);
            timers.push(check as unknown as ReturnType<typeof setTimeout>);
        }
        return () => timers.forEach(t => clearTimeout(t));
    }, [imageUrls, slides.length]); // eslint-disable-line react-hooks/exhaustive-deps

    // Auto-advance slides — only when NOT in controlled mode.
    useEffect(() => {
        if (slides.length <= 1 || onIndexChange) return;

        const timer = setInterval(() => {
            setCurrentIndex((currentIndexRef.current + 1) % slides.length);
        }, interval);

        return () => clearInterval(timer);
    }, [slides.length, interval, onIndexChange]);

    if (slides.length === 0) {
        return (
            <div className="absolute inset-0">
                <Image
                    src={fallbackImage}
                    alt="Freight and container transport — SAMA Logistics, Port Said"
                    fill
                    priority
                    className="object-cover"
                />
            </div>
        );
    }

    const currentUrl = imageUrls[currentIndex];

    return (
        <div className="absolute inset-0 z-0 overflow-hidden">
            {/* Stable crossfade — pure opacity, GPU-accelerated */}
            <AnimatePresence>
                <motion.div
                    key={currentIndex}
                    className="absolute inset-0 will-change-[opacity]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    style={{ filter: blurAmount > 0 ? `blur(${blurAmount}px)` : undefined }}
                >
                    <Image
                        src={currentUrl}
                        alt="SAMA Logistics"
                        fill
                        priority={currentIndex === 0}
                        loading={currentIndex === 0 ? 'eager' : 'lazy'}
                        quality={80}
                        sizes="100vw"
                        className="object-cover object-center"
                        onLoad={currentIndex === 0 ? handleFirstSlideLoad : undefined}
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
