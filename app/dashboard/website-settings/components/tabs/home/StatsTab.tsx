'use client';

import { StatItem } from '../../../types';

interface StatsTabProps {
    stats: StatItem[];
    isRTL: boolean;
    onStatChange: (id: string, field: keyof StatItem, value: string) => Promise<void>;
}

export function StatsTab({ stats, isRTL, onStatChange }: StatsTabProps) {
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                    {isRTL ? 'إحصائيات الهيرو' : 'Hero Statistics'}
                </h3>
                <span className="text-xs text-gray-500 bg-gray-100 dark:bg-slate-700 px-3 py-1 rounded-full">
                    {stats.length} {isRTL ? 'إحصائيات' : 'Stats'}
                </span>
            </div>

            <div className="space-y-4">
                {stats.map((stat) => (
                    <div key={stat.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {isRTL ? 'القيمة' : 'Value'}
                                </label>
                                <input
                                    type="text"
                                    value={stat.value}
                                    onChange={(e) => onStatChange(stat.id, 'value', e.target.value)}
                                    className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-center font-bold text-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {isRTL ? 'الوصف (عربي)' : 'Label (AR)'}
                                </label>
                                <input
                                    type="text"
                                    value={stat.labelAr}
                                    onChange={(e) => onStatChange(stat.id, 'labelAr', e.target.value)}
                                    className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange text-right"
                                    dir="rtl"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {isRTL ? 'الوصف (إنجليزي)' : 'Label (EN)'}
                                </label>
                                <input
                                    type="text"
                                    value={stat.labelEn}
                                    onChange={(e) => onStatChange(stat.id, 'labelEn', e.target.value)}
                                    className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">
                                    {isRTL ? 'الأيقونة' : 'Icon'}
                                </label>
                                <select
                                    value={stat.icon}
                                    onChange={(e) => onStatChange(stat.id, 'icon', e.target.value)}
                                    className="w-full p-2.5 rounded-lg bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                >
                                    <option value="Clock">Clock</option>
                                    <option value="Globe2">Globe</option>
                                    <option value="Package">Package</option>
                                    <option value="Phone">Phone</option>
                                    <option value="Users">Users</option>
                                    <option value="Award">Award</option>
                                    <option value="Ship">Ship</option>
                                    <option value="Truck">Truck</option>
                                </select>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <p className="text-xs text-green-600 dark:text-green-400 text-center pt-4 border-t border-gray-200 dark:border-slate-700">
                {isRTL
                    ? '✅ يتم حفظ الإحصائيات تلقائياً عند التعديل'
                    : '✅ Stats are saved automatically when edited'}
            </p>
        </div>
    );
}
