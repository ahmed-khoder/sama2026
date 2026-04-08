'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Users, TrendingUp, FileDown, Activity, RefreshCw, AlertCircle, Globe, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { authFetch } from '@/lib/auth-fetch';

interface GeoItem {
    name: string;
    users: number;
}

interface AnalyticsData {
    activeUsers: number;
    todayUsers: number;
    pdfDownloads: number;
    topCountries: GeoItem[];
    topCities: GeoItem[];
    source: string;
    message?: string;
}

interface AnalyticsWidgetProps {
    isRTL?: boolean;
}

export default function AnalyticsWidget({ isRTL = true }: AnalyticsWidgetProps) {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(false);
            const res = await authFetch('/api/analytics');
            if (!res.ok) throw new Error('Failed');
            const json = await res.json();
            setData(json);
            setLastUpdated(new Date());
        } catch {
            setError(true);
            setData({
                activeUsers: 0, todayUsers: 0, pdfDownloads: 0,
                topCountries: [], topCities: [], source: 'error'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const stats = [
        {
            label: isRTL ? 'زوار مباشرين' : 'Live Visitors',
            value: data?.activeUsers ?? 0,
            icon: Activity,
            color: 'from-green-500 to-emerald-600',
            bgColor: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-600 dark:text-green-400',
            pulse: true,
        },
        {
            label: isRTL ? 'زيارات اليوم' : "Today's Visits",
            value: data?.todayUsers ?? 0,
            icon: TrendingUp,
            color: 'from-blue-500 to-indigo-600',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400',
        },
        {
            label: isRTL ? 'تحميلات PDF' : 'PDF Downloads',
            value: data?.pdfDownloads ?? 0,
            icon: FileDown,
            color: 'from-brand-orange to-brand-darkOrange',
            bgColor: 'bg-orange-50 dark:bg-orange-900/20',
            textColor: 'text-brand-orange',
        },
    ];

    const topCountries = data?.topCountries ?? [];
    const topCities = data?.topCities ?? [];
    const hasGeoData = topCountries.length > 0 || topCities.length > 0;

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-brand-orange to-brand-darkOrange rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                        {isRTL ? 'إحصائيات الموقع' : 'Website Analytics'}
                    </h3>
                </div>
                <div className="flex items-center gap-2">
                    {data?.source === 'no-credentials' && (
                        <span className="text-xs text-amber-500 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {isRTL ? 'غير مرتبط' : 'Not connected'}
                        </span>
                    )}
                    {lastUpdated && (
                        <span className="text-xs text-gray-400">
                            {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                        title={isRTL ? 'تحديث' : 'Refresh'}
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {stats.map((stat, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative overflow-hidden rounded-xl ${stat.bgColor} border border-gray-200/50 dark:border-slate-700/50 p-4`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    {stat.label}
                                </p>
                                <span className={`text-3xl font-bold ${stat.textColor} tabular-nums`}>
                                    {loading ? '—' : stat.value.toLocaleString()}
                                </span>
                            </div>
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                        </div>

                        {/* Live pulse indicator */}
                        {stat.pulse && !loading && stat.value > 0 && (
                            <div className="absolute top-3 right-3">
                                <span className="flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                                </span>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Geographic Data — Countries + Cities */}
            {(hasGeoData || data?.source === 'ga4') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Top Countries */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200/60 dark:border-slate-700/50 p-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <Globe className="w-4 h-4 text-marine-500" />
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {isRTL ? 'أكثر الدول زيارة' : 'Top Countries'}
                            </h4>
                        </div>
                        {topCountries.length > 0 ? (
                            <ul className="space-y-2">
                                {topCountries.map((item, idx) => (
                                    <li key={idx} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[60%]">
                                            {item.name}
                                        </span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                                            {item.users.toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-3">
                                {isRTL ? 'لا توجد بيانات بعد' : 'No data yet'}
                            </p>
                        )}
                    </motion.div>

                    {/* Top Cities */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="rounded-xl bg-white dark:bg-slate-800/50 border border-gray-200/60 dark:border-slate-700/50 p-4"
                    >
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-4 h-4 text-brand-orange" />
                            <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                {isRTL ? 'أكثر المدن زيارة' : 'Top Cities'}
                            </h4>
                        </div>
                        {topCities.length > 0 ? (
                            <ul className="space-y-2">
                                {topCities.map((item, idx) => (
                                    <li key={idx} className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[60%]">
                                            {item.name}
                                        </span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">
                                            {item.users.toLocaleString()}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-xs text-gray-400 text-center py-3">
                                {isRTL ? 'لا توجد بيانات بعد' : 'No data yet'}
                            </p>
                        )}
                    </motion.div>
                </div>
            )}

            {/* Source indicator */}
            {data?.source === 'no-credentials' && (
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                    {isRTL
                        ? 'لم يتم ربط Google Analytics — أضف بيانات الاعتماد في متغيرات البيئة'
                        : 'Google Analytics not connected — add credentials to environment variables'}
                </p>
            )}
        </div>
    );
}
