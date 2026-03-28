'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getJobs } from '@/app/actions/careers';
import {
    Briefcase, MapPin, Clock, ArrowRight, ArrowLeft, Loader2,
    Users, TrendingUp, Building2, Star, Sparkles, Rocket,
    Heart, Award, Globe, ChevronLeft, ChevronRight, Zap,
    Send, Shield, GraduationCap, Coffee
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import { getLanguageAwareImage } from '@/lib/imageUtils';
import { useIsMobile } from '@/hooks/useIsMobile';

import {
    HeroSlide, HeroStat, CareersHeroSettings,
    highlightText, getOverlayColor
} from '@/lib/hero-utils';


export default function CareersPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const isMobile = useIsMobile();
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Dynamic Hero State
    const [heroSettings, setHeroSettings] = useState<CareersHeroSettings>({
        blurAmount: 0,
        overlayOpacity: 80,
        overlayColor: 'marine',
        showGrid: true,
        showParticles: true,
        badgeAr: 'نحن نوظف!',
        badgeEn: "We're Hiring!",
        titleAr: 'انضم إلى فريق سما',
        titleEn: 'Join the Sama Team',
        descriptionAr: 'ابدأ رحلة مهنية استثنائية مع فريق من المبتكرين والمحترفين في عالم اللوجستيات',
        descriptionEn: 'Start an exceptional career journey with a team of innovators and professionals in the logistics world',
        statsJson: '[{"value":"100+","labelAr":"موظف","labelEn":"Employees"},{"value":"25+","labelAr":"سنة خبرة","labelEn":"Years"},{"value":"50+","labelAr":"دولة","labelEn":"Countries"}]',
        titleLine1Color: '#ffffff',
        titleLine2Color: '#F97316',
        highlightColor: '#F97316',
        highlightWordsAr: '',
        highlightWordsEn: ''
    });

    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
    const [heroStats, setHeroStats] = useState<HeroStat[]>([
        { value: '100+', labelAr: 'موظف', labelEn: 'Employees' },
        { value: '25+', labelAr: 'سنة خبرة', labelEn: 'Years' },
        { value: '50+', labelAr: 'دولة', labelEn: 'Countries' }
    ]);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    // Slide navigation helpers
    const goNext = useCallback(() =>
        setCurrentSlideIndex(prev => (prev + 1) % Math.max(heroSlides.length, 1)),
        [heroSlides.length]
    );
    const goPrev = useCallback(() =>
        setCurrentSlideIndex(prev => (prev - 1 + heroSlides.length) % Math.max(heroSlides.length, 1)),
        [heroSlides.length]
    );

    // Fetch Hero Settings and Slides
    useEffect(() => {
        const fetchHeroData = async () => {
            try {
                const settingsRes = await fetch('/api/cms/careers-hero/settings').catch(() => null);
                const data = settingsRes?.ok ? await settingsRes.json() : null;
                if (data) {
                    setHeroSettings(prev => ({ ...prev, ...(data as any) }));
                    try {
                        const stats = JSON.parse((data as any).statsJson || '[]');
                        if (stats.length > 0) setHeroStats(stats);
                    } catch (e) {
                        console.error('Failed to parse stats:', e);
                    }
                }
                const slidesRes = await fetch('/api/cms/careers-hero/slides').catch(() => null);
                const slides = slidesRes?.ok ? await slidesRes.json() : [];
                if (Array.isArray(slides)) setHeroSlides(slides);
            } catch (error) {
                console.error('Failed to fetch hero data:', error);
            }
        };
        fetchHeroData();
    }, []);

    // Auto-rotate slides
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlideIndex(prev => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [heroSlides.length]);

    useEffect(() => {
        const fetchJobs = async () => {
            const res = await getJobs(true);
            if (res.success && res.jobs) setJobs(res.jobs);
            setLoading(false);
        };
        fetchJobs();
    }, []);

    const benefits = [
        { icon: Shield, labelAr: 'تأمين صحي شامل', labelEn: 'Health Insurance', descAr: 'تغطية طبية كاملة لك ولعائلتك', descEn: 'Full medical coverage for you and your family' },
        { icon: Zap, labelAr: 'رواتب تنافسية', labelEn: 'Competitive Pay', descAr: 'رواتب مجزية تتناسب مع خبراتك', descEn: 'Rewarding salary matching your experience' },
        { icon: GraduationCap, labelAr: 'تطوير مهني', labelEn: 'Career Growth', descAr: 'برامج تدريب وتأهيل مستمرة', descEn: 'Continuous training and development programs' },
        { icon: Coffee, labelAr: 'بيئة عمل محفزة', labelEn: 'Great Culture', descAr: 'فريق متعاون وأجواء عمل إيجابية', descEn: 'Collaborative team and positive atmosphere' },
        { icon: Globe, labelAr: 'إجازات مدفوعة', labelEn: 'Paid Time Off', descAr: 'إجازات سنوية ورسمية مدفوعة', descEn: 'Generous annual and public holiday leave' },
        { icon: Award, labelAr: 'مكافآت سنوية', labelEn: 'Annual Bonuses', descAr: 'حوافز ومكافآت بناءً على الأداء', descEn: 'Performance-based incentives and rewards' },
    ];

    const processSteps = [
        { step: '01', titleAr: 'تصفح الوظائف', titleEn: 'Browse Jobs', descAr: 'استكشف الفرص المتاحة التي تناسب مهاراتك', descEn: 'Explore available opportunities matching your skills' },
        { step: '02', titleAr: 'قدّم طلبك', titleEn: 'Apply Online', descAr: 'أرسل سيرتك الذاتية وخطاب التغطية', descEn: 'Submit your CV and cover letter online' },
        { step: '03', titleAr: 'المقابلة', titleEn: 'Interview', descAr: 'نتواصل معك لإجراء مقابلة شخصية أو عن بُعد', descEn: "We'll reach out for an in-person or remote interview" },
        { step: '04', titleAr: 'انطلق معنا', titleEn: 'Get Started', descAr: 'ابدأ رحلتك المهنية مع فريق سما', descEn: 'Begin your career journey with Team Sama' },
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 overflow-hidden">

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* HERO SECTION                                              */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="relative min-h-[85vh] flex items-center overflow-hidden pt-20">
                {heroSlides.length > 0 && (
                    <div className="absolute inset-0 overflow-hidden z-0">
                        <HeroSlideshow
                            slides={heroSlides}
                            language={language}
                            isMobile={isMobile}
                            interval={5000}
                            getImageUrl={getLanguageAwareImage}
                            blurAmount={heroSettings.blurAmount}
                            currentIndex={currentSlideIndex}
                            onIndexChange={setCurrentSlideIndex}
                        />
                    </div>
                )}

                {/* Dynamic CMS overlay — respects dashboard settings */}
                <div
                    className="absolute inset-0 z-[2]"
                    style={{ backgroundColor: getOverlayColor(heroSettings.overlayColor, heroSettings.overlayOpacity) }}
                />
                <div className={`absolute inset-0 z-[3] pointer-events-none`} style={{ background: `radial-gradient(ellipse 90% 80% at ${isRTL ? '70%' : '30%'} 50%, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.32) 15%, rgba(0,0,0,0.22) 30%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.01) 75%, transparent 90%)` }} />

                <div className="container mx-auto px-4 relative z-20">
                    <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[60vh]">
                        <motion.div
                            initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className={`max-w-2xl relative ${isRTL ? 'text-right lg:order-2' : 'text-left'}`}
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
                            >
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}>
                                    <Sparkles className="w-4 h-4 text-brand-orange" />
                                </motion.div>
                                <span className="text-sm font-semibold tracking-wide">{isRTL ? heroSettings.badgeAr : heroSettings.badgeEn}</span>
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                    <Rocket className="w-4 h-4 text-brand-orange" />
                                </motion.div>
                            </motion.div>

                            {/* Main Title */}
                            <motion.h1
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.7 }}
                                className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                                style={{ color: heroSettings.titleLine1Color || '#ffffff' }}
                            >
                                {highlightText(
                                    isRTL ? heroSettings.titleAr : heroSettings.titleEn,
                                    isRTL ? heroSettings.highlightWordsAr : heroSettings.highlightWordsEn,
                                    heroSettings.highlightColor || '#F97316'
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

                            {/* CTA Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 }}
                                className="flex flex-wrap gap-4 mb-14"
                                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                            >
                                <motion.a
                                    href="#jobs"
                                    className="px-8 py-4 bg-brand-orange hover:bg-brand-darkOrange text-white font-semibold rounded-xl shadow-lg shadow-brand-orange/25 flex items-center gap-2 transition-colors"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isRTL ? 'تصفح الوظائف' : 'View Openings'}
                                    {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                </motion.a>
                                <motion.a
                                    href="/contact"
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Send className="w-4 h-4" />
                                    {isRTL ? 'أرسل سيرتك الذاتية' : 'Submit Your CV'}
                                </motion.a>
                            </motion.div>

                            {/* Stats Row */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="flex flex-wrap gap-8 md:gap-16"
                                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                            >
                                {heroStats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        className="text-center"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 + index * 0.1, type: 'spring' }}
                                        whileHover={{ scale: 1.1, y: -5 }}
                                    >
                                        <div className="text-3xl md:text-4xl font-bold text-brand-orange mb-1">{stat.value}</div>
                                        <div className="text-sm text-gray-400 font-medium">{isRTL ? stat.labelAr : stat.labelEn}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-10" />
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* BENEFITS SECTION — 3-column grid with glassmorphism       */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white dark:bg-slate-950 relative">
                {/* Subtle background pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-50" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold mb-4">
                            {isRTL ? 'المزايا والمكافآت' : 'Perks & Benefits'}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-marine-900 dark:text-white mb-4">
                            {isRTL ? 'لماذا تعمل معنا؟' : 'Why Work With Us?'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                            {isRTL ? 'نحرص على توفير بيئة عمل متميزة ومزايا تنافسية لجميع أعضاء فريقنا' : 'We provide an outstanding work environment and competitive benefits for every team member'}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 max-w-5xl mx-auto">
                        {benefits.map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.08 }}
                                className="group relative bg-gray-50 dark:bg-slate-900 rounded-2xl p-4 md:p-6 hover:bg-white dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800 hover:border-brand-orange/30 dark:hover:border-brand-orange/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-orange/5 hover:-translate-y-1 active:scale-[0.98] active:-translate-y-0.5"
                            >
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-brand-orange/10 group-hover:bg-brand-orange group-hover:shadow-lg group-hover:shadow-brand-orange/25 flex items-center justify-center mb-3 md:mb-4 transition-all duration-300 shadow-[0_0_20px_rgba(255,120,0,0.12)]">
                                    <benefit.icon className="w-5 h-5 md:w-6 md:h-6 text-brand-orange group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h3 className="text-sm md:text-lg font-bold text-marine-900 dark:text-white mb-1 md:mb-2 group-hover:text-brand-orange transition-colors">
                                    {isRTL ? benefit.labelAr : benefit.labelEn}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed hidden md:block">
                                    {isRTL ? benefit.descAr : benefit.descEn}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* HOW TO APPLY — Horizontal process steps                   */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-marine-900 dark:via-marine-800 dark:to-slate-900 relative overflow-hidden">
                {/* Ambient glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-orange/5 dark:bg-brand-orange/8 rounded-full blur-[150px] pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-orange/10 dark:bg-white/10 backdrop-blur-sm text-brand-orange text-sm font-semibold mb-4 border border-brand-orange/20 dark:border-white/10">
                            {isRTL ? 'خطوات التقديم' : 'How to Apply'}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'رحلتك تبدأ من هنا' : 'Your Journey Starts Here'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                            {isRTL ? 'عملية تقديم بسيطة وسريعة في أربع خطوات فقط' : 'A simple and quick application process in just four steps'}
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto">
                        {processSteps.map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12 }}
                                className="relative text-center group"
                            >
                                {/* Connector line (not on last item) */}
                                {index < processSteps.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-full w-full h-[2px] bg-gradient-to-r from-brand-orange/30 dark:from-brand-orange/40 to-transparent z-0" style={{ transform: isRTL ? 'scaleX(-1)' : 'none' }} />
                                )}

                                <div className="relative z-10 bg-white dark:bg-white/5 backdrop-blur-sm border border-gray-200 dark:border-white/10 rounded-2xl p-4 md:p-6 hover:bg-gray-50 dark:hover:bg-white/10 hover:border-brand-orange/30 dark:hover:border-brand-orange/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] active:-translate-y-0.5">
                                    <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-3 md:mb-4 rounded-xl md:rounded-2xl bg-brand-orange/10 group-hover:bg-brand-orange flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(255,120,0,0.12)]">
                                        <span className="text-xl md:text-2xl font-bold text-brand-orange group-hover:text-white transition-colors">{step.step}</span>
                                    </div>
                                    <h3 className="text-sm md:text-lg font-bold text-gray-900 dark:text-white mb-1 md:mb-2">
                                        {isRTL ? step.titleAr : step.titleEn}
                                    </h3>
                                    <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 leading-relaxed hidden md:block">
                                        {isRTL ? step.descAr : step.descEn}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* OPEN POSITIONS                                            */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section id="jobs" className="py-24 bg-gray-50 dark:bg-slate-900/50 relative">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-marine-100 dark:bg-marine-900/50 text-marine-600 dark:text-marine-400 text-sm font-semibold mb-4">
                            {isRTL ? 'فرص العمل' : 'Career Opportunities'}
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-marine-900 dark:text-white mb-4">
                            {isRTL ? 'الوظائف المتاحة' : 'Open Positions'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                            {isRTL ? 'اكتشف الفرص المتاحة وابدأ مسيرتك المهنية معنا اليوم' : 'Discover available opportunities and start your career journey with us today'}
                        </p>
                    </motion.div>

                    <div className="max-w-4xl mx-auto">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                                    <Loader2 className="w-10 h-10 text-brand-orange" />
                                </motion.div>
                                <p className="mt-4 text-gray-500 text-sm">{isRTL ? 'جاري التحميل...' : 'Loading positions...'}</p>
                            </div>
                        ) : jobs.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-16 bg-white dark:bg-slate-800 rounded-3xl border border-gray-200 dark:border-slate-700"
                            >
                                <div className="w-20 h-20 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <Briefcase className="w-10 h-10 text-gray-400 dark:text-slate-500" />
                                </div>
                                <h4 className="text-xl md:text-2xl font-bold text-marine-900 dark:text-white mb-3">
                                    {isRTL ? 'لا توجد وظائف شاغرة حالياً' : 'No Open Positions Currently'}
                                </h4>
                                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                                    {isRTL ? 'نحن نبحث دائماً عن مواهب مميزة. أرسل سيرتك الذاتية وسنتواصل معك عند توفر فرص جديدة.' : "We're always looking for great talent. Send your CV and we'll reach out when new opportunities arise."}
                                </p>
                                <motion.a
                                    href="/contact"
                                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-darkOrange text-white font-semibold rounded-xl shadow-lg shadow-brand-orange/20 transition-colors"
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Send className="w-4 h-4" />
                                    {isRTL ? 'أرسل سيرتك الذاتية' : 'Submit Your CV'}
                                </motion.a>
                            </motion.div>
                        ) : (
                            <div className="space-y-4">
                                <AnimatePresence>
                                    {jobs.map((job, index) => (
                                        <motion.div
                                            key={job.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: index * 0.08 }}
                                        >
                                            <Link href={`/careers/${job.id}`} className="block group">
                                                <div className="relative bg-white dark:bg-slate-800 p-6 md:p-7 rounded-2xl border border-gray-200 dark:border-slate-700 group-hover:border-brand-orange/40 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-brand-orange/5">
                                                    {/* Subtle shine on hover */}
                                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-brand-orange/3 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                                                        <div className="flex items-start gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-marine-50 dark:bg-slate-700 group-hover:bg-brand-orange flex items-center justify-center flex-shrink-0 transition-all duration-300 shadow-sm">
                                                                <Briefcase className="w-5 h-5 text-marine-600 dark:text-marine-400 group-hover:text-white transition-colors" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-lg font-bold text-marine-900 dark:text-white mb-2 group-hover:text-brand-orange transition-colors">
                                                                    {isRTL ? job.titleAr : job.titleEn}
                                                                </h4>
                                                                <div className="flex flex-wrap gap-2 text-sm">
                                                                    {job.location && (
                                                                        <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                                                                            <MapPin className="w-3.5 h-3.5" />
                                                                            {job.location}
                                                                        </span>
                                                                    )}
                                                                    <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700/50 px-3 py-1 rounded-full">
                                                                        <Clock className="w-3.5 h-3.5" />
                                                                        {job.type.replace('_', ' ')}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-2 text-brand-orange font-semibold text-sm md:text-base group-hover:gap-3 transition-all">
                                                            <span>{isRTL ? 'تقديم الآن' : 'Apply Now'}</span>
                                                            {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════════════ */}
            {/* CTA SECTION                                               */}
            {/* ═══════════════════════════════════════════════════════════ */}
            <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
                {/* Ambient orbs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-marine-500/5 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="max-w-4xl mx-auto bg-gradient-to-br from-marine-900 via-marine-800 to-slate-900 rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
                    >
                        {/* Inner glow */}
                        <div className="absolute top-0 right-1/4 w-64 h-64 bg-brand-orange/10 rounded-full blur-[80px] pointer-events-none" />

                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="inline-block mb-6"
                        >
                            <Star className="w-10 h-10 text-brand-orange" fill="currentColor" />
                        </motion.div>

                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6 relative z-10">
                            {isRTL ? 'مستعد لبدء رحلتك المهنية؟' : 'Ready to Start Your Journey?'}
                        </h2>
                        <p className="text-lg text-gray-300/80 mb-10 max-w-2xl mx-auto font-normal relative z-10">
                            {isRTL
                                ? 'لا تضيع الفرصة - انضم لفريقنا اليوم وكن جزءاً من قصة نجاحنا'
                                : "Don't miss the opportunity - join our team today and be part of our success story"
                            }
                        </p>

                        <div className="flex flex-wrap justify-center gap-4 relative z-10">
                            <motion.a
                                href="#jobs"
                                className="px-8 py-4 bg-brand-orange hover:bg-brand-darkOrange text-white font-semibold rounded-xl shadow-lg shadow-brand-orange/30 flex items-center gap-2 transition-colors"
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isRTL ? 'تصفح الوظائف' : 'Browse Jobs'}
                                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                            </motion.a>
                            <motion.a
                                href="/contact"
                                className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
                                whileHover={{ scale: 1.03, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isRTL ? 'تواصل معنا' : 'Contact Us'}
                            </motion.a>
                        </div>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
