'use client';

import { HeroSettings } from '../../../types';

interface HeroSettingsTabProps {
    settings: HeroSettings;
    isRTL: boolean;
    onSettingsChange: (field: keyof HeroSettings, value: any) => void;
}

export function HeroSettingsTab({ settings, isRTL, onSettingsChange }: HeroSettingsTabProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">
                {isRTL ? 'إعدادات الخلفية' : 'Background Settings'}
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
                {/* Blur Amount */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'تعتيم الخلفية' : 'Blur Amount'} ({settings.blurAmount}px)
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
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'شفافية الطبقة' : 'Overlay Opacity'} ({settings.overlayOpacity}%)
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

                {/* Overlay Color */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {isRTL ? 'لون الطبقة' : 'Overlay Color'}
                    </label>
                    <div className="flex gap-3">
                        {[
                            { id: 'marine', label: 'Marine', color: 'from-marine-600 to-marine-800' },
                            { id: 'black', label: 'Dark', color: 'from-slate-700 to-slate-900' },
                            { id: 'orange', label: 'Orange', color: 'from-orange-600 to-orange-800' },
                        ].map(opt => (
                            <button
                                key={opt.id}
                                onClick={() => onSettingsChange('overlayColor', opt.id)}
                                className={`flex-1 p-3 rounded-xl border-2 transition-all ${settings.overlayColor === opt.id
                                    ? 'border-brand-orange ring-2 ring-brand-orange/20'
                                    : 'border-gray-200 dark:border-slate-600'
                                    }`}
                            >
                                <div className={`h-8 rounded-lg bg-gradient-to-r ${opt.color} mb-2`} />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Show Grid */}
                <div className="flex items-center">
                    <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl bg-gray-50 dark:bg-slate-900 w-full">
                        <input
                            type="checkbox"
                            checked={settings.showGrid}
                            onChange={(e) => onSettingsChange('showGrid', e.target.checked)}
                            className="w-5 h-5 rounded text-brand-orange focus:ring-brand-orange"
                        />
                        <div>
                            <span className="text-gray-700 dark:text-gray-300 font-medium block">
                                {isRTL ? 'الشبكة الزخرفية' : 'Grid Pattern'}
                            </span>
                            <span className="text-xs text-gray-500">
                                {isRTL ? 'إظهار نمط الشبكة فوق الخلفية' : 'Show grid pattern overlay'}
                            </span>
                        </div>
                    </label>
                </div>
            </div>
        </div>
    );
}
