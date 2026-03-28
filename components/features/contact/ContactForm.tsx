'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, MessageSquare, FileText, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import PhoneInput from '@/components/ui/PhoneInput';
import ContainerSelector, { ContainerType } from './ContainerSelector';

type ContactType = 'INQUIRY' | 'QUOTE_REQUEST';

interface FormData {
    name: string;
    email: string;
    phone: string;
    countryCode: string;
    dialCode: string;
    type: ContactType;
    message: string;
    origin: string;
    destination: string;
    containerType: string | null;
    containerQty: number;
}

interface ContactFormProps {
    language?: 'ar' | 'en';
    onSuccess?: () => void;
    defaultType?: ContactType;
}

const initialFormData: FormData = {
    name: '',
    email: '',
    phone: '',
    countryCode: 'EG',
    dialCode: '+20',
    type: 'INQUIRY',
    message: '',
    origin: '',
    destination: '',
    containerType: null,
    containerQty: 1,
};

export default function ContactForm({ language = 'ar', onSuccess, defaultType = 'INQUIRY' }: ContactFormProps) {
    const [formData, setFormData] = useState<FormData>({ ...initialFormData, type: defaultType });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof FormData, string>> = {};

        if (!formData.name.trim()) {
            newErrors.name = t('الاسم مطلوب', 'Name is required');
        }
        // Email is optional - only validate format if provided
        if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('البريد الإلكتروني غير صالح', 'Invalid email address');
        }
        if (!formData.phone.trim() || formData.phone.length < 8) {
            newErrors.phone = t('رقم الهاتف غير صالح', 'Invalid phone number');
        }

        if (formData.type === 'INQUIRY' && !formData.message.trim()) {
            newErrors.message = t('الرسالة مطلوبة', 'Message is required');
        }

        if (formData.type === 'QUOTE_REQUEST') {
            if (!formData.origin.trim()) {
                newErrors.origin = t('موقع الشحن مطلوب', 'Origin is required');
            }
            if (!formData.destination.trim()) {
                newErrors.destination = t('موقع الوصول مطلوب', 'Destination is required');
            }
            if (!formData.containerType) {
                newErrors.containerType = t('نوع الحاوية مطلوب', 'Container type is required');
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);
        setSubmitStatus('idle');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    phone: `${formData.dialCode}${formData.phone}`,
                }),
            });

            if (!res.ok) throw new Error('Failed to submit');

            setSubmitStatus('success');
            setFormData(initialFormData);
            onSuccess?.();
        } catch {
            setSubmitStatus('error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTypeChange = (type: ContactType) => {
        setFormData({ ...formData, type });
        setErrors({});
    };

    const handleContainerChange = (container: ContainerType | null) => {
        setFormData({ ...formData, containerType: container?.id || null });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contact Type Selector */}
            <div className="grid grid-cols-2 gap-4">
                <button
                    type="button"
                    onClick={() => handleTypeChange('INQUIRY')}
                    className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                        formData.type === 'INQUIRY'
                            ? "border-marine-500 bg-marine-50 dark:bg-marine-900/30 text-marine-700 dark:text-marine-300"
                            : "border-gray-200 dark:border-slate-700 hover:border-marine-300 dark:hover:border-marine-600"
                    )}
                >
                    <MessageSquare className={cn(
                        "w-5 h-5",
                        formData.type === 'INQUIRY' ? "text-marine-600" : "text-gray-400"
                    )} />
                    <span className="font-medium text-sm">
                        {t('استفسار', 'Inquiry')}
                    </span>
                </button>

                <button
                    type="button"
                    onClick={() => handleTypeChange('QUOTE_REQUEST')}
                    className={cn(
                        "flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300",
                        formData.type === 'QUOTE_REQUEST'
                            ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                            : "border-gray-200 dark:border-slate-700 hover:border-brand-orange/50"
                    )}
                >
                    <FileText className={cn(
                        "w-5 h-5",
                        formData.type === 'QUOTE_REQUEST' ? "text-brand-orange" : "text-gray-400"
                    )} />
                    <span className="font-medium text-sm">
                        {t('طلب عرض سعر', 'Request Quote')}
                    </span>
                </button>
            </div>

            {/* Basic Info */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('الاسم', 'Name')} <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={cn(
                            "w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border transition-all",
                            errors.name
                                ? "border-red-500"
                                : "border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-2 focus:ring-marine-200"
                        )}
                        placeholder={t('الاسم الكامل', 'Full Name')}
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t('البريد الإلكتروني', 'Email')} <span className="text-gray-400 text-xs">({t('اختياري', 'optional')})</span>
                    </label>
                    <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={cn(
                            "w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border transition-all",
                            errors.email
                                ? "border-red-500"
                                : "border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-2 focus:ring-marine-200"
                        )}
                        placeholder="example@email.com"
                        dir="ltr"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                </div>
            </div>

            {/* Phone Input */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('رقم الهاتف', 'Phone Number')} <span className="text-red-500">*</span>
                </label>
                <PhoneInput
                    value={formData.phone}
                    onChange={(phone, countryCode, dialCode) =>
                        setFormData({ ...formData, phone, countryCode, dialCode })
                    }
                    language={language}
                    error={errors.phone}
                />
            </div>

            {/* Inquiry: Message Only */}
            <AnimatePresence mode="wait">
                {formData.type === 'INQUIRY' && (
                    <motion.div
                        key="inquiry"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            {t('رسالتك', 'Your Message')} <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            rows={5}
                            className={cn(
                                "w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border transition-all resize-none",
                                errors.message
                                    ? "border-red-500"
                                    : "border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-2 focus:ring-marine-200"
                            )}
                            placeholder={t('اكتب استفسارك هنا...', 'Write your inquiry here...')}
                        />
                        {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                    </motion.div>
                )}

                {/* Quote Request: Full Form */}
                {formData.type === 'QUOTE_REQUEST' && (
                    <motion.div
                        key="quote"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Origin & Destination */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <MapPin className="w-4 h-4 inline-block mr-1 text-green-500" />
                                    {t('من (ميناء/مدينة الشحن)', 'From (Port/City)')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.origin}
                                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border transition-all",
                                        errors.origin
                                            ? "border-red-500"
                                            : "border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-2 focus:ring-marine-200"
                                    )}
                                    placeholder={t('أدخل موقع الشحن', 'Enter shipping origin')}
                                />
                                {errors.origin && <p className="mt-1 text-sm text-red-500">{errors.origin}</p>}
                            </div>

                            <div className="relative">
                                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 hidden md:flex items-center justify-center w-8 h-8 bg-brand-orange rounded-full text-white z-10" style={{ marginTop: '12px' }}>
                                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                                </div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    <MapPin className="w-4 h-4 inline-block mr-1 text-red-500" />
                                    {t('إلى (ميناء/مدينة الوصول)', 'To (Port/City)')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.destination}
                                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                                    className={cn(
                                        "w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border transition-all",
                                        errors.destination
                                            ? "border-red-500"
                                            : "border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-2 focus:ring-marine-200"
                                    )}
                                    placeholder={t('أدخل موقع الوصول', 'Enter destination')}
                                />
                                {errors.destination && <p className="mt-1 text-sm text-red-500">{errors.destination}</p>}
                            </div>
                        </div>

                        {/* Container Selector */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('نوع الحاوية', 'Container Type')} <span className="text-red-500">*</span>
                            </label>
                            <ContainerSelector
                                value={formData.containerType}
                                onChange={handleContainerChange}
                                language={language}
                                error={errors.containerType}
                            />
                        </div>

                        {/* Container Quantity */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('عدد الحاويات', 'Number of Containers')}
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, containerQty: Math.max(1, formData.containerQty - 1) })}
                                    className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    −
                                </button>
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={formData.containerQty}
                                    onChange={(e) => setFormData({ ...formData, containerQty: Math.max(1, parseInt(e.target.value) || 1) })}
                                    className="w-20 text-center px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-lg font-semibold"
                                />
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, containerQty: Math.min(100, formData.containerQty + 1) })}
                                    className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl font-semibold hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('ملاحظات إضافية (اختياري)', 'Additional Notes (Optional)')}
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-marine-500 focus:ring-2 focus:ring-marine-200 transition-all resize-none"
                                placeholder={t('أي تفاصيل إضافية عن البضاعة...', 'Any additional details about the cargo...')}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                    "w-full md:w-auto px-8 py-4 rounded-xl font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2",
                    isSubmitting
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-marine-600 to-marine-800 hover:from-marine-700 hover:to-marine-900 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                )}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('جاري الإرسال...', 'Sending...')}
                    </>
                ) : (
                    <>
                        <Send className="w-5 h-5 rtl:rotate-180" />
                        {formData.type === 'INQUIRY'
                            ? t('إرسال الاستفسار', 'Send Inquiry')
                            : t('طلب عرض السعر', 'Request Quote')
                        }
                    </>
                )}
            </button>

            {/* Status Messages */}
            <AnimatePresence>
                {submitStatus === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-center"
                    >
                        ✅ {t('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.', 'Your message was sent successfully! We will contact you soon.')}
                    </motion.div>
                )}
                {submitStatus === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-center"
                    >
                        ❌ {t('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.', 'An error occurred. Please try again.')}
                    </motion.div>
                )}
            </AnimatePresence>
        </form>
    );
}
