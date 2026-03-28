'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Truck, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { FleetTruckItem } from '../../../types';
import { authFetch } from '@/lib/auth-fetch';

interface Props {
    trucks: FleetTruckItem[];
    onAdd: (truck: Partial<FleetTruckItem>) => Promise<boolean>;
    onUpdate: (truck: FleetTruckItem) => Promise<boolean>;
    onDelete: (id: string) => Promise<void>;
}

export function FleetTab({ trucks, onAdd, onUpdate, onDelete }: Props) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [editing, setEditing] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<FleetTruckItem>>({});
    const [showAdd, setShowAdd] = useState(false);
    const [newTruck, setNewTruck] = useState<Partial<FleetTruckItem>>({ nameAr: '', nameEn: '', descAr: '', descEn: '', specsJson: '[]' });
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (file: File, callback: (path: string) => void) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'fleet');
            const res = await authFetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                callback(data.path);
            }
        } catch (err) {
            console.error('Upload failed:', err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-600" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {isRTL ? 'أسطول الشاحنات' : 'Fleet Showcase'}
                    </h3>
                </div>
                <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition">
                    <Plus className="w-4 h-4" />{isRTL ? 'إضافة شاحنة' : 'Add Truck'}
                </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'إدارة شاحنات الأسطول المعروضة في صفحة الخدمات.' : 'Manage fleet trucks displayed on the Services page.'}
            </p>

            {/* Add Form */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="border border-amber-200 dark:border-amber-800 rounded-xl p-4 bg-amber-50/50 dark:bg-amber-900/20 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs text-gray-500">{isRTL ? 'الاسم (عربي)' : 'Name (AR)'}</label><input value={newTruck.nameAr || ''} onChange={e => setNewTruck(p => ({ ...p, nameAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div><label className="text-xs text-gray-500">{isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'}</label><input value={newTruck.nameEn || ''} onChange={e => setNewTruck(p => ({ ...p, nameEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div className="col-span-2"><label className="text-xs text-gray-500">{isRTL ? 'الوصف (عربي)' : 'Description (AR)'}</label><textarea value={newTruck.descAr || ''} onChange={e => setNewTruck(p => ({ ...p, descAr: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div className="col-span-2"><label className="text-xs text-gray-500">{isRTL ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label><textarea value={newTruck.descEn || ''} onChange={e => setNewTruck(p => ({ ...p, descEn: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">{isRTL ? 'الصورة' : 'Image'}</label>
                                <div className="flex items-center gap-2">
                                    {newTruck.image && <img src={newTruck.image} alt="" className="w-16 h-12 object-cover rounded" />}
                                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <Upload className="w-4 h-4" />{uploading ? (isRTL ? 'جارٍ الرفع...' : 'Uploading...') : (isRTL ? 'رفع صورة' : 'Upload')}
                                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, path => setNewTruck(p => ({ ...p, image: path }))); }} />
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-2"><label className="text-xs text-gray-500">{isRTL ? 'المواصفات (JSON)' : 'Specs (JSON)'}</label><textarea value={newTruck.specsJson || '[]'} onChange={e => setNewTruck(p => ({ ...p, specsJson: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm font-mono text-xs" placeholder='[{"labelAr":"المحرك","labelEn":"Engine","valueAr":"V6","valueEn":"V6"}]' /></div>
                        </div>
                        <button onClick={async () => { const ok = await onAdd(newTruck); if (ok) { setNewTruck({ nameAr: '', nameEn: '', descAr: '', descEn: '', specsJson: '[]' }); setShowAdd(false); } }} className="w-full py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium">
                            {isRTL ? 'إضافة شاحنة' : 'Add Truck'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Trucks List */}
            <div className="space-y-3">
                {trucks.map(truck => (
                    <div key={truck.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
                        {editing === truck.id ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs text-gray-500">Name AR</label><input value={draft.nameAr ?? truck.nameAr} onChange={e => setDraft(p => ({ ...p, nameAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div><label className="text-xs text-gray-500">Name EN</label><input value={draft.nameEn ?? truck.nameEn} onChange={e => setDraft(p => ({ ...p, nameEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div className="col-span-2"><label className="text-xs text-gray-500">Desc AR</label><textarea value={draft.descAr ?? truck.descAr} onChange={e => setDraft(p => ({ ...p, descAr: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div className="col-span-2"><label className="text-xs text-gray-500">Desc EN</label><textarea value={draft.descEn ?? truck.descEn} onChange={e => setDraft(p => ({ ...p, descEn: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500">{isRTL ? 'الصورة' : 'Image'}</label>
                                        <div className="flex items-center gap-2">
                                            {(draft.image || truck.image) && <img src={draft.image || truck.image} alt="" className="w-16 h-12 object-cover rounded" />}
                                            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <Upload className="w-4 h-4" />{isRTL ? 'تغيير' : 'Change'}
                                                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, path => setDraft(p => ({ ...p, image: path }))); }} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-span-2"><label className="text-xs text-gray-500">Specs JSON</label><textarea value={draft.specsJson ?? truck.specsJson} onChange={e => setDraft(p => ({ ...p, specsJson: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm font-mono text-xs" /></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={async () => { await onUpdate({ ...truck, ...draft } as FleetTruckItem); setEditing(null); setDraft({}); }} className="flex-1 py-1.5 bg-amber-600 text-white rounded-lg text-sm flex items-center justify-center gap-1"><Save className="w-3.5 h-3.5" />{isRTL ? 'حفظ' : 'Save'}</button>
                                    <button onClick={() => { setEditing(null); setDraft({}); }} className="px-4 py-1.5 border rounded-lg text-sm">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {truck.image && <img src={truck.image} alt="" className="w-12 h-9 object-cover rounded" />}
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white text-sm">{isRTL ? truck.nameAr : truck.nameEn}</p>
                                        <p className="text-xs text-gray-500">{isRTL ? truck.descAr.slice(0, 60) : truck.descEn.slice(0, 60)}...</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => { setEditing(truck.id); setDraft({}); }} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{isRTL ? 'تعديل' : 'Edit'}</button>
                                    <button onClick={() => onDelete(truck.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {trucks.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-8">{isRTL ? 'لا توجد شاحنات بعد' : 'No trucks yet'}</p>
                )}
            </div>
        </div>
    );
}
