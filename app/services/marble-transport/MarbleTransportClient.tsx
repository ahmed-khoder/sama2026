'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    Truck, Shield, CheckCircle2, ArrowRight, ArrowLeft,
    Clock, Package, Phone, Award, MessageCircle,
    AlertTriangle, Mountain, MapPin, Weight,
    Hammer, HardHat, Users, Gem,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import { getSmartPhoneHref, getSmartPhoneProps, getWhatsAppHref } from '@/lib/smart-phone';
import { trackEvent, trackConversion } from '@/components/GoogleAnalytics';

// ─── WhatsApp Config ──────────────────────────────────────
const WHATSAPP_NUMBER = '201221300036';

// ─── Static Content (Bilingual Copywriting) ──────────────
const content = {
    hero: {
        badgeAr: 'متخصصون في نقل المواد المحجرية والتعدينية',
        badgeEn: 'Specialized in Quarry & Mining Transport',
        titleLine1Ar: 'نقل الرخام والمواد المحجرية والتعدينية',
        titleLine1En: 'Marble, Quarry & Mining',
        titleLine2Ar: 'بأعلى درجات الأمان',
        titleLine2En: 'Transport — Maximum Safety',
        descAr: 'نقل الرخام والجرانيت وجميع المواد المحجرية من مواقع الإنتاج مثل شق الثعبان إلى مواقع العمل باستخدام أسطول متخصص للأحمال الثقيلة.',
        descEn: 'Marble, granite, and all quarry materials transport from production sites like Shaq El-Tue\'ban to worksites using a specialized heavy-load fleet.',
    },
    stats: [
        { valueAr: '+25', valueEn: '25+', labelAr: 'سنة خبرة', labelEn: 'Years Experience' },
        { valueAr: '60', valueEn: '60', labelAr: 'طن أقصى حمولة', labelEn: 'Ton Max Load' },
        { valueAr: '+1000', valueEn: '1000+', labelAr: 'شحنة منجزة', labelEn: 'Shipments Completed' },
        { valueAr: '0%', valueEn: '0%', labelAr: 'نسبة تلف', labelEn: 'Damage Rate' },
    ],
    painPoints: [
        {
            icon: AlertTriangle,
            titleAr: 'تلف الأحمال أثناء النقل',
            titleEn: 'Cargo Damage During Transport',
            descAr: 'الرخام والجرانيت مواد حساسة رغم ثقلها. نستخدم تقنيات تثبيت متقدمة وفرق تحميل متخصصة تضمن وصول الشحنة بدون أي خدش.',
            descEn: 'Marble and granite are fragile despite their weight. We use advanced securing techniques and specialized loading teams to ensure scratch-free delivery.',
        },
        {
            icon: Weight,
            titleAr: 'صعوبة تحميل الأحجار الثقيلة',
            titleEn: 'Difficulty Loading Heavy Stones',
            descAr: 'التحميل العشوائي يسبب كسر وتلف. فريقنا مدرب على التعامل مع البلوكات والألواح الثقيلة باستخدام معدات مناسبة.',
            descEn: 'Random loading causes breakage and damage. Our team is trained to handle heavy blocks and slabs using proper equipment.',
        },
        {
            icon: Clock,
            titleAr: 'تأخير التسليم',
            titleEn: 'Delivery Delays',
            descAr: 'مشاريع البناء تعتمد على مواعيد محددة. أي تأخير يكلف المقاول خسائر. نلتزم بالمواعيد المتفق عليها بنسبة 98%.',
            descEn: 'Construction projects depend on precise schedules. Any delay costs the contractor losses. We maintain a 98% on-time delivery rate.',
        },
        {
            icon: HardHat,
            titleAr: 'نقص الخبرة في التعامل مع المواد الثقيلة',
            titleEn: 'Lack of Heavy Materials Expertise',
            descAr: 'شركات النقل العادية لا تفهم طبيعة المواد المحجرية. لدينا 25 سنة خبرة في شق الثعبان ومناطق المحاجر.',
            descEn: 'Regular transport companies don\'t understand quarry materials. We have 25 years of experience at Shaq El-Tue\'ban and quarry zones.',
        },
    ],
    whyUs: [
        {
            icon: Mountain,
            titleAr: 'خبرة في شق الثعبان والمحاجر',
            titleEn: 'Shaq El-Tue\'ban & Quarry Expertise',
            descAr: 'نعمل في شق الثعبان ومناطق المحاجر منذ أكثر من 25 سنة. نعرف كل طريق وكل تحدي.',
            descEn: 'We\'ve been operating in Shaq El-Tue\'ban and quarry zones for over 25 years. We know every route and every challenge.',
        },
        {
            icon: Truck,
            titleAr: 'أسطول مخصص للأوزان الثقيلة',
            titleEn: 'Fleet Specialized for Heavy Loads',
            descAr: 'شاحنات مجهزة خصيصاً لنقل أحمال تصل إلى 60 طن — مع نظام تثبيت احترافي يحمي كل شحنة.',
            descEn: 'Trucks specially equipped for loads up to 60 tons — with professional securing systems that protect every shipment.',
        },
        {
            icon: Shield,
            titleAr: 'تأمين عالي أثناء النقل',
            titleEn: 'Premium Transport Insurance',
            descAr: 'تأمين شامل على كل شحنة رخام ومواد محجرية. راحة البال من لحظة التحميل حتى التسليم.',
            descEn: 'Comprehensive insurance on every marble and quarry shipment. Peace of mind from loading to delivery.',
        },
        {
            icon: Clock,
            titleAr: 'التزام بالمواعيد',
            titleEn: 'On-Time Commitment',
            descAr: 'نسبة التزام 98% بالمواعيد. مشروعك لن يتأخر بسبب النقل.',
            descEn: '98% on-time delivery rate. Your project won\'t be delayed because of transport.',
        },
    ],
    services: [
        {
            icon: Gem,
            titleAr: 'نقل رخام وجرانيت',
            titleEn: 'Marble & Granite Transport',
            descAr: 'نقل ألواح وبلوكات الرخام والجرانيت بعناية فائقة من المصانع والمحاجر إلى مواقع التركيب ومعارض البيع.',
            descEn: 'Careful transport of marble and granite slabs and blocks from factories and quarries to installation sites and showrooms.',
        },
        {
            icon: Mountain,
            titleAr: 'نقل مواد محجرية',
            titleEn: 'Quarry Materials Transport',
            descAr: 'نقل الحجر الجيري والبازلت والرمال والكسر من المحاجر إلى مواقع البناء والمصانع.',
            descEn: 'Transport of limestone, basalt, sand, and aggregate from quarries to construction sites and factories.',
        },
        {
            icon: Hammer,
            titleAr: 'نقل خامات تعدين',
            titleEn: 'Mining Materials Transport',
            descAr: 'نقل الخامات التعدينية من مواقع الاستخراج إلى المصانع ومراكز المعالجة عبر جميع المحافظات.',
            descEn: 'Transport of mining materials from extraction sites to factories and processing centers across all governorates.',
        },
        {
            icon: Weight,
            titleAr: 'نقل أحمال ثقيلة',
            titleEn: 'Heavy Load Transport',
            descAr: 'نقل الأحمال الثقيلة غير النمطية (حتى 60 طن) بشاحنات مخصصة وتصاريح خاصة وفريق عمليات محترف.',
            descEn: 'Non-standard heavy load transport (up to 60 tons) with specialized trucks, special permits, and a professional operations team.',
        },
    ],
    trust: [
        { valueAr: '+25', valueEn: '25+', labelAr: 'سنة في نقل المحاجر', labelEn: 'Years in Quarry Transport', icon: Award },
        { valueAr: '20+', valueEn: '20+', labelAr: 'شاحنة ثقيلة مجهزة', labelEn: 'Equipped Heavy Trucks', icon: Truck },
        { valueAr: '+1000', valueEn: '1000+', labelAr: 'مشروع بناء وتشطيب', labelEn: 'Construction Projects Served', icon: Users },
        { valueAr: '60', valueEn: '60', labelAr: 'طن أقصى حمولة', labelEn: 'Ton Max Payload', icon: Weight },
    ],
    areas: [
        { ar: 'شق الثعبان', en: 'Shaq El-Tue\'ban' },
        { ar: 'العين السخنة', en: 'Ain Sokhna' },
        { ar: 'أسوان', en: 'Aswan' },
        { ar: 'المنيا', en: 'Minya' },
        { ar: 'بني سويف', en: 'Beni Suef' },
        { ar: 'الفيوم', en: 'Fayoum' },
        { ar: 'البحر الأحمر', en: 'Red Sea' },
        { ar: 'سيناء', en: 'Sinai' },
    ],
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
export default function MarbleTransportClient() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const whatsappUrl = getWhatsAppHref(
        WHATSAPP_NUMBER,
        isRTL
            ? 'مرحباً سما لوجيستك، أحتاج عرض سعر لنقل رخام/مواد محجرية. النوع: [___]. الكمية: [___].'
            : 'Hi SAMA Logistics, I need a quote for marble/quarry transport. Type: [___]. Quantity: [___].'
    );
    const t = (ar: string, en: string) => isRTL ? ar : en;

    const smartPhoneHref = getSmartPhoneHref(
        '+201221300036',
        isRTL ? 'مرحباً، أريد الاستفسار عن نقل رخام ومواد محجرية' : 'Hi, I want to inquire about marble and quarry transport'
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
                            <span itemProp="name" className="text-brand-orange font-semibold">{t('نقل الرخام', 'Marble Transport')}</span>
                            <meta itemProp="position" content="3" />
                        </li>
                    </ol>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════════
                 2. HERO SECTION
                ═══════════════════════════════════════════════════ */}
            <header className="relative min-h-[80vh] flex items-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-marine-900 via-marine-800 to-slate-900" />
                <motion.div
                    className="absolute inset-0"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <Image
                        src="/images/fleet/1772066646569-ggbkgl.webp"
                        alt={t('شاحنات نقل رخام ومواد محجرية', 'Marble and quarry materials transport trucks')}
                        fill
                        className="object-cover opacity-20"
                        priority
                        sizes="100vw"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-gradient-to-t from-marine-950/80 via-marine-900/40 to-transparent" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[200px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-marine-500/15 rounded-full blur-[150px]" />

                <div className="container mx-auto px-4 relative z-10 py-20 md:py-0">
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
                        >
                            <Mountain className="w-4 h-4 text-brand-orange" />
                            <span className="text-sm font-semibold tracking-wide">
                                {t(content.hero.badgeAr, content.hero.badgeEn)}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                        >
                            <span className="text-white">
                                {t(content.hero.titleLine1Ar, content.hero.titleLine1En)}
                            </span>
                            <br />
                            <span className="text-brand-orange">
                                {t(content.hero.titleLine2Ar, content.hero.titleLine2En)}
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl font-normal"
                        >
                            {t(content.hero.descAr, content.hero.descEn)}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-4"
                            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                        >
                            <Link
                                href="/contact?tab=quote"
                                onClick={() => trackEvent('quote_click', { page: 'marble-transport', location: 'hero' })}
                                className="px-8 py-4 bg-brand-orange hover:bg-brand-darkOrange text-white font-semibold rounded-xl shadow-lg shadow-brand-orange/25 flex items-center gap-2 transition-all hover:scale-[1.03] hover:-translate-y-0.5"
                            >
                                {t('اطلب عرض سعر', 'Request a Quote')}
                                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                            </Link>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => { trackEvent('whatsapp_click', { page: 'marble-transport', location: 'hero' }); trackConversion('whatsapp_open', { page: 'marble-transport', location: 'hero' }); }}
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
                        {content.stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700 hover:scale-[1.03] hover:shadow-2xl transition-all duration-300"
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
            <section className="py-24 md:py-28 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/50 dark:to-slate-950 border-t border-gray-100 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold mb-4">
                            {t('تحديات نقل المواد المحجرية', 'Quarry Transport Challenges')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {t('مشاكل تكلف المقاولين خسائر كبيرة', 'Problems Costing Contractors Major Losses')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-normal">
                            {t('كل شحنة تالفة أو متأخرة تعني خسارة مادية. هكذا نحل هذه المشاكل.', 'Every damaged or delayed shipment means financial loss. Here\'s how we solve these problems.')}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-5">
                        {content.painPoints.map((pain, idx) => (
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
                                        <pain.icon className="w-5 h-5 text-slate-600 dark:text-slate-400" />
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
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 5. WHY US
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-marine-500/5 rounded-full blur-[120px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
                            {t('لماذا سما لوجيستك؟', 'Why SAMA Logistics?')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {t('الشريك الأمثل لنقل المواد المحجرية', 'The Ideal Partner for Quarry Materials Transport')}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-normal">
                            {t('خبرة 25 سنة في نقل الرخام والمواد المحجرية من أصعب المواقع', '25 years of experience transporting marble and quarry materials from the toughest locations')}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                        {content.whyUs.map((item, idx) => (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="group relative bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 hover:border-brand-orange/30 transition-all duration-300"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-orange to-brand-gold rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange/15 to-brand-gold/10 flex items-center justify-center group-hover:from-brand-orange group-hover:to-orange-600 transition-all duration-300 flex-shrink-0 shadow-lg">
                                        <item.icon className="w-8 h-8 text-brand-orange group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 group-hover:text-brand-orange transition-colors">
                                            {t(item.titleAr, item.titleEn)}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                                            {t(item.descAr, item.descEn)}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Quarry Areas Coverage */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-12 bg-white dark:bg-slate-800/80 rounded-3xl p-8 md:p-10 border border-gray-100 dark:border-slate-700 shadow-xl"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-brand-orange" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                {t('مناطق المحاجر المغطاة', 'Quarry Areas Covered')}
                            </h3>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {content.areas.map((area, idx) => (
                                <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-50 dark:bg-slate-700/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-600 hover:border-brand-orange/50 hover:bg-brand-orange/5 transition-colors"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-brand-orange flex-shrink-0" />
                                    {t(area.ar, area.en)}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 6. SERVICES
                ═══════════════════════════════════════════════════ */}
            <section className="py-24 md:py-28 bg-white dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
                            <Package className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                            {t('خدماتنا', 'Our Services')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {t('حلول نقل مصممة للمواد المحجرية', 'Transport Solutions for Quarry Materials')}
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                        {content.services.map((service, idx) => (
                            <motion.article
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="group relative bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 hover:border-brand-orange/30 transition-all duration-300"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-orange to-brand-gold rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange/15 to-brand-gold/10 flex items-center justify-center group-hover:from-brand-orange group-hover:to-orange-600 transition-all duration-300 flex-shrink-0 shadow-lg">
                                        <service.icon className="w-8 h-8 text-brand-orange group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 group-hover:text-brand-orange transition-colors">
                                            {t(service.titleAr, service.titleEn)}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                                            {t(service.descAr, service.descEn)}
                                        </p>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 7. TRUST / SOCIAL PROOF
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-orange/5 rounded-full blur-[150px]" />
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-marine-500/10 text-marine-600 dark:text-marine-400 rounded-full text-sm font-semibold mb-4">
                            {t('أرقام تتحدث', 'Numbers That Speak')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {t('لماذا يثق المقاولون بسما لوجيستك', 'Why Contractors Trust SAMA Logistics')}
                        </h2>
                    </motion.div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                        {content.trust.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="group text-center p-8 bg-white dark:bg-slate-800/80 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="w-16 h-16 mx-auto mb-5 bg-gradient-to-br from-brand-orange/15 to-brand-gold/10 rounded-2xl flex items-center justify-center group-hover:from-brand-orange group-hover:to-orange-600 transition-all duration-300 shadow-lg">
                                    <item.icon className="w-8 h-8 text-brand-orange group-hover:text-white group-hover:scale-110 transition-all duration-300" />
                                </div>
                                <AnimatedCounter value={t(item.valueAr, item.valueEn)} className="text-3xl md:text-4xl font-black text-brand-orange mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {t(item.labelAr, item.labelEn)}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Fleet Images */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group relative rounded-3xl overflow-hidden shadow-xl h-[300px]"
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
                                    {t('أسطول مجهز للأحمال الثقيلة', 'Fleet Built for Heavy Loads')}
                                </h3>
                                <p className="text-gray-300/80 text-sm">
                                    {t('شاحنات بحمولة حتى 60 طن', 'Trucks with capacity up to 60 tons')}
                                </p>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="group relative rounded-3xl overflow-hidden shadow-xl h-[300px]"
                        >
                            <Image
                                src="/images/services/1768247641397-jp1up7.webp"
                                alt={t('نقل مواد محجرية', 'Quarry materials transport')}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                                sizes="(max-width: 768px) 100vw, 50vw"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h3 className="text-xl font-bold text-white mb-1">
                                    {t('تأمين شامل على كل شحنة', 'Full Insurance on Every Shipment')}
                                </h3>
                                <p className="text-gray-300/80 text-sm">
                                    {t('حماية كاملة من التحميل حتى التسليم', 'Full protection from loading to delivery')}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 8. SAFETY FEATURES
                ═══════════════════════════════════════════════════ */}
            <section className="py-24 md:py-28 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/50 dark:to-slate-950 relative overflow-hidden border-t border-gray-100 dark:border-slate-800">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px]" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-marine-500/10 text-marine-600 dark:text-marine-400 rounded-full text-sm font-semibold mb-4">
                            {t('ما تحصل عليه', 'What You Get')}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            {t('معايير أمان خاصة بالمواد المحجرية', 'Safety Standards for Quarry Materials')}
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('الحماية والتأمين', 'Protection & Insurance')}</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { ar: 'تأمين شامل على كل شحنة رخام ومحجرية', en: 'Full insurance on every marble and quarry shipment' },
                                    { ar: 'تقنيات تثبيت متقدمة تمنع الانزلاق والكسر', en: 'Advanced securing techniques preventing slippage and breakage' },
                                    { ar: 'فرق تحميل متخصصة في المواد الثقيلة', en: 'Loading teams specialized in heavy materials' },
                                    { ar: 'تقارير حالة موثقة بالصور عند الاستلام والتسليم', en: 'Photo-documented condition reports at pickup and delivery' },
                                ].map((f, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800/70 rounded-xl border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{t(f.ar, f.en)}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <Truck className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('القدرات التشغيلية', 'Operational Capabilities')}</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { ar: 'شاحنات بحمولة حتى 60 طن', en: 'Trucks with capacity up to 60 tons' },
                                    { ar: 'خبرة في الطرق الوعرة ومناطق المحاجر', en: 'Expertise in rough terrain and quarry zone roads' },
                                    { ar: 'تتبع GPS لحظي لكل شاحنة', en: 'Real-time GPS tracking for every truck' },
                                    { ar: 'تصاريح نقل أحمال ثقيلة جاهزة', en: 'Heavy load transport permits ready' },
                                ].map((f, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800/70 rounded-xl border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
            <section className="py-28 md:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 border-t border-gray-100 dark:border-slate-800">
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
                                <Mountain className="w-16 h-16 text-brand-orange mx-auto mb-6 opacity-80" />
                            </motion.div>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-6">
                                {t('ابدأ نقل شحنتك الآن', 'Start Shipping Your Cargo Now')}
                            </h2>
                            <p className="text-lg text-gray-200/80 max-w-2xl mx-auto mb-10 font-normal">
                                {t(
                                    'تواصل معنا اليوم واحصل على عرض سعر مخصص لنقل الرخام والمواد المحجرية. فريق العمليات جاهز.',
                                    'Contact us today for a custom quote on marble and quarry materials transport. Our operations team is standing by.'
                                )}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => { trackEvent('whatsapp_click', { page: 'marble-transport', location: 'cta' }); trackConversion('whatsapp_open', { page: 'marble-transport', location: 'cta' }); }}
                                    className="px-10 py-5 bg-[#25D366] hover:bg-[#1fba59] text-white font-bold rounded-xl transition-all text-lg flex items-center gap-2 hover:scale-[1.03] shadow-lg shadow-green-500/20 animate-pulse [animation-duration:3s]"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {t('واتساب — رد فوري', 'WhatsApp — Instant Reply')}
                                </a>
                                <a
                                    href={smartPhoneHref}
                                    {...smartPhoneProps}
                                    onClick={() => { trackEvent('call_click', { page: 'marble-transport', location: 'cta' }); setTimeout(() => { if (document.hasFocus()) trackConversion('call_intent', { page: 'marble-transport', location: 'cta' }); }, 3000); }}
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
                onClick={() => { trackEvent('whatsapp_click', { page: 'marble-transport', location: 'floating' }); trackConversion('whatsapp_open', { page: 'marble-transport', location: 'floating' }); }}
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
