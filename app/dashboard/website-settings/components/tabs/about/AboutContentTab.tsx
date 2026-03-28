'use client';

import { Type } from 'lucide-react';
import { AboutHeroSettings } from '../../../types';

interface AboutContentTabProps {
    settings: AboutHeroSettings;
    isRTL: boolean;
    onSettingsChange: (field: keyof AboutHeroSettings, value: any) => void;
}

export function AboutContentTab({ settings, isRTL, onSettingsChange }: AboutContentTabProps) {
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

            {/* Title Lines - Arabic */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isRTL ? 'العنوان (عربي) - 3 أسطر' : 'Title (Arabic) - 3 Lines'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                        type="text"
                        value={settings.titleLine1Ar || ''}
                        onChange={(e) => onSettingsChange('titleLine1Ar', e.target.value)}
                        placeholder={isRTL ? 'سطر 1' : 'Line 1'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                        dir="rtl"
                    />
                    <input
                        type="text"
                        value={settings.titleLine2Ar || ''}
                        onChange={(e) => onSettingsChange('titleLine2Ar', e.target.value)}
                        placeholder={isRTL ? 'سطر 2' : 'Line 2'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                        dir="rtl"
                    />
                    <input
                        type="text"
                        value={settings.titleLine3Ar || ''}
                        onChange={(e) => onSettingsChange('titleLine3Ar', e.target.value)}
                        placeholder={isRTL ? 'سطر 3' : 'Line 3'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                        dir="rtl"
                    />
                </div>
            </div>

            {/* Title Lines - English */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isRTL ? 'العنوان (إنجليزي) - 3 أسطر' : 'Title (English) - 3 Lines'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                        type="text"
                        value={settings.titleLine1En || ''}
                        onChange={(e) => onSettingsChange('titleLine1En', e.target.value)}
                        placeholder="Line 1"
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                    />
                    <input
                        type="text"
                        value={settings.titleLine2En || ''}
                        onChange={(e) => onSettingsChange('titleLine2En', e.target.value)}
                        placeholder="Line 2"
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                    />
                    <input
                        type="text"
                        value={settings.titleLine3En || ''}
                        onChange={(e) => onSettingsChange('titleLine3En', e.target.value)}
                        placeholder="Line 3"
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
                    {isRTL ? 'أدخل الكلمات مفصولة بفواصل (مثال: سما, لوجستيات)' : 'Enter words separated by commas (e.g., SAMA, Logistics)'}
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        value={settings.highlightWordsAr || ''}
                        onChange={(e) => onSettingsChange('highlightWordsAr', e.target.value)}
                        placeholder={isRTL ? 'سما, لوجستيات' : 'Arabic words to highlight'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                        dir="rtl"
                    />
                    <input
                        type="text"
                        value={settings.highlightWordsEn || ''}
                        onChange={(e) => onSettingsChange('highlightWordsEn', e.target.value)}
                        placeholder={isRTL ? 'SAMA, Logistics' : 'English words to highlight'}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange"
                    />
                </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isRTL ? 'أزرار الدعوة للعمل' : 'CTA Buttons'}
                </label>
                <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl space-y-3">
                        <p className="text-xs font-medium text-brand-orange">{isRTL ? 'الزر الرئيسي' : 'Primary Button'}</p>
                        <input
                            type="text"
                            value={settings.ctaPrimaryTextAr || ''}
                            onChange={(e) => onSettingsChange('ctaPrimaryTextAr', e.target.value)}
                            placeholder={isRTL ? 'النص بالعربي' : 'Text (Arabic)'}
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-sm"
                            dir="rtl"
                        />
                        <input
                            type="text"
                            value={settings.ctaPrimaryTextEn || ''}
                            onChange={(e) => onSettingsChange('ctaPrimaryTextEn', e.target.value)}
                            placeholder={isRTL ? 'النص بالإنجليزي' : 'Text (English)'}
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-sm"
                        />
                        <input
                            type="text"
                            value={settings.ctaPrimaryLink || ''}
                            onChange={(e) => onSettingsChange('ctaPrimaryLink', e.target.value)}
                            placeholder="/contact"
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-sm font-mono"
                        />
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-slate-900 rounded-xl space-y-3">
                        <p className="text-xs font-medium text-gray-500">{isRTL ? 'الزر الثانوي' : 'Secondary Button'}</p>
                        <input
                            type="text"
                            value={settings.ctaSecondaryTextAr || ''}
                            onChange={(e) => onSettingsChange('ctaSecondaryTextAr', e.target.value)}
                            placeholder={isRTL ? 'النص بالعربي' : 'Text (Arabic)'}
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-sm"
                            dir="rtl"
                        />
                        <input
                            type="text"
                            value={settings.ctaSecondaryTextEn || ''}
                            onChange={(e) => onSettingsChange('ctaSecondaryTextEn', e.target.value)}
                            placeholder={isRTL ? 'النص بالإنجليزي' : 'Text (English)'}
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-sm"
                        />
                        <input
                            type="text"
                            value={settings.ctaSecondaryLink || ''}
                            onChange={(e) => onSettingsChange('ctaSecondaryLink', e.target.value)}
                            placeholder="/services"
                            className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 text-sm font-mono"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
