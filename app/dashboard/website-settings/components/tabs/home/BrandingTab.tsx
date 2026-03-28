'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Upload, Trash2, Eye, Sparkles, Film, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react';
import { authFetch } from '@/lib/auth-fetch';
import DynamicLogo from '@/components/DynamicLogo';

interface BrandingData {
    logoDefault: string | null;
    logoOccasion: string | null;
    logoAnimated: string | null;
    occasionMode: boolean;
    animationEnabled: boolean;
    occasionLabelAr: string;
    occasionLabelEn: string;
}

interface BrandingTabProps {
    isRTL: boolean;
    uploadImage: (file: File, folder: string) => Promise<string | null>;
}

export default function BrandingTab({ isRTL, uploadImage }: BrandingTabProps) {
    const [data, setData] = useState<BrandingData>({
        logoDefault: null,
        logoOccasion: null,
        logoAnimated: null,
        occasionMode: false,
        animationEnabled: false,
        occasionLabelAr: '',
        occasionLabelEn: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState<string | null>(null);

    // Fetch current branding
    useEffect(() => {
        authFetch('/api/cms/branding')
            .then(res => res.json())
            .then(d => { setData(d); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    // Save changes
    const save = useCallback(async (updates: Partial<BrandingData>) => {
        setSaving(true);
        try {
            const newData = { ...data, ...updates };
            setData(newData);
            await authFetch('/api/cms/branding', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            // Invalidate client cache
            try { sessionStorage.removeItem('branding_settings'); } catch { }
        } catch (err) {
            console.error('Failed to save branding:', err);
        }
        setSaving(false);
    }, [data]);

    // Upload handler
    const handleUpload = useCallback(async (file: File, field: 'logoDefault' | 'logoOccasion' | 'logoAnimated') => {
        setUploading(field);
        // For Lottie JSON, handle differently
        if (file.name.endsWith('.json')) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'branding');
            try {
                // Upload JSON as regular file
                const res = await authFetch('/api/upload', { method: 'POST', body: formData });
                if (res.ok) {
                    const { path } = await res.json();
                    await save({ [field]: path });
                }
            } catch (err) {
                console.error('Upload failed:', err);
            }
        } else {
            const path = await uploadImage(file, 'branding');
            if (path) {
                await save({ [field]: path });
            }
        }
        setUploading(null);
    }, [uploadImage, save]);

    // Remove logo
    const removeLogo = useCallback(async (field: 'logoDefault' | 'logoOccasion' | 'logoAnimated') => {
        await save({ [field]: null });
    }, [save]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-brand-orange border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-orange/20 to-orange-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-brand-orange" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isRTL ? 'إدارة الشعارات' : 'Logo Management'}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isRTL ? 'تحكم في شعار الشركة وشعار المناسبات' : 'Manage company logo and occasion branding'}
                    </p>
                </div>
            </div>

            {/* Live Preview */}
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-brand-orange" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {isRTL ? 'معاينة حية' : 'Live Preview'}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-0">
                    {/* Light Preview */}
                    <div className="bg-white p-8 flex flex-col items-center gap-2 border-e border-gray-200">
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-2">
                            {isRTL ? 'الوضع الفاتح' : 'Light Mode'}
                        </span>
                        <div className="h-14 w-60 relative">
                            {getPreviewUrl(data) ? (
                                <Image src={getPreviewUrl(data)!} alt="Logo" fill className="object-contain" unoptimized />
                            ) : (
                                <DynamicLogo className="h-14 w-60" variant="auto" forceAnimation />
                            )}
                        </div>
                    </div>
                    {/* Dark Preview */}
                    <div className="bg-slate-900 p-8 flex flex-col items-center gap-2">
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
                            {isRTL ? 'الوضع الداكن' : 'Dark Mode'}
                        </span>
                        <div className="h-14 w-60 relative drop-shadow-[0_0_12px_rgba(249,115,22,0.25)]">
                            {getPreviewUrl(data) ? (
                                <Image src={getPreviewUrl(data)!} alt="Logo" fill className="object-contain" unoptimized />
                            ) : (
                                <DynamicLogo className="h-14 w-60" variant="light" forceAnimation />
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Zones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <LogoUploadCard
                    title={isRTL ? 'اللوجو الأساسي' : 'Default Logo'}
                    subtitle={isRTL ? 'SVG أو PNG — يظهر دائماً' : 'SVG or PNG — Always displayed'}
                    icon={<ImageIcon className="w-5 h-5" />}
                    currentUrl={data.logoDefault}
                    isRTL={isRTL}
                    uploading={uploading === 'logoDefault'}
                    onUpload={(file) => handleUpload(file, 'logoDefault')}
                    onRemove={() => removeLogo('logoDefault')}
                    accept=".svg,.png,.webp"
                />
                <LogoUploadCard
                    title={isRTL ? 'لوجو المناسبات' : 'Occasion Logo'}
                    subtitle={isRTL ? 'يظهر عند تفعيل وضع المناسبات' : 'Shown when occasion mode is on'}
                    icon={<Sparkles className="w-5 h-5" />}
                    currentUrl={data.logoOccasion}
                    isRTL={isRTL}
                    uploading={uploading === 'logoOccasion'}
                    onUpload={(file) => handleUpload(file, 'logoOccasion')}
                    onRemove={() => removeLogo('logoOccasion')}
                    accept=".svg,.png,.webp"
                />
                <LogoUploadCard
                    title={isRTL ? 'لوجو متحرك' : 'Animated Logo'}
                    subtitle={isRTL ? 'Lottie JSON أو SVG متحرك' : 'Lottie JSON or animated SVG'}
                    icon={<Film className="w-5 h-5" />}
                    currentUrl={data.logoAnimated}
                    isRTL={isRTL}
                    uploading={uploading === 'logoAnimated'}
                    onUpload={(file) => handleUpload(file, 'logoAnimated')}
                    onRemove={() => removeLogo('logoAnimated')}
                    accept=".json,.svg,.webp"
                />
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ToggleCard
                    title={isRTL ? 'وضع المناسبات' : 'Occasion Mode'}
                    subtitle={isRTL ? 'عرض لوجو المناسبة بدلاً من الأساسي' : 'Display occasion logo instead of default'}
                    enabled={data.occasionMode}
                    saving={saving}
                    onChange={(v) => save({ occasionMode: v })}
                />
                <ToggleCard
                    title={isRTL ? 'تفعيل الحركة' : 'Enable Animation'}
                    subtitle={isRTL ? 'عرض اللوجو المتحرك (Lottie)' : 'Display animated logo (Lottie)'}
                    enabled={data.animationEnabled}
                    saving={saving}
                    onChange={(v) => save({ animationEnabled: v })}
                />
            </div>

            {/* Occasion Labels */}
            <div className="rounded-2xl border border-gray-200 dark:border-slate-700 p-5 space-y-4">
                <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    {isRTL ? 'وصف المناسبة' : 'Occasion Description'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {isRTL ? 'الوصف بالعربي' : 'Arabic Label'}
                        </label>
                        <input
                            type="text"
                            value={data.occasionLabelAr}
                            onChange={(e) => setData(d => ({ ...d, occasionLabelAr: e.target.value }))}
                            onBlur={() => save({ occasionLabelAr: data.occasionLabelAr })}
                            placeholder={isRTL ? 'مثال: رمضان كريم' : 'e.g. رمضان كريم'}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange outline-none"
                            dir="rtl"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                            {isRTL ? 'الوصف بالإنجليزي' : 'English Label'}
                        </label>
                        <input
                            type="text"
                            value={data.occasionLabelEn}
                            onChange={(e) => setData(d => ({ ...d, occasionLabelEn: e.target.value }))}
                            onBlur={() => save({ occasionLabelEn: data.occasionLabelEn })}
                            placeholder={isRTL ? 'e.g. Ramadan Mubarak' : 'e.g. Ramadan Mubarak'}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange outline-none"
                            dir="ltr"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Helper: resolve preview URL ───
function getPreviewUrl(data: BrandingData): string | null {
    if (data.animationEnabled && data.logoAnimated && !data.logoAnimated.endsWith('.json')) return data.logoAnimated;
    if (data.occasionMode && data.logoOccasion) return data.logoOccasion;
    if (data.logoDefault) return data.logoDefault;
    return null;
}

// ─── Logo Upload Card ───
function LogoUploadCard({
    title, subtitle, icon, currentUrl, isRTL, uploading, onUpload, onRemove, accept
}: {
    title: string; subtitle: string; icon: React.ReactNode;
    currentUrl: string | null; isRTL: boolean; uploading: boolean;
    onUpload: (file: File) => void; onRemove: () => void; accept: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 p-4 space-y-3">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange">
                    {icon}
                </div>
                <div>
                    <h4 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h4>
                    <p className="text-[10px] text-gray-400">{subtitle}</p>
                </div>
            </div>

            {/* Preview */}
            {currentUrl && (
                <div className="relative h-16 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                    {currentUrl.endsWith('.json') ? (
                        <span className="text-xs text-brand-orange font-mono">Lottie JSON ✓</span>
                    ) : (
                        <Image src={currentUrl} alt={title} fill className="object-contain p-2" unoptimized />
                    )}
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-brand-orange/10 text-brand-orange text-xs font-semibold hover:bg-brand-orange/20 transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <div className="animate-spin w-3.5 h-3.5 border-2 border-brand-orange border-t-transparent rounded-full" />
                    ) : (
                        <Upload className="w-3.5 h-3.5" />
                    )}
                    {isRTL ? 'رفع' : 'Upload'}
                </button>
                {currentUrl && (
                    <button
                        onClick={onRemove}
                        className="px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-500 text-xs font-semibold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onUpload(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
}

// ─── Toggle Card ───
function ToggleCard({
    title, subtitle, enabled, saving, onChange
}: {
    title: string; subtitle: string; enabled: boolean; saving: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="rounded-2xl border border-gray-200 dark:border-slate-700 p-4 flex items-center justify-between">
            <div>
                <h4 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
            </div>
            <button
                onClick={() => onChange(!enabled)}
                disabled={saving}
                className="flex-shrink-0 transition-colors disabled:opacity-50"
            >
                {enabled ? (
                    <ToggleRight className="w-10 h-10 text-brand-orange" />
                ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                )}
            </button>
        </div>
    );
}
