'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { createJob } from '@/app/actions/careers';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateJobPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        titleAr: '', titleEn: '',
        descriptionAr: '', descriptionEn: '',
        requirementsAr: '', requirementsEn: '',
        location: 'Cairo, Egypt',
        type: 'FULL_TIME'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await createJob(formData);
        if (res.success) {
            router.push('/dashboard/careers');
        } else {
            alert('Error creating job');
        }
        setLoading(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Back Link */}
            <Link href="/dashboard/careers" className="inline-flex items-center text-gray-500 hover:text-brand-orange gap-2">
                {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                <span>{language === 'ar' ? 'عودة للقائمة' : 'Back to Dashboard'}</span>
            </Link>

            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 md:p-8">
                <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    {language === 'ar' ? 'إضافة وظيفة جديدة' : 'Post New Job'}
                </h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Titles */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">{language === 'ar' ? 'المسمى الوظيفي (عربي)' : 'Job Title (Arabic)'}</label>
                            <input required type="text" value={formData.titleAr} onChange={e => setFormData({ ...formData, titleAr: e.target.value })} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">{language === 'ar' ? 'المسمى الوظيفي (إنجليزي)' : 'Job Title (English)'}</label>
                            <input required type="text" value={formData.titleEn} onChange={e => setFormData({ ...formData, titleEn: e.target.value })} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">{language === 'ar' ? 'الموقع' : 'Location'}</label>
                            <input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">{language === 'ar' ? 'نوع الوظيفة' : 'Job Type'}</label>
                            <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white">
                                <option value="FULL_TIME">Full Time</option>
                                <option value="PART_TIME">Part Time</option>
                                <option value="CONTRACT">Contract</option>
                                <option value="INTERNSHIP">Internship</option>
                            </select>
                        </div>
                    </div>

                    {/* Descriptions */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">{language === 'ar' ? 'الوصف الوظيفي (عربي)' : 'Job Description (Arabic)'}</label>
                            <textarea required rows={4} value={formData.descriptionAr} onChange={e => setFormData({ ...formData, descriptionAr: e.target.value })} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">{language === 'ar' ? 'الوصف الوظيفي (إنجليزي)' : 'Job Description (English)'}</label>
                            <textarea required rows={4} value={formData.descriptionEn} onChange={e => setFormData({ ...formData, descriptionEn: e.target.value })} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white"></textarea>
                        </div>
                    </div>

                    {/* Requirements */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">{language === 'ar' ? 'المتطلبات (عربي)' : 'Requirements (Arabic)'}</label>
                            <textarea required rows={4} value={formData.requirementsAr} onChange={e => setFormData({ ...formData, requirementsAr: e.target.value })} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="كل نقطة في سطر جديد"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1 dark:text-gray-300">{language === 'ar' ? 'المتطلبات (إنجليزي)' : 'Requirements (English)'}</label>
                            <textarea required rows={4} value={formData.requirementsEn} onChange={e => setFormData({ ...formData, requirementsEn: e.target.value })} className="w-full p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white" placeholder="Each point on a new line"></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-3 bg-brand-orange text-white font-bold rounded-lg hover:bg-brand-darkOrange transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>{language === 'ar' ? 'حفظ ونشر' : 'Save & Publish'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
