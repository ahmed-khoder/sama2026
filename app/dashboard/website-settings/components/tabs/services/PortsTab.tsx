'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Save, Anchor, Upload } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { PortOperationItem } from '../../../types';
import { authFetch } from '@/lib/auth-fetch';

interface Props {
    ports: PortOperationItem[];
    onAdd: (port: Partial<PortOperationItem>) => Promise<boolean>;
    onUpdate: (port: PortOperationItem) => Promise<boolean>;
    onDelete: (id: string) => Promise<void>;
}

export function PortsTab({ ports, onAdd, onUpdate, onDelete }: Props) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [editing, setEditing] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<PortOperationItem>>({});
    const [showAdd, setShowAdd] = useState(false);
    const [newPort, setNewPort] = useState<Partial<PortOperationItem>>({ nameAr: '', nameEn: '', descAr: '', descEn: '', factsJson: '[]' });
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (file: File, callback: (path: string) => void) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'ports');
            const res = await authFetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) { const data = await res.json(); callback(data.path); }
        } catch (err) { console.error('Upload failed:', err); }
        finally { setUploading(false); }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Anchor className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {isRTL ? 'عمليات الموانئ' : 'Port Operations'}
                    </h3>
                </div>
                <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus className="w-4 h-4" />{isRTL ? 'إضافة ميناء' : 'Add Port'}
                </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'إدارة الموانئ المعروضة في صفحة الخدمات.' : 'Manage ports displayed on the Services page.'}
            </p>

            {/* Add Form */}
            <AnimatePresence>
                {showAdd && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="border border-blue-200 dark:border-blue-800 rounded-xl p-4 bg-blue-50/50 dark:bg-blue-900/20 space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs text-gray-500">{isRTL ? 'الاسم (عربي)' : 'Name (AR)'}</label><input value={newPort.nameAr || ''} onChange={e => setNewPort(p => ({ ...p, nameAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div><label className="text-xs text-gray-500">{isRTL ? 'الاسم (إنجليزي)' : 'Name (EN)'}</label><input value={newPort.nameEn || ''} onChange={e => setNewPort(p => ({ ...p, nameEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div className="col-span-2"><label className="text-xs text-gray-500">{isRTL ? 'الوصف (عربي)' : 'Description (AR)'}</label><textarea value={newPort.descAr || ''} onChange={e => setNewPort(p => ({ ...p, descAr: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div className="col-span-2"><label className="text-xs text-gray-500">{isRTL ? 'الوصف (إنجليزي)' : 'Description (EN)'}</label><textarea value={newPort.descEn || ''} onChange={e => setNewPort(p => ({ ...p, descEn: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                            <div className="col-span-2">
                                <label className="text-xs text-gray-500">{isRTL ? 'الصورة' : 'Image'}</label>
                                <div className="flex items-center gap-2">
                                    {newPort.image && <img src={newPort.image} alt="" className="w-16 h-12 object-cover rounded" />}
                                    <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                        <Upload className="w-4 h-4" />{uploading ? '...' : (isRTL ? 'رفع صورة' : 'Upload')}
                                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, path => setNewPort(p => ({ ...p, image: path }))); }} />
                                    </label>
                                </div>
                            </div>
                            <div className="col-span-2"><label className="text-xs text-gray-500">{isRTL ? 'الحقائق (JSON)' : 'Facts (JSON)'}</label><textarea value={newPort.factsJson || '[]'} onChange={e => setNewPort(p => ({ ...p, factsJson: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm font-mono text-xs" placeholder='[{"ar":"بوابة قناة السويس","en":"Gateway to the Suez Canal"}]' /></div>
                        </div>
                        <button onClick={async () => { const ok = await onAdd(newPort); if (ok) { setNewPort({ nameAr: '', nameEn: '', descAr: '', descEn: '', factsJson: '[]' }); setShowAdd(false); } }} className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                            {isRTL ? 'إضافة ميناء' : 'Add Port'}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Ports List */}
            <div className="space-y-3">
                {ports.map(port => (
                    <div key={port.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800/50">
                        {editing === port.id ? (
                            <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div><label className="text-xs text-gray-500">Name AR</label><input value={draft.nameAr ?? port.nameAr} onChange={e => setDraft(p => ({ ...p, nameAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div><label className="text-xs text-gray-500">Name EN</label><input value={draft.nameEn ?? port.nameEn} onChange={e => setDraft(p => ({ ...p, nameEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div className="col-span-2"><label className="text-xs text-gray-500">Desc AR</label><textarea value={draft.descAr ?? port.descAr} onChange={e => setDraft(p => ({ ...p, descAr: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div className="col-span-2"><label className="text-xs text-gray-500">Desc EN</label><textarea value={draft.descEn ?? port.descEn} onChange={e => setDraft(p => ({ ...p, descEn: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" /></div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-gray-500">Image</label>
                                        <div className="flex items-center gap-2">
                                            {(draft.image || port.image) && <img src={draft.image || port.image} alt="" className="w-16 h-12 object-cover rounded" />}
                                            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <Upload className="w-4 h-4" />{isRTL ? 'تغيير' : 'Change'}
                                                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, path => setDraft(p => ({ ...p, image: path }))); }} />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="col-span-2"><label className="text-xs text-gray-500">Facts JSON</label><textarea value={draft.factsJson ?? port.factsJson} onChange={e => setDraft(p => ({ ...p, factsJson: e.target.value }))} rows={3} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm font-mono text-xs" /></div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={async () => { await onUpdate({ ...port, ...draft } as PortOperationItem); setEditing(null); setDraft({}); }} className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-sm flex items-center justify-center gap-1"><Save className="w-3.5 h-3.5" />{isRTL ? 'حفظ' : 'Save'}</button>
                                    <button onClick={() => { setEditing(null); setDraft({}); }} className="px-4 py-1.5 border rounded-lg text-sm">{isRTL ? 'إلغاء' : 'Cancel'}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {port.image && <img src={port.image} alt="" className="w-12 h-9 object-cover rounded" />}
                                    <div>
                                        <p className="font-medium text-gray-800 dark:text-white text-sm">{isRTL ? port.nameAr : port.nameEn}</p>
                                        <p className="text-xs text-gray-500">{isRTL ? port.descAr.slice(0, 60) : port.descEn.slice(0, 60)}...</p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button onClick={() => { setEditing(port.id); setDraft({}); }} className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600">{isRTL ? 'تعديل' : 'Edit'}</button>
                                    <button onClick={() => onDelete(port.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {ports.length === 0 && (
                    <p className="text-center text-sm text-gray-400 py-8">{isRTL ? 'لا توجد موانئ بعد' : 'No ports yet'}</p>
                )}
            </div>
        </div>
    );
}
