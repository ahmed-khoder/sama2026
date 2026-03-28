'use client';

import { Plus, Edit2, Trash2, Save, X, MoveUp, MoveDown, Ship, Plane, Truck, FileCheck, Warehouse, Shield, Image as ImageIcon } from 'lucide-react';
import { useState } from 'react';
import { useConfirm } from '@/contexts/ConfirmContext';
import { ImageUploader } from '../../shared/ImageUploader';

import { ServiceItem } from '../../../types';

interface ServiceFeature {
    ar: string;
    en: string;
}

interface ServicesManagementTabProps {
    services: ServiceItem[];
    isRTL: boolean;
    onAddService: (service: Partial<ServiceItem>) => Promise<boolean>;
    onUpdateService: (service: ServiceItem) => Promise<boolean>;
    onDeleteService: (id: string) => Promise<void>;
    onToggleService: (id: string, isActive: boolean) => Promise<void>;
    onSwapService: (serviceId: string, targetServiceId: string) => Promise<boolean>;
}

// أيقونات متاحة
const AVAILABLE_ICONS = [
    { name: 'Ship', label: 'سفينة / Ship', icon: Ship },
    { name: 'Plane', label: 'طائرة / Plane', icon: Plane },
    { name: 'Truck', label: 'شاحنة / Truck', icon: Truck },
    { name: 'FileCheck', label: 'ملف / Document', icon: FileCheck },
    { name: 'Warehouse', label: 'مستودع / Warehouse', icon: Warehouse },
    { name: 'Shield', label: 'درع / Shield', icon: Shield },
];

