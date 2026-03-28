'use client';

import React, { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import AnimatedCounter from '@/components/AnimatedCounter';
import { getLanguageAwareImage } from '@/lib/imageUtils';
import { HomeHeroSettings, HomeHeroSlide, highlightText, getOverlayColor } from '@/lib/hero-utils';
import {
    ArrowRight, ArrowLeft, Ship, Truck, FileCheck, Sparkles,
} from 'lucide-react';

// Services Quick View - 3 Main Services (glass cards)
const services = [
    { id: 'sea', icon: Ship, titleAr: 'الشحن البحري', titleEn: 'Sea Freight', descAr: 'نقل الحاويات عبر شبكة موانئ عالمية', descEn: 'Container transport via global port network' },
    { id: 'land', icon: Truck, titleAr: 'النقل البري', titleEn: 'Land Transport', descAr: 'أسطول حديث يغطي مصر والشرق الأوسط', descEn: 'Modern fleet covering Egypt and Middle East' },
    { id: 'customs', icon: FileCheck, titleAr: 'التخليص الجمركي', titleEn: 'Customs Clearance', descAr: 'إنهاء جميع الإجراءات بسرعة ودقة', descEn: 'Complete all procedures quickly and accurately' },
];

interface HomeHeroSectionProps {
    language: string;
    isRTL: boolean;
    isMobile: boolean;
    heroSlides: HomeHeroSlide[];
    heroSettings: HomeHeroSettings;
    heroIndex: number;
    setHeroIndex: (idx: number) => void;
    stats: { value: string; labelAr: string; labelEn: string; icon: string }[];
}

export default function HomeHeroSection({
    language, isRTL, isMobile,
    heroSlides, heroSettings, heroIndex, setHeroIndex, stats
}: HomeHeroSectionProps) {
    const goNext = useCallback(() =>
        setHeroIndex((heroIndex + 1) % heroSlides.length),
        [heroIndex, heroSlides.length, setHeroIndex]
    );
    const goPrev = useCallback(() =>
        setHeroIndex((heroIndex - 1 + heroSlides.length) % heroSlides.length),
        [heroIndex, heroSlides.length, setHeroIndex]
    );

    // Auto-advance slideshow
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const timer = setInterval(() => {
            setHeroIndex((heroIndex + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroIndex, heroSlides.length, setHeroIndex]);

    return (
        <section className="relative min-h-screen flex flex-col overflow-hidden">

            {/* Background Slideshow → z-0 */}
            {heroSlides.length > 0 && (
                <div className="absolute inset-0 overflow-hidden z-0">
                    <HeroSlideshow
                        slides={heroSlides}
                        language={language}
                        isMobile={isMobile}
                        interval={5000}
                        getImageUrl={getLanguageAwareImage}
                        blurAmount={heroSettings.blurAmount}
                        currentIndex={heroIndex}
                        onIndexChange={setHeroIndex}
                    />
                </div>
            )}

            {/* CMS Overlay → z-[2] */}
            <div
                className="absolute inset-0 z-[2]"
                style={{ backgroundColor: getOverlayColor(heroSettings.overlayColor, heroSettings.overlayOpacity) }}
            />

            {/* Cinematic gradient — mobile only: transparent top → dark bottom */}
            <div className="absolute inset-0 z-[2] md:hidden bg-gradient-to-b from-transparent via-black/30 to-black/80" />

            {/* Radial glow on text side */}
            <div className={`absolute inset-0 z-[3] pointer-events-none`} style={{ background: `radial-gradient(ellipse 90% 80% at ${isRTL ? '70%' : '30%'} 50%, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.32) 15%, rgba(0,0,0,0.22) 30%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.01) 75%, transparent 90%)` }} />

            {/* ─────────────────────────────────────────────────
                 ALL CONTENT — single container, side-aligned
                 Arabic: RIGHT | English: LEFT
                ───────────────────────────────────────────────── */}
            <div className="relative z-20 flex-1 flex flex-col md:justify-center pt-24 pb-2 md:pb-8 px-6 md:px-16 lg:px-24">

                {/* Main content block — text, buttons, stats, services
                     Since html dir=rtl, "start" already = right in Arabic.
                     items-start pushes to the correct side automatically. */}
                <div className={`flex flex-col items-start flex-1 md:flex-initial ${isRTL ? 'text-right' : 'text-left'}`}>

                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="hidden md:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-brand-orange/20 to-brand-gold/20 backdrop-blur-md border border-brand-orange/30 text-white text-sm font-semibold mb-6 shadow-lg shadow-brand-orange/10"
                    >
                        <Sparkles className="w-4 h-4 text-brand-orange animate-pulse" />
                        <span>
                            {isRTL
                                ? (heroSettings.subtitleAr || 'شريكك اللوجستي الموثوق')
                                : (heroSettings.subtitleEn || 'Your Trusted Logistics Partner')}
                        </span>
                    </motion.div>

                    {/* Title — massive */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4, duration: 0.7 }}
                        style={{
                            color: heroSettings.titleColor || '#ffffff',
                            fontFamily: isRTL
                                ? `var(--${heroSettings.titleFontFamilyAr || 'font-cairo'})`
                                : `var(--${heroSettings.titleFontFamilyEn || 'font-inter'})`
                        }}
                        className={`text-4xl md:text-6xl lg:text-7xl ${heroSettings.titleFontWeight || 'font-bold'} tracking-tight mb-6 leading-[1.1] drop-shadow-2xl`}
                    >
                        {isRTL ? (
                            <>
                                <span style={{ color: heroSettings.titleLine1Color || heroSettings.titleColor || '#ffffff' }}>
                                    {highlightText(heroSettings.titleArLine1 || 'نوصل أعمالك', heroSettings.highlightWordsAr, heroSettings.highlightColor)}
                                </span>
                                <br />
                                <span style={{ color: heroSettings.titleLine2Color || heroSettings.titleColor || '#ffffff' }}>
                                    {highlightText(heroSettings.titleArLine2 || 'إلى العالم', heroSettings.highlightWordsAr, heroSettings.highlightColor)}
                                </span>
                            </>
                        ) : (
                            <>
                                <span style={{ color: heroSettings.titleLine1Color || heroSettings.titleColor || '#ffffff' }}>
                                    {highlightText(heroSettings.titleEnLine1 || 'Connecting Your', heroSettings.highlightWordsEn, heroSettings.highlightColor)}
                                </span>
                                <br />
                                <span style={{ color: heroSettings.titleLine2Color || heroSettings.titleColor || '#ffffff' }}>
                                    {highlightText(heroSettings.titleEnLine2 || 'Business To The World', heroSettings.highlightWordsEn, heroSettings.highlightColor)}
                                </span>
                            </>
                        )}
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-lg md:text-xl text-white/80 mb-10 max-w-xl leading-relaxed font-normal"
                    >
                        {(heroSettings.descriptionAr || heroSettings.descriptionEn) ? (
                            isRTL ? heroSettings.descriptionAr : heroSettings.descriptionEn
                        ) : (
                            isRTL
                                ? 'حلول لوجستية متكاملة للشحن البحري والجوي والبري، مع خدمات التخليص الجمركي والتخزين لضمان وصول بضائعكم بأمان وسرعة.'
                                : 'Integrated logistics solutions for sea, air, and land freight, with customs clearance and warehousing services to ensure your cargo arrives safely and quickly.'
                        )}
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="flex flex-wrap gap-4 mt-6 md:mt-0 mb-10 order-last md:order-none"
                        style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                    >
                        <Link
                            href="/contact?tab=quote"
                            className="px-8 py-4 bg-brand-orange hover:bg-brand-darkOrange text-white font-semibold rounded-xl shadow-lg shadow-brand-orange/25 flex items-center gap-2 transition-all hover:scale-[1.03] hover:-translate-y-0.5"
                        >
                            {isRTL ? 'اطلب عرض سعر' : 'Get a Quote'}
                            <motion.span animate={{ x: [0, 5, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                            </motion.span>
                        </Link>
                        <Link
                            href="/services"
                            className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl flex items-center gap-2 transition-all hover:scale-[1.03] hover:-translate-y-0.5"
                        >
                            {isRTL ? 'خدماتنا' : 'Our Services'}
                        </Link>
                    </motion.div>

                    {/* Stats + Services — same parent, tighter width, NO mx-auto */}
                    <div className="w-full max-w-3xl mt-auto md:mt-0">
                        {/* Stats Row */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            {/* Mobile: Services-page style — single row, no cards */}
                            <div className="flex md:hidden flex-nowrap justify-between gap-4" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="text-center flex-1"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 + index * 0.1, type: 'spring' }}
                                    >
                                        <AnimatedCounter value={stat.value} className="text-2xl font-bold text-brand-orange mb-0.5" />
                                        <div className="text-xs text-gray-400 font-medium">{isRTL ? stat.labelAr : stat.labelEn}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Desktop: original glass card grid */}
                            <div className="hidden md:grid md:grid-cols-4 gap-3" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 + index * 0.1 }}
                                        className="text-center p-5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15"
                                    >
                                        <AnimatedCounter value={stat.value} className="text-3xl font-bold text-white mb-1" />
                                        <div className="text-sm text-white/70 font-medium">{isRTL ? stat.labelAr : stat.labelEn}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Service Cards */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.0 }}
                            className="mt-3"
                        >
                            {/* Mobile: 3 compact cards in a row | Desktop: 3-col grid with full details */}
                            <div
                                className="grid grid-cols-3 gap-2 md:gap-3"
                                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                            >
                                {services.map((service, index) => (
                                    <Link key={index} href={`/services?tab=${service.id}`} className="h-full">
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.1 + index * 0.1 }}
                                            whileHover={{ scale: 1.02 }}
                                            className="h-full p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-xl border border-white/15 hover:bg-white/15 transition-all cursor-pointer group"
                                        >
                                            {/* Mobile: stacked icon + title | Desktop: horizontal icon + text */}
                                            <div className={`flex flex-col md:flex-row items-center md:items-center gap-1.5 md:gap-3 text-center md:text-start ${isRTL ? 'md:flex-row-reverse md:text-right' : ''}`}>
                                                <div className="w-9 h-9 md:w-10 md:h-10 rounded-lg bg-brand-orange/20 flex items-center justify-center group-hover:bg-brand-orange transition-colors flex-shrink-0">
                                                    <service.icon className="w-4 h-4 md:w-5 md:h-5 text-brand-orange group-hover:text-white transition-colors" />
                                                </div>
                                                <div>
                                                    <h3 className="text-[11px] md:text-sm font-semibold text-white leading-tight">{isRTL ? service.titleAr : service.titleEn}</h3>
                                                    <p className="hidden md:block text-xs text-white/60 leading-snug">{isRTL ? service.descAr : service.descEn}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Slideshow Dots */}
            {heroSlides.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 z-30 flex justify-center gap-2">
                    {heroSlides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setHeroIndex(idx)}
                            className={`h-2 rounded-full transition-all duration-300 ${idx === heroIndex
                                ? 'w-8 bg-brand-orange'
                                : 'w-2 bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
