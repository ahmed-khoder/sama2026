'use client';

import { Monitor, Smartphone, Upload, Trash2, GripVertical, ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImprovedSlideCardProps {
    slide: {
        id: string;
        order: number;
        imageDesktopAr?: string;
        imageDesktopEn?: string;
        imageMobile?: string;
    };
    onImageChange: (slideId: string, file: File, type: 'imageDesktopAr' | 'imageDesktopEn' | 'imageMobile') => void;
    onDelete: (slideId: string) => void;
    uploading?: string;
}

export function ImprovedSlideCard({ slide, onImageChange, onDelete, uploading }: ImprovedSlideCardProps) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-200 dark:border-slate-700 p-6 shadow-lg hover:shadow-xl transition-all">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-orange/10 rounded-lg">
                        <GripVertical className="w-5 h-5 text-brand-orange" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">
                            {isRTL ? `شريحة ${slide.order + 1}` : `Slide ${slide.order + 1}`}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {isRTL ? 'اسحب لإعادة الترتيب' : 'Drag to reorder'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => onDelete(slide.id)}
                    className="p-2.5 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-xl transition-colors"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>

            {/* Desktop Images */}
            <div className="space-y-4 mb-6">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Monitor className="w-4 h-4" />
                    {isRTL ? 'صور سطح المكتب' : 'Desktop Images'}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Arabic */}
                    <ImageUploadSlot
                        label={isRTL ? 'عربي' : 'Arabic'}
                        image={slide.imageDesktopAr}
                        color="green"
                        dimensions="1920 × 1080"
                        uploading={uploading === `${slide.id}-imageDesktopAr`}
                        onUpload={(file) => onImageChange(slide.id, file, 'imageDesktopAr')}
                    />
                    {/* English */}
                    <ImageUploadSlot
                        label={isRTL ? 'إنجليزي' : 'English'}
                        image={slide.imageDesktopEn}
                        color="blue"
                        dimensions="1920 × 1080"
                        uploading={uploading === `${slide.id}-imageDesktopEn`}
                        onUpload={(file) => onImageChange(slide.id, file, 'imageDesktopEn')}
                    />
                </div>
            </div>

            {/* Mobile Image */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <Smartphone className="w-4 h-4" />
                    {isRTL ? 'صورة الموبايل' : 'Mobile Image'}
                    <span className="text-xs text-gray-500 font-normal">({isRTL ? 'اختياري' : 'Optional'})</span>
                </h4>
                <div className="max-w-md">
                    <ImageUploadSlot
                        label=""
                        image={slide.imageMobile}
                        color="orange"
                        dimensions="1080 × 1920"
                        uploading={uploading === `${slide.id}-imageMobile`}
                        onUpload={(file) => onImageChange(slide.id, file, 'imageMobile')}
                        optional
                    />
                </div>
            </div>
        </div>
    );
}

interface ImageUploadSlotProps {
    label: string;
    image?: string;
    color: 'green' | 'blue' | 'orange';
    dimensions: string;
    uploading?: boolean;
    onUpload: (file: File) => void;
    optional?: boolean;
}

function ImageUploadSlot({ label, image, color, dimensions, uploading, onUpload, optional }: ImageUploadSlotProps) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const colorClasses = {
        green: {
            border: 'border-green-200 dark:border-green-800',
            dot: 'bg-green-500',
            button: 'bg-green-600 hover:bg-green-700',
            text: 'text-green-600 dark:text-green-400'
        },
        blue: {
            border: 'border-blue-200 dark:border-blue-800',
            dot: 'bg-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700',
            text: 'text-blue-600 dark:text-blue-400'
        },
        orange: {
            border: 'border-orange-200 dark:border-orange-800',
            dot: 'bg-orange-500',
            button: 'bg-brand-orange hover:bg-brand-orange/90',
            text: 'text-brand-orange'
        }
    };

    const colors = colorClasses[color];

    return (
        <div className="space-y-2">
            {label && (
                <label className={`flex items-center gap-2 text-xs font-medium ${colors.text}`}>
                    <div className={`w-2 h-2 rounded-full ${colors.dot}`}></div>
                    {label}
                </label>
            )}
            <div className={`relative group rounded-2xl overflow-hidden border-2 ${colors.border} aspect-video bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-700 shadow-md hover:shadow-lg transition-all`}>
                {uploading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mb-2"></div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                        </span>
                    </div>
                ) : image ? (
                    <img src={image} alt={label} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-500">
                        <ImageIcon className="w-16 h-16 mb-3 opacity-50" />
                        <span className="text-sm font-medium">{isRTL ? 'لا توجد صورة' : 'No Image'}</span>
                        <span className="text-xs opacity-60 mt-1">{dimensions}</span>
                        {optional && <span className="text-xs opacity-40 mt-1">{isRTL ? 'اختياري' : 'Optional'}</span>}
                    </div>
                )}
                {!uploading && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                        <label className={`cursor-pointer px-6 py-3 ${colors.button} rounded-xl text-white font-bold flex items-center gap-2 shadow-2xl transform hover:scale-105 transition-transform`}>
                            <Upload className="w-5 h-5" />
                            {isRTL ? 'رفع صورة' : 'Upload'}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        onUpload(e.target.files[0]);
                                    }
                                }}
                            />
                        </label>
                    </div>
                )}
            </div>
        </div>
    );
}
