'use client';

import { useState, useEffect } from 'react';
import { Monitor, Smartphone, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeroSettings, HeroSlide, ServicesHeroSlide, CareersHeroSlide, ServicesHeroSettings, CareersHeroSettings, AboutHeroSettings, AboutHeroSlide } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';
import { getLanguageAwareImage } from '@/lib/imageUtils';
import { highlightText, getOverlayColor } from '@/lib/hero-utils';

type PreviewMode = 'desktop' | 'mobile';

interface HeroPreviewProps {
    // Common props
    activeTab: string;
    activeCategory: string;  // NEW: Sync preview with category
    previewMode: PreviewMode;
    onPreviewModeChange: (mode: PreviewMode) => void;

    // Home Hero
    settings?: HeroSettings;
    slides?: HeroSlide[];

    // Services Hero
    servicesHeroSettings?: ServicesHeroSettings;
    servicesHeroSlides?: ServicesHeroSlide[];

    // Careers Hero
    careersHeroSettings?: CareersHeroSettings;
    careersHeroSlides?: CareersHeroSlide[];

    // About Hero
    aboutHeroSettings?: AboutHeroSettings;
    aboutHeroSlides?: AboutHeroSlide[];

    // Preview slide navigation
    previewSlideIndex: number;
    onSlideChange: (index: number) => void;
}

