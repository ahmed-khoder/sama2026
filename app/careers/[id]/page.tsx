'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getJobById, submitApplication } from '@/app/actions/careers';
import { notFound } from 'next/navigation';
import { Briefcase, MapPin, Clock, ArrowRight, ArrowLeft, Upload, CheckCircle2, Loader2, AlertCircle, FileText, User, Mail, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import PhoneInput from '@/components/ui/PhoneInput';

export default function JobDetailsPage({ params }: { params: { id: string } }) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [job, setJob] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        countryCode: 'EG',
        dialCode: '+20',
        mobile: '',
        mobileCountryCode: 'EG',
        mobileDialCode: '+20',
        coverLetter: '',
        cvUrl: '',
    });
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    const [cvFileName, setCvFileName] = useState('');

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

            if (!allowedTypes.includes(file.type)) {
                setError(language === 'ar'
                    ? 'يرجى رفع ملف PDF أو Word فقط'
                    : 'Please upload only PDF or Word files'
                );
                return;
            }

            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setError(language === 'ar'
                    ? 'حجم الملف يجب أن يكون أقل من 5 ميجابايت'
                    : 'File size must be less than 5MB'
                );
                return;
            }

            setCvFileName(file.name);
            setError('');
            // Note: In production, upload to cloud storage and get URL
            // For now, we'll use a placeholder that indicates file was selected
            setTimeout(() => {
                setFormData(prev => ({ ...prev, cvUrl: `uploaded:${file.name}` }));
            }, 500);
        }
    };

    useEffect(() => {
        const fetchJob = async () => {
            const res = await getJobById(params.id);
            if (res.success && res.job) {
                setJob(res.job);
            }
            setLoading(false);
        };
        fetchJob();
    }, [params.id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.cvUrl) {
            setError(language === 'ar' ? 'يرجى إرفاق السيرة الذاتية' : 'Please upload your CV');
            return;
        }

        setSubmitting(true);
        setError('');

        const fullPhone = `${formData.dialCode}${formData.phone}`;
        const fullMobile = formData.mobile ? `${formData.mobileDialCode}${formData.mobile}` : undefined;

        const res = await submitApplication({
            fullName: formData.fullName,
            email: formData.email,
            phone: fullPhone,
            mobile: fullMobile,
            coverLetter: formData.coverLetter,
            cvUrl: formData.cvUrl,
            jobId: params.id
        });

        if (res.success) {
            setSuccess(true);
        } else {
            setError(res.error || (language === 'ar' ? 'حدث خطأ أثناء إرسال الطلب' : 'Error submitting application'));
        }
        setSubmitting(false);
    };

    if (loading) return (
        <div className="min-h-screen bg-white dark:bg-slate-950 pt-32 flex justify-center items-center">
            <Loader2 className="animate-spin w-10 h-10 text-brand-orange" />
        </div>
    );

    if (!job) return notFound();

    return (
        <div className="min-h-screen bg-white dark:bg-slate-950 py-24">
            {/* Hero Section */}
            <div className="relative overflow-hidden mb-16">
                <div className="absolute inset-0 bg-gradient-to-br from-marine-50 to-transparent dark:from-marine-950/30 dark:to-transparent" />
                <div className="container mx-auto px-4 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <Link
                            href="/careers"
                            className="inline-flex items-center text-gray-500 hover:text-brand-orange transition-colors gap-2 mb-6"
                        >
                            {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                            <span>{language === 'ar' ? 'العودة للوظائف' : 'Back to Jobs'}</span>
                        </Link>

                        <span className="inline-block py-1.5 px-4 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold mb-4">
                            {job.type.replace('_', ' ')}
                        </span>
                        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-marine-900 dark:text-white mb-6">
                            {language === 'ar' ? job.titleAr : job.titleEn}
                        </h1>
                        <div className="flex flex-wrap justify-center gap-6 text-gray-600 dark:text-gray-400">
                            {job.location && (
                                <span className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-brand-orange" />
                                    {job.location}
                                </span>
                            )}
                            <span className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-brand-orange" />
                                {job.type.replace('_', ' ')}
                            </span>
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {/* Job Details */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
                            <h3 className="text-lg md:text-xl font-semibold text-marine-900 dark:text-white mb-6 flex items-center gap-2">
                                <FileText className="w-5 h-5 text-brand-orange" />
                                {language === 'ar' ? 'الوصف الوظيفي' : 'Job Description'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line leading-relaxed font-normal">
                                {language === 'ar' ? job.descriptionAr : job.descriptionEn}
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-marine-600 to-marine-800 p-6 rounded-2xl text-white">
                            <h4 className="font-semibold text-lg mb-4">
                                {language === 'ar' ? '📋 المتطلبات' : '📋 Requirements'}
                            </h4>
                            <div className="text-sm text-white/90 whitespace-pre-line leading-relaxed">
                                {language === 'ar' ? job.requirementsAr : job.requirementsEn}
                            </div>
                        </div>
                    </motion.div>

                    {/* Application Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800">
                            <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-marine-900 dark:text-white mb-8">
                                {language === 'ar' ? 'قدم طلبك الآن' : 'Apply Now'}
                            </h3>

                            {success ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-16"
                                >
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10" />
                                    </div>
                                    <h4 className="font-semibold text-xl md:text-2xl text-marine-900 dark:text-white mb-3">
                                        {language === 'ar' ? 'تم إرسال طلبك بنجاح!' : 'Application Sent!'}
                                    </h4>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                        {language === 'ar'
                                            ? 'شكراً لاهتمامك بالانضمام لفريقنا. سنقوم بمراجعة طلبك والتواصل معك قريباً.'
                                            : 'Thank you for your interest in joining our team. We will review your application and contact you shortly.'
                                        }
                                    </p>
                                    <Link
                                        href="/careers"
                                        className="inline-flex items-center gap-2 mt-8 text-brand-orange font-semibold hover:underline"
                                    >
                                        {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                                        {language === 'ar' ? 'العودة للوظائف' : 'Back to Jobs'}
                                    </Link>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Full Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-marine-900 dark:text-white mb-2">
                                                {language === 'ar' ? 'الاسم بالكامل' : 'Full Name'} *
                                            </label>
                                            <div className="relative">
                                                <User className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.fullName}
                                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                                    className="w-full ps-12 pe-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all outline-none"
                                                    placeholder={language === 'ar' ? 'أدخل اسمك' : 'Enter your name'}
                                                />
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-marine-900 dark:text-white mb-2">
                                                {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
                                            </label>
                                            <div className="relative">
                                                <Mail className="absolute start-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    required
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                                    className="w-full ps-12 pe-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all outline-none"
                                                    placeholder="example@email.com"
                                                    dir="ltr"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Phone with Country Code */}
                                    <div>
                                        <label className="block text-sm font-medium text-marine-900 dark:text-white mb-2">
                                            {language === 'ar' ? 'رقم الهاتف' : 'Phone Number'} *
                                        </label>
                                        <PhoneInput
                                            value={formData.phone}
                                            onChange={(phone, countryCode, dialCode) =>
                                                setFormData({ ...formData, phone, countryCode, dialCode })
                                            }
                                            language={language}
                                            placeholder={language === 'ar' ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                                        />
                                    </div>

                                    {/* Mobile with Country Code (Optional) */}
                                    <div>
                                        <label className="block text-sm font-medium text-marine-900 dark:text-white mb-2">
                                            {language === 'ar' ? 'رقم الجوال (اختياري)' : 'Mobile Number (Optional)'}
                                        </label>
                                        <PhoneInput
                                            value={formData.mobile}
                                            onChange={(mobile, mobileCountryCode, mobileDialCode) =>
                                                setFormData({ ...formData, mobile, mobileCountryCode, mobileDialCode })
                                            }
                                            language={language}
                                            placeholder={language === 'ar' ? 'رقم جوال إضافي' : 'Additional mobile number'}
                                        />
                                    </div>

                                    {/* Cover Letter */}
                                    <div>
                                        <label className="block text-sm font-medium text-marine-900 dark:text-white mb-2">
                                            {language === 'ar' ? 'رسالة التغطية' : 'Cover Letter'} *
                                        </label>
                                        <div className="relative">
                                            <MessageSquare className="absolute start-4 top-4 w-5 h-5 text-gray-400" />
                                            <textarea
                                                required
                                                rows={4}
                                                value={formData.coverLetter}
                                                onChange={e => setFormData({ ...formData, coverLetter: e.target.value })}
                                                className="w-full ps-12 pe-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all outline-none resize-none"
                                                placeholder={language === 'ar' ? 'اكتب رسالة قصيرة عن نفسك ولماذا أنت مناسب لهذه الوظيفة...' : 'Tell us about yourself and why you are a great fit for this position...'}
                                            />
                                        </div>
                                    </div>

                                    {/* CV Upload */}
                                    <div>
                                        <label className="block text-sm font-medium text-marine-900 dark:text-white mb-2">
                                            {language === 'ar' ? 'السيرة الذاتية' : 'Resume / CV'} *
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-8 text-center hover:border-brand-orange/50 hover:bg-brand-orange/5 transition-all cursor-pointer relative group">
                                            <input
                                                type="file"
                                                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                onChange={handleFileUpload}
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                            />
                                            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-orange/10 transition-colors">
                                                <Upload className="w-8 h-8 text-gray-400 group-hover:text-brand-orange transition-colors" />
                                            </div>
                                            {formData.cvUrl ? (
                                                <div>
                                                    <p className="text-green-600 font-semibold text-lg">
                                                        ✓ {language === 'ar' ? 'تم رفع الملف بنجاح' : 'File Uploaded Successfully'}
                                                    </p>
                                                    {cvFileName && (
                                                        <p className="text-sm text-gray-500 mt-1">{cvFileName}</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <p className="text-gray-600 dark:text-gray-400 font-medium">
                                                        {language === 'ar' ? 'اسحب الملف هنا أو اضغط للرفع' : 'Drag & drop or Click to Upload'}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {language === 'ar'
                                                            ? 'PDF أو Word فقط (الحد الأقصى 5 ميجابايت)'
                                                            : 'PDF or Word only (Max 5MB)'
                                                        }
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
                                            <AlertCircle className="w-5 h-5 shrink-0" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="w-full py-4 bg-brand-orange text-white font-semibold rounded-xl hover:bg-brand-darkOrange transition-all shadow-lg shadow-brand-orange/20 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-lg"
                                    >
                                        {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                        {language === 'ar' ? 'إرسال الطلب' : 'Submit Application'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
