'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getApplications, updateApplicationStatus, getJobs } from '@/app/actions/careers';
import { Loader2, FileText, Phone, Mail, Filter, Download, X, Eye, Edit2, Calendar, MessageSquare, AlertTriangle, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface Application {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    mobile?: string | null;
    coverLetter?: string | null;
    cvUrl: string;
    status: string;
    notes?: string | null;
    createdAt: Date;
    job: {
        titleAr: string;
        titleEn: string;
    };
}

type ViewMode = 'list' | 'grouped';

export default function ApplicationsPage() {
    const { language } = useLanguage();
    const [applications, setApplications] = useState<Application[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterJobId, setFilterJobId] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('');
    const [jobs, setJobs] = useState<any[]>([]);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [editNotes, setEditNotes] = useState('');
    const [viewMode, setViewMode] = useState<ViewMode>('grouped');

    const fetchData = async () => {
        setLoading(true);
        const [appsRes, jobsRes] = await Promise.all([
            getApplications(filterJobId || undefined),
            getJobs(false)
        ]);

        if (appsRes.success) {
            setApplications(appsRes.applications as any);
        }
        if (jobsRes.success) {
            setJobs(jobsRes.jobs as any[]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, [filterJobId]);

    const handleStatusChange = async (id: string, newStatus: string) => {
        setApplications(prev => prev.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        ));
        if (selectedApp?.id === id) {
            setSelectedApp(prev => prev ? { ...prev, status: newStatus } : null);
        }
        await updateApplicationStatus(id, newStatus);
    };

    const openModal = (app: Application) => {
        setSelectedApp(app);
        setEditNotes(app.notes || '');
    };

    const closeModal = () => {
        setSelectedApp(null);
        setEditNotes('');
    };

    const statusOrder = ['NEW', 'REVIEWED', 'SHORTLISTED', 'HIRED', 'REJECTED'];

    const statusColors: Record<string, string> = {
        NEW: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800',
        REVIEWED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        SHORTLISTED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800',
        HIRED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
        REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    };

    const statusHeaderColors: Record<string, string> = {
        NEW: 'bg-blue-500',
        REVIEWED: 'bg-yellow-500',
        SHORTLISTED: 'bg-purple-500',
        HIRED: 'bg-green-500',
        REJECTED: 'bg-red-500',
    };

    const statusLabels: Record<string, { ar: string; en: string }> = {
        NEW: { ar: 'جديد', en: 'New' },
        REVIEWED: { ar: 'تمت المراجعة', en: 'Reviewed' },
        SHORTLISTED: { ar: 'القائمة القصيرة', en: 'Shortlisted' },
        HIRED: { ar: 'تم التوظيف', en: 'Hired' },
        REJECTED: { ar: 'مرفوض', en: 'Rejected' },
    };

    // Filter applications by status
    const filteredApplications = useMemo(() => {
        if (!filterStatus) return applications;
        return applications.filter(app => app.status === filterStatus);
    }, [applications, filterStatus]);

    // Group applications by status
    const groupedApplications = useMemo(() => {
        const groups: Record<string, Application[]> = {};
        statusOrder.forEach(status => {
            groups[status] = filteredApplications.filter(app => app.status === status);
        });
        return groups;
    }, [filteredApplications]);

    // Count by status
    const statusCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        statusOrder.forEach(status => {
            counts[status] = applications.filter(app => app.status === status).length;
        });
        return counts;
    }, [applications]);

    const isMockCv = (url: string) => {
        return url.includes('example.com') || url.startsWith('uploaded:');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between gap-4 lg:items-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {language === 'ar' ? 'طلبات التوظيف' : 'Job Applications'}
                    <span className="text-gray-400 font-normal text-lg ms-2">({applications.length})</span>
                </h1>

                {/* Filters & View Toggle */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Job Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <select
                            value={filterJobId}
                            onChange={(e) => setFilterJobId(e.target.value)}
                            className="p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                        >
                            <option value="">{language === 'ar' ? 'جميع الوظائف' : 'All Jobs'}</option>
                            {jobs.map(job => (
                                <option key={job.id} value={job.id}>
                                    {language === 'ar' ? job.titleAr : job.titleEn}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2 rounded-lg border dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm"
                    >
                        <option value="">{language === 'ar' ? 'جميع الحالات' : 'All Statuses'}</option>
                        {statusOrder.map(status => (
                            <option key={status} value={status}>
                                {language === 'ar' ? statusLabels[status].ar : statusLabels[status].en} ({statusCounts[status]})
                            </option>
                        ))}
                    </select>

                    {/* View Toggle */}
                    <div className="flex items-center bg-gray-100 dark:bg-slate-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grouped')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grouped' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500'}`}
                            title={language === 'ar' ? 'عرض مجمع' : 'Grouped View'}
                        >
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-gray-500'}`}
                            title={language === 'ar' ? 'عرض قائمة' : 'List View'}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {statusOrder.map(status => (
                    <button
                        key={status}
                        onClick={() => setFilterStatus(filterStatus === status ? '' : status)}
                        className={`p-4 rounded-xl border-2 transition-all ${filterStatus === status
                                ? statusColors[status] + ' ring-2 ring-offset-2'
                                : 'bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
                            }`}
                    >
                        <div className="text-2xl font-bold">{statusCounts[status]}</div>
                        <div className="text-sm opacity-75">
                            {language === 'ar' ? statusLabels[status].ar : statusLabels[status].en}
                        </div>
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="p-10 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                </div>
            ) : filteredApplications.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-10 text-center text-gray-500 border border-gray-100 dark:border-slate-800">
                    {language === 'ar' ? 'لا توجد طلبات توظيف' : 'No applications found'}
                </div>
            ) : viewMode === 'grouped' ? (
                /* Grouped View - Kanban Style */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {statusOrder.map(status => {
                        const apps = groupedApplications[status];
                        if (filterStatus && filterStatus !== status) return null;

                        return (
                            <div key={status} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl overflow-hidden">
                                {/* Column Header */}
                                <div className={`${statusHeaderColors[status]} text-white px-4 py-3 flex items-center justify-between`}>
                                    <span className="font-bold">
                                        {language === 'ar' ? statusLabels[status].ar : statusLabels[status].en}
                                    </span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
                                        {apps.length}
                                    </span>
                                </div>

                                {/* Cards */}
                                <div className="p-3 space-y-3 max-h-[60vh] overflow-y-auto">
                                    {apps.length === 0 ? (
                                        <div className="text-center text-gray-400 py-6 text-sm">
                                            {language === 'ar' ? 'لا توجد طلبات' : 'No applications'}
                                        </div>
                                    ) : (
                                        apps.map(app => (
                                            <motion.div
                                                key={app.id}
                                                layout
                                                onClick={() => openModal(app)}
                                                className="bg-white dark:bg-slate-900 rounded-lg p-4 shadow-sm border border-gray-100 dark:border-slate-700 cursor-pointer hover:shadow-md transition-shadow"
                                            >
                                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{app.fullName}</h4>
                                                <p className="text-xs text-brand-orange truncate mt-1">
                                                    {language === 'ar' ? app.job.titleAr : app.job.titleEn}
                                                </p>
                                                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(app.createdAt), 'MMM d')}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List View */
                <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
                    <div className="divide-y divide-gray-100 dark:divide-slate-800">
                        {filteredApplications.map((app) => (
                            <div
                                key={app.id}
                                className="p-6 hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                                onClick={() => openModal(app)}
                            >
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{app.fullName}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${statusColors[app.status] || 'bg-gray-100'}`}>
                                                {language === 'ar' ? statusLabels[app.status]?.ar : statusLabels[app.status]?.en || app.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-brand-orange font-medium flex items-center gap-1">
                                            <BriefcaseIcon className="w-4 h-4" />
                                            {language === 'ar' ? app.job.titleAr : app.job.titleEn}
                                        </p>
                                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {app.email}</span>
                                            <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {app.phone}</span>
                                            <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4" /> {format(new Date(app.createdAt), 'PPP')}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                        <button
                                            onClick={() => openModal(app)}
                                            className="flex items-center gap-2 px-4 py-2 bg-marine-100 hover:bg-marine-200 dark:bg-marine-900/30 dark:hover:bg-marine-800/50 text-marine-700 dark:text-marine-300 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            {language === 'ar' ? 'عرض' : 'View'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedApp && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                        onClick={closeModal}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-slate-800 flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedApp.fullName}</h2>
                                    <p className="text-brand-orange font-medium mt-1">
                                        {language === 'ar' ? selectedApp.job.titleAr : selectedApp.job.titleEn}
                                    </p>
                                </div>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="p-6 space-y-6">
                                {/* Status Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        {language === 'ar' ? 'حالة الطلب' : 'Application Status'}
                                    </label>
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(statusLabels).map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusChange(selectedApp.id, status)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedApp.status === status
                                                        ? statusColors[status] + ' ring-2 ring-offset-2 ring-current'
                                                        : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                                                    }`}
                                            >
                                                {language === 'ar' ? statusLabels[status].ar : statusLabels[status].en}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Contact Info */}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                            <Mail className="w-4 h-4" />
                                            <span className="text-sm">{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</span>
                                        </div>
                                        <a href={`mailto:${selectedApp.email}`} className="text-marine-600 dark:text-marine-400 font-medium hover:underline">
                                            {selectedApp.email}
                                        </a>
                                    </div>
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                            <Phone className="w-4 h-4" />
                                            <span className="text-sm">{language === 'ar' ? 'الهاتف' : 'Phone'}</span>
                                        </div>
                                        <a href={`tel:${selectedApp.phone}`} className="text-marine-600 dark:text-marine-400 font-medium hover:underline" dir="ltr">
                                            {selectedApp.phone}
                                        </a>
                                    </div>
                                    {selectedApp.mobile && (
                                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                                <Phone className="w-4 h-4 text-blue-500" />
                                                <span className="text-sm">{language === 'ar' ? 'الجوال' : 'Mobile'}</span>
                                            </div>
                                            <a href={`tel:${selectedApp.mobile}`} className="text-marine-600 dark:text-marine-400 font-medium hover:underline" dir="ltr">
                                                {selectedApp.mobile}
                                            </a>
                                        </div>
                                    )}
                                    <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl">
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">{language === 'ar' ? 'تاريخ التقديم' : 'Applied On'}</span>
                                        </div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {format(new Date(selectedApp.createdAt), 'PPP')}
                                        </span>
                                    </div>
                                </div>

                                {/* Cover Letter */}
                                {selectedApp.coverLetter && (
                                    <div>
                                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                                            <MessageSquare className="w-4 h-4" />
                                            <span className="text-sm font-bold">{language === 'ar' ? 'رسالة التغطية' : 'Cover Letter'}</span>
                                        </div>
                                        <div className="p-4 bg-gray-50 dark:bg-slate-800 rounded-xl text-gray-600 dark:text-gray-400 whitespace-pre-line">
                                            {selectedApp.coverLetter}
                                        </div>
                                    </div>
                                )}

                                {/* CV Download */}
                                <div>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                                        <FileText className="w-4 h-4" />
                                        <span className="text-sm font-bold">{language === 'ar' ? 'السيرة الذاتية' : 'Resume / CV'}</span>
                                    </div>
                                    {isMockCv(selectedApp.cvUrl) ? (
                                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
                                            <div className="flex items-start gap-3">
                                                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="font-medium text-yellow-800 dark:text-yellow-300">
                                                        {language === 'ar' ? 'ملف السيرة الذاتية غير متوفر' : 'CV file not available'}
                                                    </p>
                                                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
                                                        {language === 'ar'
                                                            ? 'تم استخدام رابط مؤقت للاختبار. لتفعيل رفع الملفات الفعلي، يجب ربط خدمة تخزين سحابية.'
                                                            : 'A placeholder URL was used for testing. To enable real file uploads, integrate a cloud storage service.'
                                                        }
                                                    </p>
                                                    {selectedApp.cvUrl.startsWith('uploaded:') && (
                                                        <p className="text-sm text-yellow-600 dark:text-yellow-500 mt-2 font-mono">
                                                            {language === 'ar' ? 'اسم الملف: ' : 'File name: '}
                                                            {selectedApp.cvUrl.replace('uploaded:', '')}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <a
                                            href={selectedApp.cvUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center justify-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-darkOrange text-white rounded-xl font-medium transition-colors"
                                        >
                                            <Download className="w-5 h-5" />
                                            {language === 'ar' ? 'تحميل السيرة الذاتية' : 'Download CV'}
                                        </a>
                                    )}
                                </div>

                                {/* Notes Section */}
                                <div>
                                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 mb-2">
                                        <Edit2 className="w-4 h-4" />
                                        <span className="text-sm font-bold">{language === 'ar' ? 'ملاحظات داخلية' : 'Internal Notes'}</span>
                                    </div>
                                    <textarea
                                        value={editNotes}
                                        onChange={e => setEditNotes(e.target.value)}
                                        rows={3}
                                        className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl resize-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange outline-none"
                                        placeholder={language === 'ar' ? 'أضف ملاحظات خاصة بهذا الطلب...' : 'Add notes about this application...'}
                                    />
                                    <p className="text-xs text-gray-400 mt-1">
                                        {language === 'ar' ? '⚠️ حفظ الملاحظات غير مفعل حالياً' : '⚠️ Saving notes is not yet implemented'}
                                    </p>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                                <button
                                    onClick={closeModal}
                                    className="px-6 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
                                >
                                    {language === 'ar' ? 'إغلاق' : 'Close'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function BriefcaseIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
    )
}

function CalendarIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
        </svg>
    )
}
