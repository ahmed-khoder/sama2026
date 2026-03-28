'use client';

import React, { useEffect, useState } from 'react';
import { Save, Loader2, BookOpen, Type, Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import ImageUploadWithCompression from '@/components/ImageUploadWithCompression';

interface BlogHeroSettings {
    id: string;
    titleAr: string;
    titleEn: string;
    subtitleAr: string;
    subtitleEn: string;
    badgeAr: string;
    badgeEn: string;
    image: string | null;
}

export default function BlogSettingsPage() {
    const { language } = useLanguage();
    const { showToast } = useToast();
    const isRTL = language === 'ar';
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [settings, setSettings] = useState<BlogHeroSettings>({
        id: 'default',
        titleAr: '',
        titleEn: '',
        subtitleAr: '',
        subtitleEn: '',
        badgeAr: '',
        badgeEn: '',
        image: null,
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/cms/blog-hero');
            if (res.ok) {
                const data = await res.json();
                setSettings(data);
            }
        } catch (err) {
            console.error('Error fetching blog hero settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/cms/blog-hero', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });
            if (res.ok) {
                showToast(isRTL ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully', 'success');
            } else {
                showToast(isRTL ? 'فشل حفظ الإعدادات' : 'Failed to save settings', 'error');
            }
        } catch (err) {
            showToast(isRTL ? 'حدث خطأ' : 'An error occurred', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (file: File) => {
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', 'blog-hero');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                const data = await res.json();
                setSettings(prev => ({ ...prev, image: data.path }));
                showToast(isRTL ? 'تم رفع الصورة' : 'Image uploaded', 'success');
            }
        } catch (err) {
            showToast(isRTL ? 'فشل رفع الصورة' : 'Image upload failed', 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleChange = (field: keyof BlogHeroSettings, value: string) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-marine-900 dark:text-white flex items-center gap-3">
                        <BookOpen className="w-7 h-7 text-brand-orange" />
                        {isRTL ? 'إعدادات المدونة' : 'Blog Settings'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        {isRTL ? 'تحكم في محتوى وعناوين صفحة المدونة' : 'Manage blog page hero content and titles'}
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl hover:bg-brand-darkOrange transition-colors shadow-lg shadow-brand-orange/20 disabled:opacity-60"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isRTL ? 'حفظ' : 'Save'}
                </button>
            </div>

            {/* Content Fields */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Arabic Content */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-5">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Type className="w-5 h-5 text-brand-orange" />
                        {isRTL ? 'المحتوى العربي' : 'Arabic Content'}
                    </h3>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isRTL ? 'شارة الهيرو' : 'Hero Badge'}
                        </label>
                        <input
                            type="text"
                            value={settings.badgeAr}
                            onChange={(e) => handleChange('badgeAr', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                            dir="rtl"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isRTL ? 'العنوان الرئيسي' : 'Main Title'}
                        </label>
                        <input
                            type="text"
                            value={settings.titleAr}
                            onChange={(e) => handleChange('titleAr', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                            dir="rtl"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isRTL ? 'الوصف / العنوان الفرعي' : 'Subtitle / Description'}
                        </label>
                        <textarea
                            value={settings.subtitleAr}
                            onChange={(e) => handleChange('subtitleAr', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange resize-none"
                            dir="rtl"
                        />
                    </div>
                </div>

                {/* English Content */}
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-5">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <Type className="w-5 h-5 text-brand-orange" />
                        {isRTL ? 'المحتوى الإنجليزي' : 'English Content'}
                    </h3>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isRTL ? 'شارة الهيرو' : 'Hero Badge'}
                        </label>
                        <input
                            type="text"
                            value={settings.badgeEn}
                            onChange={(e) => handleChange('badgeEn', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isRTL ? 'العنوان الرئيسي' : 'Main Title'}
                        </label>
                        <input
                            type="text"
                            value={settings.titleEn}
                            onChange={(e) => handleChange('titleEn', e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            {isRTL ? 'الوصف / العنوان الفرعي' : 'Subtitle / Description'}
                        </label>
                        <textarea
                            value={settings.subtitleEn}
                            onChange={(e) => handleChange('subtitleEn', e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange/50 focus:border-brand-orange resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Background Image */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 space-y-5">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-brand-orange" />
                    {isRTL ? 'صورة خلفية الهيرو' : 'Hero Background Image'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {isRTL ? 'صورة خلفية لقسم الهيرو في صفحة المدونة (1920×1080 - اختياري)' : 'Background image for the blog hero section (1920×1080 - optional)'}
                </p>

                <div className="max-w-lg">
                    <ImageUploadWithCompression
                        onUpload={(file) => handleImageUpload(file)}
                        preview={settings.image || undefined}
                        label={isRTL ? 'رفع صورة الخلفية' : 'Upload Background Image'}
                        hint={isRTL ? 'اسحب الصورة وأفلتها هنا أو انقر للاختيار' : 'Drag & drop or click to select'}
                        maxWidth={1920}
                        maxHeight={1080}
                    />
                </div>

                {settings.image && (
                    <div className="mt-4">
                        <button
                            onClick={() => setSettings(prev => ({ ...prev, image: null }))}
                            className="text-sm text-red-500 hover:text-red-600 transition-colors"
                        >
                            {isRTL ? 'إزالة الصورة' : 'Remove image'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
