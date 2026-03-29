'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
    Target, Eye, Award, Globe, Shield, Users, Truck,
    Clock, Package, Ship, ArrowRight, ArrowLeft, Sparkles,
    CheckCircle2, Building2, MapPin, Phone, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import JourneyTimeline, { FuturePulseData } from '@/components/JourneyTimeline';
import Link from 'next/link';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import { getLanguageAwareImage } from '@/lib/imageUtils';
import AccreditationsManager from '@/components/AccreditationsManager';
import { useIsMobile } from '@/hooks/useIsMobile';

import { highlightText, getOverlayColor } from '@/lib/hero-utils';

interface Milestone {
    id: string;
    year: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    image?: string;
    order: number;
    isActive: boolean;
}

export default function AboutPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const isMobile = useIsMobile(); // Mobile detection
    const heroRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const [statsInView, setStatsInView] = useState(false);

    // Intersection Observer for stats counter animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setStatsInView(true); },
            { threshold: 0.3 }
        );
        if (statsRef.current) observer.observe(statsRef.current);
        return () => observer.disconnect();
    }, []);

    // Dynamic milestones from API
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [milestonesLoading, setMilestonesLoading] = useState(true);
    const [futurePulse, setFuturePulse] = useState<FuturePulseData | null>(null);

    // Dynamic Hero Settings
    const [heroSettings, setHeroSettings] = useState({
        // Visual Effects
        blurAmount: 0,
        overlayOpacity: 85,
        overlayColor: '#1e3a5f',
        showGrid: true,
        showParticles: true,
        // Content
        badgeAr: 'شريكك اللوجستي الموثوق منذ 2000',
        badgeEn: 'Your Trusted Logistics Partner Since 2000',
        titleLine1Ar: 'نحن',
        titleLine2Ar: 'سما',
        titleLine3Ar: 'للخدمات اللوجستية',
        titleLine1En: 'We Are',
        titleLine2En: 'SAMA',
        titleLine3En: 'Logistics',
        titleLine1Color: '#ffffff',
        titleLine2Color: '#F97316',
        titleLine3Color: '#ffffff',
        descriptionAr: 'نحن أكثر من مجرد شركة شحن.. نحن شريكك الاستراتيجي في النجاح.',
        descriptionEn: 'We are more than just a shipping company. We are your strategic partner.',
        highlightWordsAr: '',
        highlightWordsEn: '',
        highlightColor: '#F97316'
    });

    // Loading state
    const [heroLoading, setHeroLoading] = useState(true);

    // highlightText imported from '@/lib/hero-utils'

    const [heroSlides, setHeroSlides] = useState<any[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Slide navigation helpers
    const goNext = useCallback(() =>
        setCurrentSlide(prev => (prev + 1) % Math.max(heroSlides.length, 1)),
        [heroSlides.length]
    );
    const goPrev = useCallback(() =>
        setCurrentSlide(prev => (prev - 1 + heroSlides.length) % Math.max(heroSlides.length, 1)),
        [heroSlides.length]
    );

    // Fetch hero settings and slides — direct fetch for freshness
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [settingsRes, slidesRes] = await Promise.all([
                    fetch('/api/cms/about-hero/settings').catch(() => null),
                    fetch('/api/cms/about-hero/slides').catch(() => null)
                ]);

                const settingsData = settingsRes?.ok ? await settingsRes.json() : null;
                const slidesData = slidesRes?.ok ? await slidesRes.json() : [];

                if (settingsData) {
                    setHeroSettings(prev => ({ ...prev, ...settingsData }));
                }

                if (Array.isArray(slidesData) && slidesData.length > 0) {
                    setHeroSlides(slidesData);
                }
            } catch (error) {
                console.error('Failed to fetch hero data:', error);
            } finally {
                setTimeout(() => setHeroLoading(false), 100);
            }
        };

        fetchData();
    }, []);

    // Auto-rotate slides
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const res = await fetch('/api/cms/milestones');
                if (!res.ok) throw new Error('Failed to fetch milestones');
                const data = await res.json();
                setMilestones((data as Milestone[]).filter(m => m.isActive).sort((a, b) => a.order - b.order));
            } catch (error) {
                console.error('Failed to fetch milestones:', error);
            } finally {
                setMilestonesLoading(false);
            }
        };
        fetchMilestones();

        // Fetch Future Pulse Settings
        fetch('/api/cms/future-pulse')
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setFuturePulse(data); })
            .catch(err => console.error('Failed to fetch future pulse:', err));
    }, []);

    // Transform milestones for JourneyTimeline component
    const timelineMilestones = milestones.map(m => ({
        year: m.year,
        titleAr: m.titleAr,
        titleEn: m.titleEn,
        descAr: m.descriptionAr,
        descEn: m.descriptionEn,
        image: m.image
    }));

    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ["start start", "end start"]
    });

    const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

    // Company Values
    const values = [
        {
            icon: Shield,
            titleAr: 'الأمان والموثوقية',
            titleEn: 'Safety & Reliability',
            descAr: 'نلتزم بأعلى معايير الأمان لضمان وصول بضائعكم بسلام وفي أفضل حالة.',
            descEn: 'We adhere to the highest safety standards to ensure your cargo arrives safely.',
            color: 'from-blue-500 to-blue-600'
        },
        {
            icon: Target,
            titleAr: 'الدقة في المواعيد',
            titleEn: 'Punctuality',
            descAr: 'نقدر قيمة الوقت ونلتزم بجداول زمنية دقيقة للتسليم في كل مرة.',
            descEn: 'We value time effectively and commit to precise delivery schedules.',
            color: 'from-orange-500 to-orange-600'
        },
        {
            icon: Globe,
            titleAr: 'تغطية عالمية',
            titleEn: 'Global Coverage',
            descAr: 'شبكة واسعة من الشركاء والوكلاء حول العالم لخدمتكم أينما كنتم.',
            descEn: 'A vast network of partners and agents worldwide to serve you anywhere.',
            color: 'from-marine-500 to-marine-600'
        },
        {
            icon: Award,
            titleAr: 'التميز والجودة',
            titleEn: 'Excellence & Quality',
            descAr: 'نسعى دائماً لتقديم خدمات تفوق توقعات عملائنا وتحقق رضاهم.',
            descEn: 'We always strive to provide services that exceed expectations.',
            color: 'from-emerald-500 to-emerald-600'
        }
    ];

    // Statistics
    const statTargets = [
        { numericEnd: 25, suffix: '+', labelAr: 'سنة خبرة', labelEn: 'Years Experience', icon: Clock },
        { numericEnd: 50, suffix: '+', labelAr: 'ميناء عالمي', labelEn: 'Global Ports', icon: Globe },
        { numericEnd: 10, suffix: 'K+', labelAr: 'شحنة ناجحة', labelEn: 'Successful Shipments', icon: Package },
        { numericEnd: 500, suffix: '+', labelAr: 'عميل سعيد', labelEn: 'Happy Clients', icon: Users }
    ];

    // Animated counter values (hooks-safe: single useEffect at component level)
    const [statCounts, setStatCounts] = useState([0, 0, 0, 0]);
    useEffect(() => {
        if (!statsInView) return;
        const duration = 2000;
        let startTime: number | null = null;
        let raf: number;
        const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
            setStatCounts(statTargets.map(s => Math.floor(eased * s.numericEnd)));
            if (progress < 1) raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
        return () => cancelAnimationFrame(raf);
    }, [statsInView]);

    // Why Choose Us - Dynamic from Database
    const [whySection, setWhySection] = useState({
        badgeAr: 'لماذا نحن؟',
        badgeEn: 'Why Us?',
        titleAr: 'لماذا تختار سما للخدمات اللوجستية؟',
        titleEn: 'Why Choose SAMA Logistics?',
        descriptionAr: 'نحن لسنا مجرد شركة شحن، بل شريكك الاستراتيجي الذي يفهم احتياجات عملك ويعمل على تلبيتها بأعلى معايير الجودة والكفاءة.',
        descriptionEn: 'We are not just a shipping company, but your strategic partner who understands your business needs and works to meet them with the highest standards of quality and efficiency.',
        reasonsJson: '[]',
        statsValue: '25+',
        statsLabelAr: 'سنة من التميز',
        statsLabelEn: 'Years of Excellence'
    });
    const [whyImages, setWhyImages] = useState<{ id: string; url: string; order: number }[]>([]);
    const [whyImageIndex, setWhyImageIndex] = useState(0);

    // Fetch Why Choose Us data — direct fetch for freshness
    useEffect(() => {
        fetch('/api/cms/about-why')
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setWhySection(data as any); })
            .catch(err => console.error('Failed to fetch why section:', err));

        fetch('/api/cms/about-why/images')
            .then(res => res.ok ? res.json() : [])
            .then(data => { if (Array.isArray(data)) setWhyImages(data as any); })
            .catch(err => console.error('Failed to fetch why images:', err));
    }, []);

    // Auto-rotate why images
    useEffect(() => {
        if (whyImages.length <= 1) return;
        const timer = setInterval(() => {
            setWhyImageIndex(prev => (prev + 1) % whyImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [whyImages.length]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 overflow-hidden">
            {/* Hero Section with Parallax */}
            <section ref={heroRef} className="relative min-h-[85vh] pt-20 flex flex-col md:flex-row md:items-center overflow-hidden">
                {/* Background Slideshow → z-0 */}
                {heroSlides.length > 0 && (
                    <motion.div style={{ scale: heroScale }} className="absolute inset-0 overflow-hidden z-0">
                        <HeroSlideshow
                            slides={heroSlides}
                            language={language}
                            isMobile={isMobile}
                            interval={5000}
                            getImageUrl={getLanguageAwareImage}
                            blurAmount={heroSettings.blurAmount}
                            currentIndex={currentSlide}
                            onIndexChange={setCurrentSlide}
                        />
                    </motion.div>
                )}

                {/* Dynamic CMS overlay — respects dashboard settings */}
                <div
                    className="absolute inset-0 z-[2]"
                    style={{ backgroundColor: getOverlayColor(heroSettings.overlayColor, heroSettings.overlayOpacity) }}
                />
                <div className={`absolute inset-0 z-[3] pointer-events-none`} style={{ background: `radial-gradient(ellipse 90% 80% at ${isRTL ? '70%' : '30%'} 50%, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.32) 15%, rgba(0,0,0,0.22) 30%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.01) 75%, transparent 90%)` }} />

                <motion.div
                    style={{ opacity: heroOpacity }}
                    className="container mx-auto px-4 relative z-20 flex-1 flex flex-col md:block pb-2 md:pb-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: heroLoading ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-16 lg:items-center min-h-[60vh] flex-1 lg:flex-none">
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className={`max-w-2xl relative flex flex-col flex-1 lg:flex-none ${isRTL ? 'text-right lg:order-2' : 'text-left'}`}
                        >

                            {/* Title + Description — centered on mobile, normal flow on desktop */}
                            <div className="flex-1 flex flex-col justify-center lg:flex-none lg:block">
                                {/* Badge */}
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="hidden md:inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
                                >
                                    <Sparkles className="w-4 h-4 text-brand-orange" />
                                    <span className="text-sm font-semibold tracking-wide">{isRTL ? heroSettings.badgeAr : heroSettings.badgeEn}</span>
                                </motion.div>

                                {/* Title - Dynamic with Highlighting and Colors */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.7 }}
                                    className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                                >
                                    {isRTL ? (
                                        <>
                                            <span style={{ color: heroSettings.titleLine1Color || '#ffffff' }}>
                                                {highlightText(heroSettings.titleLine1Ar, heroSettings.highlightWordsAr, heroSettings.highlightColor || '#F97316')}
                                            </span>{' '}
                                            <span style={{ color: heroSettings.titleLine2Color || '#F97316' }}>
                                                {highlightText(heroSettings.titleLine2Ar, heroSettings.highlightWordsAr, heroSettings.highlightColor || '#F97316')}
                                            </span>
                                            <br />
                                            <span style={{ color: heroSettings.titleLine3Color || '#ffffff' }}>
                                                {highlightText(heroSettings.titleLine3Ar, heroSettings.highlightWordsAr, heroSettings.highlightColor || '#F97316')}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span style={{ color: heroSettings.titleLine1Color || '#ffffff' }}>
                                                {highlightText(heroSettings.titleLine1En, heroSettings.highlightWordsEn, heroSettings.highlightColor || '#F97316')}
                                            </span>{' '}
                                            <span style={{ color: heroSettings.titleLine2Color || '#F97316' }}>
                                                {highlightText(heroSettings.titleLine2En, heroSettings.highlightWordsEn, heroSettings.highlightColor || '#F97316')}
                                            </span>
                                            <br />
                                            <span style={{ color: heroSettings.titleLine3Color || '#ffffff' }}>
                                                {highlightText(heroSettings.titleLine3En, heroSettings.highlightWordsEn, heroSettings.highlightColor || '#F97316')}
                                            </span>
                                        </>
                                    )}
                                </motion.h1>

                                {/* Description */}
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-xl font-normal"
                                >
                                    {isRTL ? heroSettings.descriptionAr : heroSettings.descriptionEn}
                                </motion.p>
                            </div>

                            {/* CTA Buttons — matches Careers pattern */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap gap-4 mb-14 order-last md:order-none mt-6 md:mt-0"
                                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                            >
                                <motion.a
                                    href="/contact"
                                    className="px-8 py-4 bg-brand-orange hover:bg-brand-darkOrange text-white font-semibold rounded-xl shadow-lg shadow-brand-orange/25 flex items-center gap-2 transition-colors"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isRTL ? 'تواصل معنا' : 'Contact Us'}
                                    {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                </motion.a>
                                <motion.a
                                    href="/services"
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isRTL ? 'استكشف خدماتنا' : 'Explore Services'}
                                </motion.a>
                            </motion.div>

                            {/* Stats Row — matches Careers pattern (plain numbers) */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="flex flex-wrap gap-8 md:gap-16 mt-auto lg:mt-0"
                                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                            >
                                {[
                                    { value: '+50', labelAr: 'دولة', labelEn: 'Countries' },
                                    { value: '24/7', labelAr: 'دعم', labelEn: 'Support' },
                                    { value: '+10K', labelAr: 'شحنة', labelEn: 'Shipments' },
                                ].map((stat, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="text-center"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 + idx * 0.1, type: 'spring' }}
                                        whileHover={{ scale: 1.1, y: -5 }}
                                    >
                                        <div className="text-3xl md:text-4xl font-bold text-brand-orange mb-1">{stat.value}</div>
                                        <div className="text-sm text-gray-400 font-medium">{isRTL ? stat.labelAr : stat.labelEn}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 dark:from-slate-950 to-transparent z-10" />
            </section>

            {/* ══════════════════════════════════════════════════
                STATS — Frosted Glass with Gradient Accent
               ══════════════════════════════════════════════════ */}
            <section className="relative pt-12 md:pt-16 pb-4 md:pb-6 bg-white dark:bg-slate-950" ref={statsRef}>
                <div className="container mx-auto px-5 md:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
                        {statTargets.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.12, type: 'spring', stiffness: 120, damping: 14 }}
                                className="relative overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl p-5 md:p-7 shadow-lg shadow-black/5 dark:shadow-black/30 border border-gray-200/60 dark:border-slate-700/50 text-center group hover:-translate-y-1.5 hover:shadow-xl dark:hover:shadow-black/50 active:scale-[0.98] transition-all duration-300"
                            >
                                {/* Gradient top-line accent */}
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange opacity-80 group-hover:opacity-100 transition-opacity" />

                                <div className="w-11 h-11 md:w-14 md:h-14 mx-auto mb-3 md:mb-4 bg-gradient-to-br from-brand-orange/10 to-brand-gold/10 dark:from-brand-orange/20 dark:to-brand-gold/20 rounded-xl md:rounded-2xl flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform duration-300">
                                    <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                                </div>
                                <h3 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mb-0.5 md:mb-1 tabular-nums tracking-tight">
                                    {statCounts[idx]}{stat.suffix}
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-[11px] md:text-sm font-medium">{isRTL ? stat.labelAr : stat.labelEn}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════════════
                VISION & MISSION — Editorial Cards
               ══════════════════════════════════════════════════ */}
            <section className="mt-4 md:mt-6 py-10 md:py-14 bg-gray-50 dark:bg-slate-950/50">
                <div className="container mx-auto px-5 md:px-8">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-8 md:mb-10"
                    >
                        <span className="inline-block text-brand-orange text-sm font-semibold tracking-widest uppercase mb-3">
                            {isRTL ? 'من نحن' : 'Who We Are'}
                        </span>
                        <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {isRTL ? 'رؤيتنا ورسالتنا' : 'Vision & Mission'}
                        </h2>
                        <div className="w-16 h-1 bg-gradient-to-r from-brand-orange to-brand-gold mx-auto mt-4 rounded-full" />
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
                        {/* Vision */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ type: 'spring', stiffness: 80, damping: 16 }}
                            className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 group hover:shadow-2xl hover:shadow-marine-500/5 dark:hover:shadow-marine-500/10 transition-all duration-500"
                        >
                            {/* Colored top bar */}
                            <div className="h-1.5 bg-gradient-to-r from-marine-400 via-marine-500 to-marine-600" />

                            <div className="p-8 md:p-10 lg:p-12">
                                {/* Decorative glow */}
                                <div className="absolute -top-20 -right-20 w-60 h-60 bg-marine-500/5 dark:bg-marine-500/10 rounded-full blur-3xl group-hover:bg-marine-500/10 dark:group-hover:bg-marine-500/15 transition-colors duration-500" />

                                <div className="relative z-10">
                                    {/* Icon with ring */}
                                    <div className="w-16 h-16 md:w-18 md:h-18 mb-6 rounded-2xl bg-marine-50 dark:bg-marine-500/10 border border-marine-100 dark:border-marine-500/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                        <Eye className="w-7 h-7 md:w-8 md:h-8 text-marine-600 dark:text-marine-400" />
                                    </div>

                                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                                        {isRTL ? 'رؤيتنا' : 'Our Vision'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base lg:text-lg font-normal">
                                        {isRTL
                                            ? 'أن نكون الخيار الأول والشركة الرائدة في مجال الخدمات اللوجستية في الشرق الأوسط وشمال أفريقيا، من خلال تقديم حلول مبتكرة تساهم في نمو أعمال عملائنا وتسهيل حركة التجارة العالمية.'
                                            : 'To be the first choice and leading logistics company in the MENA region, by providing innovative solutions that contribute to our clients\' business growth and facilitate global trade.'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Mission */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.15, type: 'spring', stiffness: 80, damping: 16 }}
                            className="relative overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 group hover:shadow-2xl hover:shadow-brand-orange/5 dark:hover:shadow-brand-orange/10 transition-all duration-500"
                        >
                            {/* Colored top bar */}
                            <div className="h-1.5 bg-gradient-to-r from-brand-orange via-brand-darkOrange to-brand-gold" />

                            <div className="p-8 md:p-10 lg:p-12">
                                {/* Decorative glow */}
                                <div className="absolute -top-20 -right-20 w-60 h-60 bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full blur-3xl group-hover:bg-brand-orange/10 dark:group-hover:bg-brand-orange/15 transition-colors duration-500" />

                                <div className="relative z-10">
                                    {/* Icon with ring */}
                                    <div className="w-16 h-16 md:w-18 md:h-18 mb-6 rounded-2xl bg-orange-50 dark:bg-brand-orange/10 border border-orange-100 dark:border-brand-orange/20 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                                        <Target className="w-7 h-7 md:w-8 md:h-8 text-brand-orange" />
                                    </div>

                                    <h3 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                                        {isRTL ? 'رسالتنا' : 'Our Mission'}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm md:text-base lg:text-lg font-normal">
                                        {isRTL
                                            ? 'تمكين الشركات من الوصول إلى الأسواق العالمية بكفاءة وسهولة، عبر تقديم خدمات لوجستية موثوقة، آمنة، وعالية الجودة تفوق التوقعات وتحقق رضا العملاء الكامل.'
                                            : 'Empowering businesses to access global markets efficiently and easily, by providing reliable, safe, and high-quality logistics services that exceed expectations and achieve complete customer satisfaction.'}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="pt-4 md:pt-6 pb-12 md:pb-16 bg-gray-50 dark:bg-slate-950">
                <div className="container mx-auto px-5 md:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-6 md:mb-10"
                    >
                        <span className="inline-block px-4 py-2 bg-marine-100 dark:bg-marine-900/50 text-marine-600 dark:text-marine-400 rounded-full text-sm font-semibold mb-4">
                            {isRTL ? 'ما يميزنا' : 'What Defines Us'}
                        </span>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'قيمنا الجوهرية' : 'Our Core Values'}
                        </h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-brand-orange to-brand-gold mx-auto rounded-full" />
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                        {values.map((value, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white dark:bg-slate-900 p-5 md:p-8 rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-slate-800 relative overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                                <div className={`w-11 h-11 md:w-16 md:h-16 bg-gradient-to-br ${value.color} rounded-xl md:rounded-2xl flex items-center justify-center text-white mb-4 md:mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                                    <value.icon className="w-5 h-5 md:w-8 md:h-8" />
                                </div>
                                <h3 className="text-base md:text-xl font-semibold text-gray-900 dark:text-white mb-2 md:mb-3">
                                    {isRTL ? value.titleAr : value.titleEn}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-xs md:text-base font-normal">
                                    {isRTL ? value.descAr : value.descEn}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== ACCREDITATIONS ===== */}
            <AccreditationsManager type="about" />

            {/* Why Choose Us */}
            <section className="py-16 md:py-20 bg-slate-50 dark:bg-marine-900 relative overflow-hidden">
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.02] dark:opacity-5" />
                    <div className="absolute top-0 left-0 w-96 h-96 bg-brand-orange/10 dark:bg-brand-orange/20 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-marine-400/10 dark:bg-marine-400/20 rounded-full blur-[150px]" />
                </div>

                <div className="container mx-auto px-5 md:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-10 md:gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-block px-4 py-2 bg-brand-orange/10 dark:bg-white/10 text-brand-orange dark:text-white rounded-full text-sm font-semibold mb-4 backdrop-blur-md">
                                {isRTL ? whySection.badgeAr : whySection.badgeEn}
                            </span>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6">
                                {isRTL ? whySection.titleAr : whySection.titleEn}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300/80 text-sm md:text-base lg:text-lg mb-6 md:mb-8 leading-relaxed font-normal">
                                {isRTL ? whySection.descriptionAr : whySection.descriptionEn}
                            </p>

                            <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
                                {JSON.parse(whySection.reasonsJson || '[]').map((item: { ar: string; en: string }, idx: number) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-brand-orange flex-shrink-0" />
                                        <span className="text-gray-700 dark:text-gray-200 text-sm md:text-base">{isRTL ? item.ar : item.en}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
                                {whyImages.length > 0 ? (
                                    <>
                                        <AnimatePresence mode="wait">
                                            <motion.img
                                                key={whyImageIndex}
                                                src={whyImages[whyImageIndex]?.url}
                                                alt="Why Choose Us"
                                                initial={{ opacity: 0, scale: 1.1 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.9 }}
                                                transition={{ duration: 0.7 }}
                                                className="w-full h-80 md:h-96 object-cover"
                                            />
                                        </AnimatePresence>
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-marine-900/60 to-transparent" />

                                        {/* Image Indicators */}
                                        {whyImages.length > 1 && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                                {whyImages.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setWhyImageIndex(idx)}
                                                        className={`w-2 h-2 rounded-full transition-all ${whyImageIndex === idx ? 'bg-white w-6' : 'bg-white/50'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <img
                                            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
                                            alt="Container Port"
                                            className="w-full h-80 md:h-96 object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 dark:from-marine-900/60 to-transparent" />
                                    </>
                                )}
                            </div>

                            {/* Floating Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.3 }}
                                className={`absolute -bottom-8 ${isRTL ? '-right-4 md:-right-8' : '-left-4 md:-left-8'} bg-white dark:bg-[#1e293b] p-4 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-gray-100 dark:border-white/10`}
                            >
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="w-11 h-11 md:w-14 md:h-14 bg-gradient-to-br from-brand-orange to-brand-gold rounded-lg md:rounded-xl flex items-center justify-center text-white">
                                        <Ship className="w-5 h-5 md:w-7 md:h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{whySection.statsValue}</h4>
                                        <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">{isRTL ? whySection.statsLabelAr : whySection.statsLabelEn}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Journey Timeline */}
            <section className="py-20 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-2 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
                            {isRTL ? 'رحلتنا' : 'Our Journey'}
                        </span>
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'مسيرة نجاحنا' : 'Our Success Story'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-normal">
                            {isRTL ? 'خطوات ثابتة نحو الريادة والتميز في عالم الخدمات اللوجستية' : 'Steady steps towards leadership and excellence in logistics'}
                        </p>
                    </motion.div>

                    <JourneyTimeline milestones={timelineMilestones} futurePulse={futurePulse || undefined} />
                </div>
            </section>

            {/* Team CTA */}
            <section className="py-20 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-950 dark:to-slate-900">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto text-center bg-white dark:bg-[#1e293b] p-10 md:p-16 rounded-3xl shadow-xl border border-gray-100 dark:border-white/10 relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 w-40 h-40 bg-marine-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl" />

                        <div className="relative z-10">
                            <div className="w-20 h-20 bg-gradient-to-br from-marine-500 to-marine-700 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-marine-500/30">
                                <Users className="w-10 h-10" />
                            </div>

                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6">
                                {isRTL ? 'فريقنا هو سر قوتنا' : 'Our Team is Our Strength'}
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed font-normal">
                                {isRTL
                                    ? 'نفخر بامتلاك نخبة من الخبراء والمتخصصين الذين يعملون بشغف لتقديم أفضل الحلول لكم. تعرف على فريق قيادتنا المتميز.'
                                    : 'We are proud to have a team of experts and specialists who work passionately to provide the best solutions for you. Meet our distinguished leadership team.'}
                            </p>

                            <Link
                                href="/#team"
                                className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-brand-orange to-brand-darkOrange text-white font-semibold text-lg rounded-xl hover:shadow-2xl hover:shadow-brand-orange/30 transition-all duration-300 transform hover:-translate-y-1"
                            >
                                {isRTL ? 'تعرف على فريق القيادة' : 'Meet Our Leadership Team'}
                                {isRTL ? <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" /> : <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-16 bg-marine-950">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="text-center md:text-start">
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold tracking-tight text-white mb-2">
                                {isRTL ? 'هل أنت جاهز للبدء؟' : 'Ready to Get Started?'}
                            </h3>
                            <p className="text-gray-400 font-normal">
                                {isRTL ? 'تواصل معنا اليوم ودعنا نساعدك في تحقيق أهدافك اللوجستية' : 'Contact us today and let us help you achieve your logistics goals'}
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link
                                href="/contact"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-darkOrange transition-colors"
                            >
                                <Phone className="w-5 h-5" />
                                {isRTL ? 'تواصل معنا' : 'Contact Us'}
                            </Link>
                            <Link
                                href="/services"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-colors"
                            >
                                {isRTL ? 'خدماتنا' : 'Our Services'}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div >
    );
}
