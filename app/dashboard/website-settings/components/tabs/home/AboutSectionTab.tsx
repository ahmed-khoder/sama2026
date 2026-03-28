'use client';

import { useState } from 'react';
import { Plus, Trash2, Upload, Image as ImageIcon, X } from 'lucide-react';
import { AboutSettings, HeroSettings } from '../../../types';

interface AboutSectionTabProps {
    aboutSettings: AboutSettings;
    heroSettings: HeroSettings;
    isRTL: boolean;
    onAboutChange: (field: keyof AboutSettings, value: any) => void;
    onHeroSettingsChange: (field: keyof HeroSettings, value: any) => void;
    onFeatureChange: (index: number, lang: 'ar' | 'en', value: string) => void;
    onAddFeature: () => void;
    onDeleteFeature: (index: number) => void;
    uploadImage: (file: File, folder: string) => Promise<string | null>;
}

export function AboutSectionTab({
    aboutSettings,
    heroSettings,
    isRTL,
    onAboutChange,
    onHeroSettingsChange,
    onFeatureChange,
    onAddFeature,
    onDeleteFeature,
    uploadImage
}: AboutSectionTabProps) {
    const [uploading, setUploading] = useState(false);

    // Default fallback images — must match the frontend defaults in app/page.tsx
    const defaultAboutImages = [
        'https://images.unsplash.com/photo-1494412574643-35d324698420?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=1200',
        'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80&w=1200',
    ];

    // Parse aboutSectionImages from comma-separated string to array
    // Fall back to default images when the field is empty (mirrors frontend behavior)
    const parsedImages = heroSettings.aboutSectionImages
        ? heroSettings.aboutSectionImages.split(',').filter(Boolean).map(url => url.trim())
        : [];
    const aboutImages = parsedImages.length > 0 ? parsedImages : defaultAboutImages;

    const handleImageUpload = async (file: File, field: keyof AboutSettings) => {
        const path = await uploadImage(file, 'about');
        if (path) {
            onAboutChange(field, path);
        }
    };

    const handleAddAboutImage = async (file: File) => {
        setUploading(true);
        try {
            const path = await uploadImage(file, 'about');
            if (path) {
                const newImages = [...aboutImages, path];
                onHeroSettingsChange('aboutSectionImages', newImages.join(','));
            }
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAboutImage = (index: number) => {
        const newImages = aboutImages.filter((_, i) => i !== index);
        onHeroSettingsChange('aboutSectionImages', newImages.join(','));
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {isRTL ? 'قسم من نحن' : 'About Section'}
            </h3>

            {/* About Section Images Gallery */}
            <div className="border-b border-gray-200 dark:border-slate-700 pb-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-brand-orange" />
                        {isRTL ? 'صور قسم من نحن' : 'About Section Images'}
                    </h4>
                    <span className="text-xs text-gray-500">
                        {parsedImages.length > 0
                            ? (isRTL ? `${aboutImages.length} صور` : `${aboutImages.length} images`)
                            : (isRTL ? `${aboutImages.length} صور (افتراضية)` : `${aboutImages.length} images (defaults)`)}
                    </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    {isRTL
                        ? 'هذه الصور تظهر في الكاروسيل الخاص بقسم "من نحن" في الصفحة الرئيسية'
                        : 'These images appear in the About section carousel on the homepage'}
                </p>

                {/* Images Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {aboutImages.map((imageUrl, index) => (
                        <div key={index} className="relative group aspect-[4/3] rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600">
                            <img
                                src={imageUrl}
                                alt={`About ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                    onClick={() => handleDeleteAboutImage(index)}
                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                    title={isRTL ? 'حذف الصورة' : 'Delete image'}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="absolute bottom-1 right-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded">
                                {index + 1}
                            </div>
                        </div>
                    ))}

                    {/* Add Image Button */}
                    <label className="relative aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 hover:border-brand-orange dark:hover:border-brand-orange transition-colors cursor-pointer flex flex-col items-center justify-center gap-2 bg-gray-50 dark:bg-slate-900">
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleAddAboutImage(file);
                            }}
                            disabled={uploading}
                        />
                        {uploading ? (
                            <div className="animate-spin w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full" />
                        ) : (
                            <>
                                <Plus className="w-6 h-6 text-gray-400" />
                                <span className="text-xs text-gray-500">{isRTL ? 'إضافة صورة' : 'Add Image'}</span>
                            </>
                        )}
                    </label>
                </div>

                {aboutImages.length === 0 && (
                    <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {isRTL
                            ? 'لا توجد صور حالياً. أضف صوراً لعرضها في الكاروسيل.'
                            : 'No images yet. Add images to display in the carousel.'}
                    </div>
                )}
            </div>

            {/* Main Content */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'العنوان (عربي)' : 'Title (AR)'}
                        </label>
                        <input
                            type="text"
                            value={aboutSettings.titleAr || ''}
                            onChange={(e) => onAboutChange('titleAr', e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'الوصف (عربي)' : 'Description (AR)'}
                        </label>
                        <textarea
                            value={aboutSettings.descriptionAr || ''}
                            onChange={(e) => onAboutChange('descriptionAr', e.target.value)}
                            rows={3}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                            dir="rtl"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'العنوان (إنجليزي)' : 'Title (EN)'}
                        </label>
                        <input
                            type="text"
                            value={aboutSettings.titleEn || ''}
                            onChange={(e) => onAboutChange('titleEn', e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'الوصف (إنجليزي)' : 'Description (EN)'}
                        </label>
                        <textarea
                            value={aboutSettings.descriptionEn || ''}
                            onChange={(e) => onAboutChange('descriptionEn', e.target.value)}
                            rows={3}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                        {isRTL ? 'المميزات' : 'Features'}
                    </h4>
                    <button
                        onClick={onAddFeature}
                        className="flex items-center gap-2 px-3 py-2 bg-marine-600 hover:bg-marine-700 text-white rounded-lg text-sm transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {isRTL ? 'إضافة' : 'Add'}
                    </button>
                </div>
                <div className="space-y-3">
                    {aboutSettings.features?.map((feature, index) => (
                        <div key={index} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                            <div className="flex items-start gap-3">
                                <div className="flex-1 grid md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={feature.ar}
                                        onChange={(e) => onFeatureChange(index, 'ar', e.target.value)}
                                        placeholder={isRTL ? 'النص بالعربي' : 'Arabic text'}
                                        className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-sm"
                                        dir="rtl"
                                    />
                                    <input
                                        type="text"
                                        value={feature.en}
                                        onChange={(e) => onFeatureChange(index, 'en', e.target.value)}
                                        placeholder={isRTL ? 'النص بالإنجليزي' : 'English text'}
                                        className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-sm"
                                    />
                                </div>
                                <button
                                    onClick={() => onDeleteFeature(index)}
                                    className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

