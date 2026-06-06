'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Package, Image, AlertCircle, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SpecializedCargoItem, serviceIconOptions } from '../../../types';

interface Props {
    cargo: SpecializedCargoItem[];
    onAdd: (cargo: Partial<SpecializedCargoItem>) => Promise<boolean>;
    onUpdate: (cargo: SpecializedCargoItem) => Promise<boolean>;
    onDelete: (id: string) => Promise<void>;
}

const gradientOptions = [
    { value: 'from-amber-500 to-orange-600', label: 'Amber → Orange' },
    { value: 'from-sky-500 to-blue-600', label: 'Sky → Blue' },
    { value: 'from-emerald-500 to-teal-600', label: 'Emerald → Teal' },
    { value: 'from-purple-500 to-indigo-600', label: 'Purple → Indigo' },
    { value: 'from-rose-500 to-red-600', label: 'Rose → Red' },
    { value: 'from-cyan-500 to-blue-600', label: 'Cyan → Blue' },
];

// ── Image Preview Field Component ──────────────────────
function ImagePreviewField({ value, onChange, isRTL }: { value: string; onChange: (v: string) => void; isRTL: boolean }) {
    const [imgError, setImgError] = React.useState(false);
    const [imgLoaded, setImgLoaded] = React.useState(false);
    const hasUrl = value.trim().length > 0;

    React.useEffect(() => { setImgError(false); setImgLoaded(false); }, [value]);

    return (
        <div className="col-span-2 space-y-2">
            <label className="text-xs text-gray-500 flex items-center gap-1">
                <Image className="w-3 h-3" />
                {isRTL ? 'صورة الخلفية (اختياري)' : 'Background Image (optional)'}
            </label>
            <div className="relative">
                <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full px-3 py-2 pr-8 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition"
                    placeholder={isRTL ? '/images/cargo/image.jpg أو رابط خارجي' : '/images/cargo/image.jpg or external URL'}
                />
                {hasUrl && (
                    <button type="button" onClick={() => onChange('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-red-500 transition">
                        <X className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
            <p className="text-[10px] text-gray-400">
                {isRTL ? 'أدخل مسار صورة محلي أو رابط خارجي. الأبعاد المُوصى بها: 800×600' : 'Enter a local path or external URL. Recommended: 800×600px'}
            </p>

            {/* Preview / Empty State */}
            {hasUrl ? (
                <div className="relative rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900/50" style={{ maxHeight: 160 }}>
                    {!imgLoaded && !imgError && (
                        <div className="flex items-center justify-center h-24 text-xs text-gray-400">
                            {isRTL ? 'جاري التحميل...' : 'Loading preview...'}
                        </div>
                    )}
                    {imgError ? (
                        <div className="flex items-center justify-center gap-2 h-24 text-xs text-red-400">
                            <AlertCircle className="w-4 h-4" />
                            {isRTL ? 'الرابط غير صالح أو الصورة غير متاحة' : 'Invalid URL or image not found'}
                        </div>
                    ) : (
                        <img
                            src={value}
                            alt="preview"
                            className={`w-full object-cover transition-opacity duration-300 ${imgLoaded ? 'opacity-100' : 'opacity-0'}`}
                            style={{ maxHeight: 156 }}
                            onLoad={() => setImgLoaded(true)}
                            onError={() => setImgError(true)}
                        />
                    )}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/30">
                    <Image className="w-5 h-5 text-gray-300 dark:text-gray-600 mb-1" />
                    <span className="text-[10px] text-gray-400">{isRTL ? 'أدخل رابط صورة للمعاينة' : 'Enter an image URL to preview'}</span>
                </div>
            )}
        </div>
    );
}

export function CargoTab({ cargo, onAdd, onUpdate, onDelete }: Props) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [editing, setEditing] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<SpecializedCargoItem>>({});
    const [showAdd, setShowAdd] = useState(false);
    const [newCargo, setNewCargo] = useState<Partial<SpecializedCargoItem>>({ icon: 'Package', titleAr: '', titleEn: '', badgeAr: '', badgeEn: '', descAr: '', descEn: '', gradient: 'from-sky-500 to-blue-600', image: '', slug: '' });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {isRTL ? 'البضائع المتخصصة' : 'Specialized Cargo'}
                    </h3>
                </div>
                <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition">
                    <Plus className="w-4 h-4" />{isRTL ? 'إضافة نوع' : 'Add Type'}
                </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'إدارة أنواع البضائع المتخصصة المعروضة في صفحة الخدمات.' : 'Manage specialized cargo types on the Services page.'}
            </p>

            {/* Add Form */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 bg-emerald-50/50 dark:bg-emerald-900/20 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs text-gray-500">{isRTL ? 'الأيقونة' : 'Icon'}</label>
                                <select value={newCargo.icon} onChange={e => setNewCargo(p => ({ ...p, icon: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm">
                                    {serviceIconOptions.map(o => <option key={o.name} value={o.name}>{o.label}</option>)}
                                    <option value="Weight">Weight</option>
                                    <option value="Container">Container</option>
                                    <option value="Package">Package</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500">{isRTL ? 'التدرج اللوني' : 'Gradient'}</label>
                                <select value={newCargo.gradient} onChange={e => setNewCargo(p => ({ ...p, gradient: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm">
                                    {gradientOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                                </select>
                            </div>
                            <div><label className="text-xs text-gray-500">{isRTL ? 'العنوان (عربي)' : 'Title (AR)'}</label><input value={newCargo.titleAr || ''} onChange={e => setNewCargo(p => ({ ...p, titleAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div><label className="text-xs text-gray-500">{isRTL ? 'العنوان (إنجليزي)' : 'Title (EN)'}</label><input value={newCargo.titleEn || ''} onChange={e => setNewCargo(p => ({ ...p, titleEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div><label className="text-xs text-gray-500">{isRTL ? 'الشارة (عربي)' : 'Badge (AR)'}</label><input value={newCargo.badgeAr || ''} onChange={e => setNewCargo(p => ({ ...p, badgeAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" placeholder="50-60 طن" /></div>
                            <div><label className="text-xs text-gray-500">{isRTL ? 'الشارة (إنجليزي)' : 'Badge (EN)'}</label><input value={newCargo.badgeEn || ''} onChange={e => setNewCargo(p => ({ ...p, badgeEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" placeholder="50-60 Tons" /></div>
                            <div className="col-span-2"><label className="text-xs text-gray-500">{isRTL ? 'الوصف (عربي)' : 'Description (AR)'}</label><textarea value={newCargo.descAr || ''} onChange={e => setNewCargo(p => ({ ...p, descAr: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div className="col-span-2"><label className="text-xs text-gray-500">{isRTL ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label><textarea value={newCargo.descEn || ''} onChange={e => setNewCargo(p => ({ ...p, descEn: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <ImagePreviewField value={newCargo.image || ''} onChange={v => setNewCargo(p => ({ ...p, image: v }))} isRTL={isRTL} />
                        </div>
                        <button onClick={async () => { const ok = await onAdd(newCargo); if (ok) { setNewCargo({ icon: 'Package', titleAr: '', titleEn: '', badgeAr: '', badgeEn: '', descAr: '', descEn: '', gradient: 'from-sky-500 to-blue-600', image: '', slug: '' }); setShowAdd(false); } }} className="w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                            {isRTL ? 'إضافة نوع البضاعة' : 'Add Cargo Type'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cargo List */}
            <div className="space-y-3">
                {cargo.map(item => (
                    <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
                        {editing === item.id ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs text-gray-500">Icon</label><select value={draft.icon ?? item.icon} onChange={e => setDraft(p => ({ ...p, icon: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm">{serviceIconOptions.map(o => <option key={o.name} value={o.name}>{o.label}</option>)}<option value="Weight">Weight</option><option value="Container">Container</option><option value="Package">Package</option></select></div>
                                    <div><label className="text-xs text-gray-500">Gradient</label><select value={draft.gradient ?? item.gradient} onChange={e => setDraft(p => ({ ...p, gradient: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm">{gradientOptions.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}</select></div>
                                    <div><label className="text-xs text-gray-500">Title AR</label><input value={draft.titleAr ?? item.titleAr} onChange={e => setDraft(p => ({ ...p, titleAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div><label className="text-xs text-gray-500">Title EN</label><input value={draft.titleEn ?? item.titleEn} onChange={e => setDraft(p => ({ ...p, titleEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div><label className="text-xs text-gray-500">Badge AR</label><input value={draft.badgeAr ?? item.badgeAr} onChange={e => setDraft(p => ({ ...p, badgeAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div><label className="text-xs text-gray-500">Badge EN</label><input value={draft.badgeEn ?? item.badgeEn} onChange={e => setDraft(p => ({ ...p, badgeEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div className="col-span-2"><label className="text-xs text-gray-500">Desc AR</label><textarea value={draft.descAr ?? item.descAr} onChange={e => setDraft(p => ({ ...p, descAr: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div className="col-span-2"><label className="text-xs text-gray-500">Desc EN</label><textarea value={draft.descEn ?? item.descEn} onChange={e => setDraft(p => ({ ...p, descEn: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <ImagePreviewField value={draft.image ?? item.image ?? ''} onChange={v => setDraft(p => ({ ...p, image: v }))} isRTL={isRTL} />
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={async () => { await onUpdate({ ...item, ...draft } as SpecializedCargoItem); setEditing(null); setDraft({}); }} className="flex-1 py-1.5 bg-emerald-600 text-white rounded-lg text-sm flex items-center justify-center gap-1"><Save className="w-3.5 h-3.5" />{isRTL ? 'حفظ' : 'Save'}</button>
                                    <button onClick={() => { setEditing(null); setDraft({}); }} className="px-4 py-1.5 border rounded-lg text-sm">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${item.gradient} flex items-center justify-center`}>
                                        <span className="text-white text-xs font-bold">{item.icon.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white text-sm">{isRTL ? item.titleAr : item.titleEn}</p>
                                        <p className="text-xs text-gray-500">{isRTL ? item.badgeAr : item.badgeEn} · {isRTL ? item.descAr.slice(0, 40) : item.descEn.slice(0, 40)}...</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => { setEditing(item.id); setDraft({}); }} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{isRTL ? 'تعديل' : 'Edit'}</button>
                                    <button onClick={() => onDelete(item.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {cargo.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-8">{isRTL ? 'لا توجد أنواع بعد' : 'No cargo types yet'}</p>
                )}
            </div>
        </div>
    );
}
