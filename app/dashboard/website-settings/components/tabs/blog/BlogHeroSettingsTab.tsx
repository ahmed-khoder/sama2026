'use client';

import React, { useState, useEffect } from 'react';
import {
    Save, Loader2, Type, Image as ImageIcon, RefreshCw, LayoutGrid, Sliders, Palette,
    Plus, Trash2, ChevronUp, ChevronDown, Monitor, Smartphone, Layers
} from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import { getOverlayColor, highlightText } from '@/lib/hero-utils';
import ImageUploadWithCompression from '@/components/ImageUploadWithCompression';
import { SlideImageUploader } from '../../SlideImageUploader';
import { useConfirm } from '@/contexts/ConfirmContext';

// ── Types ──
interface BlogHeroSettingsData {
    id: string;
    blurAmount: number;
    overlayOpacity: number;
    overlayColor: string;
    showGrid: boolean;
    titleFontSize: string;
    titleFontWeight: string;
    titleColor: string;
    subtitleColor: string;
    badgeColor: string;
    highlightColor: string;
    titleFontFamilyAr: string;
    titleFontFamilyEn: string;
    highlightWordsAr: string;
    highlightWordsEn: string;
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    subtitleEn: string;
    badgeAr: string;
    badgeEn: string;
    image: string | null;
    articleLayout: string;
    cardSize: string;
}

interface BlogSlide {
    id: string;
    imageDesktopAr?: string;
    imageDesktopEn?: string;
    imageMobile?: string;
    order: number;
}

interface BlogHeroSettingsTabProps {
    isRTL: boolean;
    uploadImage: (file: File, folder: string) => Promise<string | null>;
}

type SubTab = 'heroText' | 'effects' | 'colors' | 'slides';

// ── Reusable Color Picker (matches ServicesStylingTab) ──
function ColorPickerField({ label, value, onChange, isRTL }: {
    label: string; value: string | undefined; onChange: (c: string) => void; isRTL: boolean;
}) {
    const currentColor = value || '#ffffff';
    return (
        <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl space-y-2 sm:space-y-3">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
            <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex-shrink-0">
                    <input type="color" value={currentColor} onChange={(e) => onChange(e.target.value)}
                        className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-lg sm:rounded-xl cursor-pointer border-2 sm:border-4 border-white dark:border-slate-700 shadow-lg hover:scale-105 transition-transform" />
                </div>
                <div className="flex-1 min-w-0 space-y-1 sm:space-y-2">
                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-600">
                        <span className="text-brand-orange font-bold text-sm sm:text-base">#</span>
                        <input type="text" value={currentColor.replace('#', '').toUpperCase()}
                            onChange={(e) => { const hex = e.target.value.replace('#', ''); if (/^[0-9A-Fa-f]{0,6}$/.test(hex)) onChange(`#${hex}`); }}
                            className="flex-1 min-w-0 bg-transparent border-none text-gray-900 dark:text-white font-mono text-sm sm:text-base lg:text-lg uppercase focus:outline-none"
                            maxLength={6} placeholder="FFFFFF" />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">{isRTL ? 'اضغط للاختيار' : 'Click to pick'}</p>
                </div>
            </div>
        </div>
    );
}

