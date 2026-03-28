'use client';

import { Plus, Trash2, ChevronUp, ChevronDown, Calendar, Upload, Save, X } from 'lucide-react';
import { useState } from 'react';
import { MilestoneItem, FuturePulseSettings } from '../../../types';
import { useConfirm } from '@/contexts/ConfirmContext';
import { authFetch } from '@/lib/auth-fetch';

interface MilestonesTabProps {
    milestones: MilestoneItem[];
    isRTL: boolean;
    onAddMilestone: (milestone: Partial<MilestoneItem>) => Promise<boolean>;
    onUpdateMilestone: (milestone: MilestoneItem) => Promise<boolean>;
    onDeleteMilestone: (id: string) => Promise<void>;
    onMoveMilestone: (id: string, direction: 'up' | 'down') => Promise<void>;
    futurePulse: FuturePulseSettings;
    onUpdateFuturePulse: (data: FuturePulseSettings) => Promise<boolean>;
}

export function MilestonesTab({
    milestones,
    isRTL,
    onAddMilestone,
    onUpdateMilestone,
    onDeleteMilestone,
    onMoveMilestone,
    futurePulse,
    onUpdateFuturePulse
}: MilestonesTabProps) {
    const { confirm } = useConfirm();
    const [showAddForm, setShowAddForm] = useState(false);
    const [newMilestone, setNewMilestone] = useState<Partial<MilestoneItem>>({});
    const [adding, setAdding] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState<string | null>(null);
    const [draft, setDraft] = useState<Partial<MilestoneItem>>({});
    const [fpDraft, setFpDraft] = useState<FuturePulseSettings>(futurePulse);
    const [fpSaving, setFpSaving] = useState(false);
    const [fpUploading, setFpUploading] = useState(false);

    const handleImageUpload = async (file: File, callback: (path: string) => void) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'milestones');
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

    const handleAdd = async () => {
        setAdding(true);
        const success = await onAddMilestone(newMilestone);
        if (success) {
            setNewMilestone({});
            setShowAddForm(false);
        }
        setAdding(false);
    };

    const handleSaveEdit = async (milestone: MilestoneItem) => {
        await onUpdateMilestone({ ...milestone, ...draft } as MilestoneItem);
        setEditing(null);
        setDraft({});
    };

    const milestonesSection = (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {isRTL ? 'المحطات الرئيسية' : 'Milestones'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {milestones.length} {isRTL ? 'محطة' : 'milestones'}
                    </p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-marine-600 hover:bg-marine-700 text-white rounded-xl transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>{isRTL ? 'إضافة محطة' : 'Add Milestone'}</span>
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-marine-50 to-brand-orange/10 dark:from-marine-900/30 dark:to-brand-orange/5 border border-marine-200 dark:border-marine-800 space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                        {isRTL ? 'إضافة محطة جديدة' : 'Add New Milestone'}
                    </h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                {isRTL ? 'السنة' : 'Year'}
                            </label>
                            <input
                                type="text"
                                value={newMilestone.year || ''}
                                onChange={(e) => setNewMilestone(prev => ({ ...prev, year: e.target.value }))}
                                placeholder="2024"
                                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                {isRTL ? 'العنوان بالعربي' : 'Title (AR)'}
                            </label>
                            <input
                                type="text"
                                value={newMilestone.titleAr || ''}
                                onChange={(e) => setNewMilestone(prev => ({ ...prev, titleAr: e.target.value }))}
                                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                {isRTL ? 'العنوان بالإنجليزي' : 'Title (EN)'}
                            </label>
                            <input
                                type="text"
                                value={newMilestone.titleEn || ''}
                                onChange={(e) => setNewMilestone(prev => ({ ...prev, titleEn: e.target.value }))}
                                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                {isRTL ? 'الوصف بالعربي' : 'Description (AR)'}
                            </label>
                            <textarea
                                value={newMilestone.descriptionAr || ''}
                                onChange={(e) => setNewMilestone(prev => ({ ...prev, descriptionAr: e.target.value }))}
                                rows={2}
                                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                                dir="rtl"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                {isRTL ? 'الوصف بالإنجليزي' : 'Description (EN)'}
                            </label>
                            <textarea
                                value={newMilestone.descriptionEn || ''}
                                onChange={(e) => setNewMilestone(prev => ({ ...prev, descriptionEn: e.target.value }))}
                                rows={2}
                                className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                            />
                        </div>
                        {/* Image Upload */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                                {isRTL ? 'صورة المحطة (اختياري)' : 'Milestone Image (Optional)'}
                            </label>
                            <div className="flex items-center gap-3">
                                {newMilestone.image && (
                                    <div className="relative group">
                                        <img src={newMilestone.image} alt="" className="w-20 h-14 object-cover rounded-lg border border-gray-200 dark:border-slate-600" />
                                        <button
                                            onClick={() => setNewMilestone(prev => ({ ...prev, image: undefined }))}
                                            className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                    </div>
                                )}
                                <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                    <Upload className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-500">{uploading ? (isRTL ? 'جارٍ الرفع...' : 'Uploading...') : (isRTL ? 'رفع صورة' : 'Upload Image')}</span>
                                    <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, path => setNewMilestone(p => ({ ...p, image: path }))); }} />
                                </label>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleAdd}
                            disabled={adding || !newMilestone.year || !newMilestone.titleAr || !newMilestone.titleEn}
                            className="flex-1 px-4 py-3 bg-marine-600 hover:bg-marine-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 text-white rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            {isRTL ? 'إضافة المحطة' : 'Add Milestone'}
                        </button>
                        <button
                            onClick={() => { setShowAddForm(false); setNewMilestone({}); }}
                            className="px-4 py-3 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                    </div>
                </div>
            )}

            {/* Milestones List */}
            <div className="space-y-3">
                {milestones.map((milestone, idx) => (
                    <div key={milestone.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700">
                        {editing === milestone.id ? (
                            /* ── EDIT MODE ── */
                            <div className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs text-gray-500">{isRTL ? 'السنة' : 'Year'}</label>
                                        <input value={draft.year ?? milestone.year} onChange={e => setDraft(p => ({ ...p, year: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">{isRTL ? 'العنوان (عربي)' : 'Title (AR)'}</label>
                                        <input value={draft.titleAr ?? milestone.titleAr} onChange={e => setDraft(p => ({ ...p, titleAr: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" dir="rtl" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">{isRTL ? 'العنوان (إنجليزي)' : 'Title (EN)'}</label>
                                        <input value={draft.titleEn ?? milestone.titleEn} onChange={e => setDraft(p => ({ ...p, titleEn: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-500">{isRTL ? 'الوصف (عربي)' : 'Desc (AR)'}</label>
                                        <textarea value={draft.descriptionAr ?? milestone.descriptionAr} onChange={e => setDraft(p => ({ ...p, descriptionAr: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" dir="rtl" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500">{isRTL ? 'الوصف (إنجليزي)' : 'Desc (EN)'}</label>
                                        <textarea value={draft.descriptionEn ?? milestone.descriptionEn} onChange={e => setDraft(p => ({ ...p, descriptionEn: e.target.value }))} rows={2} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm" />
                                    </div>
                                    {/* Image Edit */}
                                    <div className="md:col-span-2">
                                        <label className="text-xs text-gray-500">{isRTL ? 'الصورة' : 'Image'}</label>
                                        <div className="flex items-center gap-3 mt-1">
                                            {(draft.image ?? milestone.image) ? (
                                                <div className="relative group">
                                                    <img src={draft.image ?? milestone.image} alt="" className="w-20 h-14 object-cover rounded-lg border border-gray-200 dark:border-slate-600" />
                                                    <button
                                                        onClick={() => setDraft(p => ({ ...p, image: '' }))}
                                                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title={isRTL ? 'إزالة الصورة' : 'Remove image'}
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ) : null}
                                            <label className="cursor-pointer flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">
                                                <Upload className="w-4 h-4" />
                                                {uploading ? (isRTL ? 'جارٍ الرفع...' : 'Uploading...') : (draft.image ?? milestone.image) ? (isRTL ? 'تغيير' : 'Change') : (isRTL ? 'رفع صورة' : 'Upload')}
                                                <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f, path => setDraft(p => ({ ...p, image: path }))); }} />
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleSaveEdit(milestone)} className="flex-1 py-2 bg-marine-600 text-white rounded-lg text-sm flex items-center justify-center gap-1.5 hover:bg-marine-700 transition-colors">
                                        <Save className="w-3.5 h-3.5" />{isRTL ? 'حفظ التعديلات' : 'Save Changes'}
                                    </button>
                                    <button onClick={() => { setEditing(null); setDraft({}); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                                        {isRTL ? 'إلغاء' : 'Cancel'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* ── VIEW MODE ── */
                            <div className="flex items-start gap-4">
                                {/* Year Badge OR Image */}
                                {milestone.image ? (
                                    <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-slate-600">
                                        <img src={milestone.image} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 inset-x-0 bg-marine-600/90 text-center py-0.5">
                                            <span className="text-[10px] font-bold text-white">{milestone.year}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 rounded-xl bg-marine-100 dark:bg-marine-900 flex items-center justify-center flex-shrink-0">
                                        <div className="text-center">
                                            <Calendar className="w-4 h-4 text-marine-600 mx-auto mb-1" />
                                            <span className="text-xs font-bold text-marine-600">{milestone.year}</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 dark:text-white">
                                        {isRTL ? milestone.titleAr : milestone.titleEn}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                        {isRTL ? milestone.descriptionAr : milestone.descriptionEn}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setEditing(milestone.id); setDraft({}); }}
                                        className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors font-medium"
                                    >
                                        {isRTL ? 'تعديل' : 'Edit'}
                                    </button>
                                    <button
                                        onClick={() => onMoveMilestone(milestone.id, 'up')}
                                        disabled={idx === 0}
                                        className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => onMoveMilestone(milestone.id, 'down')}
                                        disabled={idx === milestones.length - 1}
                                        className="p-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={async () => {
                                            const confirmed = await confirm({
                                                title: isRTL ? 'حذف المحطة' : 'Delete Milestone',
                                                message: isRTL ? 'هل تريد حذف هذه المحطة؟' : 'Are you sure you want to delete this milestone?',
                                                confirmText: isRTL ? 'حذف' : 'Delete',
                                                cancelText: isRTL ? 'إلغاء' : 'Cancel',
                                                type: 'danger'
                                            });
                                            if (confirmed) {
                                                onDeleteMilestone(milestone.id);
                                            }
                                        }}
                                        className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {milestones.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>{isRTL ? 'لا توجد محطات. أضف واحدة!' : 'No milestones yet. Add one!'}</p>
                </div>
            )}
        </div>
    );

    // ── Future Card Settings Section ──
    return (
        <>
            {milestonesSection}

            {/* Future Card Settings */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-4 mt-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-orange-600 rounded-xl flex items-center justify-center">
                        <span className="text-xl">🚀</span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                            {isRTL ? 'كارت المستقبل النابض' : 'Future Pulse Card'}
                        </h3>
                        <p className="text-xs text-gray-500">
                            {isRTL ? 'الكارت الختامي في مسيرة النجاح' : 'The closing card of the success journey'}
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                    {/* Badge AR */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            {isRTL ? 'البادج (عربي)' : 'Badge (AR)'}
                        </label>
                        <input
                            type="text"
                            value={fpDraft.badgeAr}
                            onChange={e => setFpDraft(p => ({ ...p, badgeAr: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            dir="rtl"
                        />
                    </div>
                    {/* Badge EN */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            {isRTL ? 'البادج (إنجليزي)' : 'Badge (EN)'}
                        </label>
                        <input
                            type="text"
                            value={fpDraft.badgeEn}
                            onChange={e => setFpDraft(p => ({ ...p, badgeEn: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                    {/* Title AR */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            {isRTL ? 'العنوان (عربي)' : 'Title (AR)'}
                        </label>
                        <input
                            type="text"
                            value={fpDraft.titleAr}
                            onChange={e => setFpDraft(p => ({ ...p, titleAr: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                            dir="rtl"
                        />
                    </div>
                    {/* Title EN */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            {isRTL ? 'العنوان (إنجليزي)' : 'Title (EN)'}
                        </label>
                        <input
                            type="text"
                            value={fpDraft.titleEn}
                            onChange={e => setFpDraft(p => ({ ...p, titleEn: e.target.value }))}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                    {/* Description AR */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            {isRTL ? 'الوصف (عربي)' : 'Description (AR)'}
                        </label>
                        <textarea
                            value={fpDraft.descriptionAr}
                            onChange={e => setFpDraft(p => ({ ...p, descriptionAr: e.target.value }))}
                            rows={2}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                            dir="rtl"
                        />
                    </div>
                    {/* Description EN */}
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            {isRTL ? 'الوصف (إنجليزي)' : 'Description (EN)'}
                        </label>
                        <textarea
                            value={fpDraft.descriptionEn}
                            onChange={e => setFpDraft(p => ({ ...p, descriptionEn: e.target.value }))}
                            rows={2}
                            className="w-full p-3 rounded-xl bg-white dark:bg-slate-800 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none"
                        />
                    </div>
                    {/* Image Upload */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                            {isRTL ? 'صورة الكارت (اختياري)' : 'Card Image (Optional)'}
                        </label>
                        <div className="flex items-center gap-3">
                            {fpDraft.image && (
                                <div className="relative group">
                                    <img src={fpDraft.image} alt="" className="w-20 h-14 object-cover rounded-lg border border-gray-200 dark:border-slate-600" />
                                    <button
                                        onClick={() => setFpDraft(p => ({ ...p, image: undefined }))}
                                        className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            )}
                            <label className="cursor-pointer flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
                                <Upload className="w-4 h-4 text-gray-400" />
                                <span className="text-gray-500">{fpUploading ? (isRTL ? 'جارٍ الرفع...' : 'Uploading...') : (isRTL ? 'رفع صورة' : 'Upload Image')}</span>
                                <input type="file" accept="image/*" className="hidden" onChange={e => {
                                    const f = e.target.files?.[0];
                                    if (f) {
                                        setFpUploading(true);
                                        const formData = new FormData();
                                        formData.append('file', f);
                                        formData.append('folder', 'future-pulse');
                                        authFetch('/api/upload', { method: 'POST', body: formData })
                                            .then(res => res.ok ? res.json() : null)
                                            .then(data => { if (data) setFpDraft(p => ({ ...p, image: data.path })); })
                                            .finally(() => setFpUploading(false));
                                    }
                                }} />
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    onClick={async () => { setFpSaving(true); await onUpdateFuturePulse(fpDraft); setFpSaving(false); }}
                    disabled={fpSaving}
                    className="w-full px-4 py-3 bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-brand-darkOrange disabled:opacity-50 text-white rounded-xl transition-all flex items-center justify-center gap-2 font-medium"
                >
                    <Save className="w-4 h-4" />
                    {fpSaving ? (isRTL ? 'جارٍ الحفظ...' : 'Saving...') : (isRTL ? 'حفظ كارت المستقبل' : 'Save Future Card')}
                </button>
            </div>
        </>
    );
}
