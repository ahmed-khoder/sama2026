'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { getJobs, toggleJobStatus } from '@/app/actions/careers';
import { Briefcase, Plus, Users, Eye, EyeOff, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface Job {
    id: string;
    titleAr: string;
    titleEn: string;
    location: string | null;
    type: string;
    isActive: boolean;
    createdAt: Date;
    _count?: { applications: number }; // Future API extension or separate fetch
}

export default function CareersDashboard() {
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchJobs = async () => {
        setLoading(true);
        const res = await getJobs(false); // Fetch all jobs
        if (res.success && res.jobs) {
            setJobs(res.jobs as unknown as Job[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const res = await toggleJobStatus(id, !currentStatus);
        if (res.success) {
            fetchJobs();
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-brand-orange" />
                        {language === 'ar' ? 'إدارة التوظيف' : 'Recruitment Management'}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        {language === 'ar' ? 'إدارة الوظائف الشاغرة وطلبات التوظيف' : 'Manage job openings and applications'}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/dashboard/careers/applications"
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                        <Users className="w-4 h-4" />
                        <span>{language === 'ar' ? 'طلبات التوظيف' : 'Applications'}</span>
                    </Link>
                    <Link
                        href="/dashboard/careers/jobs/create"
                        className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-darkOrange transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>{language === 'ar' ? 'إضافة وظيفة' : 'Post New Job'}</span>
                    </Link>
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="p-10 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        {language === 'ar' ? 'لا توجد وظائف حالياً' : 'No jobs found'}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-800/50">
                                <tr>
                                    <th className="px-6 py-3">{language === 'ar' ? 'المسمى الوظيفي' : 'Job Title'}</th>
                                    <th className="px-6 py-3">{language === 'ar' ? 'الموقع' : 'Location'}</th>
                                    <th className="px-6 py-3">{language === 'ar' ? 'النوع' : 'Type'}</th>
                                    <th className="px-6 py-3">{language === 'ar' ? 'تاريخ النشر' : 'Posted Date'}</th>
                                    <th className="px-6 py-3">{language === 'ar' ? 'الحالة' : 'Status'}</th>
                                    <th className="px-6 py-3 text-right">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jobs.map((job) => (
                                    <tr key={job.id} className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {language === 'ar' ? job.titleAr : job.titleEn}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {job.location || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-semibold">
                                                {job.type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                                            {format(new Date(job.createdAt), 'PP', { locale: isRTL ? ar : enUS })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {job.isActive ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                    {language === 'ar' ? 'نشط' : 'Active'}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                                    {language === 'ar' ? 'غير نشط' : 'Inactive'}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleToggleStatus(job.id, job.isActive)}
                                                className="text-gray-400 hover:text-brand-orange transition-colors"
                                                title={language === 'ar' ? 'تغيير الحالة' : 'Toggle Status'}
                                            >
                                                {job.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
