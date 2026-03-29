'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Upload, Trash2, Eye, EyeOff, GripVertical, Shield, Loader2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { authFetch } from '@/lib/auth-fetch';

interface AccreditationItem {
    id: string;
    logo: string;
    order: number;
    isActive: boolean;
}

export default function AccreditationsTab() {
    const [items, setItems] = useState<AccreditationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [hasChanges, setHasChanges] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Drag state
    const [dragId, setDragId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    // ── Fetch all items ──
    const fetchItems = useCallback(async () => {
        try {
            // Try admin endpoint first (includes hidden)
            const res = await authFetch('/api/cms/accreditations/all');
            if (res.ok) {
                setItems(await res.json());
            } else {
                // Fallback to public
                const pubRes = await fetch('/api/cms/accreditations');
                if (pubRes.ok) setItems(await pubRes.json());
            }
        } catch (err) {
            console.error('Failed to fetch:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    // ── Upload ──
    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        setUploading(true);
        setError('');
        setSuccess('');

        try {
            for (const file of Array.from(files)) {
                const formData = new FormData();
                formData.append('file', file);

                const res = await authFetch('/api/cms/accreditations', {
                    method: 'POST',
                    body: formData,
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error || 'Upload failed');
                }
            }

            setSuccess(`✅ تم رفع ${files.length} لوجو بنجاح`);
            await fetchItems();
        } catch (err: any) {
            setError(err.message || 'فشل الرفع');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // ── Toggle visibility ──
    const handleToggle = async (id: string, currentActive: boolean) => {
        try {
            await authFetch(`/api/cms/accreditations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentActive }),
            });
            setItems(prev => prev.map(i => i.id === id ? { ...i, isActive: !i.isActive } : i));
        } catch {
            setError('فشل تحديث الحالة');
        }
    };

    // ── Delete ──
    const handleDelete = async (id: string) => {
        try {
            const res = await authFetch(`/api/cms/accreditations/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            setItems(prev => prev.filter(i => i.id !== id));
            setDeleteConfirm(null);
            setSuccess('🗑️ تم الحذف بنجاح');
        } catch {
            setError('فشل الحذف');
        }
    };

    // ── Drag & Drop ──
    const handleDragStart = (id: string) => setDragId(id);

    const handleDragOver = (e: React.DragEvent, id: string) => {
        e.preventDefault();
        if (id !== dragId) setDragOverId(id);
    };

    const handleDrop = (targetId: string) => {
        if (!dragId || dragId === targetId) return;
        const newItems = [...items];
        const dragIndex = newItems.findIndex(i => i.id === dragId);
        const dropIndex = newItems.findIndex(i => i.id === targetId);
        const [dragged] = newItems.splice(dragIndex, 1);
        newItems.splice(dropIndex, 0, dragged);
        setItems(newItems);
        setDragId(null);
        setDragOverId(null);
        setHasChanges(true);
    };

    // ── Save order ──
    const handleSaveOrder = async () => {
        setSaving(true);
        try {
            const res = await authFetch('/api/cms/accreditations/reorder', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids: items.map(i => i.id) }),
            });
            if (!res.ok) throw new Error('Reorder failed');
            setHasChanges(false);
            setSuccess('✅ تم حفظ الترتيب');
        } catch {
            setError('فشل حفظ الترتيب');
        } finally {
            setSaving(false);
        }
    };

    // Clear messages
    useEffect(() => {
        if (success || error) {
            const timer = setTimeout(() => { setSuccess(''); setError(''); }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    return (
        <div className="space-y-6">
            {/* Messages */}
            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
            )}
            {success && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm">
                    {success}
                </div>
            )}

            {/* Upload Zone */}
            <label
                className={`block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200
                    ${uploading
                        ? 'border-brand-orange bg-brand-orange/5 cursor-wait'
                        : 'border-gray-300 dark:border-slate-700 hover:border-brand-orange hover:bg-brand-orange/5'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    multiple
                    className="hidden"
                    onChange={handleUpload}
                    disabled={uploading}
                />
                {uploading ? (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">جاري الرفع...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            📤 اضغط أو اسحب لوجوهات هنا
                        </span>
                        <span className="text-xs text-gray-400">PNG, JPG, WebP, SVG — يمكنك رفع عدة ملفات</span>
                    </div>
                )}
            </label>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-brand-orange animate-spin" />
                </div>
            )}

            {/* Items Grid */}
            {!loading && items.length > 0 && (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                draggable
                                onDragStart={() => handleDragStart(item.id)}
                                onDragOver={(e) => handleDragOver(e, item.id)}
                                onDrop={() => handleDrop(item.id)}
                                onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                                className={`relative group bg-white dark:bg-slate-900 rounded-xl border 
                                            p-3 transition-all duration-200 cursor-grab active:cursor-grabbing
                                            ${dragOverId === item.id
                                        ? 'border-brand-orange scale-105 shadow-lg'
                                        : 'border-gray-200 dark:border-slate-800 hover:shadow-md'
                                    }
                                            ${!item.isActive ? 'opacity-40' : ''}
                                            ${dragId === item.id ? 'opacity-20' : ''}`}
                            >
                                {/* Drag handle */}
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-50 transition-opacity">
                                    <GripVertical className="w-3 h-3 text-gray-400" />
                                </div>

                                {/* Logo */}
                                <div className="h-16 flex items-center justify-center mb-2 mt-1">
                                    <Image
                                        src={item.logo}
                                        alt="Accreditation"
                                        width={100}
                                        height={60}
                                        className="max-h-full w-auto object-contain"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-center gap-1.5">
                                    <button
                                        onClick={() => handleToggle(item.id, item.isActive)}
                                        className={`p-1 rounded-lg transition-colors
                                            ${item.isActive
                                                ? 'bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 dark:bg-slate-800'
                                            }`}
                                        title={item.isActive ? 'إخفاء' : 'إظهار'}
                                    >
                                        {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    </button>

                                    {deleteConfirm === item.id ? (
                                        <div className="flex gap-1">
                                            <button onClick={() => handleDelete(item.id)}
                                                className="px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-lg hover:bg-red-600">
                                                تأكيد
                                            </button>
                                            <button onClick={() => setDeleteConfirm(null)}
                                                className="px-2 py-0.5 bg-gray-200 dark:bg-slate-700 text-[10px] rounded-lg">
                                                إلغاء
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setDeleteConfirm(item.id)}
                                            className="p-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Save Order Button */}
                    {hasChanges && (
                        <div className="flex justify-center">
                            <button
                                onClick={handleSaveOrder}
                                disabled={saving}
                                className="px-5 py-2.5 bg-brand-orange text-white font-semibold rounded-xl 
                                           hover:bg-brand-darkOrange transition-colors shadow-lg 
                                           shadow-brand-orange/25 disabled:opacity-50 flex items-center gap-2 text-sm"
                            >
                                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                                💾 حفظ الترتيب
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && items.length === 0 && (
                <div className="text-center py-12 text-gray-400 dark:text-gray-600">
                    <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-sm font-medium">لا توجد اعتمادات بعد</p>
                    <p className="text-xs mt-1">ارفع أول لوجو من الأعلى</p>
                </div>
            )}
        </div>
    );
}
