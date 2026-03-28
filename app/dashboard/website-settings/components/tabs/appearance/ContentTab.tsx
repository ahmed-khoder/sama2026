'use client';

import { HeroSettings } from '../../../types';

interface ContentTabProps {
    settings: HeroSettings;
    isRTL: boolean;
    onSettingsChange: (field: keyof HeroSettings, value: any) => void;
}

export function ContentTab({ settings, isRTL, onSettingsChange }: ContentTabProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                {isRTL ? 'المحتوى النصي' : 'Text Content'}
            </h3>

            {/* Arabic Content */}
            <div className="space-y-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 bg-marine-100 dark:bg-marine-900 rounded flex items-center justify-center text-xs font-bold text-marine-600">ع</span>
                    {isRTL ? 'المحتوى العربي' : 'Arabic Content'}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'العنوان الفرعي' : 'Subtitle'}
                        </label>
                        <input
                            type="text"
                            value={settings.subtitleAr || ''}
                            onChange={(e) => onSettingsChange('subtitleAr', e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'العنوان - السطر الأول' : 'Title - Line 1'}
                        </label>
                        <input
                            type="text"
                            value={settings.titleArLine1 || ''}
                            onChange={(e) => onSettingsChange('titleArLine1', e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'العنوان - السطر الثاني' : 'Title - Line 2'}
                        </label>
                        <input
                            type="text"
                            value={settings.titleArLine2 || ''}
                            onChange={(e) => onSettingsChange('titleArLine2', e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'كلمات التظليل' : 'Highlight Words'}
                        </label>
                        <input
                            type="text"
                            value={settings.highlightWordsAr || ''}
                            onChange={(e) => onSettingsChange('highlightWordsAr', e.target.value)}
                            placeholder={isRTL ? 'كلمة1, كلمة2' : 'word1, word2'}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            dir="rtl"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'الوصف' : 'Description'}
                        </label>
                        <textarea
                            value={settings.descriptionAr || ''}
                            onChange={(e) => onSettingsChange('descriptionAr', e.target.value)}
                            rows={2}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                            dir="rtl"
                        />
                    </div>
                </div>
            </div>

            {/* English Content */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 bg-brand-orange/20 rounded flex items-center justify-center text-xs font-bold text-brand-orange">EN</span>
                    {isRTL ? 'المحتوى الإنجليزي' : 'English Content'}
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'العنوان الفرعي' : 'Subtitle'}
                        </label>
                        <input
                            type="text"
                            value={settings.subtitleEn || ''}
                            onChange={(e) => onSettingsChange('subtitleEn', e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'العنوان - السطر الأول' : 'Title - Line 1'}
                        </label>
                        <input
                            type="text"
                            value={settings.titleEnLine1 || ''}
                            onChange={(e) => onSettingsChange('titleEnLine1', e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'العنوان - السطر الثاني' : 'Title - Line 2'}
                        </label>
                        <input
                            type="text"
                            value={settings.titleEnLine2 || ''}
                            onChange={(e) => onSettingsChange('titleEnLine2', e.target.value)}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'كلمات التظليل' : 'Highlight Words'}
                        </label>
                        <input
                            type="text"
                            value={settings.highlightWordsEn || ''}
                            onChange={(e) => onSettingsChange('highlightWordsEn', e.target.value)}
                            placeholder="word1, word2"
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                            {isRTL ? 'الوصف' : 'Description'}
                        </label>
                        <textarea
                            value={settings.descriptionEn || ''}
                            onChange={(e) => onSettingsChange('descriptionEn', e.target.value)}
                            rows={2}
                            className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
