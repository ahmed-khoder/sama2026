'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, CheckCircle2, Ship } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import Image from 'next/image';

type PreviewMode = 'desktop' | 'mobile';

interface WhyChooseUsPreviewProps {
    previewMode: PreviewMode;
    onPreviewModeChange: (mode: PreviewMode) => void;
}

export function WhyChooseUsPreview({
    previewMode,
    onPreviewModeChange,
}: WhyChooseUsPreviewProps) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const [whySection, setWhySection] = useState({
        badgeAr: 'لماذا نحن؟',
        badgeEn: 'Why Us?',
        titleAr: 'لماذا تختار سما للخدمات اللوجستية؟',
        titleEn: 'Why Choose SAMA Logistics?',
        descriptionAr: 'نحن لسنا مجرد شركة شحن، بل شريكك الاستراتيجي...',
        descriptionEn: 'We are not just a shipping company, but your strategic partner...',
        reasonsJson: '[]',
        statsValue: '25+',
        statsLabelAr: 'سنة من التميز',
        statsLabelEn: 'Years of Excellence'
    });
    const [whyImages, setWhyImages] = useState<{ id: string; url: string; order: number }[]>([]);
    const [imageIndex, setImageIndex] = useState(0);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/cms/about-why', { credentials: 'same-origin' });
                const data = await res.json();
                setWhySection(data);

                const imgRes = await fetch('/api/cms/about-why/images', { credentials: 'same-origin' });
                if (imgRes.ok) {
                    const imgData = await imgRes.json();
                    setWhyImages(Array.isArray(imgData) ? imgData : []);
                }
            } catch (error) {
                console.error('Failed to fetch why section:', error);
            }
        };
        fetchData();

        // Poll for updates every 2 seconds
        const interval = setInterval(fetchData, 2000);
        return () => clearInterval(interval);
    }, []);

    // Auto-rotate images
    useEffect(() => {
        if (whyImages.length <= 1) return;
        const timer = setInterval(() => {
            setImageIndex(prev => (prev + 1) % whyImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [whyImages.length]);

    const reasons = JSON.parse(whySection.reasonsJson || '[]');

    return (
        <div className="bg-slate-900 rounded-2xl p-4 space-y-4">
            {/* Header with Device Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {isRTL ? 'معاينة لماذا نحن؟' : 'Why Choose Us Preview'}
                    </h3>
                </div>
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl">
                    <button
                        onClick={() => onPreviewModeChange('desktop')}
                        className={`p-2 rounded-lg transition-all ${previewMode === 'desktop'
                            ? 'bg-brand-orange text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-slate-700'
                            }`}
                        title={isRTL ? 'سطح المكتب' : 'Desktop'}
                    >
                        <Monitor className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onPreviewModeChange('mobile')}
                        className={`p-2 rounded-lg transition-all ${previewMode === 'mobile'
                            ? 'bg-brand-orange text-white shadow-lg'
                            : 'text-gray-400 hover:text-white hover:bg-slate-700'
                            }`}
                        title={isRTL ? 'الموبايل' : 'Mobile'}
                    >
                        <Smartphone className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Preview Container */}
            <div className="flex justify-center">
                <div
                    className={`relative overflow-hidden shadow-2xl border-2 border-slate-700 transition-all duration-300 bg-marine-900 ${previewMode === 'mobile'
                        ? 'w-[200px] aspect-[9/16] rounded-[2rem]'
                        : 'w-full aspect-[16/10] rounded-2xl'
                        }`}
                >
                    {/* Phone Frame for Mobile */}
                    {previewMode === 'mobile' && (
                        <>
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-b-2xl z-30 flex items-center justify-center">
                                <div className="w-8 h-2 bg-slate-800 rounded-full" />
                            </div>
                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-500 rounded-full z-30" />
                        </>
                    )}

                    {/* Content Grid */}
                    <div className={`h-full p-4 ${previewMode === 'mobile' ? 'pt-8 flex flex-col gap-3' : 'grid grid-cols-2 gap-4 items-center'}`}>
                        {/* Text Content Side */}
                        <div className={`flex flex-col ${previewMode === 'mobile' ? 'gap-2' : 'gap-3'} ${isRTL && previewMode === 'desktop' ? 'order-2' : ''}`}>
                            {/* Badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-white font-medium w-fit backdrop-blur-md ${previewMode === 'mobile' ? 'text-[8px]' : 'text-[10px]'}`}>
                                {isRTL ? whySection.badgeAr : whySection.badgeEn}
                            </span>

                            {/* Title */}
                            <h2 className={`font-bold text-white leading-tight ${previewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                                {isRTL ? whySection.titleAr : whySection.titleEn}
                            </h2>

                            {/* Description */}
                            <p className={`text-gray-300 line-clamp-2 ${previewMode === 'mobile' ? 'text-[7px]' : 'text-[9px]'}`}>
                                {isRTL ? whySection.descriptionAr : whySection.descriptionEn}
                            </p>

                            {/* Reasons */}
                            <div className={`grid gap-1 ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {reasons.slice(0, previewMode === 'mobile' ? 3 : 6).map((item: { ar: string; en: string }, idx: number) => (
                                    <div key={idx} className="flex items-center gap-1">
                                        <CheckCircle2 className={`text-brand-orange flex-shrink-0 ${previewMode === 'mobile' ? 'w-2 h-2' : 'w-3 h-3'}`} />
                                        <span className={`text-gray-200 ${previewMode === 'mobile' ? 'text-[7px]' : 'text-[8px]'}`}>
                                            {isRTL ? item.ar : item.en}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Image Side with Carousel */}
                        <div className={`relative rounded-xl overflow-hidden ${previewMode === 'mobile' ? 'aspect-[4/3]' : 'aspect-[4/3]'} ${isRTL && previewMode === 'desktop' ? 'order-1' : ''}`}>
                            {whyImages.length > 0 ? (
                                <>
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={imageIndex}
                                            initial={{ opacity: 0, scale: 1.1 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.5 }}
                                            className="absolute inset-0"
                                        >
                                            <Image
                                                src={whyImages[imageIndex]?.url}
                                                alt="Why Choose Us"
                                                fill
                                                className="object-cover"
                                            />
                                        </motion.div>
                                    </AnimatePresence>
                                    <div className="absolute inset-0 bg-gradient-to-t from-marine-950/50 to-transparent" />

                                    {/* Image Indicators */}
                                    {whyImages.length > 1 && (
                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                            {whyImages.map((_, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setImageIndex(idx)}
                                                    className={`w-1 h-1 rounded-full transition-all ${imageIndex === idx ? 'bg-white w-3' : 'bg-white/50'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                    <span className="text-gray-500 text-xs">No Images</span>
                                </div>
                            )}

                            {/* Floating Stats Card - Desktop only */}
                            {previewMode === 'desktop' && (
                                <div className={`absolute -bottom-2 bg-white dark:bg-slate-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-slate-700 scale-75 origin-bottom-right ${isRTL ? '-left-2 origin-bottom-left' : '-right-2'}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-gradient-to-br from-brand-orange to-brand-gold rounded flex items-center justify-center">
                                            <Ship className="w-3 h-3 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{whySection.statsValue}</div>
                                            <div className="text-[8px] text-gray-500">{isRTL ? whySection.statsLabelAr : whySection.statsLabelEn}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-slate-800 rounded">
                    {reasons.length} {isRTL ? 'نقاط' : 'points'}
                </span>
                <span className="px-2 py-1 bg-slate-800 rounded">
                    {whyImages.length} {isRTL ? 'صور' : 'images'}
                </span>
                <span className="px-2 py-1 bg-slate-800 rounded">
                    {previewMode === 'desktop' ? '1920×1080' : '390×844'}
                </span>
            </div>
        </div>
    );
}
