'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Upload, Plus, X, Save, Loader2, Trash2, MoveUp, MoveDown } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/contexts/ToastContext';
import { authFetch } from '@/lib/auth-fetch';

interface Reason {
    ar: string;
    en: string;
}

interface WhyImage {
    id: string;
    url: string;
    order: number;
}

interface WhyChooseUsSettings {
    badgeAr: string;
    badgeEn: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    reasonsJson: string;
    statsValue: string;
    statsLabelAr: string;
    statsLabelEn: string;
}

interface WhyChooseUsTabProps {
    isRTL: boolean;
    uploadImage: (file: File, folder: string) => Promise<string | null>;
}

export function WhyChooseUsTab({ isRTL, uploadImage }: WhyChooseUsTabProps) {
    const { success, error: showError } = useToast();
    const [settings, setSettings] = useState<WhyChooseUsSettings>({
        badgeAr: '',
        badgeEn: '',
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        reasonsJson: '[]',
        statsValue: '',
        statsLabelAr: '',
        statsLabelEn: ''
    });
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [images, setImages] = useState<WhyImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Fetch settings and images on mount
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            // Fetch settings
            const settingsRes = await authFetch('/api/cms/about-why');
            if (settingsRes.ok) {
                const settingsData = await settingsRes.json();
                setSettings(settingsData);
                setReasons(JSON.parse(settingsData.reasonsJson || '[]'));
            }

            // Fetch images
            try {
                const imagesRes = await authFetch('/api/cms/about-why/images');
                if (imagesRes.ok) {
                    const imagesData = await imagesRes.json();
                    setImages(Array.isArray(imagesData) ? imagesData : []);
                } else {
                    setImages([]);
                }
            } catch (imgError) {
                console.error('Error fetching images:', imgError);
                setImages([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            const updatedSettings = {
                ...settings,
                reasonsJson: JSON.stringify(reasons)
            };

            const res = await authFetch('/api/cms/about-why', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedSettings)
            });

            if (res.ok) {
                const data = await res.json();
                setSettings(data);
                success(isRTL ? 'تم الحفظ بنجاح!' : 'Saved successfully!');
            } else {
                throw new Error('Failed to save');
            }
        } catch (error) {
            console.error('Error saving:', error);
            showError(isRTL ? 'فشل الحفظ' : 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    // Reasons management
    const addReason = () => {
        setReasons([...reasons, { ar: '', en: '' }]);
    };

    const removeReason = (index: number) => {
        setReasons(reasons.filter((_, i) => i !== index));
    };

    const updateReason = (index: number, field: 'ar' | 'en', value: string) => {
        const updated = [...reasons];
        updated[index][field] = value;
        setReasons(updated);
    };

    // Images management
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const path = await uploadImage(file, 'about-why');
            if (path) {
                // Add image to database
                const res = await authFetch('/api/cms/about-why/images', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: path })
                });

                if (res.ok) {
                    const newImage = await res.json();
                    setImages([...images, newImage]);
                    success(isRTL ? 'تم رفع الصورة بنجاح!' : 'Image uploaded successfully!');
                } else {
                    throw new Error('Failed to add image');
                }
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            showError(isRTL ? 'فشل رفع الصورة' : 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const deleteImage = async (id: string) => {
        try {
            const res = await authFetch(`/api/cms/about-why/images/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setImages(images.filter(img => img.id !== id));
                success(isRTL ? 'تم حذف الصورة بنجاح!' : 'Image deleted successfully!');
            } else {
                throw new Error('Failed to delete');
            }
        } catch (error) {
            console.error('Error deleting image:', error);
            showError(isRTL ? 'فشل حذف الصورة' : 'Failed to delete image');
        }
    };

    const moveImage = async (id: string, direction: 'up' | 'down') => {
        const index = images.findIndex(img => img.id === id);
        if (index === -1) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === images.length - 1) return;

        const newImages = [...images];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newImages[index], newImages[swapIndex]] = [newImages[swapIndex], newImages[index]];

        // Update orders
        newImages.forEach((img, idx) => {
            img.order = idx;
        });

        setImages(newImages);

        // Update in database
        try {
            await Promise.all(
                newImages.map(img =>
                    authFetch(`/api/cms/about-why/images/${img.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ order: img.order })
                    })
                )
            );
        } catch (error) {
            console.error('Error updating image order:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Save Button */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-orange hover:bg-brand-darkOrange text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                        </>
                    )}
                </button>
            </div>

            {/* Header Texts */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                    {isRTL ? 'النصوص الرئيسية' : 'Main Texts'}
                </h3>

                {/* Badge */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {isRTL ? 'الشارة (عربي)' : 'Badge (Arabic)'}
                        </label>
                        <input
                            type="text"
                            value={settings.badgeAr}
                            onChange={(e) => setSettings({ ...settings, badgeAr: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                            placeholder="لماذا نحن؟"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {isRTL ? 'الشارة (إنجليزي)' : 'Badge (English)'}
                        </label>
                        <input
                            type="text"
                            value={settings.badgeEn}
                            onChange={(e) => setSettings({ ...settings, badgeEn: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                            placeholder="Why Us?"
                        />
                    </div>
                </div>

                {/* Title */}
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}
                        </label>
                        <input
                            type="text"
                            value={settings.titleAr}
                            onChange={(e) => setSettings({ ...settings, titleAr: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}
                        </label>
                        <input
                            type="text"
                            value={settings.titleEn}
                            onChange={(e) => setSettings({ ...settings, titleEn: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}
                        </label>
                        <textarea
                            value={settings.descriptionAr}
                            onChange={(e) => setSettings({ ...settings, descriptionAr: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}
                        </label>
                        <textarea
                            value={settings.descriptionEn}
                            onChange={(e) => setSettings({ ...settings, descriptionEn: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                            rows={4}
                        />
                    </div>
                </div>
            </div>

            {/* Reasons List */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isRTL ? 'الأسباب/المميزات (6 نقاط)' : 'Reasons/Features (6 points)'}
                    </h3>
                    <button
                        onClick={addReason}
                        className="px-4 py-2 bg-brand-orange hover:bg-brand-darkOrange text-white rounded-lg flex items-center gap-2 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        {isRTL ? 'إضافة نقطة' : 'Add Point'}
                    </button>
                </div>

                <div className="space-y-3">
                    {reasons.map((reason, index) => (
                        <div key={index} className="grid md:grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600">
                            <div>
                                <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                                    {isRTL ? `النقطة ${index + 1} (عربي)` : `Point ${index + 1} (Arabic)`}
                                </label>
                                <input
                                    type="text"
                                    placeholder={isRTL ? 'النص بالعربي' : 'Arabic text'}
                                    value={reason.ar}
                                    onChange={(e) => updateReason(index, 'ar', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium mb-1 text-gray-600 dark:text-gray-400">
                                        {isRTL ? 'إنجليزي' : 'English'}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder={isRTL ? 'النص بالإنجليزي' : 'English text'}
                                        value={reason.en}
                                        onChange={(e) => updateReason(index, 'en', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => removeReason(index)}
                                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
                                        title={isRTL ? 'حذف' : 'Delete'}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Images Gallery */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isRTL ? 'معرض الصور' : 'Images Gallery'}
                    </h3>
                    <label className="cursor-pointer">
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg flex items-center gap-2 transition-all">
                            {uploading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="text-sm">{isRTL ? 'جاري الرفع...' : 'Uploading...'}</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="w-4 h-4" />
                                    <span className="text-sm">{isRTL ? 'رفع صورة' : 'Upload Image'}</span>
                                </>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            disabled={uploading}
                        />
                    </label>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                        <div key={image.id} className="relative group rounded-lg overflow-hidden border-2 border-gray-200 dark:border-slate-600">
                            <div className="relative aspect-[4/3]">
                                <Image
                                    src={image.url}
                                    alt={`Image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                />
                            </div>

                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <button
                                    onClick={() => moveImage(image.id, 'up')}
                                    disabled={index === 0}
                                    className="p-2 bg-white/90 hover:bg-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                                    title={isRTL ? 'تحريك لأعلى' : 'Move Up'}
                                >
                                    <MoveUp className="w-4 h-4 text-gray-900" />
                                </button>
                                <button
                                    onClick={() => moveImage(image.id, 'down')}
                                    disabled={index === images.length - 1}
                                    className="p-2 bg-white/90 hover:bg-white rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                                    title={isRTL ? 'تحريك لأسفل' : 'Move Down'}
                                >
                                    <MoveDown className="w-4 h-4 text-gray-900" />
                                </button>
                                <button
                                    onClick={() => deleteImage(image.id)}
                                    className="p-2 bg-red-500 hover:bg-red-600 rounded-full"
                                    title={isRTL ? 'حذف' : 'Delete'}
                                >
                                    <Trash2 className="w-4 h-4 text-white" />
                                </button>
                            </div>

                            {/* Order Badge */}
                            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                #{index + 1}
                            </div>
                        </div>
                    ))}
                </div>

                {images.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <Upload className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{isRTL ? 'لا توجد صور. اضغط "رفع صورة" لإضافة صور.' : 'No images. Click "Upload Image" to add images.'}</p>
                    </div>
                )}

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-4">
                    {isRTL ? 'الأبعاد الموصى بها: 800×600 بكسل | الحد الأقصى: 2MB' : 'Recommended: 800×600 pixels | Max: 2MB'}
                </p>
            </div>

            {/* Stats Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-gray-200 dark:border-slate-700">
                <h3 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                    {isRTL ? 'بطاقة الإحصائية العائمة' : 'Floating Stats Card'}
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {isRTL ? 'القيمة (مثال: 25+)' : 'Value (e.g., 25+)'}
                        </label>
                        <input
                            type="text"
                            value={settings.statsValue}
                            onChange={(e) => setSettings({ ...settings, statsValue: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                            placeholder="25+"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {isRTL ? 'النص (عربي)' : 'Label (Arabic)'}
                        </label>
                        <input
                            type="text"
                            value={settings.statsLabelAr}
                            onChange={(e) => setSettings({ ...settings, statsLabelAr: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                            placeholder="سنة من التميز"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                            {isRTL ? 'النص (إنجليزي)' : 'Label (English)'}
                        </label>
                        <input
                            type="text"
                            value={settings.statsLabelEn}
                            onChange={(e) => setSettings({ ...settings, statsLabelEn: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-brand-orange"
                            placeholder="Years of Excellence"
                        />
                    </div>
                </div>

                {/* Preview */}
                <div className="mt-4 p-4 bg-gradient-to-br from-brand-orange to-brand-gold rounded-xl text-white">
                    <div className="text-center">
                        <div className="text-3xl font-black mb-1">{settings.statsValue || '25+'}</div>
                        <div className="text-sm opacity-90">
                            {isRTL ? (settings.statsLabelAr || 'سنة من التميز') : (settings.statsLabelEn || 'Years of Excellence')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Save Button (Bottom) */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-brand-orange hover:bg-brand-darkOrange text-white font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                >
                    {saving ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                        </>
                    ) : (
                        <>
                            <Save className="w-5 h-5" />
                            {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
