'use client';

import React, { useEffect, useState, useCallback, Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, MessageCircle, Phone, FileText,
    RefreshCw, AlertCircle, Smartphone, Monitor,
    Trophy, Zap, Target, AlertTriangle, ArrowDown,
    BarChart3, Loader2, CheckCircle, Lightbulb,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { authFetch } from '@/lib/auth-fetch';

// Lazy-load AnalyticsWidget — same component used on /dashboard
const AnalyticsWidget = lazy(() => import('@/app/dashboard/components/AnalyticsWidget'));

// ─── Types ───────────────────────────────────────────────
interface ConversionData {
    period: string;
    totals: Record<string, number>;
    conversionRates: { quote: number; whatsapp: number; call: number };
    dropoffs: { quote: number; whatsapp: number; call: number };
    byPage: {
        page: string;
        clicks: number;
        conversions: number;
        conversionRate: number;
        events: Record<string, number>;
    }[];
    byDevice: {
        device: string;
        clicks: number;
        conversions: number;
        conversionRate: number;
        events: Record<string, number>;
    }[];
    insights: {
        bestPage: { page: string; rate: number; clicks: number } | null;
        highestVolumePage: { page: string; clicks: number; conversions: number } | null;
        bestDevice: { device: string; rate: number; clicks: number } | null;
        weakestFunnel: { funnel: string; dropoff: number; rate: number } | null;
    };
    optimization_recommendations: {
        id: string;
        severity: 'high' | 'medium' | 'low';
        title_en: string;
        title_ar: string;
        description_en: string;
        description_ar: string;
        metric?: string;
        page?: string;
        impact_score: number;
        lost_leads: number;
        dropoff_rate?: number;
    }[];
    site_avg_conversion_rate: number;
    source: string;
    message?: string;
}

// ─── Helpers ─────────────────────────────────────────────
function formatPageName(path: string): string {
    if (path === '/' || path === '/en' || path === '/ar') return 'Homepage';
    const clean = path.replace(/^\/(en|ar)\/?/, '/');
    if (clean.startsWith('/services/container-transport')) return 'Container Transport';
    if (clean.startsWith('/services')) return 'Services';
    if (clean.startsWith('/contact')) return 'Contact';
    if (clean.startsWith('/about')) return 'About';
    if (clean.startsWith('/blog')) return 'Blog';
    if (clean.startsWith('/careers')) return 'Careers';
    return clean;
}

function funnelLabel(name: string, isRTL: boolean): string {
    const labels: Record<string, [string, string]> = {
        quote: ['عروض الأسعار', 'Quote'],
        whatsapp: ['واتساب', 'WhatsApp'],
        call: ['المكالمات', 'Calls'],
    };
    return (labels[name] || [name, name])[isRTL ? 0 : 1];
}

function deviceIcon(device: string) {
    if (device === 'mobile' || device === 'tablet') return Smartphone;
    return Monitor;
}

// ─── Progress Bar ────────────────────────────────────────
function ProgressBar({ value, max, color = 'bg-brand-orange' }: { value: number; max: number; color?: string }) {
    const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
    return (
        <div className="w-full bg-gray-100 dark:bg-slate-700/50 rounded-full h-2 overflow-hidden">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className={`h-full rounded-full ${color}`}
            />
        </div>
    );
}

// ─── Rate Badge ──────────────────────────────────────────
function RateBadge({ rate }: { rate: number }) {
    const color = rate >= 20 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        : rate >= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : rate > 0 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400';
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold tabular-nums ${color}`}>
            {rate}%
        </span>
    );
}

// ═════════════════════════════════════════════════════════
//  MAIN PAGE COMPONENT
// ═════════════════════════════════════════════════════════
export default function AnalyticsDashboardPage() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const [data, setData] = useState<ConversionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const res = await authFetch('/api/analytics/conversions');
            if (!res.ok) throw new Error('Failed');
            const json = await res.json();
            setData(json);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const t = (ar: string, en: string) => isRTL ? ar : en;
    const totals = data?.totals || {};
    const rates = data?.conversionRates || { quote: 0, whatsapp: 0, call: 0 };
    const drops = data?.dropoffs || { quote: 0, whatsapp: 0, call: 0 };
    const insights = data?.insights;
    const noCredentials = data?.source === 'no-credentials' || data?.source === 'auth-failed';

    // ─── Loading State ───────────────────────────────────
    if (loading && !data) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                    <Loader2 className="w-10 h-10 animate-spin text-brand-orange mx-auto" />
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        {t('جارٍ تحميل بيانات التحويل...', 'Loading conversion data...')}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* ═══ Header ═══ */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-orange to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        {t('تحليل التحويلات', 'Conversion Analytics')}
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {t('آخر 30 يوم — بيانات من Google Analytics', 'Last 30 days — Data from Google Analytics')}
                    </p>
                </div>

                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    {t('تحديث', 'Refresh')}
                </button>
            </div>

            {/* ═══ Credentials Warning ═══ */}
            {noCredentials && (
                <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                            {t('GA4 غير مرتبط', 'GA4 Not Connected')}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            {data?.message || t(
                                'أضف بيانات الاعتماد في متغيرات البيئة لعرض البيانات الحقيقية.',
                                'Add credentials to environment variables to display real data.',
                            )}
                        </p>
                    </div>
                </div>
            )}

            {/* ═══ Error State ═══ */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-300">
                        {t('فشل تحميل البيانات. حاول مرة أخرى.', 'Failed to load data. Please try again.')}
                    </p>
                </div>
            )}

            {/* ═══════════════════════════════════════════════
                 SECTION 0: Site Stats (reused from Dashboard)
                ═══════════════════════════════════════════════ */}
            <Suspense fallback={
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-40 mb-4" />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl" />
                        <div className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl" />
                        <div className="h-24 bg-gray-100 dark:bg-slate-800 rounded-xl" />
                    </div>
                </div>
            }>
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm">
                    <AnalyticsWidget isRTL={isRTL} />
                </div>
            </Suspense>

            {/* ═══════════════════════════════════════════════
                 SECTION 1: Summary Cards
                ═══════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Quote Leads */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-orange to-orange-500" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                {t('عروض الأسعار', 'Quote Leads')}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                                    {totals.quote_submit ?? 0}
                                </span>
                                <RateBadge rate={rates.quote} />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {t(`من ${totals.quote_click ?? 0} نقرة`, `from ${totals.quote_click ?? 0} clicks`)}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-brand-orange" />
                        </div>
                    </div>
                    {/* Drop-off indicator */}
                    {drops.quote > 0 && (
                        <div className="mt-4 flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400">
                            <ArrowDown className="w-3.5 h-3.5" />
                            <span>{drops.quote} {t('فقدوا بدون إرسال', 'dropped without submitting')}</span>
                        </div>
                    )}
                </motion.div>

                {/* WhatsApp Leads */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                {t('تواصل واتساب', 'WhatsApp Leads')}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                                    {totals.whatsapp_open ?? 0}
                                </span>
                                <RateBadge rate={rates.whatsapp} />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {t(`من ${totals.whatsapp_click ?? 0} نقرة`, `from ${totals.whatsapp_click ?? 0} clicks`)}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-green-600" />
                        </div>
                    </div>
                </motion.div>

                {/* Call Leads */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                                {t('مكالمات', 'Call Leads')}
                            </p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                                    {totals.call_intent ?? 0}
                                </span>
                                <RateBadge rate={rates.call} />
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                                {t(`من ${totals.call_click ?? 0} نقرة`, `from ${totals.call_click ?? 0} clicks`)}
                            </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <Phone className="w-6 h-6 text-blue-600" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════════════
                 SECTION 2: Breakdown Tables
                ═══════════════════════════════════════════════ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Table 1: By Page ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm"
                >
                    <div className="p-5 border-b border-gray-100 dark:border-slate-700">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-brand-orange" />
                            {t('الأداء حسب الصفحة', 'Performance by Page')}
                        </h2>
                    </div>

                    {(data?.byPage?.length ?? 0) > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        <th className="text-start px-5 py-3 font-medium">{t('الصفحة', 'Page')}</th>
                                        <th className="text-center px-3 py-3 font-medium">{t('نقرات', 'Clicks')}</th>
                                        <th className="text-center px-3 py-3 font-medium">{t('تحويلات', 'Conv.')}</th>
                                        <th className="text-center px-3 py-3 font-medium">{t('معدل', 'Rate')}</th>
                                        <th className="px-5 py-3 font-medium w-32">{t('أداء', 'Perf.')}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                                    {data!.byPage.map((row, idx) => {
                                        const maxClicks = Math.max(...data!.byPage.map(p => p.clicks), 1);
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                                                <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white">
                                                    {formatPageName(row.page)}
                                                </td>
                                                <td className="text-center px-3 py-3.5 text-gray-600 dark:text-gray-400 tabular-nums font-semibold">
                                                    {row.clicks}
                                                </td>
                                                <td className="text-center px-3 py-3.5 text-gray-600 dark:text-gray-400 tabular-nums font-semibold">
                                                    {row.conversions}
                                                </td>
                                                <td className="text-center px-3 py-3.5">
                                                    <RateBadge rate={row.conversionRate} />
                                                </td>
                                                <td className="px-5 py-3.5 w-32">
                                                    <ProgressBar value={row.clicks} max={maxClicks} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-400 dark:text-gray-500">
                            <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">{t('لا توجد بيانات حالياً', 'No data available yet')}</p>
                        </div>
                    )}
                </motion.div>

                {/* ── Table 2: By Device ── */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden shadow-sm"
                >
                    <div className="p-5 border-b border-gray-100 dark:border-slate-700">
                        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-blue-500" />
                            {t('حسب الجهاز', 'By Device')}
                        </h2>
                    </div>

                    {(data?.byDevice?.length ?? 0) > 0 ? (
                        <div className="p-5 space-y-4">
                            {data!.byDevice.map((row, idx) => {
                                const DeviceIcon = deviceIcon(row.device);
                                const maxClicks = Math.max(...data!.byDevice.map(d => d.clicks), 1);
                                return (
                                    <div key={idx} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <DeviceIcon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                                <span className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                                                    {row.device}
                                                </span>
                                            </div>
                                            <RateBadge rate={row.conversionRate} />
                                        </div>
                                        <ProgressBar
                                            value={row.clicks}
                                            max={maxClicks}
                                            color={row.device === 'mobile' ? 'bg-blue-500' : 'bg-indigo-500'}
                                        />
                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <span>{row.clicks} {t('نقرة', 'clicks')}</span>
                                            <span>{row.conversions} {t('تحويل', 'conv.')}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="p-10 text-center text-gray-400 dark:text-gray-500">
                            <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className="text-sm">{t('لا توجد بيانات حالياً', 'No data available yet')}</p>
                        </div>
                    )}
                </motion.div>
            </div>

            {/* ═══════════════════════════════════════════════
                 SECTION 3: Insights Engine
                ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <Zap className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t('رؤى ذكية', 'Smart Insights')}
                    </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Best Page */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border border-green-200 dark:border-green-800/50 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Trophy className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">
                                {t('أفضل صفحة', 'Best Page')}
                            </span>
                        </div>
                        {insights?.bestPage ? (
                            <>
                                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    {formatPageName(insights.bestPage.page)}
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400 font-semibold">
                                    {insights.bestPage.rate}% {t('معدل تحويل', 'conv. rate')}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {insights.bestPage.clicks} {t('نقرة', 'clicks')}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">{t('لا توجد بيانات كافية', 'Not enough data')}</p>
                        )}
                    </div>

                    {/* Highest Volume */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 border border-blue-200 dark:border-blue-800/50 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                                {t('أعلى حجم', 'Highest Volume')}
                            </span>
                        </div>
                        {insights?.highestVolumePage ? (
                            <>
                                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    {formatPageName(insights.highestVolumePage.page)}
                                </p>
                                <p className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                                    {insights.highestVolumePage.clicks} {t('نقرة', 'clicks')}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {insights.highestVolumePage.conversions} {t('تحويل', 'conversions')}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">{t('لا توجد بيانات كافية', 'Not enough data')}</p>
                        )}
                    </div>

                    {/* Best Device */}
                    <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-purple-900/10 dark:to-fuchsia-900/10 border border-purple-200 dark:border-purple-800/50 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Smartphone className="w-4 h-4 text-purple-600" />
                            <span className="text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                                {t('أفضل جهاز', 'Best Device')}
                            </span>
                        </div>
                        {insights?.bestDevice ? (
                            <>
                                <p className="text-lg font-bold text-gray-900 dark:text-white capitalize mb-1">
                                    {insights.bestDevice.device}
                                </p>
                                <p className="text-sm text-purple-600 dark:text-purple-400 font-semibold">
                                    {insights.bestDevice.rate}% {t('معدل تحويل', 'conv. rate')}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {insights.bestDevice.clicks} {t('نقرة', 'clicks')}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">{t('لا توجد بيانات كافية', 'Not enough data')}</p>
                        )}
                    </div>

                    {/* Weakest Funnel */}
                    <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/10 dark:to-orange-900/10 border border-red-200 dark:border-red-800/50 rounded-2xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            <span className="text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">
                                {t('أضعف نقطة', 'Weakest Point')}
                            </span>
                        </div>
                        {insights?.weakestFunnel ? (
                            <>
                                <p className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    {funnelLabel(insights.weakestFunnel.funnel, isRTL)}
                                </p>
                                <p className="text-sm text-red-600 dark:text-red-400 font-semibold">
                                    {insights.weakestFunnel.dropoff} {t('فقدوا', 'dropped off')}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    {insights.weakestFunnel.rate}% {t('معدل تحويل فقط', 'conv. rate only')}
                                </p>
                            </>
                        ) : (
                            <p className="text-sm text-gray-400">{t('لا توجد بيانات كافية', 'Not enough data')}</p>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ═══ Drop-off Funnel ═══ */}
            {(drops.quote > 0 || drops.whatsapp > 0 || drops.call > 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-6 shadow-sm"
                >
                    <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-5">
                        <ArrowDown className="w-4 h-4 text-red-500" />
                        {t('تحليل الفقد (Drop-off)', 'Drop-off Analysis')}
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {(['quote', 'whatsapp', 'call'] as const).map((key) => {
                            const click = totals[`${key}_click`] ?? 0;
                            const conv = key === 'quote' ? (totals.quote_submit ?? 0)
                                : key === 'whatsapp' ? (totals.whatsapp_open ?? 0)
                                    : (totals.call_intent ?? 0);
                            const drop = drops[key];
                            const pct = click > 0 ? Math.round((drop / click) * 100) : 0;

                            return (
                                <div key={key} className="text-center space-y-2">
                                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        {funnelLabel(key, isRTL)}
                                    </p>
                                    <div className="flex items-center justify-center gap-3">
                                        <div className="text-center">
                                            <span className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{click}</span>
                                            <p className="text-[10px] text-gray-400 uppercase">{t('نقرة', 'clicks')}</p>
                                        </div>
                                        <ArrowDown className="w-5 h-5 text-red-400" />
                                        <div className="text-center">
                                            <span className="text-2xl font-bold text-green-600 tabular-nums">{conv}</span>
                                            <p className="text-[10px] text-gray-400 uppercase">{t('تحويل', 'conv.')}</p>
                                        </div>
                                    </div>
                                    {drop > 0 && (
                                        <p className="text-xs text-red-500 font-medium">
                                            ▼ {drop} {t('فقدوا', 'lost')} ({pct}%)
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* ═══════════════════════════════════════════════
                 SECTION 4: Optimization Recommendations
                ═══════════════════════════════════════════════ */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="flex items-center flex-wrap gap-2 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                        {t('توصيات التحسين', 'Optimization Recommendations')}
                    </h2>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        {t('مبني على بيانات المستخدم', 'User-based metric')} · {t('آخر 30 يوم', 'Last 30 days')}
                    </span>
                    {(data?.site_avg_conversion_rate ?? 0) > 0 && (
                        <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
                            {t('متوسط الموقع', 'Site avg')}: {data!.site_avg_conversion_rate}%
                        </span>
                    )}
                </div>

                {(data?.optimization_recommendations?.length ?? 0) > 0 ? (
                    <div className="space-y-3">
                        {data!.optimization_recommendations.map((rec) => {
                            const isHigh = rec.severity === 'high';
                            const isMedium = rec.severity === 'medium';
                            const severityConfig = isHigh
                                ? {
                                    border: 'border-red-200 dark:border-red-800/50',
                                    bg: 'bg-red-50 dark:bg-red-900/10',
                                    badge: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                                    icon: <AlertTriangle className="w-5 h-5 text-red-500" />,
                                    label: t('عالي', 'High'),
                                    dot: '🔴',
                                }
                                : isMedium
                                    ? {
                                        border: 'border-amber-200 dark:border-amber-800/50',
                                        bg: 'bg-amber-50 dark:bg-amber-900/10',
                                        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                        icon: <AlertCircle className="w-5 h-5 text-amber-500" />,
                                        label: t('متوسط', 'Medium'),
                                        dot: '🟡',
                                    }
                                    : {
                                        border: 'border-green-200 dark:border-green-800/50',
                                        bg: 'bg-green-50 dark:bg-green-900/10',
                                        badge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
                                        icon: <CheckCircle className="w-5 h-5 text-green-500" />,
                                        label: t('منخفض', 'Low'),
                                        dot: '🟢',
                                    };

                            return (
                                <div
                                    key={rec.id}
                                    className={`rounded-2xl border ${severityConfig.border} ${severityConfig.bg} p-5 transition-shadow hover:shadow-sm`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {severityConfig.icon}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {isRTL ? rec.title_ar : rec.title_en}
                                                </h3>
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${severityConfig.badge}`}>
                                                    {severityConfig.dot} {severityConfig.label}
                                                </span>
                                                {rec.metric && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300">
                                                        {rec.metric}
                                                    </span>
                                                )}
                                                {rec.lost_leads > 0 && (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/50">
                                                        <ArrowDown className="w-3 h-3" />
                                                        {t(`خسارة محتملة: ${rec.lost_leads} عميل`, `Potential Loss: ${rec.lost_leads} leads`)}
                                                    </span>
                                                )}
                                                {rec.dropoff_rate != null && rec.dropoff_rate > 0 && (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                                                        ▼ {rec.dropoff_rate}%
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {isRTL ? rec.description_ar : rec.description_en}
                                            </p>
                                            {rec.impact_score > 0 && (
                                                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1.5 italic">
                                                    {t('مبني على مقارنة بمتوسط الموقع', 'Based on site average comparison')} · Impact: {rec.impact_score}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50 rounded-2xl p-8 text-center">
                        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
                        <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                            {t('لا توجد مشاكل رئيسية', 'No Major Issues Detected')}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {t(
                                'أداء التحويلات ضمن المعدل الطبيعي. استمر في المراقبة.',
                                'Conversion performance is within normal range. Keep monitoring.',
                            )}
                        </p>
                    </div>
                )}
            </motion.div>

            {/* ═══ Footer ═══ */}
            <div className="text-center text-xs text-gray-400 dark:text-gray-500 pt-2 pb-8">
                {data?.source === 'ga4' && (
                    <span>{t('مصدر البيانات: Google Analytics 4', 'Data source: Google Analytics 4')}</span>
                )}
            </div>
        </div>
    );
}
