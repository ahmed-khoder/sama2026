'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    Truck, Shield, CheckCircle2, ArrowRight, ArrowLeft,
    Clock, Package, Phone, Award, MessageCircle,
    AlertTriangle, Factory, MapPin, Container,
    CalendarClock, Cog, Users, Boxes,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import { getSmartPhoneHref, getSmartPhoneProps, getWhatsAppHref } from '@/lib/smart-phone';
import { trackEvent, trackConversion } from '@/components/GoogleAnalytics';
import type { MarbleTransportContent } from '@/lib/schemas/marble-transport.schema';

// ─── WhatsApp Config ──────────────────────────────────────
const WHATSAPP_NUMBER = '201221300036';

// ─── Static Content (Bilingual Copywriting) ──────────────
const content = {
    hero: {
        badgeAr: 'متخصصون في خدمة القطاع الصناعي',
        badgeEn: 'Specialized in Industrial Sector Services',
        titleLine1Ar: 'نقل حاويات المصانع',
        titleLine1En: 'Factory Container Transport',
        titleLine2Ar: 'في جميع المناطق الصناعية',
        titleLine2En: 'Across All Industrial Zones',
        descAr: 'خدمات نقل حاويات 40 قدم والبضائع الصناعية من وإلى المصانع والمجمعات الصناعية في جميع المحافظات بكفاءة تشغيلية عالية والتزام كامل بالمواعيد.',
        descEn: 'Professional 40ft container and industrial cargo transport to and from factories and industrial complexes across all governorates with high operational efficiency and full schedule commitment.',
    },
    stats: [
        { valueAr: '+25', valueEn: '25+', labelAr: 'سنة خبرة', labelEn: 'Years Experience' },
        { valueAr: '15+', valueEn: '15+', labelAr: 'شاحنة مخصصة', labelEn: 'Dedicated Trucks' },
        { valueAr: '+500', valueEn: '500+', labelAr: 'مصنع وشركة', labelEn: 'Factories & Companies' },
        { valueAr: '98%', valueEn: '98%', labelAr: 'التزام بالمواعيد', labelEn: 'On-Time Rate' },
    ],
    painPoints: [
        {
            icon: Clock,
            titleAr: 'تأخير في استلام أو تسليم الحاويات',
            titleEn: 'Container Pickup & Delivery Delays',
            descAr: 'التأخير يُعطل خطوط الإنتاج ويكلف المصنع خسائر يومية. نضمن مواعيد محددة ومنتظمة لكل شحنة.',
            descEn: 'Delays disrupt production lines and cost factories daily losses. We guarantee fixed, regular schedules for every shipment.',
        },
        {
            icon: Cog,
            titleAr: 'صعوبة التنسيق داخل المناطق الصناعية',
            titleEn: 'Complex Industrial Zone Coordination',
            descAr: 'المناطق الصناعية لها متطلبات دخول وتصاريح خاصة. فريقنا يعرف كل منطقة وإجراءاتها بالتفصيل.',
            descEn: 'Industrial zones have special entry requirements and permits. Our team knows every zone and its procedures in detail.',
        },
        {
            icon: AlertTriangle,
            titleAr: 'تلف أو تحميل غير آمن',
            titleEn: 'Damaged Cargo or Unsafe Loading',
            descAr: 'التحميل العشوائي يسبب تلف المنتجات وخسائر مالية. نستخدم فرق تحميل متخصصة ومعدات مناسبة لكل نوع بضاعة.',
            descEn: 'Random loading causes product damage and financial losses. We use specialized loading teams and equipment suited for each cargo type.',
        },
        {
            icon: CalendarClock,
            titleAr: 'عدم الالتزام بالمواعيد',
            titleEn: 'Schedule Non-Compliance',
            descAr: 'المصانع تعمل بجداول إنتاج محددة. أي تأخير يعني توقف. نعمل بنظام تشغيل منتظم مع التزام صارم بالمواعيد.',
            descEn: 'Factories operate on tight production schedules. Any delay means downtime. We operate with regular schedules and strict time commitments.',
        },
    ],
    whyUs: [
        {
            icon: Truck,
            titleAr: 'أسطول مخصص للحاويات',
            titleEn: 'Dedicated Container Fleet',
            descAr: 'أسطول من الشاحنات الثقيلة المجهزة خصيصاً لنقل حاويات 20 و40 قدم بكفاءة وأمان.',
            descEn: 'A fleet of heavy trucks specially equipped for efficient and safe transport of 20ft and 40ft containers.',
        },
        {
            icon: Factory,
            titleAr: 'خبرة في التعامل مع المصانع',
            titleEn: 'Factory Operations Expertise',
            descAr: 'نفهم متطلبات القطاع الصناعي — من جداول الإنتاج والتحميل إلى إجراءات المناطق الصناعية.',
            descEn: 'We understand industrial sector needs — from production schedules and loading to industrial zone procedures.',
        },
        {
            icon: Clock,
            titleAr: 'التزام بالمواعيد',
            titleEn: 'On-Time Commitment',
            descAr: 'نسبة التزام 98% بالمواعيد المحددة. خطوط إنتاجك لن تتوقف بسبب تأخير النقل.',
            descEn: '98% on-time delivery rate. Your production lines won\'t stop due to transport delays.',
        },
        {
            icon: MapPin,
            titleAr: 'تغطية جميع المناطق الصناعية',
            titleEn: 'Full Industrial Zone Coverage',
            descAr: 'العاشر من رمضان، 6 أكتوبر، مدينة السادات، بورسعيد، برج العرب — نغطي كل المناطق الصناعية.',
            descEn: '10th of Ramadan, 6th of October, Sadat City, Port Said, Borg El Arab — we cover all industrial zones.',
        },
    ],
    services: [
        {
            icon: Container,
            titleAr: 'نقل حاويات 40 قدم',
            titleEn: '40ft Container Transport',
            descAr: 'نقل حاويات 40 قدم الكاملة من وإلى المصانع والموانئ بشاحنات مجهزة وسائقين محترفين.',
            descEn: 'Full 40ft container transport to and from factories and ports with equipped trucks and professional drivers.',
        },
        {
            icon: Boxes,
            titleAr: 'نقل منتجات صناعية',
            titleEn: 'Industrial Product Transport',
            descAr: 'نقل المنتجات الصناعية بمختلف أنواعها مع تأمين شامل وتحميل احترافي يحافظ على سلامة البضاعة.',
            descEn: 'Transport of industrial products of all types with comprehensive insurance and professional loading that preserves cargo integrity.',
        },
        {
            icon: MapPin,
            titleAr: 'نقل من وإلى المناطق الصناعية',
            titleEn: 'Industrial Zone Logistics',
            descAr: 'خدمات نقل متكاملة تربط المصانع بالموانئ ومراكز التوزيع عبر جميع المحافظات المصرية.',
            descEn: 'Integrated transport services connecting factories to ports and distribution centers across all Egyptian governorates.',
        },
        {
            icon: CalendarClock,
            titleAr: 'تشغيل منتظم للمصانع',
            titleEn: 'Regular Factory Operations',
            descAr: 'عقود تشغيل يومية وأسبوعية مصممة حسب جدول إنتاج المصنع مع مرونة كاملة في التعديل.',
            descEn: 'Daily and weekly operation contracts designed around the factory\'s production schedule with full flexibility for adjustments.',
        },
    ],
    trust: [
        { valueAr: '+25', valueEn: '25+', labelAr: 'سنة في السوق المصري', labelEn: 'Years in Egyptian Market', icon: Award },
        { valueAr: '15+', valueEn: '15+', labelAr: 'شاحنة ثقيلة مجهزة', labelEn: 'Equipped Heavy Trucks', icon: Truck },
        { valueAr: '+500', valueEn: '500+', labelAr: 'مصنع وشركة صناعية', labelEn: 'Factories & Industrial Companies', icon: Users },
        { valueAr: '3', valueEn: '3', labelAr: 'موانئ رئيسية مغطاة', labelEn: 'Major Ports Covered', icon: MapPin },
    ],
    zones: [
        { ar: 'العاشر من رمضان', en: '10th of Ramadan' },
        { ar: '6 أكتوبر', en: '6th of October' },
        { ar: 'مدينة السادات', en: 'Sadat City' },
        { ar: 'بورسعيد الصناعية', en: 'Port Said Industrial' },
        { ar: 'برج العرب', en: 'Borg El Arab' },
        { ar: 'المنطقة الصناعية بالعين السخنة', en: 'Ain Sokhna Industrial Zone' },
        { ar: 'بدر', en: 'Badr City' },
        { ar: 'المنوفية الصناعية', en: 'Menoufia Industrial' },
    ],
};

