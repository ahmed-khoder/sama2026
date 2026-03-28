'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    Ship, Plane, Truck, FileCheck, Warehouse, Shield,
    ArrowRight, ArrowLeft, CheckCircle2, Sparkles, Globe, Clock,
    Package, Zap, TrendingUp, Anchor, Container, Weight,
    MapPin, Gauge, Fuel, Cog, Users, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import { getLanguageAwareImage } from '@/lib/imageUtils';
import { useIsMobile } from '@/hooks/useIsMobile';

import {
    HeroSettings, HeroSlide,
    defaultHeroSettings, defaultSlides,
    getOverlayColor
} from '@/lib/hero-utils';

// ─── Icon mapping ───────────────────────────────────────────
const iconMap: Record<string, any> = {
    Ship, Plane, Truck, FileCheck, Warehouse, Shield,
    Globe, Clock, Package, Zap, TrendingUp, Anchor, Container, Weight, MapPin, Gauge, Fuel, Cog,
};

// ─── Types ──────────────────────────────────────────────────
interface ServiceFeature {
    ar: string;
    en: string;
}

interface Service {
    id: string;
    slug: string;
    iconName: string;
    titleAr: string;
    titleEn: string;
    shortDescAr: string;
    shortDescEn: string;
    featuresJson: string;
    image?: string;
    imageMobile?: string;
    color: string;
    order: number;
}

// ─── Animation variants ─────────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
    }),
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

