'use client';

import { Palette } from 'lucide-react';
import { CareersHeroSettings } from '../../../types';

interface CareersStylingTabProps {
    settings: CareersHeroSettings;
    isRTL: boolean;
    onSettingsChange: (field: keyof CareersHeroSettings, value: any) => void;
}

// Responsive Color Picker Component
function ColorPickerField({
    label,
    value,
    onChange,
    isRTL
}: {
    label: string;
    value: string | undefined;
    onChange: (color: string) => void;
    isRTL: boolean;
}) {
    const currentColor = value || '#ffffff';

    return (
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl space-y-2 sm:space-y-3">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">
                {label}
            </label>

            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                    <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl cursor-pointer border-2 sm:border-4 border-white dark:border-slate-700 shadow-lg hover:scale-105 transition-transform"
                    />
                </div>

                <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                        <span className="text-brand-orange font-bold text-sm sm:text-base">#</span>
                        <input
                            type="text"
                            value={currentColor.replace('#', '').toUpperCase()}
                            onChange={(e) => {
                                const hex = e.target.value.replace('#', '');
                                // Allow typing any valid hex characters
                                if (/^[0-9A-Fa-f]{0,6}$/.test(hex)) {
                                    // Always update the display value for typing
                                    onChange(`#${hex}`);
                                }
                            }}
                            onBlur={(e) => {
                                // On blur, ensure complete 6-character hex
                                const hex = e.target.value.replace('#', '');
                                if (hex.length > 0 && hex.length < 6) {
                                    // Pad incomplete hex with the last character repeated
                                    const paddedHex = hex.padEnd(6, hex[hex.length - 1] || '0');
                                    onChange(`#${paddedHex}`);
                                }
                            }}
                            className="flex-1 min-w-0 bg-transparent border-none text-gray-900 dark:text-white font-mono text-sm sm:text-base lg:text-lg uppercase focus:outline-none"
                            maxLength={6}
                            placeholder="FFFFFF"
                        />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                        {isRTL ? 'اضغط للاختيار' : 'Click to pick'}
                    </p>
                </div>
            </div>
        </div>
    );
}

export function CareersStylingTab({ settings, isRTL, onSettingsChange }: CareersStylingTabProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-slate-700">
                <div className="p-2 sm:p-2.5 bg-gradient-to-br from-brand-orange/20 to-brand-gold/20 rounded-lg sm:rounded-xl flex-shrink-0">
                    <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" />
                </div>
                <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">
                        {isRTL ? 'التنسيق والألوان' : 'Styling & Colors'}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                        {isRTL ? 'تخصيص ألوان وخطوط العناوين' : 'Customize title colors and fonts'}
                    </p>
                </div>
            </div>

            {/* Text Colors Section */}
            <div className="space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    {isRTL ? 'ألوان النصوص' : 'Text Colors'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <ColorPickerField
                        label={isRTL ? 'لون العنوان الرئيسي' : 'Main Title Color'}
                        value={settings.titleColor}
                        onChange={(color) => onSettingsChange('titleColor', color)}
                        isRTL={isRTL}
                    />
                    <ColorPickerField
                        label={isRTL ? 'لون السطر الأول' : 'Line 1 Color'}
                        value={settings.titleLine1Color}
                        onChange={(color) => onSettingsChange('titleLine1Color', color)}
                        isRTL={isRTL}
                    />
                    <ColorPickerField
                        label={isRTL ? 'لون السطر الثاني' : 'Line 2 Color'}
                        value={settings.titleLine2Color}
                        onChange={(color) => onSettingsChange('titleLine2Color', color)}
                        isRTL={isRTL}
                    />
                    <ColorPickerField
                        label={isRTL ? 'لون التظليل' : 'Highlight Color'}
                        value={settings.highlightColor}
                        onChange={(color) => onSettingsChange('highlightColor', color)}
                        isRTL={isRTL}
                    />
                </div>
            </div>

            {/* Typography Section */}
            <div className="border-t border-gray-200 dark:border-slate-700 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
                    {isRTL ? 'الخطوط' : 'Typography'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'حجم العنوان' : 'Title Size'}
                        </label>
                        <select
                            value={settings.titleFontSize || 'text-5xl'}
                            onChange={(e) => onSettingsChange('titleFontSize', e.target.value)}
                            className="w-full p-2 sm:p-3 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                        >
                            <option value="text-3xl">{isRTL ? 'صغير' : 'Small'}</option>
                            <option value="text-4xl">{isRTL ? 'متوسط' : 'Medium'}</option>
                            <option value="text-5xl">{isRTL ? 'كبير' : 'Large'}</option>
                            <option value="text-6xl">{isRTL ? 'كبير جداً' : 'X-Large'}</option>
                            <option value="text-7xl">{isRTL ? 'ضخم' : 'Huge'}</option>
                        </select>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'وزن العنوان' : 'Title Weight'}
                        </label>
                        <select
                            value={settings.titleFontWeight || 'font-extrabold'}
                            onChange={(e) => onSettingsChange('titleFontWeight', e.target.value)}
                            className="w-full p-2 sm:p-3 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                        >
                            <option value="font-normal">Normal</option>
                            <option value="font-medium">Medium</option>
                            <option value="font-semibold">Semibold</option>
                            <option value="font-bold">Bold</option>
                            <option value="font-extrabold">Extra Bold</option>
                            <option value="font-black">Black</option>
                        </select>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'خط العربي' : 'Arabic Font'}
                        </label>
                        <select
                            value={settings.titleFontFamilyAr || 'font-arabic'}
                            onChange={(e) => onSettingsChange('titleFontFamilyAr', e.target.value)}
                            className="w-full p-2 sm:p-3 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                        >
                            <option value="font-arabic">Default Arabic</option>
                            <option value="font-cairo">Cairo</option>
                            <option value="font-tajawal">Tajawal</option>
                        </select>
                    </div>
                    <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'خط الإنجليزي' : 'English Font'}
                        </label>
                        <select
                            value={settings.titleFontFamilyEn || 'font-outfit'}
                            onChange={(e) => onSettingsChange('titleFontFamilyEn', e.target.value)}
                            className="w-full p-2 sm:p-3 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange focus:border-transparent"
                        >
                            <option value="font-outfit">Outfit</option>
                            <option value="font-inter">Inter</option>
                            <option value="font-roboto">Roboto</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
