'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
    Ship, Plane, Truck, FileCheck, Warehouse, Shield,
    CheckCircle2, Phone, Mail, ArrowRight, ArrowLeft,
    Sparkles, Clock, Users, Award, TrendingUp, Package
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/useIsMobile';


// Icon mapping
const iconMap: Record<string, any> = {
    Ship, Plane, Truck, FileCheck, Warehouse, Shield
};

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
    descriptionAr: string;
    descriptionEn: string;
    featuresJson: string;
    image?: string;        // Desktop image (default)
    imageMobile?: string;  // Mobile-specific image (optional)
    color: string;
    order: number;
}

export default function ServiceDetailPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const isMobile = useIsMobile();
    const params = useParams();
    const slug = params.slug as string;

    const [service, setService] = useState<Service | null>(null);
    const [allServices, setAllServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'overview' | 'features' | 'process'>('overview');

    useEffect(() => {
        const fetchService = async () => {
            try {
                const res = await fetch('/api/cms/services');
                if (!res.ok) throw new Error('Failed to fetch services');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setAllServices(data);
                    const found = data.find((s: Service) => s.slug === slug);
                    if (found) setService(found);
                }
            } catch (error) {
                console.error('Error fetching service:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchService();
    }, [slug]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-brand-orange"></div>
            </div>
        );
    }

    if (!service) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        {isRTL ? 'الخدمة غير موجودة' : 'Service Not Found'}
                    </h1>
                    <Link href="/services" className="text-brand-orange hover:underline">
                        {isRTL ? 'العودة للخدمات' : 'Back to Services'}
                    </Link>
                </div>
            </div>
        );
    }

    const Icon = iconMap[service.iconName] || Ship;
    let features: ServiceFeature[] = [];
    try {
        features = JSON.parse(service.featuresJson || '[]');
    } catch (e) {
        features = [];
    }

    // Select appropriate image: mobile image if available and on mobile, else desktop image
    const currentImage = (isMobile && service.imageMobile) ? service.imageMobile : service.image;
    const hasImage = !!(currentImage);

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
            {/* Breadcrumb */}
            <div className="border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-brand-orange transition-colors">
                            {isRTL ? 'الرئيسية' : 'Home'}
                        </Link>
                        <span className="text-gray-400">/</span>
                        <Link href="/services" className="text-gray-600 dark:text-gray-400 hover:text-brand-orange transition-colors">
                            {isRTL ? 'الخدمات' : 'Services'}
                        </Link>
                        <span className="text-gray-400">/</span>
                        <span className="text-brand-orange font-semibold">{isRTL ? service.titleAr : service.titleEn}</span>
                    </div>
                </div>
            </div>

            {/* Hero Image Section */}
            {hasImage && (
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative w-full h-[70vh] overflow-hidden"
                >
                    <div className="absolute inset-0">
                        <img
                            src={currentImage}
                            alt={isRTL ? service.titleAr : service.titleEn}
                            className="w-full h-full object-cover object-[center_30%] md:object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
                    </div>

                    {/* Title Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                        <div className="container mx-auto">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-4 mb-4"
                            >
                                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                                    <Icon className="w-8 h-8 md:w-10 md:h-10 text-brand-orange" />
                                </div>
                                <div>
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white">
                                        {isRTL ? service.titleAr : service.titleEn}
                                    </h1>
                                    <p className="text-gray-200 text-lg md:text-xl mt-2">
                                        {isRTL ? service.shortDescAr : service.shortDescEn}
                                    </p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </motion.section>
            )}

            {/* If no image, show simple header */}
            {!hasImage && (
                <section className="py-12 md:py-16 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-950">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="flex items-center gap-6"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center shadow-2xl">
                                <Icon className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white">
                                    {isRTL ? service.titleAr : service.titleEn}
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 text-lg md:text-xl mt-2">
                                    {isRTL ? service.shortDescAr : service.shortDescEn}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </section>
            )}

            {/* Stats Section */}
            <section className="py-8 border-b border-gray-200 dark:border-slate-800">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {[
                            { icon: Clock, labelAr: 'متاح 24/7', labelEn: '24/7 Available', valueAr: 'طوال الأسبوع', valueEn: 'All Week' },
                            { icon: Users, labelAr: 'فريق محترف', labelEn: 'Expert Team', valueAr: '+50 خبير', valueEn: '50+ Experts' },
                            { icon: Award, labelAr: 'شهادات معتمدة', labelEn: 'Certified', valueAr: 'ISO 9001', valueEn: 'ISO 9001' },
                            { icon: TrendingUp, labelAr: 'نسبة النجاح', labelEn: 'Success Rate', valueAr: '98%', valueEn: '98%' },
                        ].map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <stat.icon className="w-8 h-8 text-brand-orange mx-auto mb-2" />
                                <div className="text-2xl font-black text-gray-900 dark:text-white mb-1">
                                    {isRTL ? stat.valueAr : stat.valueEn}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    {isRTL ? stat.labelAr : stat.labelEn}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
                        {/* Main Content Area */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Tabs */}
                            <div className="flex flex-wrap gap-2 md:gap-4 p-2 bg-gray-100 dark:bg-slate-800 rounded-2xl">
                                {[
                                    { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview' },
                                    { id: 'features', labelAr: 'المميزات', labelEn: 'Features' },
                                    { id: 'process', labelAr: 'كيف نعمل', labelEn: 'Process' },
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as any)}
                                        className={`flex-1 px-4 md:px-8 py-3 rounded-xl font-bold transition-all ${activeTab === tab.id
                                            ? 'bg-white dark:bg-slate-700 text-brand-orange shadow-lg'
                                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {isRTL ? tab.labelAr : tab.labelEn}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-10 shadow-xl border border-gray-100 dark:border-slate-700"
                                >
                                    {activeTab === 'overview' && (
                                        <div className="prose prose-lg dark:prose-invert max-w-none">
                                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-6">
                                                {isRTL ? 'نظرة عامة' : 'Overview'}
                                            </h2>
                                            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg whitespace-pre-line">
                                                {isRTL ? service.descriptionAr : service.descriptionEn}
                                            </p>
                                        </div>
                                    )}

                                    {activeTab === 'features' && (
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8">
                                                {isRTL ? 'المميزات الرئيسية' : 'Key Features'}
                                            </h2>
                                            <div className="grid sm:grid-cols-2 gap-4">
                                                {features.map((f, i) => (
                                                    <motion.div
                                                        key={i}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        className="flex items-start gap-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-shadow"
                                                    >
                                                        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                                                            <CheckCircle2 className="w-5 h-5 text-brand-orange" />
                                                        </div>
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium pt-2">
                                                            {isRTL ? f.ar : f.en}
                                                        </span>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'process' && (
                                        <div>
                                            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8">
                                                {isRTL ? 'خطوات العمل' : 'How We Work'}
                                            </h2>
                                            <div className="space-y-6">
                                                {[
                                                    { step: 1, titleAr: 'استلام الطلب', titleEn: 'Receive Request', descAr: 'نستقبل طلبك ونقوم بتحليل احتياجاتك بدقة', descEn: 'We receive your request and analyze your needs carefully' },
                                                    { step: 2, titleAr: 'التخطيط والإعداد', titleEn: 'Planning', descAr: 'نضع خطة متكاملة مع جدول زمني واضح', descEn: 'We create a comprehensive plan with clear timeline' },
                                                    { step: 3, titleAr: 'التنفيذ', titleEn: 'Execution', descAr: 'نبدأ التنفيذ وفق أعلى معايير الجودة', descEn: 'We execute according to highest quality standards' },
                                                    { step: 4, titleAr: 'المتابعة', titleEn: 'Follow-up', descAr: 'نتابع معك حتى اكتمال الخدمة بنجاح', descEn: 'We follow up until successful completion' },
                                                ].map((item, idx) => (
                                                    <motion.div
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -30 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.1 }}
                                                        className="flex gap-6 items-start p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl hover:shadow-lg transition-shadow"
                                                    >
                                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-lg">
                                                            {item.step}
                                                        </div>
                                                        <div className="flex-1 pt-2">
                                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                                                {isRTL ? item.titleAr : item.titleEn}
                                                            </h4>
                                                            <p className="text-gray-600 dark:text-gray-400">
                                                                {isRTL ? item.descAr : item.descEn}
                                                            </p>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* CTA Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                className="bg-gradient-to-br from-brand-orange to-orange-600 rounded-3xl p-8 shadow-2xl text-white"
                            >
                                <Sparkles className="w-12 h-12 mb-4" />
                                <h3 className="text-2xl md:text-3xl font-black mb-4">
                                    {isRTL ? 'جاهز للبدء؟' : 'Ready to Start?'}
                                </h3>
                                <p className="mb-6 opacity-90 text-lg">
                                    {isRTL
                                        ? 'تواصل معنا الآن واحصل على استشارة مجانية'
                                        : 'Contact us now and get a free consultation'}
                                </p>
                                <div className="space-y-3">
                                    <Link
                                        href="/contact"
                                        className="flex items-center justify-center gap-2 w-full py-4 bg-white text-brand-orange font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                                    >
                                        <Mail className="w-5 h-5" />
                                        {isRTL ? 'راسلنا' : 'Email Us'}
                                    </Link>
                                    <a
                                        href="tel:+201234567890"
                                        className="flex items-center justify-center gap-2 w-full py-4 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl transition-all backdrop-blur-sm border border-white/30"
                                    >
                                        <Phone className="w-5 h-5" />
                                        {isRTL ? 'اتصل بنا' : 'Call Us'}
                                    </a>
                                </div>
                            </motion.div>

                            {/* Other Services */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1 }}
                                className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-slate-700"
                            >
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-brand-orange" />
                                    {isRTL ? 'خدمات أخرى' : 'Other Services'}
                                </h3>
                                <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
                                    {allServices
                                        .filter(s => s.id !== service.id)
                                        .map((s) => {
                                            const ServiceIcon = iconMap[s.iconName] || Ship;
                                            return (
                                                <Link
                                                    key={s.id}
                                                    href={`/services/${s.slug}`}
                                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors group"
                                                >
                                                    <div className="w-10 h-10 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                                                        <ServiceIcon className="w-5 h-5 text-brand-orange" />
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-orange transition-colors flex-1">
                                                        {isRTL ? s.titleAr : s.titleEn}
                                                    </span>
                                                    {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                                                </Link>
                                            );
                                        })}
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
}