export function HeroPreview({
    activeTab,
    activeCategory,
    previewMode,
    onPreviewModeChange,
    settings,
    slides = [],
    servicesHeroSettings,
    servicesHeroSlides = [],
    careersHeroSettings,
    careersHeroSlides = [],
    aboutHeroSettings,
    aboutHeroSlides = [],
    previewSlideIndex,
    onSlideChange,
}: HeroPreviewProps) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    // ── Blog Hero: fetch on mount + listen for real-time updates from BlogHeroSettingsTab ──
    const [blogSettings, setBlogSettings] = useState<any>(null);
    const [blogSlides, setBlogSlides] = useState<any[]>([]);

    useEffect(() => {
        if (activeCategory !== 'blog') return;
        // Initial fetch
        fetch('/api/cms/blog-hero')
            .then(r => r.json())
            .then(d => { if (d && !d.error) setBlogSettings(d); })
            .catch(() => {});
        fetch('/api/cms/blog-hero/slides')
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setBlogSlides(d.filter((s: any) => s.imageDesktopAr || s.imageDesktopEn || s.imageMobile)); })
            .catch(() => {});

        // Listen for real-time updates from BlogHeroSettingsTab
        const onSettingsUpdate = (e: Event) => setBlogSettings((e as CustomEvent).detail);
        const onSlidesUpdate = (e: Event) => setBlogSlides((e as CustomEvent).detail);
        window.addEventListener('blog-hero-settings-update', onSettingsUpdate);
        window.addEventListener('blog-hero-slides-update', onSlidesUpdate);
        return () => {
            window.removeEventListener('blog-hero-settings-update', onSettingsUpdate);
            window.removeEventListener('blog-hero-slides-update', onSlidesUpdate);
        };
    }, [activeCategory]);

    // Determine active slides and settings based on CATEGORY (not tab)
    const getActiveData = () => {
        // Services category
        if (activeCategory === 'services') {
            return {
                slides: servicesHeroSlides,
                settings: servicesHeroSettings ? {
                    blurAmount: servicesHeroSettings.blurAmount || 0,
                    overlayOpacity: servicesHeroSettings.overlayOpacity || 80,
                    overlayColor: servicesHeroSettings.overlayColor || '#1e3a5f',
                    showGrid: servicesHeroSettings.showGrid ?? true,
                    badge: isRTL ? servicesHeroSettings.badgeAr : servicesHeroSettings.badgeEn,
                    title: isRTL ? servicesHeroSettings.titleAr : servicesHeroSettings.titleEn,
                    description: isRTL ? servicesHeroSettings.descriptionAr : servicesHeroSettings.descriptionEn,
                    titleLine1Color: servicesHeroSettings.titleLine1Color || '#ffffff',
                    titleLine2Color: servicesHeroSettings.titleLine2Color || '#F97316',
                    highlightColor: servicesHeroSettings.highlightColor || '#F97316',
                    highlightWords: isRTL ? servicesHeroSettings.highlightWordsAr : servicesHeroSettings.highlightWordsEn,
                } : null,
                type: 'services' as const,
                label: isRTL ? 'صفحة الخدمات' : 'Services Page'
            };
        }
        // About category
        if (activeCategory === 'aboutpage') {
            return {
                slides: aboutHeroSlides,
                settings: aboutHeroSettings ? {
                    blurAmount: aboutHeroSettings.blurAmount || 0,
                    overlayOpacity: aboutHeroSettings.overlayOpacity || 80,
                    overlayColor: aboutHeroSettings.overlayColor || '#1e3a5f',
                    showGrid: aboutHeroSettings.showGrid ?? true,
                    badge: isRTL ? aboutHeroSettings.badgeAr : aboutHeroSettings.badgeEn,
                    // Individual title lines for About page
                    titleLine1: isRTL ? aboutHeroSettings.titleLine1Ar : aboutHeroSettings.titleLine1En,
                    titleLine2: isRTL ? aboutHeroSettings.titleLine2Ar : aboutHeroSettings.titleLine2En,
                    titleLine3: isRTL ? aboutHeroSettings.titleLine3Ar : aboutHeroSettings.titleLine3En,
                    titleLine1Color: aboutHeroSettings.titleLine1Color || '#ffffff',
                    titleLine2Color: aboutHeroSettings.titleLine2Color || '#F97316',
                    titleLine3Color: aboutHeroSettings.titleLine3Color || '#ffffff',
                    title: isRTL
                        ? `${aboutHeroSettings.titleLine1Ar || ''} ${aboutHeroSettings.titleLine2Ar || ''} ${aboutHeroSettings.titleLine3Ar || ''}`
                        : `${aboutHeroSettings.titleLine1En || ''} ${aboutHeroSettings.titleLine2En || ''} ${aboutHeroSettings.titleLine3En || ''}`,
                    description: isRTL ? aboutHeroSettings.descriptionAr : aboutHeroSettings.descriptionEn,
                    highlightColor: aboutHeroSettings.highlightColor || '#F97316',
                    highlightWords: isRTL ? aboutHeroSettings.highlightWordsAr : aboutHeroSettings.highlightWordsEn,
                } : null,
                type: 'about' as const,
                label: isRTL ? 'صفحة عن الشركة' : 'About Page'
            };
        }
        // Careers category
        if (activeCategory === 'careers') {
            return {
                slides: careersHeroSlides,
                settings: careersHeroSettings ? {
                    blurAmount: careersHeroSettings.blurAmount || 0,
                    overlayOpacity: careersHeroSettings.overlayOpacity || 80,
                    overlayColor: careersHeroSettings.overlayColor || '#1e3a5f',
                    showGrid: careersHeroSettings.showGrid ?? true,
                    badge: isRTL ? careersHeroSettings.badgeAr : careersHeroSettings.badgeEn,
                    title: isRTL ? careersHeroSettings.titleAr : careersHeroSettings.titleEn,
                    description: isRTL ? careersHeroSettings.descriptionAr : careersHeroSettings.descriptionEn,
                    titleLine1Color: careersHeroSettings.titleLine1Color || '#ffffff',
                    titleLine2Color: careersHeroSettings.titleLine2Color || '#F97316',
                    highlightColor: careersHeroSettings.highlightColor || '#F97316',
                    highlightWords: isRTL ? careersHeroSettings.highlightWordsAr : careersHeroSettings.highlightWordsEn,
                } : null,
                type: 'careers' as const,
                label: isRTL ? 'صفحة الوظائف' : 'Careers Page'
            };
        }
        // Blog category
        if (activeCategory === 'blog') {
            return {
                slides: blogSlides,
                settings: blogSettings ? {
                    blurAmount: blogSettings.blurAmount || 0,
                    overlayOpacity: blogSettings.overlayOpacity || 75,
                    overlayColor: blogSettings.overlayColor || 'marine',
                    showGrid: blogSettings.showGrid ?? true,
                    badge: isRTL ? blogSettings.badgeAr : blogSettings.badgeEn,
                    title: isRTL ? blogSettings.titleAr : blogSettings.titleEn,
                    description: isRTL ? blogSettings.subtitleAr : blogSettings.subtitleEn,
                    titleLine1Color: blogSettings.titleColor || '#ffffff',
                    titleLine2Color: blogSettings.titleColor || '#ffffff',
                    highlightColor: blogSettings.highlightColor || '#F97316',
                    highlightWords: isRTL ? blogSettings.highlightWordsAr : blogSettings.highlightWordsEn,
                } : null,
                type: 'blog' as const,
                label: isRTL ? 'المدونة' : 'Blog',
            };
        }
        // Default: Home Hero
        return {
            slides: slides,
            settings: settings ? {
                blurAmount: settings.blurAmount || 0,
                overlayOpacity: settings.overlayOpacity || 30,
                overlayColor: settings.overlayColor || '#1e3a5f',
                showGrid: settings.showGrid ?? true,
                badge: isRTL ? settings.subtitleAr : settings.subtitleEn,
                title: isRTL
                    ? `${settings.titleArLine1 || ''}\n${settings.titleArLine2 || ''}`
                    : `${settings.titleEnLine1 || ''}\n${settings.titleEnLine2 || ''}`,
                description: isRTL ? settings.descriptionAr : settings.descriptionEn,
                titleLine1Color: settings.titleLine1Color,
                titleLine2Color: settings.titleLine2Color,
                highlightColor: settings.highlightColor,
                highlightWords: isRTL ? settings.highlightWordsAr : settings.highlightWordsEn,
            } : null,
            type: 'home' as const,
            label: isRTL ? 'الصفحة الرئيسية' : 'Home Page'
        };
    };

    const { slides: activeSlides, settings: activeSettings, type, label } = getActiveData();
    const currentSlide = activeSlides[previewSlideIndex] || activeSlides[0];
    const totalSlides = activeSlides.length;

    // Get the right image for the mode
    const getImage = () => {
        if (!currentSlide) return '/images/hero/placeholder.jpg';

        // Use language-aware image selection
        const isMobile = previewMode === 'mobile';
        const selectedImage = getLanguageAwareImage(currentSlide, language, isMobile);

        return selectedImage || '/images/hero/placeholder.jpg';
    };

    // highlightText is now imported from @/lib/hero-utils

    return (
        <div className="bg-slate-900 rounded-2xl p-4 space-y-4">
            {/* Header with Device Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h3 className="text-white font-bold text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        {isRTL ? 'معاينة حية' : 'Live Preview'}
                    </h3>
                    {/* Page Label Badge */}
                    <span className="px-2.5 py-1 bg-brand-orange/20 text-brand-orange text-xs font-medium rounded-lg border border-brand-orange/30">
                        {label}
                    </span>
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
                <AnimatePresence mode="wait">
                    <motion.div
                        key={previewMode}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className={`relative overflow-hidden shadow-2xl border-2 border-slate-700 transition-all duration-300  ${previewMode === 'mobile'
                            ? 'w-[200px] aspect-[9/19] rounded-[2rem]'
                            : 'w-full aspect-video rounded-2xl'
                            }`}
                    >
                        {/* Phone Frame for Mobile */}
                        {previewMode === 'mobile' && (
                            <>
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-black rounded-b-2xl z-30 flex items-center justify-center">
                                    <div className="w-8 h-2 bg-slate-800 rounded-full" />
                                </div>
                                {/* Home Bar */}
                                <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-gray-500 rounded-full z-30" />
                            </>
                        )}

                        {/* Background Image */}
                        <div className="absolute inset-0">
                            <img
                                src={getImage()}
                                alt="Preview"
                                className={`w-full h-full object-cover transition-all duration-500 ${previewMode === 'mobile' ? 'object-[center_30%]' : 'object-center'
                                    }`}
                            />
                            {/* Blur Effect */}
                            <div
                                className="absolute inset-0 transition-all"
                                style={{ backdropFilter: `blur(${activeSettings?.blurAmount || 0}px)` }}
                            />
                            {/* Overlay — uses same getOverlayColor() as actual pages */}
                            <div
                                className="absolute inset-0 transition-all"
                                style={{ backgroundColor: getOverlayColor(activeSettings?.overlayColor || 'marine', Number(activeSettings?.overlayOpacity) || 30) }}
                            />
                            {/* Radial glow — matches actual pages */}
                            <div className={`absolute inset-y-0 ${isRTL ? 'right-0' : 'left-0'} w-[70%] pointer-events-none`} style={{ background: 'radial-gradient(ellipse 80% 70% at center, rgba(0,0,0,0.45) 0%, transparent 70%)' }} />
                            {/* Grid */}
                            {activeSettings?.showGrid && (
                                <div className="absolute inset-0 opacity-20">
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:30px_30px]" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className={`relative z-10 h-full flex flex-col justify-center ${previewMode === 'mobile' ? 'p-4 pt-8' : 'p-6'
                            }`}>
                            {/* Badge */}
                            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-full bg-gradient-to-r from-brand-orange/20 to-brand-gold/20 backdrop-blur-md border border-brand-orange/30 text-white font-bold mb-2 w-fit ${previewMode === 'mobile' ? 'text-[8px]' : 'text-xs'
                                }`}>
                                <Sparkles className={previewMode === 'mobile' ? 'w-2 h-2' : 'w-3 h-3'} />
                                <span>{activeSettings?.badge || (isRTL ? 'شريكك اللوجستي' : 'Your Logistics Partner')}</span>
                            </div>

                            {/* Title */}
                            <h1 className={`font-extrabold leading-tight text-white ${previewMode === 'mobile' ? 'text-sm' : 'text-2xl'
                                }`}>
                                {type === 'home' && activeSettings ? (
                                    <>
                                        <span style={{ color: (activeSettings as any).titleLine1Color || '#ffffff' }}>
                                            {highlightText(
                                                isRTL ? settings?.titleArLine1 : settings?.titleEnLine1,
                                                (activeSettings as any).highlightWords,
                                                (activeSettings as any).highlightColor
                                            )}
                                        </span>
                                        <br />
                                        <span style={{ color: (activeSettings as any).titleLine2Color || '#ffffff' }}>
                                            {highlightText(
                                                isRTL ? settings?.titleArLine2 : settings?.titleEnLine2,
                                                (activeSettings as any).highlightWords,
                                                (activeSettings as any).highlightColor
                                            )}
                                        </span>
                                    </>
                                ) : type === 'about' && activeSettings ? (
                                    <>
                                        <span style={{ color: (activeSettings as any).titleLine1Color || '#ffffff' }}>
                                            {highlightText(
                                                (activeSettings as any).titleLine1 || '',
                                                (activeSettings as any).highlightWords,
                                                (activeSettings as any).highlightColor
                                            )}
                                        </span>{' '}
                                        <span style={{ color: (activeSettings as any).titleLine2Color || '#F97316' }}>
                                            {highlightText(
                                                (activeSettings as any).titleLine2 || '',
                                                (activeSettings as any).highlightWords,
                                                (activeSettings as any).highlightColor
                                            )}
                                        </span>
                                        <br />
                                        <span style={{ color: (activeSettings as any).titleLine3Color || '#ffffff' }}>
                                            {highlightText(
                                                (activeSettings as any).titleLine3 || '',
                                                (activeSettings as any).highlightWords,
                                                (activeSettings as any).highlightColor
                                            )}
                                        </span>
                                    </>
                                ) : (type === 'services' || type === 'careers') && activeSettings ? (
                                    <>
                                        <span style={{ color: (activeSettings as any).titleLine1Color || '#ffffff' }}>
                                            {highlightText(
                                                activeSettings.title?.split(' ').slice(0, Math.ceil(activeSettings.title.split(' ').length / 2)).join(' ') || '',
                                                (activeSettings as any).highlightWords,
                                                (activeSettings as any).highlightColor
                                            )}
                                        </span>{' '}
                                        <span style={{ color: (activeSettings as any).titleLine2Color || '#F97316' }}>
                                            {highlightText(
                                                activeSettings.title?.split(' ').slice(Math.ceil(activeSettings.title.split(' ').length / 2)).join(' ') || '',
                                                (activeSettings as any).highlightWords,
                                                (activeSettings as any).highlightColor
                                            )}
                                        </span>
                                    </>
                                ) : (
                                    <span>
                                        {highlightText(
                                            activeSettings?.title || (isRTL ? 'عنوان الصفحة' : 'Page Title'),
                                            (activeSettings as any)?.highlightWords,
                                            (activeSettings as any)?.highlightColor || '#F97316'
                                        )}
                                    </span>
                                )}
                            </h1>

                            {/* Description */}
                            <p className={`text-gray-200 mt-2 line-clamp-2 ${previewMode === 'mobile' ? 'text-[8px]' : 'text-xs'
                                }`}>
                                {activeSettings?.description || (isRTL ? 'وصف الصفحة' : 'Page description')}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Slide Navigation */}
            {totalSlides > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => onSlideChange(Math.max(0, previewSlideIndex - 1))}
                        disabled={previewSlideIndex === 0}
                        className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-white" />
                    </button>
                    <span className="text-sm font-medium text-gray-400">
                        {isRTL
                            ? `شريحة ${previewSlideIndex + 1} من ${totalSlides}`
                            : `Slide ${previewSlideIndex + 1} of ${totalSlides}`
                        }
                    </span>
                    <button
                        onClick={() => onSlideChange(Math.min(totalSlides - 1, previewSlideIndex + 1))}
                        disabled={previewSlideIndex >= totalSlides - 1}
                        className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                </div>
            )}

            {/* Mode & Tab Indicator */}
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <span className="px-2 py-1 bg-slate-800 rounded">
                    {previewMode === 'desktop' ? '1920×1080' : '390×844'}
                </span>
                <span className="px-2 py-1 bg-slate-800 rounded capitalize">
                    {type} Hero
                </span>
            </div>
        </div>
    );
}