export function ServicesManagementTab({
    services,
    isRTL,
    onAddService,
    onUpdateService,
    onDeleteService,
    onToggleService,
    onSwapService,
}: ServicesManagementTabProps) {
    const { confirm } = useConfirm();
    const [showAddForm, setShowAddForm] = useState(false);
    const [editingService, setEditingService] = useState<ServiceItem | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState<Partial<ServiceItem>>({
        iconName: 'Ship',
        titleAr: '',
        titleEn: '',
        shortDescAr: '',
        shortDescEn: '',
        descriptionAr: '',
        descriptionEn: '',
        featuresJson: '[]',
        image: '',
        color: '#F97316',
        order: services.length,
        isActive: true,
    });

    const [features, setFeatures] = useState<ServiceFeature[]>([]);

    // Reset form
    const resetForm = () => {
        setFormData({
            iconName: 'Ship',
            titleAr: '',
            titleEn: '',
            shortDescAr: '',
            shortDescEn: '',
            descriptionAr: '',
            descriptionEn: '',
            featuresJson: '[]',
            image: '',
            color: '#F97316',
            order: services.length,
            isActive: true,
        });
        setFeatures([]);
        setEditingService(null);
        setShowAddForm(false);
    };

    // Edit service
    const handleEdit = (service: ServiceItem) => {
        console.log('✏️ Editing service:', {
            id: service.id,
            titleEn: service.titleEn,
            hasImage: !!service.image,
            imagePath: service.image
        });

        setEditingService(service);

        // Create a clean copy of service data for editing
        const editData = {
            ...service,
            image: service.image || ''  // Ensure image field exists
        };

        console.log('📝 Setting form data:', {
            hasImage: !!editData.image,
            imagePath: editData.image
        });

        setFormData(editData);

        try {
            const parsedFeatures = JSON.parse(service.featuresJson || '[]');
            setFeatures(parsedFeatures);
        } catch (e) {
            setFeatures([]);
        }

        setShowAddForm(true);
    };

    // Add feature
    const addFeature = () => {
        setFeatures([...features, { ar: '', en: '' }]);
    };

    // Update feature
    const updateFeature = (index: number, field: 'ar' | 'en', value: string) => {
        const newFeatures = [...features];
        newFeatures[index][field] = value;
        setFeatures(newFeatures);
    };

    // Remove feature
    const removeFeature = (index: number) => {
        setFeatures(features.filter((_, i) => i !== index));
    };

    // Save service
    const handleSave = async () => {
        if (!formData.titleAr || !formData.titleEn) {
            alert(isRTL ? 'الرجاء إدخال العنوان بالعربية والإنجليزية' : 'Please enter title in both languages');
            return;
        }

        setSaving(true);

        try {
            // Create a clean copy of the data to save
            const dataToSave = { ...formData };

            // Generate slug from English title if not exists
            if (!dataToSave.slug && dataToSave.titleEn) {
                dataToSave.slug = dataToSave.titleEn
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-+|-+$/g, '');
            }

            // Save features as JSON
            dataToSave.featuresJson = JSON.stringify(features);

            // Ensure image field is preserved
            if (!dataToSave.image) {
                dataToSave.image = '';
            }

            // Log data being saved (for debugging)
            console.log('💾 Saving service data:', {
                titleEn: dataToSave.titleEn,
                hasImage: !!dataToSave.image,
                imagePath: dataToSave.image,
                allData: dataToSave
            });

            let success = false;
            if (editingService) {
                // When updating, merge with existing service data
                const updateData = { ...editingService, ...dataToSave };
                console.log('🔄 Update data:', {
                    id: updateData.id,
                    hasImage: !!updateData.image,
                    imagePath: updateData.image
                });
                success = await onUpdateService(updateData as ServiceItem);
            } else {
                success = await onAddService(dataToSave);
            }

            if (success) {
                console.log('✅ Service saved successfully!');
                resetForm();
            } else {
                console.error('❌ Failed to save service');
            }
        } catch (error) {
            console.error('❌ Error saving service:', error);
        } finally {
            setSaving(false);
        }
    };

    // Delete service
    const handleDelete = async (service: ServiceItem) => {
        const confirmed = await confirm({
            title: isRTL ? 'حذف الخدمة' : 'Delete Service',
            message: isRTL
                ? `هل أنت متأكد من حذف "${service.titleAr}"؟`
                : `Are you sure you want to delete "${service.titleEn}"?`,
            confirmText: isRTL ? 'حذف' : 'Delete',
            cancelText: isRTL ? 'إلغاء' : 'Cancel',
        });

        if (confirmed) {
            await onDeleteService(service.id);
        }
    };

    // Move service up/down — uses atomic swap endpoint
    const handleMove = async (service: ServiceItem, direction: 'up' | 'down') => {
        const currentIndex = services.findIndex(s => s.id === service.id);
        if (
            (direction === 'up' && currentIndex === 0) ||
            (direction === 'down' && currentIndex === services.length - 1)
        ) {
            return;
        }

        const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
        const targetService = services[targetIndex];

        // Atomic swap via dedicated endpoint
        await onSwapService(service.id, targetService.id);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700">
                <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                        {isRTL ? 'إدارة الخدمات' : 'Services Management'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {services.filter(s => s.isActive).length} {isRTL ? 'خدمة نشطة من' : 'active of'} {services.length}
                    </p>
                </div>
                <button
                    onClick={() => {
                        resetForm();
                        setShowAddForm(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-darkOrange text-white rounded-xl transition-colors font-bold"
                >
                    <Plus className="w-4 h-4" />
                    <span>{isRTL ? 'خدمة جديدة' : 'New Service'}</span>
                </button>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border-2 border-brand-orange dark:border-brand-orange space-y-6">
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-lg text-gray-900 dark:text-white">
                            {editingService
                                ? (isRTL ? 'تعديل الخدمة' : 'Edit Service')
                                : (isRTL ? 'إضافة خدمة جديدة' : 'Add New Service')}
                        </h4>
                        <button
                            onClick={resetForm}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            {isRTL ? 'الأيقونة' : 'Icon'}
                        </label>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                            {AVAILABLE_ICONS.map((icon) => {
                                const IconComponent = icon.icon;
                                const isSelected = formData.iconName === icon.name;
                                return (
                                    <button
                                        key={icon.name}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, iconName: icon.name })}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${isSelected
                                            ? 'border-brand-orange bg-brand-orange/10'
                                            : 'border-gray-200 dark:border-slate-700 hover:border-brand-orange/50'
                                            }`}
                                    >
                                        <IconComponent className={`w-8 h-8 ${isSelected ? 'text-brand-orange' : 'text-gray-600 dark:text-gray-400'}`} />
                                        <span className="text-xs text-center">{icon.label.split(' / ')[isRTL ? 0 : 1]}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Service Image */}
                    {/* Desktop Image */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            <span className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                {isRTL ? 'صورة سطح المكتب' : 'Desktop Image'}
                                <span className="text-xs text-gray-500 font-normal">({isRTL ? 'افتراضية' : 'Default'})</span>
                            </span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            {isRTL
                                ? 'صورة تظهر على سطح المكتب، وعلى الموبايل إذا لم تُرفع صورة موبايل (1920x1080 بكسل)'
                                : 'Shown on desktop, also on mobile if no mobile image uploaded (1920x1080px)'
                            }
                        </p>
                        <ImageUploader
                            folder="services"
                            currentImage={formData.image || undefined}
                            onUpload={(path) => {
                                console.log('🖼️ Desktop image uploaded:', path);
                                setFormData(prev => ({ ...prev, image: path }));
                            }}
                            aspectRatio="video"
                            isRTL={isRTL}
                        />
                    </div>

                    {/* Mobile Image (Optional) */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                            <span className="flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                {isRTL ? 'صورة الموبايل' : 'Mobile Image'}
                                <span className="text-xs text-gray-500 font-normal">({isRTL ? 'اختيارية' : 'Optional'})</span>
                            </span>
                        </label>
                        <p className="text-xs text-gray-500 mb-3">
                            {isRTL
                                ? 'صورة مُحسّنة للموبايل (اختيارية). إذا لم تُرفع، ستُستخدم صورة سطح المكتب (750x1334 بكسل)'
                                : 'Mobile-optimized image (optional). If not uploaded, desktop image will be used (750x1334px)'
                            }
                        </p>
                        <ImageUploader
                            folder="services"
                            currentImage={formData.imageMobile || undefined}
                            onUpload={(path) => {
                                console.log('📱 Mobile image uploaded:', path);
                                setFormData(prev => ({ ...prev, imageMobile: path }));
                            }}
                            aspectRatio="portrait"
                            isRTL={isRTL}
                        />
                        {formData.imageMobile && (
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, imageMobile: undefined }))}
                                className="mt-2 text-xs text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
                            >
                                <X className="w-3 h-3" />
                                {isRTL ? 'إزالة (ستُستخدم صورة سطح المكتب)' : 'Remove (desktop image will be used)'}
                            </button>
                        )}
                    </div>

                    {/* Titles */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? 'العنوان بالعربية' : 'Title (Arabic)'}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titleAr || ''}
                                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                placeholder={isRTL ? 'مثال: شحن بحري' : 'Example: Sea Freight'}
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? 'العنوان بالإنجليزية' : 'Title (English)'}
                                <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={formData.titleEn || ''}
                                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                placeholder="Example: Sea Freight"
                            />
                        </div>
                    </div>

                    {/* Short Descriptions */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? 'الوصف المختصر بالعربية' : 'Short Description (Arabic)'}
                            </label>
                            <textarea
                                value={formData.shortDescAr || ''}
                                onChange={(e) => setFormData({ ...formData, shortDescAr: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                placeholder={isRTL ? 'وصف قصير يظهر في بطاقة الخدمة' : 'Short description for service card'}
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? 'الوصف المختصر بالإنجليزية' : 'Short Description (English)'}
                            </label>
                            <textarea
                                value={formData.shortDescEn || ''}
                                onChange={(e) => setFormData({ ...formData, shortDescEn: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                placeholder="Short description for service card"
                            />
                        </div>
                    </div>

                    {/* Full Descriptions */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? 'الوصف الكامل بالعربية' : 'Full Description (Arabic)'}
                            </label>
                            <textarea
                                value={formData.descriptionAr || ''}
                                onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                placeholder={isRTL ? 'وصف تفصيلي يظهر في صفحة الخدمة' : 'Detailed description for service page'}
                                dir="rtl"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                {isRTL ? 'الوصف الكامل بالإنجليزية' : 'Full Description (English)'}
                            </label>
                            <textarea
                                value={formData.descriptionEn || ''}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                                placeholder="Detailed description for service page"
                            />
                        </div>
                    </div>

                    {/* Features */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                {isRTL ? 'المميزات' : 'Features'}
                            </label>
                            <button
                                type="button"
                                onClick={addFeature}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                {isRTL ? 'إضافة ميزة' : 'Add Feature'}
                            </button>
                        </div>
                        <div className="space-y-3">
                            {features.map((feature, index) => (
                                <div key={index} className="flex gap-3 items-start p-3 bg-gray-50 dark:bg-slate-900 rounded-lg">
                                    <div className="flex-1 grid md:grid-cols-2 gap-3">
                                        <input
                                            type="text"
                                            value={feature.ar}
                                            onChange={(e) => updateFeature(index, 'ar', e.target.value)}
                                            placeholder={isRTL ? 'الميزة بالعربية' : 'Feature in Arabic'}
                                            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                                            dir="rtl"
                                        />
                                        <input
                                            type="text"
                                            value={feature.en}
                                            onChange={(e) => updateFeature(index, 'en', e.target.value)}
                                            placeholder="Feature in English"
                                            className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFeature(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                            {features.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">
                                    {isRTL ? 'لا توجد مميزات. انقر على "إضافة ميزة" للبدء.' : 'No features yet. Click "Add Feature" to start.'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-slate-700">
                        <button
                            onClick={resetForm}
                            className="px-6 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-bold"
                        >
                            {isRTL ? 'إلغاء' : 'Cancel'}
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2 bg-brand-orange hover:bg-brand-darkOrange text-white rounded-lg transition-colors font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ' : 'Save')}
                        </button>
                    </div>
                </div>
            )}

            {/* Services List */}
            <div className="space-y-3">
                {services.length === 0 ? (
                    <div className="bg-white dark:bg-slate-800 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 text-center">
                        <p className="text-gray-500">
                            {isRTL ? 'لا توجد خدمات. انقر على "خدمة جديدة" لإضافة أول خدمة.' : 'No services yet. Click "New Service" to add your first service.'}
                        </p>
                    </div>
                ) : (
                    services.map((service, index) => {
                        const IconComponent = AVAILABLE_ICONS.find(i => i.name === service.iconName)?.icon || Ship;
                        return (
                            <div
                                key={service.id}
                                className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon or Image Preview */}
                                    {service.image ? (
                                        <div className="w-24 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gray-200 dark:border-slate-700">
                                            <img
                                                src={service.image}
                                                alt={isRTL ? service.titleAr : service.titleEn}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 rounded-xl bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
                                            <IconComponent className="w-7 h-7 text-brand-orange" />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-3 mb-2">
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                                                    {isRTL ? service.titleAr : service.titleEn}
                                                </h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                                    {isRTL ? service.shortDescAr : service.shortDescEn}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                {/* Status Badge */}
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${service.isActive
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                        }`}
                                                >
                                                    {service.isActive ? (isRTL ? 'نشط' : 'Active') : (isRTL ? 'غير نشط' : 'Inactive')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Features Preview */}
                                        {service.featuresJson && (() => {
                                            try {
                                                const features = JSON.parse(service.featuresJson);
                                                return features.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {features.slice(0, 3).map((f: ServiceFeature, idx: number) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs px-2 py-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded"
                                                            >
                                                                {isRTL ? f.ar : f.en}
                                                            </span>
                                                        ))}
                                                        {features.length > 3 && (
                                                            <span className="text-xs px-2 py-1 bg-brand-orange/10 text-brand-orange rounded font-bold">
                                                                +{features.length - 3} {isRTL ? 'أخرى' : 'more'}
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            } catch (e) {
                                                return null;
                                            }
                                        })()}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => handleMove(service, 'up')}
                                            disabled={index === 0}
                                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                                            title={isRTL ? 'تحريك لأعلى' : 'Move Up'}
                                        >
                                            <MoveUp className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleMove(service, 'down')}
                                            disabled={index === services.length - 1}
                                            className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-30"
                                            title={isRTL ? 'تحريك لأسفل' : 'Move Down'}
                                        >
                                            <MoveDown className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(service)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                            title={isRTL ? 'تعديل' : 'Edit'}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onToggleService(service.id, !service.isActive)}
                                            className={`p-2 rounded-lg transition-colors ${service.isActive
                                                ? 'text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
                                                : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                }`}
                                            title={service.isActive ? (isRTL ? 'تعطيل' : 'Deactivate') : (isRTL ? 'تفعيل' : 'Activate')}
                                        >
                                            {service.isActive ? '◻' : '◼'}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service)}
                                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            title={isRTL ? 'حذف' : 'Delete'}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
