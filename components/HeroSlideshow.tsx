'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

    // Get all image URLs
    const imageUrls = slides.map(slide => getImageUrl(slide, language, isMobile) || fallbackImage);

    // Content-based key so preloading re-triggers when slide URLs actually change
    const slidesKey = imageUrls.join('|');

    // ─── Preload the NEXT image on every index change ───
    useEffect(() => {
        if (slides.length <= 1) return;
        const nextIndex = (currentIndex + 1) % slides.length;
        const nextUrl = imageUrls[nextIndex];
        if (nextUrl) {
            const img = new window.Image();
            img.src = nextUrl;
        }
    }, [currentIndex, slides.length, imageUrls]);

    // ─── Also preload ALL images on mount for instant first transitions ───
    useEffect(() => {
        if (slides.length === 0) return;
        imageUrls.forEach((url) => {
            const img = new window.Image();
            img.src = url;
        });
    }, [slidesKey]); // eslint-disable-line react-hooks/exhaustive-deps

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
                    alt="Hero"
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
                        priority
                        quality={80}
                        sizes="100vw"
                        className="object-cover object-center"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