// ═══════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════
export default function ServicesPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const isMobile = useIsMobile();

    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [hoveredService, setHoveredService] = useState<string | null>(null);

    // Hero State
    const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(defaultSlides);
    const [heroSettings, setHeroSettings] = useState<HeroSettings>(defaultHeroSettings);
    const [heroIndex, setHeroIndex] = useState(0);

    // Slide navigation helpers
    const goNext = useCallback(() =>
        setHeroIndex(prev => (prev + 1) % Math.max(heroSlides.length, 1)),
        [heroSlides.length]
    );
    const goPrev = useCallback(() =>
        setHeroIndex(prev => (prev - 1 + heroSlides.length) % Math.max(heroSlides.length, 1)),
        [heroSlides.length]
    );

    // Auto-advance hero slides
    useEffect(() => {
        if (heroSlides.length <= 1) return;
        const timer = setInterval(() => {
            setHeroIndex(prev => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [heroSlides.length]);

    // Dynamic section state (from CMS)
    const [fleetTrucks, setFleetTrucks] = useState<any[]>([]);
    const [ports, setPorts] = useState<any[]>([]);
    const [specializedCargo, setSpecializedCargo] = useState<any[]>([]);

    // Fetch dynamic sections (Fleet, Ports, Cargo) — direct fetch for freshness
    useEffect(() => {

        fetch('/api/cms/fleet')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data)) {
                    setFleetTrucks(data.sort((a: any, b: any) => a.order - b.order));
                }
            })
            .catch(() => { });

        fetch('/api/cms/ports')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data)) {
                    setPorts(data.sort((a: any, b: any) => a.order - b.order));
                }
            })
            .catch(() => { });

        fetch('/api/cms/specialized-cargo')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data)) {
                    setSpecializedCargo(data.sort((a: any, b: any) => a.order - b.order));
                }
            })
            .catch(() => { });
    }, []);

    // Fetch services — direct fetch (no client cache) to always show latest active state
    useEffect(() => {
        fetch('/api/cms/services')
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch services');
                return res.json();
            })
            .then(data => {
                const sorted = (data as Service[]).sort((a, b) => a.order - b.order);
                setServices(sorted);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    // Fetch Hero settings & slides — direct fetch for freshness
    useEffect(() => {
        fetch('/api/cms/services-hero/settings')
            .then(res => res.ok ? res.json() : null)
            .then(data => { if (data) setHeroSettings({ ...defaultHeroSettings, ...data }); })
            .catch(() => { });

        fetch('/api/cms/services-hero/slides')
            .then(res => res.ok ? res.json() : [])
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    const validSlides = data.filter((slide: HeroSlide) =>
                        slide.imageDesktopAr || slide.imageDesktopEn || slide.imageMobile
                    );
                    if (validSlides.length > 0) {
                        setHeroSlides(validSlides);
                    }
                }
            })
            .catch(() => { });
    }, []);

    // ─── Hero Stats ─────────────────────────────────────────
    const stats = [
        { icon: Globe, valueAr: '+50', valueEn: '50+', labelAr: 'دولة', labelEn: 'Countries' },
        { icon: Clock, valueAr: '24/7', valueEn: '24/7', labelAr: 'دعم', labelEn: 'Support' },
        { icon: Package, valueAr: '+10K', valueEn: '10K+', labelAr: 'شحنة', labelEn: 'Shipments' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

            {/* ╔══════════════════════════════════════════════════╗
                ║  SECTION 1 — HERO (CMS-driven, unchanged)       ║
                ╚══════════════════════════════════════════════════╝ */}
            <section className="relative min-h-[85vh] pt-20 flex flex-col md:flex-row md:items-center overflow-hidden">
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

                {/* Dynamic CMS overlay — respects dashboard settings */}
                <div
                    className="absolute inset-0 z-[2]"
                    style={{ backgroundColor: getOverlayColor(heroSettings.overlayColor, heroSettings.overlayOpacity) }}
                />
                <div className={`absolute inset-0 z-[3] pointer-events-none`} style={{ background: `radial-gradient(ellipse 90% 80% at ${isRTL ? '70%' : '30%'} 50%, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.32) 15%, rgba(0,0,0,0.22) 30%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.01) 75%, transparent 90%)` }} />

                <div className="container mx-auto px-4 relative z-20 flex-1 flex flex-col md:block pb-2 md:pb-0">
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

                                {/* Title */}
                                <motion.h1
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.7 }}
                                    className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                                    style={{ color: heroSettings.titleLine1Color || '#ffffff' }}
                                >
                                    {(() => {
                                        const title = isRTL ? heroSettings.titleAr : heroSettings.titleEn;
                                        const words = title?.split(' ') || [];
                                        const midpoint = Math.ceil(words.length / 2);
                                        const firstHalf = words.slice(0, midpoint).join(' ');
                                        const secondHalf = words.slice(midpoint).join(' ');
                                        return (
                                            <>
                                                <span style={{ color: heroSettings.titleLine1Color || '#ffffff' }}>
                                                    {firstHalf}
                                                </span>{' '}
                                                <span style={{ color: heroSettings.titleLine2Color || heroSettings.highlightColor || '#F97316' }}>
                                                    {secondHalf}
                                                </span>
                                            </>
                                        );
                                    })()}
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
                                    href="/about"
                                    className="px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-semibold rounded-xl flex items-center gap-2 transition-colors"
                                    whileHover={{ scale: 1.03, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {isRTL ? 'من نحن' : 'About Us'}
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
                                {stats.map((stat, idx) => (
                                    <motion.div
                                        key={idx}
                                        className="text-center"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.9 + idx * 0.1, type: 'spring' }}
                                        whileHover={{ scale: 1.1, y: -5 }}
                                    >
                                        <div className="text-3xl md:text-4xl font-bold text-brand-orange mb-1">{isRTL ? stat.valueAr : stat.valueEn}</div>
                                        <div className="text-sm text-gray-400 font-medium">{isRTL ? stat.labelAr : stat.labelEn}</div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.div>
                    </div>
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 dark:from-slate-950 to-transparent z-10" />
            </section>



            {/* ╔══════════════════════════════════════════════════╗
                ║  SECTION 3 — CORE SERVICES (CMS - PRIMARY)      ║
                ╚══════════════════════════════════════════════════╝ */}
            <section className="py-24 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-marine-500/5 rounded-full blur-[150px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
                            {isRTL ? 'خدماتنا الأساسية' : 'Our Core Services'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'حلول شاملة لكل احتياجاتك' : 'Complete Solutions for All Your Needs'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-normal">
                            {isRTL
                                ? 'نقدم مجموعة متنوعة من الخدمات اللوجستية المتخصصة لتغطية جميع عمليات الشحن والتخليص'
                                : 'We offer a diverse range of specialized logistics services covering all shipping and clearance operations'}
                        </p>
                    </motion.div>

                    {loading ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-[500px] bg-white dark:bg-slate-800 rounded-3xl animate-pulse shadow-lg" />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            variants={staggerContainer}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.1 }}
                            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {services.map((service, index) => {
                                const Icon = iconMap[service.iconName] || Ship;
                                const isHovered = hoveredService === service.id;
                                let features: ServiceFeature[] = [];
                                try {
                                    features = JSON.parse(service.featuresJson);
                                } catch (e) { }

                                return (
                                    <motion.div
                                        key={service.id}
                                        custom={index}
                                        variants={fadeUp}
                                        onHoverStart={() => setHoveredService(service.id)}
                                        onHoverEnd={() => setHoveredService(null)}
                                    >
                                        <Link href={`/services/${service.slug}`}>
                                            <motion.div
                                                className="group relative bg-white dark:bg-[#1e293b]/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-white/10 h-full flex flex-col overflow-hidden cursor-pointer"
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                transition={{ type: "spring", stiffness: 300 }}
                                            >
                                                {/* Hover glow */}
                                                <motion.div
                                                    className="absolute inset-0 rounded-3xl bg-gradient-to-br from-brand-orange/5 to-transparent"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: isHovered ? 1 : 0 }}
                                                />

                                                {/* Image Panel */}
                                                {service.image ? (
                                                    <motion.div
                                                        className="relative w-full h-52 overflow-hidden"
                                                        whileHover={{ scale: 1.02 }}
                                                    >
                                                        <Image
                                                            src={service.image}
                                                            alt={isRTL ? service.titleAr : service.titleEn}
                                                            fill
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                                            loading="lazy"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                                        <div className="absolute bottom-4 right-4 w-12 h-12 rounded-xl bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                                                            <Icon className="w-6 h-6 text-brand-orange" />
                                                        </div>
                                                    </motion.div>
                                                ) : (
                                                    <div className="p-8 pb-0">
                                                        <motion.div
                                                            className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-white shadow-2xl bg-brand-orange"
                                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                                        >
                                                            <div className="absolute inset-0 rounded-2xl blur-xl opacity-50 bg-brand-orange" />
                                                            <Icon className="w-10 h-10 relative z-10" />
                                                        </motion.div>
                                                    </div>
                                                )}

                                                <div className="p-8 flex flex-col flex-grow">
                                                    {/* Title */}
                                                    <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-4 relative z-10 group-hover:text-brand-orange transition-colors">
                                                        {isRTL ? service.titleAr : service.titleEn}
                                                    </h3>

                                                    {/* Description */}
                                                    <p className="text-gray-600 dark:text-gray-400 mb-6 flex-grow leading-relaxed relative z-10 font-normal">
                                                        {isRTL ? service.shortDescAr : service.shortDescEn}
                                                    </p>

                                                    {/* Features */}
                                                    <div className="space-y-3 mb-6 relative z-10">
                                                        {features.slice(0, 3).map((f, i) => (
                                                            <motion.div
                                                                key={i}
                                                                className="flex items-center gap-3"
                                                                initial={{ x: 0 }}
                                                                whileHover={{ x: 5 }}
                                                            >
                                                                <div className="w-6 h-6 rounded-full bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                                                                    <CheckCircle2 className="w-4 h-4 text-brand-orange" />
                                                                </div>
                                                                <span className="text-gray-600 dark:text-gray-400 text-sm">{isRTL ? f.ar : f.en}</span>
                                                            </motion.div>
                                                        ))}
                                                    </div>

                                                    {/* CTA */}
                                                    <motion.div
                                                        className="flex items-center gap-2 font-semibold text-base md:text-lg relative z-10 text-brand-orange mt-auto"
                                                        whileHover={{ x: isRTL ? -5 : 5 }}
                                                    >
                                                        <span>{isRTL ? 'استكشف الخدمة' : 'Explore Service'}</span>
                                                        <motion.div animate={{ x: isHovered ? (isRTL ? -5 : 5) : 0 }}>
                                                            {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                                        </motion.div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>
                                        </Link>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* ╔══════════════════════════════════════════════════╗
                ║  SECTION 4 — SPECIALIZED CARGO                   ║
                ╚══════════════════════════════════════════════════╝ */}
            <section className="py-20 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-14"
                    >
                        <span className="inline-block px-4 py-1.5 bg-marine-500/10 text-marine-600 dark:text-marine-400 rounded-full text-sm font-semibold mb-4">
                            {isRTL ? 'تخصصاتنا' : 'Our Specializations'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'نقل متخصص للأحمال الاستثنائية' : 'Specialized Transport for Exceptional Loads'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-normal">
                            {isRTL
                                ? 'أسطول وطاقم مُجهز لنقل البضائع الثقيلة والحاويات بأعلى معايير السلامة'
                                : 'Fleet and crew equipped for heavy cargo and container transport at the highest safety standards'}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {specializedCargo.map((cargo: any, idx: number) => {
                            const CargoIcon = iconMap[cargo.icon] || Package;
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.15 }}
                                    className="group relative bg-white dark:bg-slate-800/80 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl transition-shadow overflow-hidden"
                                >
                                    {/* Decorative top bar */}
                                    <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cargo.gradient || cargo.color}`} />

                                    <div className="flex items-start justify-between mb-6">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cargo.gradient || cargo.color} flex items-center justify-center shadow-lg`}>
                                            <CargoIcon className="w-8 h-8 text-white" />
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${cargo.gradient || cargo.color}`}>
                                            {isRTL ? cargo.badgeAr : cargo.badgeEn}
                                        </span>
                                    </div>

                                    <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 group-hover:text-brand-orange transition-colors">
                                        {isRTL ? cargo.titleAr : cargo.titleEn}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {isRTL ? cargo.descAr : cargo.descEn}
                                    </p>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ╔══════════════════════════════════════════════════╗
                ║  SECTION 5 — OUR FLEET                           ║
                ╚══════════════════════════════════════════════════╝ */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-marine-500/5 rounded-full blur-[150px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
                            {isRTL ? 'أسطولنا' : 'Our Fleet'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'قوة النقل التي نعتمد عليها' : 'The Transport Power We Rely On'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-normal">
                            {isRTL
                                ? 'أسطول من أقوى الشاحنات الأوروبية المصممة للأحمال الثقيلة والمسافات الطويلة'
                                : 'A fleet of Europe\'s most powerful trucks engineered for heavy loads and long distances'}
                        </p>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {fleetTrucks.map((truck: any, idx: number) => {
                            let specs: any[] = [];
                            try { specs = typeof truck.specsJson === 'string' ? JSON.parse(truck.specsJson) : (truck.specsJson || []); } catch (e) { }
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: idx === 0 ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2, duration: 0.6 }}
                                    className="group bg-white dark:bg-slate-800/80 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl transition-all"
                                >
                                    {/* Truck image */}
                                    <div className="relative h-56 md:h-64 overflow-hidden">
                                        <Image
                                            src={truck.image}
                                            alt={isRTL ? truck.nameAr : truck.nameEn}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                                {isRTL ? truck.nameAr : truck.nameEn}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Specs & description */}
                                    <div className="p-8">
                                        <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                                            {isRTL ? truck.descAr : truck.descEn}
                                        </p>

                                        <div className="grid grid-cols-2 gap-3">
                                            {specs.map((spec: any, sIdx: number) => (
                                                <div
                                                    key={sIdx}
                                                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl"
                                                >
                                                    <div className="w-9 h-9 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                                                        {sIdx === 0 && <Cog className="w-4 h-4 text-brand-orange" />}
                                                        {sIdx === 1 && <Gauge className="w-4 h-4 text-brand-orange" />}
                                                        {sIdx === 2 && <Weight className="w-4 h-4 text-brand-orange" />}
                                                        {sIdx === 3 && <Fuel className="w-4 h-4 text-brand-orange" />}
                                                    </div>
                                                    <div>
                                                        <div className="text-[11px] text-gray-500 dark:text-gray-500 uppercase tracking-wide">
                                                            {isRTL ? spec.labelAr : spec.labelEn}
                                                        </div>
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {isRTL ? spec.valueAr : spec.valueEn}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ╔══════════════════════════════════════════════════╗
                ║  SECTION 6 — PORT OPERATIONS                     ║
                ╚══════════════════════════════════════════════════╝ */}
            <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-marine-900 dark:via-marine-800 dark:to-slate-900 relative overflow-hidden">
                {/* Animated background pattern */}
                <motion.div
                    className="absolute inset-0 opacity-5 dark:opacity-20"
                    animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
                    transition={{ duration: 30, repeat: Infinity, repeatType: 'reverse' }}
                    style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.05\'%3E%3Cpath d=\'m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm-30 30v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm60 0v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                    }}
                />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 dark:bg-brand-orange/20 text-brand-orange rounded-full text-sm font-semibold mb-4">
                            <Anchor className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                            {isRTL ? 'تواجدنا في الموانئ' : 'Port Presence'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'هيمنة استراتيجية في موانئ مصر' : 'Strategic Dominance in Egypt\'s Ports'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300/80 text-base md:text-lg max-w-2xl mx-auto font-normal">
                            {isRTL
                                ? 'تواجد استراتيجي في أهم الموانئ المصرية على قناة السويس يمنحنا ميزة تنافسية فريدة'
                                : 'Strategic presence in Egypt\'s most vital Suez Canal ports gives us a unique competitive edge'}
                        </p>
                    </motion.div>

                    <div className="flex flex-wrap justify-center gap-8">
                        {ports.map((port: any, idx: number) => {
                            let factsAr: string[] = [];
                            let factsEn: string[] = [];
                            try {
                                const parsed = typeof port.factsJson === 'string' ? JSON.parse(port.factsJson) : (port.factsJson || []);
                                factsAr = parsed.map((f: any) => f.ar || f);
                                factsEn = parsed.map((f: any) => f.en || f);
                            } catch (e) { }
                            return (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.2 }}
                                    className="group relative rounded-3xl overflow-hidden w-full lg:w-[calc(50%-1rem)] shadow-xl border border-gray-200/50 dark:border-transparent"
                                >
                                    {/* Background image */}
                                    <div className="relative h-[420px]">
                                        <Image
                                            src={port.image}
                                            alt={isRTL ? port.nameAr : port.nameEn}
                                            fill
                                            sizes="(max-width: 1024px) 100vw, 50vw"
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

                                        {/* Content overlay */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                                            <div className="flex items-center gap-2 mb-3">
                                                <MapPin className="w-5 h-5 text-brand-orange" />
                                                <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                                    {isRTL ? port.nameAr : port.nameEn}
                                                </h3>
                                            </div>

                                            <p className="text-gray-300/80 mb-5 leading-relaxed font-normal">
                                                {isRTL ? port.descAr : port.descEn}
                                            </p>

                                            <div className="flex flex-wrap gap-2">
                                                {(isRTL ? factsAr : factsEn).map((fact: string, fIdx: number) => (
                                                    <span
                                                        key={fIdx}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-sm text-white border border-white/10"
                                                    >
                                                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-orange" />
                                                        {fact}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ╔══════════════════════════════════════════════════╗
                ║  SECTION 7 — WHY CHOOSE US / CTA                ║
                ╚══════════════════════════════════════════════════╝ */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-orange/5 rounded-full blur-[200px]" />
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-marine-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-[1400px] mx-auto px-4 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">

                        {/* ── Left Flanking Images (hidden on mobile) ── */}
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="hidden lg:flex lg:col-span-3 flex-col gap-4"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                                <Image
                                    src="/images/ports/1772066525895-w995dr.webp"
                                    alt="Port operations"
                                    width={400}
                                    height={250}
                                    className="w-full h-[250px] object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                                <Image
                                    src="/images/fleet/1772066633950-8rp7lg.webp"
                                    alt="Fleet transport"
                                    width={400}
                                    height={250}
                                    className="w-full h-[250px] object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                        </motion.div>

                        {/* ── Center Content Column ── */}
                        <div className="lg:col-span-6">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="text-center mb-10"
                            >
                                <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
                                    {isRTL ? 'لماذا نحن؟' : 'Why Choose Us?'}
                                </span>
                                <h2 className="text-2xl md:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 leading-tight">
                                    {isRTL ? 'نحن نصنع الفرق في عالم اللوجستيات' : 'We Make the Difference in Logistics'}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400 text-base max-w-xl mx-auto leading-relaxed">
                                    {isRTL
                                        ? 'خبرة واسعة ومعايير عالمية تجعلنا الخيار الأول في النقل واللوجستيات'
                                        : 'Extensive experience and global standards make us the top choice in transport & logistics'}
                                </p>
                            </motion.div>

                            {/* Feature Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-8">
                                {[
                                    { icon: Zap, titleAr: 'سرعة التنفيذ', titleEn: 'Fast Execution', descAr: 'نضمن تسليم شحناتك في أسرع وقت ممكن مع تتبع لحظي', descEn: 'We guarantee delivery in the fastest time with real-time tracking' },
                                    { icon: Shield, titleAr: 'أمان تام', titleEn: 'Complete Security', descAr: 'تأمين شامل على جميع الشحنات مع معايير سلامة صارمة', descEn: 'Comprehensive insurance on all shipments with strict safety standards' },
                                    { icon: TrendingUp, titleAr: 'أسعار تنافسية', titleEn: 'Competitive Prices', descAr: 'أفضل الأسعار في السوق مع جودة خدمة لا تُضاهى', descEn: 'Best market prices with unmatched service quality' },
                                ].map((item, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 25 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group relative text-center p-6 bg-white dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-white/10 shadow-lg hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] active:-translate-y-0.5 transition-all duration-300"
                                    >
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-brand-orange to-brand-gold rounded-b-full opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="w-14 h-14 mx-auto mb-4 bg-gradient-to-br from-brand-orange/15 to-brand-gold/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_20px_rgba(255,120,0,0.15)]">
                                            <item.icon className="w-7 h-7 text-brand-orange" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-brand-orange transition-colors">
                                            {isRTL ? item.titleAr : item.titleEn}
                                        </h4>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-xs">
                                            {isRTL ? item.descAr : item.descEn}
                                        </p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Mini Stats */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="flex flex-wrap justify-center gap-5 md:gap-8 mb-8"
                            >
                                {[
                                    { valueAr: '+10K', valueEn: '10K+', labelAr: 'شحنة ناجحة', labelEn: 'Successful Shipments' },
                                    { valueAr: '24/7', valueEn: '24/7', labelAr: 'تتبع لحظي', labelEn: 'Real-Time Tracking' },
                                    { valueAr: '+50', valueEn: '50+', labelAr: 'دولة تغطية', labelEn: 'Countries Covered' },
                                    { valueAr: '99%', valueEn: '99%', labelAr: 'رضا العملاء', labelEn: 'Client Satisfaction' },
                                ].map((stat, idx) => (
                                    <div key={idx} className="text-center">
                                        <div className="text-xl md:text-2xl font-bold text-brand-orange">
                                            {isRTL ? stat.valueAr : stat.valueEn}
                                        </div>
                                        <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                                            {isRTL ? stat.labelAr : stat.labelEn}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>

                            {/* CTA Banner */}
                            <motion.div
                                initial={{ opacity: 0, y: 15 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-br from-marine-800 to-marine-950 rounded-2xl p-6 md:p-8 border border-white/10 shadow-2xl"
                            >
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                    <div className={`text-center lg:text-start ${isRTL ? 'lg:text-right' : ''}`}>
                                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-white mb-1">
                                            {isRTL ? 'جاهز للبدء؟' : 'Ready to Get Started?'}
                                        </h3>
                                        <p className="text-gray-300/80 text-sm font-normal">
                                            {isRTL
                                                ? 'تواصل معنا اليوم واحصل على عرض سعر مخصص لشحنتك'
                                                : 'Contact us today and get a custom quote for your shipment'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                                        <Link
                                            href="/contact"
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-darkOrange text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-orange/30 hover:shadow-xl hover:shadow-brand-orange/40 text-sm"
                                        >
                                            {isRTL ? 'تواصل معنا' : 'Contact Us'}
                                            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                        </Link>
                                        <Link
                                            href="/#team"
                                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all backdrop-blur-sm border border-white/20 text-sm"
                                        >
                                            {isRTL ? 'فريق العمل' : 'Our Team'}
                                            <Users className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* ── Right Flanking Images (hidden on mobile) ── */}
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="hidden lg:flex lg:col-span-3 flex-col gap-4"
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                                <Image
                                    src="/images/ports/1772066564938-tvcp0f.webp"
                                    alt="Container port"
                                    width={400}
                                    height={250}
                                    className="w-full h-[250px] object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                            <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                                <Image
                                    src="/images/ports/1772066740278-m128a9.webp"
                                    alt="Shipping operations"
                                    width={400}
                                    height={250}
                                    className="w-full h-[250px] object-cover group-hover:scale-105 transition-transform duration-700"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                        </motion.div>

                    </div>
                </div>
            </section>
        </div>
    );
}