// ─── Icons (not serializable, attached at render) ────────
const staticContent = {
    painPointIcons: [Clock, Cog, AlertTriangle, CalendarClock],
    whyUsIcons: [Truck, Factory, Clock, MapPin],
    serviceIcons: [Container, Boxes, MapPin, CalendarClock],
    trustIcons: [Award, Truck, Users, MapPin],
};

// ─── Animation Variants ──────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
    }),
};

// ═══════════════════════════════════════════════════════════
//  CLIENT COMPONENT
// ═══════════════════════════════════════════════════════════
export default function IndustrialTransportClient({ content: cms }: { content: MarbleTransportContent }) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const whatsappUrl = getWhatsAppHref(
        WHATSAPP_NUMBER,
        isRTL
            ? 'مرحباً سما لوجيستك، أحتاج عرض سعر لنقل حاويات من المصنع إلى الميناء. المنطقة الصناعية: [___]. ما هي التفاصيل المطلوبة؟'
            : 'Hi SAMA Logistics, I need a quote for factory container transport. Industrial zone: [___]. What details do you need?'
    );
    const t = (ar: string, en: string) => isRTL ? ar : en;

    const smartPhoneHref = getSmartPhoneHref(
        '+201221300036',
        isRTL ? 'مرحباً، أريد الاستفسار عن عقود التشغيل المنتظم للمصانع' : 'Hi, I want to inquire about regular factory operation contracts'
    );
    const smartPhoneProps = getSmartPhoneProps();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

            {/* ═══════════════════════════════════════════════════
                 1. BREADCRUMB
                ═══════════════════════════════════════════════════ */}
            <nav aria-label="Breadcrumb" className="border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <ol className="flex items-center gap-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href="/" itemProp="item" className="text-gray-600 dark:text-gray-400 hover:text-brand-orange transition-colors">
                                <span itemProp="name">{t('الرئيسية', 'Home')}</span>
                            </Link>
                            <meta itemProp="position" content="1" />
                        </li>
                        <span className="text-gray-400">/</span>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href="/services" itemProp="item" className="text-gray-600 dark:text-gray-400 hover:text-brand-orange transition-colors">
                                <span itemProp="name">{t('الخدمات', 'Services')}</span>
                            </Link>
                            <meta itemProp="position" content="2" />
                        </li>
                        <span className="text-gray-400">/</span>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <span itemProp="name" className="text-brand-orange font-semibold">{t('نقل حاويات المصانع', 'Industrial Transport')}</span>
                            <meta itemProp="position" content="3" />
                        </li>
                    </ol>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════════
                 2. HERO SECTION
                ═══════════════════════════════════════════════════ */}
            <header className="relative min-h-[80vh] flex items-center overflow-hidden">
                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-marine-900 via-marine-800 to-slate-900" />
                <motion.div
                    className="absolute inset-0"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ filter: cms.hero.blurAmount > 0 ? `blur(${cms.hero.blurAmount}px)` : undefined }}
                >
                    <Image
                        src={cms.hero.image}
                        alt={t('شاحنات نقل حاويات في منطقة صناعية', 'Container transport trucks at industrial zone')}
                        fill
                        className="object-cover"
                        priority
                        sizes="100vw"
                    />
                </motion.div>
                <div className="absolute inset-0" style={{ backgroundColor: cms.hero.overlayColor === 'orange' ? 'rgba(249,115,22,0.6)' : cms.hero.overlayColor === 'dark' ? 'rgba(0,0,0,0.6)' : 'rgba(3,105,161,0.6)', opacity: cms.hero.overlayOpacity }} />
                <div className="absolute inset-0 bg-gradient-to-t from-marine-950/80 via-marine-900/40 to-transparent" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[200px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-marine-500/15 rounded-full blur-[150px]" />

                <div className="container mx-auto px-4 relative z-10 py-20 md:py-0">
                    <div className="max-w-4xl">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
                        >
                            <Factory className="w-4 h-4 text-brand-orange" />
                            <span className="text-sm font-semibold tracking-wide">
                                {t(cms.hero.badgeAr, cms.hero.badgeEn)}
                            </span>
                        </motion.div>

                        {/* H1 Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                        >
                            <span className="text-white">
                                {t(cms.hero.titleLine1Ar, cms.hero.titleLine1En)}
                            </span>
                            <br />
                            <span className="text-brand-orange">
                                {t(cms.hero.titleLine2Ar, cms.hero.titleLine2En)}
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl font-normal"
                        >
                            {t(cms.hero.descAr, cms.hero.descEn)}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-4"
                            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                        >
                            <Link
                                href="/contact?tab=quote"
                                onClick={() => trackEvent('quote_click', { page: 'industrial-transport', location: 'hero' })}
                                className="px-8 py-4 bg-brand-orange hover:bg-brand-darkOrange text-white font-semibold rounded-xl shadow-lg shadow-brand-orange/25 flex items-center gap-2 transition-all hover:scale-[1.03] hover:-translate-y-0.5"
                            >
                                {t('اطلب عرض سعر', 'Request a Quote')}
                                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                            </Link>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => { trackEvent('whatsapp_click', { page: 'industrial-transport', location: 'hero' }); trackConversion('whatsapp_open', { page: 'industrial-transport', location: 'hero' }); }}
                                className="px-8 py-4 bg-[#25D366] hover:bg-[#1fba59] text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.03] hover:-translate-y-0.5"
                            >
                                <MessageCircle className="w-5 h-5" />
                                {t('تواصل واتساب', 'WhatsApp Us')}
                            </a>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════
                 3. STATS BAR
                ═══════════════════════════════════════════════════ */}
            <section className="relative z-10 -mt-8 md:-mt-10 pb-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        {cms.stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-md border border-gray-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
                            >
                                <AnimatedCounter value={t(stat.valueAr, stat.valueEn)} className="text-2xl md:text-3xl font-black text-brand-orange mb-1" />
                                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {t(stat.labelAr, stat.labelEn)}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 4. PAIN POINTS
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold mb-4">
                            {t('تحديات القطاع الصناعي', 'Industrial Sector Challenges')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {t('مشاكل تكلف المصانع خسائر يومية', 'Problems Costing Factories Daily Losses')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-normal">
                            {t(
                                'كل تأخير في النقل يعني توقف في الإنتاج. هكذا نحل هذه المشاكل.',
                                'Every transport delay means production downtime. Here\'s how we solve these problems.'
                            )}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-5">
                        {cms.problems.items.map((pain, idx) => {const PainIcon = staticContent.painPointIcons[idx] || AlertTriangle; return (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="rounded-2xl p-5 md:p-6 border border-gray-200 dark:border-slate-700 shadow-md bg-white dark:bg-slate-900"
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                                        <PainIcon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-800 dark:text-white">
                                        {t(pain.titleAr, pain.titleEn)}
                                    </h3>
                                </div>
                                <div className={`${isRTL ? 'border-r-2 pr-4' : 'border-l-2 pl-4'} border-emerald-400 py-1`}>
                                    <div className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                                            {t(pain.descAr, pain.descEn)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );})}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 5. WHY US
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-marine-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4 border border-brand-orange/20">
                            {t('لماذا سما لوجيستك؟', 'Why SAMA Logistics?')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                            {t('الشريك اللوجستي الأمثل للقطاع الصناعي', 'The Ideal Logistics Partner for the Industrial Sector')}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-normal">
                            {t(
                                'خبرة 25 سنة في خدمة المصانع وفهم عميق لمتطلبات القطاع الصناعي',
                                '25 years of experience serving factories and deep understanding of industrial sector requirements'
                            )}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                        {cms.features.cards.map((item, idx) => {const WhyIcon = staticContent.whyUsIcons[idx] || Shield; return (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="group relative bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-6 md:p-8 shadow-md border border-gray-200/80 dark:border-slate-700 hover:shadow-lg hover:border-brand-orange/20 transition-all duration-300"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-orange rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-4 md:gap-5">
                                    <div className="w-13 h-13 md:w-16 md:h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange transition-all duration-300 flex-shrink-0 shadow-sm">
                                        <WhyIcon className="w-7 h-7 md:w-8 md:h-8 text-brand-orange group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 group-hover:text-brand-orange transition-colors">
                                            {t(item.titleAr, item.titleEn)}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-base font-normal">
                                            {t(item.descAr, item.descEn)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        );})}
                    </div>

                    {/* Industrial Zones Coverage */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-12 bg-white dark:bg-slate-800/80 rounded-3xl p-6 md:p-10 border border-gray-200/80 dark:border-slate-700 shadow-md"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-marine-500/10 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-marine-600 dark:text-marine-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t('المناطق الصناعية المغطاة', 'Industrial Zones Covered')}
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {content.zones.map((zone, idx) => (
                                <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600 hover:border-brand-orange/50 hover:bg-brand-orange/5 transition-colors"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-brand-orange flex-shrink-0" />
                                    {t(zone.ar, zone.en)}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 6. SERVICES
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4 border border-brand-orange/20">
                            <Package className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                            {t('خدماتنا', 'Our Services')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                            {t('حلول نقل مصممة للقطاع الصناعي', 'Transport Solutions Designed for Industry')}
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                        {cms.solutions.map((service, idx) => {const SvcIcon = staticContent.serviceIcons[idx] || Package; return (
                            <motion.article
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="group relative bg-white dark:bg-slate-800/80 rounded-3xl p-6 md:p-8 shadow-md border border-gray-200/80 dark:border-slate-700 hover:shadow-lg hover:border-brand-orange/20 transition-all duration-300"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1 bg-brand-orange rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-4 md:gap-5">
                                    <div className="w-13 h-13 md:w-16 md:h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center group-hover:bg-brand-orange transition-all duration-300 flex-shrink-0 shadow-sm">
                                        <SvcIcon className="w-7 h-7 md:w-8 md:h-8 text-brand-orange group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2 group-hover:text-brand-orange transition-colors">
                                            {t(service.titleAr, service.titleEn)}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm md:text-base font-normal">
                                            {t(service.descAr, service.descEn)}
                                        </p>
                                    </div>
                                </div>
                            </motion.article>
                        );})}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 7. TRUST / SOCIAL PROOF
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-marine-900 dark:bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-marine-400/5 rounded-full blur-[150px]" />
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-white/10 text-white/90 rounded-full text-sm font-semibold mb-4 border border-white/15">
                            {t('أرقام تتحدث', 'Numbers That Speak')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4">
                            {t('لماذا تثق المصانع بسما لوجيستك', 'Why Factories Trust SAMA Logistics')}
                        </h2>
                    </motion.div>

                    {/* Trust Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
                        {cms.trust.map((item, idx) => {const TrustIcon = staticContent.trustIcons[idx] || Award; return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group text-center p-6 md:p-8 bg-white/5 backdrop-blur-sm rounded-3xl border border-white/10 hover:border-white/20 transition-all duration-300"
                            >
                                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 md:mb-5 bg-brand-orange/15 rounded-2xl flex items-center justify-center group-hover:bg-brand-orange transition-all duration-300">
                                    <TrustIcon className="w-6 h-6 md:w-8 md:h-8 text-brand-orange group-hover:text-white transition-colors" />
                                </div>
                                <AnimatedCounter value={t(item.valueAr, item.valueEn)} className="text-3xl md:text-4xl font-black text-brand-orange mb-2" />
                                <p className="text-xs md:text-sm text-gray-300 font-medium">
                                    {t(item.labelAr, item.labelEn)}
                                </p>
                            </motion.div>
                        );})}
                    </div>

                    {/* Fleet Images */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group relative rounded-3xl overflow-hidden shadow-md h-[280px] md:h-[320px]"
                        >
                            <Image
                                src="/images/fleet/1772066646569-ggbkgl.webp"
                                alt={t('أسطول شاحنات سما لوجيستك', 'SAMA Logistics truck fleet')}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {t('أسطول مجهز للأحمال الثقيلة', 'Fleet Equipped for Heavy Loads')}
                                </h3>
                                <p className="text-gray-300/80 text-sm">
                                    {t('شاحنات أوروبية بقدرات تحميل حتى 60 طن', 'European trucks with load capacity up to 60 tons')}
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group relative rounded-3xl overflow-hidden shadow-md h-[280px] md:h-[320px]"
                        >
                            <Image
                                src="/images/ports/1772066525895-w995dr.webp"
                                alt={t('عمليات نقل حاويات في الميناء', 'Container transport operations at port')}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {t('عمليات موانئ متكاملة', 'Integrated Port Operations')}
                                </h3>
                                <p className="text-gray-300/80 text-sm">
                                    {t('تواجد تشغيلي في 3 موانئ رئيسية', 'Operational presence at 3 major ports')}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 8. SAFETY FEATURES
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-slate-50 dark:bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px]" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-marine-500/10 text-marine-600 dark:text-marine-400 rounded-full text-sm font-semibold mb-4 border border-marine-500/15">
                            {t('ما تحصل عليه', 'What You Get')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                            {t('معايير أمان وجودة لا نتنازل عنها', 'Safety & Quality Standards We Never Compromise')}
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Safety Group */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/15 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('الأمان والتأمين', 'Safety & Insurance')}</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { ar: 'تأمين شامل على كل شحنة صناعية', en: 'Comprehensive insurance on every industrial shipment' },
                                    { ar: 'فرق تحميل متخصصة مدربة على المنتجات الصناعية', en: 'Specialized loading teams trained for industrial products' },
                                    { ar: 'تثبيت احترافي يمنع التلف أثناء النقل', en: 'Professional securing that prevents damage during transport' },
                                    { ar: 'تقارير حالة الشحنة عند الاستلام والتسليم', en: 'Shipment condition reports at pickup and delivery' },
                                ].map((f, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800/70 rounded-xl border border-gray-200/80 dark:border-white/10 hover:border-emerald-300/50 transition-all duration-200">
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{t(f.ar, f.en)}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Efficiency Group */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('الكفاءة التشغيلية', 'Operational Efficiency')}</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { ar: 'جدولة مرنة تتوافق مع إنتاج المصنع', en: 'Flexible scheduling aligned with factory production' },
                                    { ar: 'مدير حساب مخصص — اتصال واحد لكل شيء', en: 'Dedicated account manager — one call for everything' },
                                    { ar: 'تتبع GPS لحظي لكل شاحنة', en: 'Real-time GPS tracking for every truck' },
                                    { ar: 'تقارير أداء شهرية للعقود المنتظمة', en: 'Monthly performance reports for regular contracts' },
                                ].map((f, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-3 p-4 bg-white dark:bg-slate-800/70 rounded-xl border border-gray-200/80 dark:border-white/10 hover:border-blue-300/50 transition-all duration-200">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{t(f.ar, f.en)}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 9. CTA FINAL
                ═══════════════════════════════════════════════════ */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-gradient-to-br from-marine-600 to-marine-800 rounded-3xl p-12 md:p-16 text-center overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/30 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-[80px]" />

                        <div className="relative z-10">
                            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                                <Factory className="w-16 h-16 text-brand-orange mx-auto mb-6 opacity-80" />
                            </motion.div>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-6">
                                {t('ابدأ نقل شحنتك الآن', 'Start Shipping Your Cargo Now')}
                            </h2>
                            <p className="text-lg text-gray-200/80 max-w-2xl mx-auto mb-10 font-normal">
                                {t(
                                    'تواصل معنا اليوم واحصل على عرض سعر مخصص لاحتياجات مصنعك. فريق العمليات جاهز.',
                                    'Contact us today and get a custom quote for your factory needs. Our operations team is standing by.'
                                )}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => { trackEvent('whatsapp_click', { page: 'industrial-transport', location: 'cta' }); trackConversion('whatsapp_open', { page: 'industrial-transport', location: 'cta' }); }}
                                    className="px-10 py-5 bg-[#25D366] hover:bg-[#1fba59] text-white font-bold rounded-xl transition-all text-lg flex items-center gap-2 hover:scale-[1.03] shadow-lg"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {t('واتساب — رد فوري', 'WhatsApp — Instant Reply')}
                                </a>
                                <a
                                    href={smartPhoneHref}
                                    {...smartPhoneProps}
                                    onClick={() => { trackEvent('call_click', { page: 'industrial-transport', location: 'cta' }); setTimeout(() => { if (document.hasFocus()) trackConversion('call_intent', { page: 'industrial-transport', location: 'cta' }); }, 3000); }}
                                    aria-label={t('اتصال مباشر', 'Direct Call')}
                                    className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all text-lg flex items-center gap-2"
                                >
                                    <Phone className="w-5 h-5" />
                                    {t('اتصال مباشر', 'Call Us Directly')}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 10. FLOATING WHATSAPP BUTTON
                ═══════════════════════════════════════════════════ */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { trackEvent('whatsapp_click', { page: 'industrial-transport', location: 'floating' }); trackConversion('whatsapp_open', { page: 'industrial-transport', location: 'floating' }); }}
                aria-label={t('تواصل عبر واتساب', 'Chat on WhatsApp')}
                className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 w-16 h-16 bg-[#25D366] hover:bg-[#1fba59] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 hover:scale-110 transition-all group`}
            >
                <MessageCircle className="w-8 h-8 text-white" />
                <span className={`absolute bottom-full mb-3 ${isRTL ? 'left-0' : 'right-0'} bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
                    {t('تواصل عبر واتساب', 'Chat on WhatsApp')}
                </span>
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
            </a>
        </div>
    );
}
