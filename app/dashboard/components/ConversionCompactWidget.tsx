'use client';

/**
 * Conversion Analytics — Compact Widget
 * ══════════════════════════════════════
 * Displays a compact summary of conversion analytics
 * inside the main dashboard page.
 *
 * Shows:
 *   - 3 summary cards (Quote / WhatsApp / Call)
 *   - Top recommendation (if any)
 *   - Link to full analytics page
 *
 * ⚠️ This component is additive only.
 *    It does NOT modify or replace the full /dashboard/analytics page.
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
    FileText, MessageCircle, Phone,
    ArrowDown, AlertTriangle, AlertCircle,
    CheckCircle, Lightbulb, BarChart3,
    Loader2, ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { authFetch } from '@/lib/auth-fetch';

// ─── Types (mirrors API response shape) ─────────────────
interface ConversionCompactData {
    totals: Record<string, number>;
    conversionRates: { quote: number; whatsapp: number; call: number };
    dropoffs: { quote: number; whatsapp: number; call: number };
    site_avg_conversion_rate: number;
    optimization_recommendations: {
        id: string;
        severity: 'high' | 'medium' | 'low';
        title_en: string;
        title_ar: string;
        description_en: string;
        description_ar: string;
        metric?: string;
        lost_leads: number;
    }[];
    source: string;
    message?: string;
}

// ─── Rate Badge ──────────────────────────────────────────
function CompactRateBadge({ rate }: { rate: number }) {
    const color = rate >= 20 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
        : rate >= 10 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : rate > 0 ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                : 'bg-gray-100 text-gray-500 dark:bg-slate-700 dark:text-gray-400';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${color}`}>
            {rate}%
        </span>
    );
}

// ═════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═════════════════════════════════════════════════════════
export default function ConversionCompactWidget({ isRTL = true }: { isRTL?: boolean }) {
    const [data, setData] = useState<ConversionCompactData | null>(null);
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
    const noCredentials = data?.source === 'no-credentials' || data?.source === 'auth-failed';
    const totals = data?.totals || {};
    const rates = data?.conversionRates || { quote: 0, whatsapp: 0, call: 0 };
    const drops = data?.dropoffs || { quote: 0, whatsapp: 0, call: 0 };
    const topRec = data?.optimization_recommendations?.[0] || null;

    // Check if we have meaningful data
    const totalClicks = (totals.quote_click || 0) + (totals.whatsapp_click || 0) + (totals.call_click || 0);
    const hasData = totalClicks > 0 || (totals.quote_submit || 0) > 0;

    // ─── Loading State ───
    if (loading && !data) {
        return (
            <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-brand-orange" />
                <span className="text-sm text-gray-400 ms-2">
                    {t('جارٍ تحميل بيانات التحويل...', 'Loading conversion data...')}
                </span>
            </div>
        );
    }

    // ─── GA4 Not Connected ───
    if (noCredentials) {
        return null; // Don't show anything — the main AnalyticsWidget already displays this message
    }

    // ─── Error State ───
    if (error) {
        return (
            <div className="flex items-center gap-2 py-4 text-sm text-red-500 dark:text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {t('فشل تحميل بيانات التحويل', 'Failed to load conversion data')}
            </div>
        );
    }

    // ─── No Sufficient Data ───
    if (!hasData) {
        return (
            <div className="py-4 text-center">
                <BarChart3 className="w-6 h-6 text-gray-300 dark:text-gray-600 mx-auto mb-1.5" />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    {t('لا توجد بيانات كافية للتحليل', 'Not enough data for analysis')}
                </p>
            </div>
        );
    }

    // ─── Cards Data ───
    const cards = [
        {
            label: t('عروض أسعار', 'Quote Leads'),
            value: totals.quote_submit ?? 0,
            clicks: totals.quote_click ?? 0,
            rate: rates.quote,
            drop: drops.quote,
            icon: FileText,
            gradient: 'from-brand-orange to-orange-500',
            iconBg: 'bg-orange-50 dark:bg-orange-900/20',
        },
        {
            label: t('واتساب', 'WhatsApp'),
            value: totals.whatsapp_open ?? 0,
            clicks: totals.whatsapp_click ?? 0,
            rate: rates.whatsapp,
            drop: drops.whatsapp,
            icon: MessageCircle,
            gradient: 'from-green-500 to-emerald-500',
            iconBg: 'bg-green-50 dark:bg-green-900/20',
        },
        {
            label: t('مكالمات', 'Calls'),
            value: totals.call_intent ?? 0,
            clicks: totals.call_click ?? 0,
            rate: rates.call,
            drop: drops.call,
            icon: Phone,
            gradient: 'from-blue-500 to-indigo-500',
            iconBg: 'bg-blue-50 dark:bg-blue-900/20',
        },
    ];

    return (
        <div className="space-y-4 mt-5 pt-5 border-t border-gray-100 dark:border-slate-800">
            {/* Section Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-md flex items-center justify-center">
                        <BarChart3 className="w-3 h-3 text-white" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        {t('تحليل التحويلات', 'Conversion Analytics')}
                    </h4>
                    <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-400 uppercase tracking-wider">
                        {t('آخر 30 يوم', '30 days')}
                    </span>
                </div>
                <Link
                    href="/dashboard/analytics"
                    className="flex items-center gap-1 text-xs font-semibold text-brand-orange hover:text-brand-darkOrange transition-colors"
                >
                    {t('عرض التفاصيل', 'View Details')}
                    <ExternalLink className="w-3 h-3" />
                </Link>
            </div>

            {/* Compact Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {cards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="relative overflow-hidden bg-gray-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-gray-100 dark:border-slate-700/50"
                        >
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${card.gradient}`} />
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5">
                                        {card.label}
                                    </p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-xl font-bold text-gray-900 dark:text-white tabular-nums">
                                            {card.value}
                                        </span>
                                        <CompactRateBadge rate={card.rate} />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {t(`من ${card.clicks} نقرة`, `from ${card.clicks} clicks`)}
                                    </p>
                                </div>
                                <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                                </div>
                            </div>
                            {card.drop > 0 && (
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-red-500 dark:text-red-400">
                                    <ArrowDown className="w-3 h-3" />
                                    <span>{card.drop} {t('فقدوا', 'dropped')}</span>
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Top Recommendation (only the first / highest-impact one) */}
            {topRec && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {(() => {
                        const isHigh = topRec.severity === 'high';
                        const isMedium = topRec.severity === 'medium';
                        const config = isHigh
                            ? {
                                border: 'border-red-200 dark:border-red-800/50',
                                bg: 'bg-red-50 dark:bg-red-900/10',
                                icon: <AlertTriangle className="w-4 h-4 text-red-500" />,
                                dot: '🔴',
                                label: t('عالي', 'High'),
                            }
                            : isMedium
                                ? {
                                    border: 'border-amber-200 dark:border-amber-800/50',
                                    bg: 'bg-amber-50 dark:bg-amber-900/10',
                                    icon: <AlertCircle className="w-4 h-4 text-amber-500" />,
                                    dot: '🟡',
                                    label: t('متوسط', 'Medium'),
                                }
                                : {
                                    border: 'border-green-200 dark:border-green-800/50',
                                    bg: 'bg-green-50 dark:bg-green-900/10',
                                    icon: <CheckCircle className="w-4 h-4 text-green-500" />,
                                    dot: '🟢',
                                    label: t('منخفض', 'Low'),
                                };

                        return (
                            <div className={`rounded-xl border ${config.border} ${config.bg} p-3.5`}>
                                <div className="flex items-start gap-2.5">
                                    <div className="flex-shrink-0 mt-0.5">{config.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                            <Lightbulb className="w-3 h-3 text-amber-500" />
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {t('أهم توصية', 'Top Recommendation')}
                                            </span>
                                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400">
                                                {config.dot} {config.label}
                                            </span>
                                            {topRec.lost_leads > 0 && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                                    ⬇ {t(`خسارة: ${topRec.lost_leads} عميل`, `Loss: ${topRec.lost_leads} leads`)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-0.5">
                                            {isRTL ? topRec.title_ar : topRec.title_en}
                                        </p>
                                        <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">
                                            {isRTL ? topRec.description_ar : topRec.description_en}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })()}
                </motion.div>
            )}

            {/* No recommendations = healthy state */}
            {!topRec && hasData && (
                <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800/50">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <p className="text-xs font-medium text-green-700 dark:text-green-400">
                        {t('لا توجد مشاكل رئيسية — الأداء جيد', 'No major issues — Performance is healthy')}
                    </p>
                </div>
            )}

            {/* View Full Details Link */}
            <div className="text-center pt-1">
                <Link
                    href="/dashboard/analytics"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-orange hover:text-brand-darkOrange transition-colors group"
                >
                    {t('عرض التفاصيل الكاملة', 'View Full Details')}
                    <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
