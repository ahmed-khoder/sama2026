'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, RefreshCw, Monitor, Smartphone, Upload, Image as ImageIcon, Layers, Type, Settings } from 'lucide-react';
import { SlideImageUploader } from '../../SlideImageUploader';
import { AboutHeroSlide, AboutHeroSettings } from '../../../types';
import { useConfirm } from '@/contexts/ConfirmContext';

interface AboutHeroTabProps {
    slides: AboutHeroSlide[];
    settings: AboutHeroSettings;
    slidesLoading: boolean;
    isRTL: boolean;
    onAddSlide: () => void;
    onDeleteSlide: (id: string) => Promise<void>;
    onMoveSlide: (id: string, direction: 'up' | 'down') => Promise<void>;
    onUpdateSlideImage: (slideId: string, field: 'imageDesktopAr' | 'imageDesktopEn' | 'imageMobile', path: string) => Promise<void>;
    onSettingsChange: (field: keyof AboutHeroSettings, value: any) => void;
    uploadImage: (file: File, folder: string) => Promise<string | null>;
}

type SubSection = 'slides' | 'styling';

export function AboutHeroTab({
    slides,
    settings,
    slidesLoading,
    isRTL,
    onAddSlide,
    onDeleteSlide,
    onMoveSlide,
    onUpdateSlideImage,
    onSettingsChange,
    uploadImage
}: AboutHeroTabProps) {
    const { confirm } = useConfirm();
    const [activeSection, setActiveSection] = useState<SubSection>('slides');
    const [uploading, setUploading] = useState<string | null>(null);

    const handleImageChange = async (slideId: string, file: File, type: 'imageDesktopAr' | 'imageDesktopEn' | 'imageMobile') => {
        setUploading(`${slideId}-${type}`);
        const path = await uploadImage(file, 'about-hero');
        if (path) {
            await onUpdateSlideImage(slideId, type, path);
        }
        setUploading(null);
    };

    return (
        <div className="space-y-4">
            {/* Sub-Section Toggle */}
            <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-900 rounded-xl">
                <button
                    onClick={() => setActiveSection('slides')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === 'slides'
                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                        }`}
                >
                    <Layers className="w-4 h-4" />
                    {isRTL ? 'الشرائح' : 'Slides'}
                </button>
                <button
                    onClick={() => setActiveSection('styling')}
                    className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeSection === 'styling'
                        ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
                        }`}
                >
                    <Settings className="w-4 h-4" />
                    {isRTL ? 'التأثيرات' : 'Effects'}
                </button>
            </div>

            {/* SLIDES SECTION */}
            {activeSection === 'slides' && (
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                            {isRTL ? 'شرائح الهيرو' : 'Hero Slides'}
                        </h3>
                        <button
                            onClick={onAddSlide}
                            className="flex items-center gap-2 px-3 py-2 bg-brand-orange text-white rounded-xl hover:bg-brand-orange/90 transition-colors text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">{isRTL ? 'إضافة' : 'Add'}</span>
                        </button>
                    </div>

                    {slidesLoading ? (
                        <div className="flex justify-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-brand-orange" />
                        </div>
                    ) : slides.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            {isRTL ? 'لا توجد شرائح' : 'No slides yet'}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {slides.map((slide, index) => (
                                <div key={slide.id} className="p-6 border border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-900 space-y-6">
                                    {/* Header */}
                                    <div className="flex items-center justify-between">
                                        <span className="px-4 py-2 bg-brand-orange text-white text-sm font-bold rounded-xl">
                                            {isRTL ? `شريحة ${index + 1}` : `Slide ${index + 1}`}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => onMoveSlide(slide.id, 'up')} disabled={index === 0} className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 disabled:opacity-30 rounded-lg"><ChevronUp className="w-4 h-4" /></button>
                                            <button onClick={() => onMoveSlide(slide.id, 'down')} disabled={index === slides.length - 1} className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 disabled:opacity-30 rounded-lg"><ChevronDown className="w-4 h-4" /></button>
                                            <button onClick={async () => {
                                                const confirmed = await confirm({
                                                    title: isRTL ? 'حذف الشريحة' : 'Delete Slide',
                                                    message: isRTL ? 'هل تريد حذف هذه الشريحة؟' : 'Delete this slide?',
                                                    confirmText: isRTL ? 'حذف' : 'Delete',
                                                    cancelText: isRTL ? 'إلغاء' : 'Cancel',
                                                    type: 'danger'
                                                });
                                                if (confirmed) onDeleteSlide(slide.id);
                                            }} className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>

                                    {/* Desktop Images - 2 Columns */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                            <Monitor className="w-4 h-4" />
                                            {isRTL ? 'صور الديسكتوب' : 'Desktop Images'}
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <SlideImageUploader imageUrl={slide.imageDesktopAr} type="desktop-ar" isRTL={isRTL} uploading={uploading === `${slide.id}-imageDesktopAr`} onImageChange={(file) => handleImageChange(slide.id, file, 'imageDesktopAr')} onImageDelete={() => onUpdateSlideImage(slide.id, 'imageDesktopAr', '')} />
                                            <SlideImageUploader imageUrl={slide.imageDesktopEn} type="desktop-en" isRTL={isRTL} uploading={uploading === `${slide.id}-imageDesktopEn`} onImageChange={(file) => handleImageChange(slide.id, file, 'imageDesktopEn')} onImageDelete={() => onUpdateSlideImage(slide.id, 'imageDesktopEn', '')} />
                                        </div>
                                    </div>

                                    {/* Mobile Image */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                            <Smartphone className="w-4 h-4" />
                                            {isRTL ? 'صورة الموبايل' : 'Mobile Image'}
                                            <span className="text-xs text-gray-500 font-normal">({isRTL ? 'اختياري' : 'Optional'})</span>
                                        </h4>
                                        <div className="max-w-sm">
                                            <SlideImageUploader imageUrl={slide.imageMobile} type="mobile" isRTL={isRTL} uploading={uploading === `${slide.id}-imageMobile`} onImageChange={(file) => handleImageChange(slide.id, file, 'imageMobile')} onImageDelete={() => onUpdateSlideImage(slide.id, 'imageMobile', '')} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* STYLING/EFFECTS SECTION */}
            {activeSection === 'styling' && (
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                        {isRTL ? 'التأثيرات البصرية' : 'Visual Effects'}
                    </h3>

                    <div className="grid sm:grid-cols-2 gap-6">
                        {/* Blur Amount */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isRTL ? 'تعتيم الخلفية' : 'Blur'} ({settings.blurAmount}px)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="20"
                                value={settings.blurAmount}
                                onChange={(e) => onSettingsChange('blurAmount', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-brand-orange"
                            />
                        </div>

                        {/* Overlay Opacity */}
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isRTL ? 'شفافية الطبقة' : 'Overlay'} ({settings.overlayOpacity}%)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.overlayOpacity}
                                onChange={(e) => onSettingsChange('overlayOpacity', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-brand-orange"
                            />
                        </div>
                    </div>

                    {/* Overlay Color */}
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isRTL ? 'لون الطبقة' : 'Overlay Color'}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: 'marine', label: isRTL ? 'أزرق' : 'Marine', color: 'from-marine-600 to-marine-800' },
                                { id: 'black', label: isRTL ? 'داكن' : 'Dark', color: 'from-slate-700 to-slate-900' },
                                { id: 'orange', label: isRTL ? 'برتقالي' : 'Orange', color: 'from-orange-600 to-orange-800' },
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => onSettingsChange('overlayColor', opt.id)}
                                    className={`p-3 rounded-xl border-2 transition-all ${settings.overlayColor === opt.id
                                        ? 'border-brand-orange ring-2 ring-brand-orange/20'
                                        : 'border-gray-200 dark:border-slate-600'
                                        }`}
                                >
                                    <div className={`h-6 rounded-lg bg-gradient-to-r ${opt.color} mb-1`} />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {isRTL ? 'الشبكة الزخرفية' : 'Grid Pattern'}
                                </p>
                            </div>
                            <button
                                onClick={() => onSettingsChange('showGrid', !settings.showGrid)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${settings.showGrid ? 'bg-brand-orange' : 'bg-gray-300 dark:bg-slate-600'
                                    }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.showGrid ? 'right-1' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {isRTL ? 'الجزيئات المتحركة' : 'Particles'}
                                </p>
                            </div>
                            <button
                                onClick={() => onSettingsChange('showParticles', !settings.showParticles)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${settings.showParticles ? 'bg-brand-orange' : 'bg-gray-300 dark:bg-slate-600'
                                    }`}
                            >
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.showParticles ? 'right-1' : 'left-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
