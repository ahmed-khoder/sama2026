'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/contexts/LanguageContext';
import ClientsMarquee from '@/components/ClientsMarquee';
import HashScroll from '@/components/HashScroll';
import { useIsMobile } from '@/hooks/useIsMobile';
import { HomeHeroSettings, HomeHeroSlide } from '@/lib/hero-utils';

// Section Components
import HomeHeroSection from '@/components/home/HomeHeroSection';
import WhyChooseSection from '@/components/home/WhyChooseSection';
import AboutPreviewSection from '@/components/home/AboutPreviewSection';
import TeamSection from '@/components/home/TeamSection';
import CTASection from '@/components/home/CTASection';


// Lazy load heavy components
const WorldMapVisualization = dynamic(
    () => import('@/components/WorldMapVisualization'),
    {
        ssr: false,
        loading: () => (
            <div className="py-24 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin" />
            </div>
        ),
    }
);

interface AboutContent {
    badgeAr: string; badgeEn: string;
    titleAr: string; titleEn: string;
    descriptionAr: string; descriptionEn: string;
    ctaTextAr: string; ctaTextEn: string; ctaLink: string;
    features: { ar: string; en: string }[];
    statsValue: string; statsLabelAr: string; statsLabelEn: string;
}

interface HomePageClientProps {
    initialHeroSlides: HomeHeroSlide[];
    initialHeroSettings: HomeHeroSettings;
    initialTeamMembers: { nameAr: string; nameEn: string; roleAr: string; roleEn: string; image: string; linkedin: string; twitter: string }[];
    initialStats: { value: string; labelAr: string; labelEn: string; icon: string }[];
    initialAboutContent: AboutContent;
    initialAboutImages: string[];
    initialClients: { name: string; logo: string }[];
}

export default function HomePageClient({
    initialHeroSlides,
    initialHeroSettings,
    initialTeamMembers,
    initialStats,
    initialAboutContent,
    initialAboutImages,
    initialClients,
}: HomePageClientProps) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const isMobile = useIsMobile();

    // ─── Static props from SSR — no state needed ───
    const heroSlides = initialHeroSlides;
    const heroSettings = initialHeroSettings;
    const teamMembers = initialTeamMembers;
    const stats = initialStats;
    const aboutContent = initialAboutContent;
    const aboutImages = initialAboutImages;

    // Hero slideshow index (timer is managed by HomeHeroSection)
    const [heroIndex, setHeroIndex] = useState(0);

    // About section image carousel
    const [aboutIndex, setAboutIndex] = useState(0);
    useEffect(() => {
        if (aboutImages.length <= 1) return;
        const timer = setInterval(() => {
            setAboutIndex((prev) => (prev + 1) % aboutImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [aboutImages.length]);

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden noise-overlay">

            {/* Hash scroll handler for cross-page anchor navigation */}
            <HashScroll />

            {/* ===== HERO SECTION ===== */}
            <HomeHeroSection
                language={language}
                isRTL={isRTL}
                isMobile={isMobile}
                heroSlides={heroSlides}
                heroSettings={heroSettings}
                heroIndex={heroIndex}
                setHeroIndex={setHeroIndex}
                stats={stats}
            />

            {/* ===== WHY CHOOSE US ===== */}
            <WhyChooseSection isRTL={isRTL} />

            {/* ===== CLIENTS MARQUEE ===== */}
            <ClientsMarquee clients={initialClients} />

            {/* ===== ABOUT PREVIEW ===== */}
            <AboutPreviewSection
                isRTL={isRTL}
                aboutContent={aboutContent}
                aboutImages={aboutImages}
                aboutIndex={aboutIndex}
                setAboutIndex={setAboutIndex}
            />

            {/* ===== TEAM SECTION ===== */}
            <TeamSection isRTL={isRTL} teamMembers={teamMembers} />

            {/* ===== WORLD MAP ===== */}
            <WorldMapVisualization />

            {/* ===== CTA ===== */}
            <CTASection isRTL={isRTL} />
        </div>
    );
}
