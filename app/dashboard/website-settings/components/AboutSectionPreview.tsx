'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Smartphone, CheckCircle2, Award, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { AboutSettings, HeroSettings } from '../types';

type PreviewMode = 'desktop' | 'mobile';

interface AboutSectionPreviewProps {
    aboutSettings: AboutSettings;
    heroSettings: HeroSettings;
    previewMode: PreviewMode;
    onPreviewModeChange: (mode: PreviewMode) => void;
}

export function AboutSectionPreview({
    aboutSettings,
    heroSettings,
    previewMode,
    onPreviewModeChange,
}: AboutSectionPreviewProps) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    // Default fallback images — must match the frontend defaults in app/page.tsx
    const defaultAboutImages = [
        'https://images.unsplash.com/photo-1494412574643-35d324698420?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80&w=1200',
    ];

    // Parse images from comma-separated string
    // Fall back to default images when the field is empty (mirrors frontend behavior)
    const parsedImages = heroSettings.aboutSectionImages
        ? heroSettings.aboutSectionImages.split(',').filter(Boolean).map(url => url.trim())
        : [];
    const aboutImages = parsedImages.length > 0 ? parsedImages : defaultAboutImages;

    // Image carousel state
    const [imageIndex, setImageIndex] = useState(0);
    const [imgError, setImgError] = useState(false);

    // Auto-rotate images
    useEffect(() => {
        if (aboutImages.length <= 1) return;
        const timer = setInterval(() => {
            setImageIndex(prev => (prev + 1) % aboutImages.length);
        }, 3000);
        return () => clearInterval(timer);
    }, [aboutImages.length]);

    // Reset index if images change
    useEffect(() => {
        if (imageIndex >= aboutImages.length) {
            setImageIndex(0);
        }
        setImgError(false);
    }, [aboutImages.length, imageIndex]);

    const currentImage = aboutImages[imageIndex] || '';

    return (
        <div className="bg-slate-900 rounded-2xl p-4 space-y-4">
            {/* Header with Device Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {isRTL ? 'معاينة قسم من نحن' : 'About Section Preview'}
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
                    className={`relative overflow-hidden shadow-2xl border-2 border-slate-700 transition-all duration-300 bg-white dark:bg-slate-950 ${previewMode === 'mobile'
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
                        {/* Image Carousel Side */}
                        <div className={`relative rounded-xl overflow-hidden ${previewMode === 'mobile' ? 'aspect-[4/3]' : 'aspect-[4/3]'}`}>
                            <AnimatePresence mode="wait">
                                {currentImage && !imgError ? (
                                    <motion.img
                                        key={imageIndex}
                                        src={currentImage}
                                        alt="About"
                                        initial={{ opacity: 0, x: 50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -50 }}
                                        transition={{ duration: 0.5 }}
                                        className="w-full h-full object-cover absolute inset-0"
                                        onError={() => setImgError(true)}
                                    />
                                ) : (
                                    <motion.div
                                        key="placeholder"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-full h-full absolute inset-0 bg-gradient-to-br from-marine-800 to-marine-950 flex items-center justify-center"
                                    >
                                        <span className="text-gray-500 text-xs">{isRTL ? 'لا توجد صورة' : 'No image'}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-marine-950/50 to-transparent" />

                            {/* Image indicators */}
                            {aboutImages.length > 1 && (
                                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                                    {aboutImages.map((_, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setImageIndex(idx)}
                                            className={`w-1.5 h-1.5 rounded-full transition-all ${imageIndex === idx ? 'bg-white w-4' : 'bg-white/50'}`}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Floating Stats Card - Desktop only */}
                            {previewMode === 'desktop' && (
                                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 rounded-lg p-2 shadow-lg border border-gray-200 dark:border-slate-700 scale-75 origin-bottom-right">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 bg-brand-orange rounded flex items-center justify-center">
                                            <Award className="w-3 h-3 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 dark:text-white">{aboutSettings.statsValue}</div>
                                            <div className="text-[8px] text-gray-500">{isRTL ? aboutSettings.statsLabelAr : aboutSettings.statsLabelEn}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Content Side */}
                        <div className={`flex flex-col ${previewMode === 'mobile' ? 'gap-2' : 'gap-3'}`}>
                            {/* Badge */}
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-marine-100 dark:bg-marine-900/50 text-marine-600 dark:text-marine-400 font-medium w-fit ${previewMode === 'mobile' ? 'text-[8px]' : 'text-[10px]'}`}>
                                {isRTL ? aboutSettings.badgeAr : aboutSettings.badgeEn}
                            </span>

                            {/* Title */}
                            <h2 className={`font-bold text-gray-900 dark:text-white leading-tight ${previewMode === 'mobile' ? 'text-xs' : 'text-sm'}`}>
                                {isRTL ? aboutSettings.titleAr : aboutSettings.titleEn}
                            </h2>

                            {/* Description */}
                            <p className={`text-gray-600 dark:text-gray-400 line-clamp-2 ${previewMode === 'mobile' ? 'text-[7px]' : 'text-[9px]'}`}>
                                {isRTL ? aboutSettings.descriptionAr : aboutSettings.descriptionEn}
                            </p>

                            {/* Features */}
                            <div className={`grid gap-1 ${previewMode === 'mobile' ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                {aboutSettings.features?.slice(0, previewMode === 'mobile' ? 2 : 4).map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-1">
                                        <CheckCircle2 className={`text-green-500 flex-shrink-0 ${previewMode === 'mobile' ? 'w-2 h-2' : 'w-3 h-3'}`} />
                                        <span className={`text-gray-700 dark:text-gray-300 ${previewMode === 'mobile' ? 'text-[7px]' : 'text-[8px]'}`}>
                                            {isRTL ? item.ar : item.en}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            {/* CTA Button */}
                            <button className={`w-fit px-2 py-1 bg-marine-600 text-white font-medium rounded ${previewMode === 'mobile' ? 'text-[7px]' : 'text-[9px]'}`}>
                                {isRTL ? aboutSettings.ctaTextAr : aboutSettings.ctaTextEn}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Count Info */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-slate-800 rounded">
                    {aboutImages.length} {isRTL ? 'صور' : 'images'}
                </span>
                <span className="px-2 py-1 bg-slate-800 rounded">
                    {previewMode === 'desktop' ? '1920×1080' : '390×844'}
                </span>
            </div>
        </div>
    );
}