export function BlogHeroSettingsTab({ isRTL, uploadImage }: BlogHeroSettingsTabProps) {
    const { showToast } = useToast();
    const { confirm } = useConfirm();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [subTab, setSubTab] = useState<SubTab>('heroText');
    const [slides, setSlides] = useState<BlogSlide[]>([]);
    const [slidesLoading, setSlidesLoading] = useState(true);
    const [uploading, setUploading] = useState<string | null>(null);

    const [settings, setSettings] = useState<BlogHeroSettingsData>({
        id: 'default',
        blurAmount: 0,
        overlayOpacity: 75,
        overlayColor: 'marine',
        showGrid: true,
        titleFontSize: 'text-5xl',
        titleFontWeight: 'font-bold',
        titleColor: '#ffffff',
        subtitleColor: '#ffffffcc',
        badgeColor: '#F97316',
        highlightColor: '#F97316',
        titleFontFamilyAr: 'font-cairo',
        titleFontFamilyEn: 'font-inter',
        highlightWordsAr: '',
        highlightWordsEn: '',
        titleAr: '',
        titleEn: '',
        subtitleAr: '',
        subtitleEn: '',
        badgeAr: '',
        badgeEn: '',
        image: null,
        articleLayout: 'grid',
        cardSize: 'medium',
    });

    // ── Fetch settings + slides ──
    useEffect(() => {
        fetch('/api/cms/blog-hero')
            .then(r => r.json())
            .then(d => { if (d && !d.error) setSettings(d); })
            .catch(() => { })
            .finally(() => setLoading(false));

        fetch('/api/cms/blog-hero/slides')
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setSlides(d); })
            .catch(() => { })
            .finally(() => setSlidesLoading(false));
    }, []);

    // ── Broadcast changes to HeroPreview in real-time ──
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('blog-hero-settings-update', { detail: settings }));
    }, [settings]);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('blog-hero-slides-update', { detail: slides }));
    }, [slides]);

    // ── Handlers ──
    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/cms/blog-hero', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) showToast(isRTL ? 'تم حفظ إعدادات المدونة' : 'Blog settings saved', 'success');
            else showToast(isRTL ? 'فشل الحفظ' : 'Save failed', 'error');
        } catch { showToast(isRTL ? 'حدث خطأ' : 'An error occurred', 'error'); }
        finally { setSaving(false); }
    };

    const handleImageUpload = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'blog-hero');
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, image: data.path }));
                showToast(isRTL ? 'تم رفع الصورة' : 'Image uploaded', 'success');
            }
        } catch { showToast(isRTL ? 'فشل رفع الصورة' : 'Upload failed', 'error'); }
    };

    const handleChange = (field: keyof BlogHeroSettingsData, value: string | number | boolean) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    // ── Slide CRUD ──
    const handleAddSlide = async () => {
        try {
            const res = await fetch('/api/cms/blog-hero/slides', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageDesktopAr: '', imageDesktopEn: '', imageMobile: '' }),
            });
            if (res.ok) {
                const newSlide = await res.json();
                setSlides(prev => [...prev, newSlide]);
                showToast(isRTL ? 'تمت إضافة شريحة' : 'Slide added', 'success');
            }
        } catch { showToast(isRTL ? 'فشل الإضافة' : 'Failed to add slide', 'error'); }
    };

    const handleDeleteSlide = async (id: string) => {
        const ok = await confirm({
            title: isRTL ? 'حذف الشريحة' : 'Delete Slide',
            message: isRTL ? 'هل تريد حذف هذه الشريحة؟' : 'Are you sure you want to delete this slide?',
            confirmText: isRTL ? 'حذف' : 'Delete',
            cancelText: isRTL ? 'إلغاء' : 'Cancel',
            type: 'danger',
        });
        if (!ok) return;
        try {
            await fetch(`/api/cms/blog-hero/slides/${id}`, { method: 'DELETE' });
            setSlides(prev => prev.filter(s => s.id !== id));
            showToast(isRTL ? 'تم حذف الشريحة' : 'Slide deleted', 'success');
        } catch { showToast(isRTL ? 'فشل الحذف' : 'Delete failed', 'error'); }
    };

    const handleMoveSlide = async (id: string, direction: 'up' | 'down') => {
        const idx = slides.findIndex(s => s.id === id);
        if (direction === 'up' && idx <= 0) return;
        if (direction === 'down' && idx >= slides.length - 1) return;
        const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
        const newSlides = [...slides];
        [newSlides[idx], newSlides[swapIdx]] = [newSlides[swapIdx], newSlides[idx]];
        newSlides.forEach((s, i) => { s.order = i; });
        setSlides(newSlides);
        try {
            await Promise.all(newSlides.map(s =>
                fetch(`/api/cms/blog-hero/slides/${s.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order: s.order }),
                })
            ));
        } catch { /* silent */ }
    };

    const handleUpdateSlideImage = async (slideId: string, field: 'imageDesktopAr' | 'imageDesktopEn' | 'imageMobile', path: string) => {
        try {
            const res = await fetch(`/api/cms/blog-hero/slides/${slideId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [field]: path }),
            });
            if (res.ok) {
                setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [field]: path } : s));
            }
        } catch { /* silent */ }
    };

    const handleSlideImageChange = async (slideId: string, file: File, type: 'imageDesktopAr' | 'imageDesktopEn' | 'imageMobile') => {
        setUploading(`${slideId}-${type}`);
        const path = await uploadImage(file, 'blog-hero');
        if (path) {
            await handleUpdateSlideImage(slideId, type, path);
        }
        setUploading(null);
    };

    const overlayPresets = [
        { id: 'marine', label: isRTL ? 'أزرق بحري' : 'Marine', color: 'from-marine-600 to-marine-800' },
        { id: 'black', label: isRTL ? 'داكن' : 'Dark', color: 'from-slate-700 to-slate-900' },
        { id: 'orange', label: isRTL ? 'برتقالي' : 'Orange', color: 'from-orange-600 to-orange-800' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Save Button */}
            <div className="flex justify-end">
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange text-white rounded-xl hover:bg-brand-darkOrange transition-colors shadow-lg shadow-brand-orange/20 disabled:opacity-60 text-sm font-medium">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isRTL ? 'حفظ إعدادات المدونة' : 'Save Blog Settings'}
                </button>
            </div>

            {/* Sub-Tab Navigation */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-slate-900 rounded-xl">
                {([
                    { id: 'heroText' as SubTab, icon: Type, labelAr: 'نصوص الهيرو', labelEn: 'Hero Text' },
                    { id: 'slides' as SubTab, icon: Layers, labelAr: 'الشرائح', labelEn: 'Slides' },
                    { id: 'effects' as SubTab, icon: Sliders, labelAr: 'التأثيرات', labelEn: 'Effects' },
                    { id: 'colors' as SubTab, icon: Palette, labelAr: 'التنسيق والألوان', labelEn: 'Colors & Styling' },
                ]).map(tab => (
                    <button key={tab.id} onClick={() => setSubTab(tab.id)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                            subTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{isRTL ? tab.labelAr : tab.labelEn}</span>
                    </button>
                ))}
            </div>


            {/* ══════════ HERO TEXT ══════════ */}
            {subTab === 'heroText' && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {isRTL ? 'المحتوى النصي' : 'Text Content'}
                    </h3>

                    {/* Arabic Content */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                            <span className="w-6 h-6 bg-marine-100 dark:bg-marine-900 rounded flex items-center justify-center text-xs font-bold text-marine-600">ع</span>
                            {isRTL ? 'المحتوى العربي' : 'Arabic Content'}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">{isRTL ? 'شارة الهيرو' : 'Badge Text'}</label>
                                <input type="text" value={settings.badgeAr} onChange={(e) => handleChange('badgeAr', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange" dir="rtl" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">{isRTL ? 'العنوان الرئيسي' : 'Title'}</label>
                                <input type="text" value={settings.titleAr} onChange={(e) => handleChange('titleAr', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange" dir="rtl" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">{isRTL ? 'كلمات التظليل' : 'Highlight Words'}</label>
                                <input type="text" value={settings.highlightWordsAr} onChange={(e) => handleChange('highlightWordsAr', e.target.value)}
                                    placeholder={isRTL ? 'كلمة1, كلمة2' : 'word1, word2'}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange" dir="rtl" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-2">{isRTL ? 'الوصف' : 'Description'}</label>
                                <textarea value={settings.subtitleAr} onChange={(e) => handleChange('subtitleAr', e.target.value)} rows={2}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none" dir="rtl" />
                            </div>
                        </div>
                    </div>

                    {/* English Content */}
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                            <span className="w-6 h-6 bg-brand-orange/20 rounded flex items-center justify-center text-xs font-bold text-brand-orange">EN</span>
                            {isRTL ? 'المحتوى الإنجليزي' : 'English Content'}
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">{isRTL ? 'شارة الهيرو' : 'Badge Text'}</label>
                                <input type="text" value={settings.badgeEn} onChange={(e) => handleChange('badgeEn', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">{isRTL ? 'العنوان الرئيسي' : 'Title'}</label>
                                <input type="text" value={settings.titleEn} onChange={(e) => handleChange('titleEn', e.target.value)}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-2">{isRTL ? 'كلمات التظليل' : 'Highlight Words'}</label>
                                <input type="text" value={settings.highlightWordsEn} onChange={(e) => handleChange('highlightWordsEn', e.target.value)}
                                    placeholder="word1, word2"
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-medium text-gray-500 mb-2">{isRTL ? 'الوصف' : 'Description'}</label>
                                <textarea value={settings.subtitleEn} onChange={(e) => handleChange('subtitleEn', e.target.value)} rows={2}
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-slate-900 border-none ring-1 ring-gray-200 dark:ring-slate-600 focus:ring-2 focus:ring-brand-orange resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Background Image (fallback) */}
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-brand-orange" />
                            {isRTL ? 'صورة الخلفية الاحتياطية' : 'Fallback Background Image'}
                        </h4>
                        <p className="text-xs text-gray-500">{isRTL ? 'تُستخدم فقط إذا لم تكن هناك شرائح.' : 'Used only when no slides exist.'}</p>
                        <div className="max-w-lg">
                            <ImageUploadWithCompression
                                onUpload={(file) => handleImageUpload(file)}
                                preview={settings.image || undefined}
                                label={isRTL ? 'رفع صورة' : 'Upload Image'}
                                hint={isRTL ? 'اسحب وأفلت أو انقر' : 'Drag & drop or click'}
                                maxWidth={1920} maxHeight={1080}
                            />
                        </div>
                        {settings.image && (
                            <button onClick={() => setSettings(prev => ({ ...prev, image: null }))}
                                className="text-sm text-red-500 hover:text-red-600 transition-colors">
                                {isRTL ? 'إزالة الصورة' : 'Remove image'}
                            </button>
                        )}
                    </div>

                    {/* Article Display Settings */}
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-6 space-y-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-sm flex items-center gap-2">
                            <LayoutGrid className="w-4 h-4 text-brand-orange" />
                            {isRTL ? 'إعدادات عرض المقالات' : 'Article Display Settings'}
                        </h4>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'نمط العرض' : 'Display Layout'}</label>
                                <select value={settings.articleLayout} onChange={(e) => handleChange('articleLayout', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 appearance-none cursor-pointer">
                                    <option value="grid">{isRTL ? 'شبكي (Grid)' : 'Grid'}</option>
                                    <option value="list">{isRTL ? 'طولي (List)' : 'List'}</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{isRTL ? 'حجم البطاقة' : 'Card Size'}</label>
                                <select value={settings.cardSize} onChange={(e) => handleChange('cardSize', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 appearance-none cursor-pointer">
                                    <option value="small">{isRTL ? 'صغير' : 'Small'}</option>
                                    <option value="medium">{isRTL ? 'متوسط' : 'Medium'}</option>
                                    <option value="large">{isRTL ? 'كبير' : 'Large'}</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════ SLIDES ══════════ */}
            {subTab === 'slides' && (
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                            {isRTL ? 'شرائح البانر' : 'Hero Slides'}
                        </h3>
                        <button onClick={handleAddSlide}
                            className="flex items-center gap-2 px-3 py-2 bg-brand-orange text-white rounded-xl hover:bg-brand-orange/90 transition-colors text-sm">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">{isRTL ? 'إضافة شريحة' : 'Add Slide'}</span>
                        </button>
                    </div>

                    {slidesLoading ? (
                        <div className="flex justify-center py-8">
                            <RefreshCw className="w-6 h-6 animate-spin text-brand-orange" />
                        </div>
                    ) : slides.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {isRTL ? 'لا توجد شرائح — ستُستخدم صورة الخلفية الاحتياطية' : 'No slides yet — fallback image will be used'}
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {slides.map((slide, index) => (
                                <div key={slide.id} className="p-6 border border-gray-200 dark:border-slate-700 rounded-2xl bg-gray-50 dark:bg-slate-900 space-y-6">
                                    {/* Slide Header */}
                                    <div className="flex items-center justify-between">
                                        <span className="px-4 py-2 bg-brand-orange text-white text-sm font-bold rounded-xl">
                                            {isRTL ? `شريحة ${index + 1}` : `Slide ${index + 1}`}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleMoveSlide(slide.id, 'up')} disabled={index === 0}
                                                className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 disabled:opacity-30 rounded-lg">
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleMoveSlide(slide.id, 'down')} disabled={index === slides.length - 1}
                                                className="p-2 bg-white dark:bg-slate-800 hover:bg-gray-100 disabled:opacity-30 rounded-lg">
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleDeleteSlide(slide.id)}
                                                className="p-2 bg-red-50 dark:bg-red-900/30 text-red-600 hover:bg-red-100 rounded-lg">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Desktop Images */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                            <Monitor className="w-4 h-4" />
                                            {isRTL ? 'صور الديسكتوب' : 'Desktop Images'}
                                        </h4>
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <SlideImageUploader
                                                imageUrl={slide.imageDesktopAr}
                                                type="desktop-ar"
                                                isRTL={isRTL}
                                                uploading={uploading === `${slide.id}-imageDesktopAr`}
                                                onImageChange={(file) => handleSlideImageChange(slide.id, file, 'imageDesktopAr')}
                                                onImageDelete={() => handleUpdateSlideImage(slide.id, 'imageDesktopAr', '')}
                                            />
                                            <SlideImageUploader
                                                imageUrl={slide.imageDesktopEn}
                                                type="desktop-en"
                                                isRTL={isRTL}
                                                uploading={uploading === `${slide.id}-imageDesktopEn`}
                                                onImageChange={(file) => handleSlideImageChange(slide.id, file, 'imageDesktopEn')}
                                                onImageDelete={() => handleUpdateSlideImage(slide.id, 'imageDesktopEn', '')}
                                            />
                                        </div>
                                    </div>

                                    {/* Mobile Image */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center gap-2">
                                            <Smartphone className="w-4 h-4" />
                                            {isRTL ? 'صورة الموبايل' : 'Mobile Image'}
                                            <span className="text-xs text-gray-500 font-normal">({isRTL ? 'اختياري' : 'Optional'})</span>
                                        </h4>
                                        <div className="max-w-sm">
                                            <SlideImageUploader
                                                imageUrl={slide.imageMobile}
                                                type="mobile"
                                                isRTL={isRTL}
                                                uploading={uploading === `${slide.id}-imageMobile`}
                                                onImageChange={(file) => handleSlideImageChange(slide.id, file, 'imageMobile')}
                                                onImageDelete={() => handleUpdateSlideImage(slide.id, 'imageMobile', '')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ══════════ EFFECTS ══════════ */}
            {subTab === 'effects' && (
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-6">
                    <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">
                        {isRTL ? 'إعدادات الخلفية' : 'Background Settings'}
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isRTL ? 'تعتيم الخلفية' : 'Blur Amount'} ({settings.blurAmount}px)
                            </label>
                            <input type="range" min="0" max="20" value={settings.blurAmount}
                                onChange={(e) => handleChange('blurAmount', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-brand-orange" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {isRTL ? 'شفافية الطبقة' : 'Overlay Opacity'} ({settings.overlayOpacity}%)
                            </label>
                            <input type="range" min="0" max="100" value={settings.overlayOpacity}
                                onChange={(e) => handleChange('overlayOpacity', Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700 accent-brand-orange" />
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isRTL ? 'لون الطبقة' : 'Overlay Color'}
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {overlayPresets.map(opt => (
                                <button key={opt.id} onClick={() => handleChange('overlayColor', opt.id)}
                                    className={`p-3 rounded-xl border-2 transition-all ${settings.overlayColor === opt.id
                                        ? 'border-brand-orange ring-2 ring-brand-orange/20'
                                        : 'border-gray-200 dark:border-slate-600'}`}>
                                    <div className={`h-8 rounded-lg bg-gradient-to-r ${opt.color} mb-2`} />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{opt.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">{isRTL ? 'الشبكة الزخرفية' : 'Grid Pattern'}</p>
                            <p className="text-xs text-gray-500">{isRTL ? 'إظهار نمط الشبكة فوق الخلفية' : 'Show grid pattern overlay'}</p>
                        </div>
                        <button onClick={() => handleChange('showGrid', !settings.showGrid)}
                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.showGrid ? 'bg-brand-orange' : 'bg-gray-300 dark:bg-slate-600'}`}>
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${settings.showGrid ? 'right-1' : 'left-1'}`} />
                        </button>
                    </div>
                </div>
            )}

            {/* ══════════ COLORS & STYLING ══════════ */}
            {subTab === 'colors' && (
                <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-4 sm:space-y-6">
                    <div className="flex items-center gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-200 dark:border-slate-700">
                        <div className="p-2 sm:p-2.5 bg-gradient-to-br from-brand-orange/20 to-brand-gold/20 rounded-lg sm:rounded-xl flex-shrink-0">
                            <Palette className="w-4 h-4 sm:w-5 sm:h-5 text-brand-orange" />
                        </div>
                        <div className="min-w-0">
                            <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white truncate">{isRTL ? 'التنسيق والألوان' : 'Styling & Colors'}</h3>
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{isRTL ? 'تخصيص ألوان وخطوط العناوين' : 'Customize title colors and fonts'}</p>
                        </div>
                    </div>
                    <div className="space-y-3 sm:space-y-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{isRTL ? 'ألوان النصوص' : 'Text Colors'}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                            <ColorPickerField label={isRTL ? 'لون العنوان' : 'Title Color'} value={settings.titleColor} onChange={(c) => handleChange('titleColor', c)} isRTL={isRTL} />
                            <ColorPickerField label={isRTL ? 'لون الوصف' : 'Subtitle Color'} value={settings.subtitleColor} onChange={(c) => handleChange('subtitleColor', c)} isRTL={isRTL} />
                            <ColorPickerField label={isRTL ? 'لون الشارة' : 'Badge Color'} value={settings.badgeColor} onChange={(c) => handleChange('badgeColor', c)} isRTL={isRTL} />
                            <ColorPickerField label={isRTL ? 'لون التظليل' : 'Highlight Color'} value={settings.highlightColor} onChange={(c) => handleChange('highlightColor', c)} isRTL={isRTL} />
                        </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-slate-700 pt-4 sm:pt-6 space-y-3 sm:space-y-4">
                        <h4 className="font-semibold text-gray-700 dark:text-gray-300 text-xs sm:text-sm">{isRTL ? 'الخطوط' : 'Typography'}</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'حجم العنوان' : 'Title Size'}</label>
                                <select value={settings.titleFontSize} onChange={(e) => handleChange('titleFontSize', e.target.value)}
                                    className="w-full p-2 sm:p-3 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange focus:border-transparent">
                                    <option value="text-3xl">{isRTL ? 'صغير' : 'Small'}</option>
                                    <option value="text-4xl">{isRTL ? 'متوسط' : 'Medium'}</option>
                                    <option value="text-5xl">{isRTL ? 'كبير' : 'Large'}</option>
                                    <option value="text-6xl">{isRTL ? 'كبير جداً' : 'X-Large'}</option>
                                    <option value="text-7xl">{isRTL ? 'ضخم' : 'Huge'}</option>
                                </select>
                            </div>
                            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'وزن العنوان' : 'Title Weight'}</label>
                                <select value={settings.titleFontWeight} onChange={(e) => handleChange('titleFontWeight', e.target.value)}
                                    className="w-full p-2 sm:p-3 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange focus:border-transparent">
                                    <option value="font-normal">Normal</option>
                                    <option value="font-medium">Medium</option>
                                    <option value="font-semibold">Semibold</option>
                                    <option value="font-bold">Bold</option>
                                    <option value="font-extrabold">Extra Bold</option>
                                    <option value="font-black">Black</option>
                                </select>
                            </div>
                            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'خط العربي' : 'Arabic Font'}</label>
                                <select value={settings.titleFontFamilyAr} onChange={(e) => handleChange('titleFontFamilyAr', e.target.value)}
                                    className="w-full p-2 sm:p-3 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange focus:border-transparent">
                                    <option value="font-arabic">Default Arabic</option>
                                    <option value="font-cairo">Cairo</option>
                                    <option value="font-tajawal">Tajawal</option>
                                </select>
                            </div>
                            <div className="p-3 sm:p-4 bg-gray-50 dark:bg-slate-900 rounded-xl">
                                <label className="block text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{isRTL ? 'خط الإنجليزي' : 'English Font'}</label>
                                <select value={settings.titleFontFamilyEn} onChange={(e) => handleChange('titleFontFamilyEn', e.target.value)}
                                    className="w-full p-2 sm:p-3 text-sm rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 focus:ring-2 focus:ring-brand-orange focus:border-transparent">
                                    <option value="font-outfit">Outfit</option>
                                    <option value="font-inter">Inter</option>
                                    <option value="font-roboto">Roboto</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
