'use client';

import { Type } from 'lucide-react';
import { CareersHeroSettings } from '../../../types';

interface CareersContentTabProps {
    settings: CareersHeroSettings;
    isRTL: boolean;
    onSettingsChange: (field: keyof CareersHeroSettings, value: any) => void;
}

export function CareersContentTab({ settings, isRTL, onSettingsChange }: CareersContentTabProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-gray-200 dark:border-slate-700">
                <div className="p-2.5 bg-gradient-to-br from-brand-orange/20 to-brand-gold/20 rounded-xl">
                    <Type className="w-5 h-5 text-brand-orange" />
                </div>
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {isRTL ? 'نصوص الهيرو' : 'Hero Content'}
                    </h3>
                    <p className="text-xs text-gray-500">
                        {isRTL ? 'تخصيص النصوص المعروضة' : 'Customize displayed text'}
                    </p>
                </div>
            </div>

            {/* Badge */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isRTL ? 'الشارة (Badge)' : 'Badge Text'}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={settings.badgeAr || ''}
                        onChange={(e) => onSettingsChange('badgeAr', e.target.value)}
                        placeholder={isRTL ? 'الشارة بالعربي' : 'Badge (Arabic)'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                        dir="rtl"
                    />
                    <input
                        type="text"
                        value={settings.badgeEn || ''}
                        onChange={(e) => onSettingsChange('badgeEn', e.target.value)}
                        placeholder={isRTL ? 'الشارة بالإنجليزي' : 'Badge (English)'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                    />
                </div>
            </div>

            {/* Title */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isRTL ? 'العنوان الرئيسي' : 'Main Title'}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={settings.titleAr || ''}
                        onChange={(e) => onSettingsChange('titleAr', e.target.value)}
                        placeholder={isRTL ? 'العنوان بالعربي' : 'Title (Arabic)'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                        dir="rtl"
                    />
                    <input
                        type="text"
                        value={settings.titleEn || ''}
                        onChange={(e) => onSettingsChange('titleEn', e.target.value)}
                        placeholder={isRTL ? 'العنوان بالإنجليزي' : 'Title (English)'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                    />
                </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isRTL ? 'الوصف' : 'Description'}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                    <textarea
                        value={settings.descriptionAr || ''}
                        onChange={(e) => onSettingsChange('descriptionAr', e.target.value)}
                        placeholder={isRTL ? 'الوصف بالعربي' : 'Description (Arabic)'}
                        rows={3}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                        dir="rtl"
                    />
                    <textarea
                        value={settings.descriptionEn || ''}
                        onChange={(e) => onSettingsChange('descriptionEn', e.target.value)}
                        placeholder={isRTL ? 'الوصف بالإنجليزي' : 'Description (English)'}
                        rows={3}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                    />
                </div>
            </div>

            {/* Highlight Words */}
            <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isRTL ? 'كلمات التظليل (باللون البرتقالي)' : 'Highlight Words (Orange Color)'}
                </label>
                <p className="text-xs text-gray-500 -mt-1">
                    {isRTL ? 'أدخل الكلمات مفصولة بفواصل (مثال: سما, وظائف)' : 'Enter words separated by commas (e.g., SAMA, careers)'}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={settings.highlightWordsAr || ''}
                        onChange={(e) => onSettingsChange('highlightWordsAr', e.target.value)}
                        placeholder={isRTL ? 'سما, وظائف' : 'Arabic words to highlight'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                        dir="rtl"
                    />
                    <input
                        type="text"
                        value={settings.highlightWordsEn || ''}
                        onChange={(e) => onSettingsChange('highlightWordsEn', e.target.value)}
                        placeholder={isRTL ? 'SAMA, careers' : 'English words to highlight'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                    />
                </div>
            </div>
        </div>
    );
}
