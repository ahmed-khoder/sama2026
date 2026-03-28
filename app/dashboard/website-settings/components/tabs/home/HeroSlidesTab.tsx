'use client';

import { Plus, Trash2, ChevronUp, ChevronDown, RefreshCw, Monitor, Smartphone, Upload, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { HeroSlide } from '../../../types';
import { useConfirm } from '@/contexts/ConfirmContext';

interface HeroSlidesTabProps {
    slides: HeroSlide[];
    slidesLoading: boolean;
    isRTL: boolean;
    onAddSlide: () => void;
    onDeleteSlide: (id: string) => Promise<void>;
    onMoveSlide: (id: string, direction: 'up' | 'down') => Promise<void>;
    onUpdateSlideImage: (slideId: string, field: 'imageDesktopAr' | 'imageDesktopEn' | 'imageMobile', path: string) => Promise<void>;
    uploadImage: (file: File, folder: string) => Promise<string | null>;
}

export function HeroSlidesTab({
    slides,
    slidesLoading,
    isRTL,
    onAddSlide,
    onDeleteSlide,
    onMoveSlide,
    onUpdateSlideImage,
    uploadImage
}: HeroSlidesTabProps) {
    const { confirm } = useConfirm();
    const [uploading, setUploading] = useState<string | null>(null);

    const handleImageChange = async (slideId: string, file: File, type: 'imageDesktopAr' | 'imageDesktopEn' | 'imageMobile') => {
        setUploading(`${slideId}-${type}`);
        try {
            const path = await uploadImage(file, 'hero');
            if (path) {
                await onUpdateSlideImage(slideId, type, path);
            }
        } finally {
            setUploading(null);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {isRTL ? 'شرائح الهيرو' : 'Hero Slides'}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {isRTL ? 'أضف صور للديسكتوب والموبايل لكل شريحة' : 'Add desktop and mobile images for each slide'}
                    </p>
                </div>
                <button
                    onClick={onAddSlide}
                    className="px-4 py-2.5 bg-brand-orange hover:bg-brand-orange/90 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    {isRTL ? 'إضافة شريحة' : 'Add Slide'}
                </button>
            </div>

            {/* Slides */}
            {slidesLoading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-brand-orange" />
                </div>
            ) : slides.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-30" />
                    <p>{isRTL ? 'لا توجد شرائح. أضف شريحة للبدء.' : 'No slides yet. Add a slide to get started.'}</p>
                </div>
            ) : (
                <div className="space-y-8">
                    {slides.map((slide, index) => (
                        <div key={slide.id} className="bg-gray-50 dark:bg-slate-900 rounded-2xl p-6 border border-gray-200 dark:border-slate-700">
                            {/* Slide Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-4">
                                    <span className="px-4 py-2 bg-brand-orange text-white text-sm font-bold rounded-xl">
                                        {isRTL ? `شريحة ${index + 1}` : `Slide ${index + 1}`}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onMoveSlide(slide.id, 'up')}
                                            disabled={index === 0}
                                            className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 rounded-lg"
                                        >
                                            <ChevronUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onMoveSlide(slide.id, 'down')}
                                            disabled={index === slides.length - 1}
                                            className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-30 rounded-lg"
                                        >
                                            <ChevronDown className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        const confirmed = await confirm({
                                            title: isRTL ? 'حذف الشريحة' : 'Delete Slide',
                                            message: isRTL ? 'هل أنت متأكد؟' : 'Are you sure?',
                                            confirmText: isRTL ? 'حذف' : 'Delete',
                                            cancelText: isRTL ? 'إلغاء' : 'Cancel'
                                        });
                                        if (confirmed) onDeleteSlide(slide.id);
                                    }}
                                    className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 rounded-xl"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Desktop Images - 2 Columns */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                    <Monitor className="w-4 h-4" />
                                    {isRTL ? 'صور الديسكتوب' : 'Desktop Images'}
                                </h4>
                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Arabic */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-bold text-green-600">
                                            <div className="w-2 h-2 rounded-full bg-green-500" />
                                            {isRTL ? 'عربي' : 'Arabic'}
                                        </label>
                                        <div className="relative group rounded-2xl overflow-hidden border-2 border-green-300 dark:border-green-800 aspect-video bg-gray-100 dark:bg-slate-800 shadow-lg">
                                            {uploading === `${slide.id}-imageDesktopAr` ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <RefreshCw className="w-10 h-10 animate-spin text-green-600" />
                                                </div>
                                            ) : slide.imageDesktopAr ? (
                                                <img src={slide.imageDesktopAr} alt="AR" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-12 h-12 mb-2" />
                                                    <span className="text-sm">1920 × 1080</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                <label className="cursor-pointer px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-white font-bold flex items-center gap-2 transform hover:scale-105 transition-transform">
                                                    <Upload className="w-5 h-5" />
                                                    {isRTL ? 'رفع' : 'Upload'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageChange(slide.id, e.target.files[0], 'imageDesktopAr')} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* English */}
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-xs font-bold text-blue-600">
                                            <div className="w-2 h-2 rounded-full bg-blue-500" />
                                            {isRTL ? 'إنجليزي' : 'English'}
                                        </label>
                                        <div className="relative group rounded-2xl overflow-hidden border-2 border-blue-300 dark:border-blue-800 aspect-video bg-gray-100 dark:bg-slate-800 shadow-lg">
                                            {uploading === `${slide.id}-imageDesktopEn` ? (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
                                                </div>
                                            ) : slide.imageDesktopEn ? (
                                                <img src={slide.imageDesktopEn} alt="EN" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                    <ImageIcon className="w-12 h-12 mb-2" />
                                                    <span className="text-sm">1920 × 1080</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                                <label className="cursor-pointer px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-bold flex items-center gap-2 transform hover:scale-105 transition-transform">
                                                    <Upload className="w-5 h-5" />
                                                    {isRTL ? 'رفع' : 'Upload'}
                                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageChange(slide.id, e.target.files[0], 'imageDesktopEn')} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
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
                                    <div className="relative group rounded-2xl overflow-hidden border-2 border-orange-300 dark:border-orange-800 aspect-video bg-gray-100 dark:bg-slate-800 shadow-lg">
                                        {uploading === `${slide.id}-imageMobile` ? (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <RefreshCw className="w-10 h-10 animate-spin text-brand-orange" />
                                            </div>
                                        ) : slide.imageMobile ? (
                                            <img src={slide.imageMobile} alt="Mobile" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                                <Smartphone className="w-12 h-12 mb-2" />
                                                <span className="text-sm">1080 × 1920</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <label className="cursor-pointer px-6 py-3 bg-brand-orange hover:bg-brand-orange/90 rounded-xl text-white font-bold flex items-center gap-2 transform hover:scale-105 transition-transform">
                                                <Upload className="w-5 h-5" />
                                                {isRTL ? 'رفع' : 'Upload'}
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleImageChange(slide.id, e.target.files[0], 'imageMobile')} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
