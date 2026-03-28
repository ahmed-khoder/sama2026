'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, BarChart3 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { ServicesPageStatItem, serviceIconOptions } from '../../../types';

interface Props {
    stats: ServicesPageStatItem[];
    onAdd: (stat: Partial<ServicesPageStatItem>) => Promise<boolean>;
    onUpdate: (stat: ServicesPageStatItem) => Promise<boolean>;
    onDelete: (id: string) => Promise<void>;
}

export function ServicesStatsTab({ stats, onAdd, onUpdate, onDelete }: Props) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [editing, setEditing] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<ServicesPageStatItem>>({});
    const [showAdd, setShowAdd] = useState(false);
    const [newStat, setNewStat] = useState<Partial<ServicesPageStatItem>>({ icon: 'Truck', valueAr: '', valueEn: '', labelAr: '', labelEn: '' });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-sky-600" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {isRTL ? 'إحصائيات شريط القدرات' : 'Capability Stats Bar'}
                    </h3>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition"
                >
                    <Plus className="w-4 h-4" />
                    {isRTL ? 'إضافة' : 'Add'}
                </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'الأرقام التي تظهر في شريط القدرات أسفل الهيرو في صفحة الخدمات.' : 'Stats displayed in the capabilities bar below the hero on the Services page.'}
            </p>

            {/* Add Form */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="border border-sky-200 dark:border-sky-800 rounded-xl p-4 bg-sky-50/50 dark:bg-sky-900/20 space-y-3"
                    >
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500">{isRTL ? 'الأيقونة' : 'Icon'}</label>
                                <select
                                    value={newStat.icon}
                                    onChange={e => setNewStat(p => ({ ...p, icon: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm"
                                >
                                    {serviceIconOptions.map(o => <option key={o.name} value={o.name}>{o.label}</option>)}
                                    <option value="Anchor">Anchor</option>
                                    <option value="Weight">Weight</option>
                                    <option value="Clock">Clock</option>
                                    <option value="Globe">Globe</option>
                                    <option value="Container">Container</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{isRTL ? 'القيمة (عربي)' : 'Value (AR)'}</label>
                                <input value={newStat.valueAr || ''} onChange={e => setNewStat(p => ({ ...p, valueAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" placeholder="15+" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{isRTL ? 'القيمة (إنجليزي)' : 'Value (EN)'}</label>
                                <input value={newStat.valueEn || ''} onChange={e => setNewStat(p => ({ ...p, valueEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" placeholder="15+" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{isRTL ? 'التسمية (عربي)' : 'Label (AR)'}</label>
                                <input value={newStat.labelAr || ''} onChange={e => setNewStat(p => ({ ...p, labelAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" placeholder="شاحنة ثقيلة" />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{isRTL ? 'التسمية (إنجليزي)' : 'Label (EN)'}</label>
                                <input value={newStat.labelEn || ''} onChange={e => setNewStat(p => ({ ...p, labelEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" placeholder="Heavy Trucks" />
                            </div>
                        </div>
                        <button
                            onClick={async () => {
                                const ok = await onAdd(newStat);
                                if (ok) { setNewStat({ icon: 'Truck', valueAr: '', valueEn: '', labelAr: '', labelEn: '' }); setShowAdd(false); }
                            }}
                            className="w-full py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 text-sm font-medium"
                        >
                            {isRTL ? 'إضافة إحصائية' : 'Add Stat'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats List */}
            <div className="space-y-3">
                {stats.map(stat => (
                    <div key={stat.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
                        {editing === stat.id ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">Icon</label>
                                        <select value={draft.icon || stat.icon} onChange={e => setDraft(p => ({ ...p, icon: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm">
                                            {serviceIconOptions.map(o => <option key={o.name} value={o.name}>{o.label}</option>)}
                                            <option value="Anchor">Anchor</option>
                                            <option value="Weight">Weight</option>
                                            <option value="Clock">Clock</option>
                                            <option value="Globe">Globe</option>
                                            <option value="Container">Container</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Value AR</label>
                                        <input value={draft.valueAr ?? stat.valueAr} onChange={e => setDraft(p => ({ ...p, valueAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Value EN</label>
                                        <input value={draft.valueEn ?? stat.valueEn} onChange={e => setDraft(p => ({ ...p, valueEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Label AR</label>
                                        <input value={draft.labelAr ?? stat.labelAr} onChange={e => setDraft(p => ({ ...p, labelAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">Label EN</label>
                                        <input value={draft.labelEn ?? stat.labelEn} onChange={e => setDraft(p => ({ ...p, labelEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={async () => { await onUpdate({ ...stat, ...draft }); setEditing(null); setDraft({}); }} className="flex-1 py-1.5 bg-sky-600 text-white rounded-lg text-sm flex items-center justify-center gap-1"><Save className="w-3.5 h-3.5" />{isRTL ? 'حفظ' : 'Save'}</button>
                                    <button onClick={() => { setEditing(null); setDraft({}); }} className="px-4 py-1.5 border rounded-lg text-sm">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-xl font-bold text-sky-600">{isRTL ? stat.valueAr : stat.valueEn}</span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{isRTL ? stat.labelAr : stat.labelEn}</span>
                                    <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded">{stat.icon}</span>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => { setEditing(stat.id); setDraft({}); }} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{isRTL ? 'تعديل' : 'Edit'}</button>
                                    <button onClick={() => onDelete(stat.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {stats.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-8">{isRTL ? 'لا توجد إحصائيات بعد' : 'No stats yet'}</p>
                )}
            </div>
        </div>
    );
}
