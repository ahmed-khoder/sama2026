'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, CheckCircle2, FileCheck, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '../shared/StatCard';
import OrdersModal from '../modals/OrdersModal';
import { useLanguage } from '@/contexts/LanguageContext';

interface SalesStats {
    total: number;
    confirmed: number;
    fullyInvoiced: number;
    notInvoiced: number;
    confirmedWithoutInvoices: number;
}

interface Order {
    id: number;
    name: string;
    customerName: string;
    customerId: number | null;
    date: string;
    amount: number;
    salesperson: string;
    salespersonId: number | null;
    state: string;
}

interface ApiResponse {
    success: boolean;
    data?: SalesStats;
    lastUpdated?: string;
    error?: string;
    cached?: boolean;
}

const text = {
    ar: {
        title: 'إحصائيات المبيعات',
        lastUpdated: 'آخر تحديث',
        refresh: 'تحديث',
        totalOrders: 'إجمالي أوامر البيع',
        confirmedOrders: 'أوامر البيع المؤكدة',
        fullyInvoiced: 'أوامر البيع المفوترة بالكامل',
        notInvoiced: 'أوامر البيع غير المفوترة',
        confirmedWithoutInvoices: 'أوامر مؤكدة بدون فواتير',
        loadFailed: 'فشل في تحميل البيانات',
        serverError: 'فشل في الاتصال بالخادم',
        retry: 'إعادة المحاولة',
        quickSummary: 'ملخص سريع',
        confirmationRate: 'نسبة التأكيد',
        invoiceRate: 'نسبة الفوترة',
        awaitingInvoice: 'في انتظار الفوترة',
        statusBreakdown: 'توزيع الحالات',
        confirmed: 'مؤكدة',
        invoiced: 'مفوترة',
        notInvoicedShort: 'غير مفوترة',
        withoutInvoices: 'مؤكدة بدون فواتير',
    },
    en: {
        title: 'Sales Statistics',
        lastUpdated: 'Last Updated',
        refresh: 'Refresh',
        totalOrders: 'Total Sale Orders',
        confirmedOrders: 'Confirmed Sale Orders',
        fullyInvoiced: 'Fully Invoiced Orders',
        notInvoiced: 'Not Invoiced Orders',
        confirmedWithoutInvoices: 'Confirmed Orders Without Invoices',
        loadFailed: 'Failed to load data',
        serverError: 'Failed to connect to server',
        retry: 'Retry',
        quickSummary: 'Quick Summary',
        confirmationRate: 'Confirmation Rate',
        invoiceRate: 'Invoice Rate',
        awaitingInvoice: 'Awaiting Invoice',
        statusBreakdown: 'Status Distribution',
        confirmed: 'Confirmed',
        invoiced: 'Invoiced',
        notInvoicedShort: 'Not Invoiced',
        withoutInvoices: 'Without Invoices',
    },
};

export default function SalesTab() {
    const { language } = useLanguage();
    const t = text[language];
    const [stats, setStats] = useState<SalesStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    const fetchStats = async (forceRefresh = false) => {
        try {
            if (forceRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }
            setError(null);

            const url = '/api/odoo/sales/stats';
            const method = forceRefresh ? 'POST' : 'GET';

            const response = await fetch(url, { method });
            const result: ApiResponse = await response.json();

            if (result.success && result.data) {
                setStats(result.data);
                setLastUpdated(result.lastUpdated || null);
            } else {
                setError(result.error || 'فشل في جلب البيانات');
            }
        } catch (err) {
            setError('فشل في الاتصال بالخادم');
            console.error('Error fetching sales stats:', err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleRefresh = () => {
        fetchStats(true);
    };

    const fetchOrdersDetails = async () => {
        try {
            setLoadingOrders(true);
            setIsModalOpen(true);

            const response = await fetch('/api/odoo/sales/orders-without-invoices');
            const result = await response.json();

            if (result.success && result.data) {
                setOrders(result.data);
            } else {
                setOrders([]);
            }
        } catch (err) {
            console.error('Error fetching orders:', err);
            setOrders([]);
        } finally {
            setLoadingOrders(false);
        }
    };

    // Format last updated time
    const formatLastUpdated = (dateString: string | null) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header with refresh button */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-marine-900 dark:text-white">{t.title}</h2>
                    {lastUpdated && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {t.lastUpdated}: {formatLastUpdated(lastUpdated)}
                        </p>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing || loading}
                    className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-darkOrange disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg font-bold transition-colors shadow-lg shadow-brand-orange/20"
                >
                    <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                    {t.refresh}
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                <StatCard
                    title={t.totalOrders}
                    value={stats?.total.toLocaleString('ar-EG') || '0'}
                    icon={<ShoppingCart className="w-6 h-6" />}
                    bg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-500"
                    loading={loading}
                    error={error ? 'خطأ' : undefined}
                />
                <StatCard
                    title={t.confirmedOrders}
                    value={stats?.confirmed.toLocaleString('ar-EG') || '0'}
                    trend={
                        stats?.total
                            ? `${((stats.confirmed / stats.total) * 100).toFixed(1)}%`
                            : undefined
                    }
                    trendUp={true}
                    icon={<CheckCircle2 className="w-6 h-6" />}
                    bg="bg-green-50 dark:bg-green-900/20"
                    iconColor="text-green-500"
                    loading={loading}
                    error={error ? 'خطأ' : undefined}
                />
                <StatCard
                    title={t.fullyInvoiced}
                    value={stats?.fullyInvoiced.toLocaleString('ar-EG') || '0'}
                    trend={
                        stats?.total
                            ? `${((stats.fullyInvoiced / stats.total) * 100).toFixed(1)}%`
                            : undefined
                    }
                    trendUp={true}
                    icon={<FileCheck className="w-6 h-6" />}
                    bg="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-500"
                    loading={loading}
                    error={error ? 'خطأ' : undefined}
                />
                <StatCard
                    title={t.notInvoiced}
                    value={stats?.notInvoiced.toLocaleString('ar-EG') || '0'}
                    trend={
                        stats?.total
                            ? `${((stats.notInvoiced / stats.total) * 100).toFixed(1)}%`
                            : undefined
                    }
                    trendUp={false}
                    icon={<AlertCircle className="w-6 h-6" />}
                    bg="bg-orange-50 dark:bg-orange-900/20"
                    iconColor="text-brand-orange"
                    loading={loading}
                    error={error ? 'خطأ' : undefined}
                />
                <StatCard
                    title={t.confirmedWithoutInvoices}
                    value={stats?.confirmedWithoutInvoices.toLocaleString('ar-EG') || '0'}
                    trend={
                        stats?.confirmed
                            ? `${((stats.confirmedWithoutInvoices / stats.confirmed) * 100).toFixed(1)}%`
                            : undefined
                    }
                    trendUp={false}
                    icon={<AlertCircle className="w-6 h-6" />}
                    bg="bg-red-50 dark:bg-red-900/20"
                    iconColor="text-red-500"
                    loading={loading}
                    error={error ? 'خطأ' : undefined}
                    onClick={fetchOrdersDetails}
                />
            </div>

            {/* Error message with retry */}
            {error && !loading && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl p-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <div>
                                <p className="font-bold text-red-900 dark:text-red-200">{t.loadFailed}</p>
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-bold transition-colors"
                        >
                            {t.retry}
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Additional insights or charts can be added here */}
            {stats && !loading && !error && (
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Summary Card */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-4">{t.quickSummary}</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">{t.confirmationRate}:</span>
                                <span className="font-bold text-green-600">
                                    {((stats.confirmed / stats.total) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">{t.invoiceRate}:</span>
                                <span className="font-bold text-purple-600">
                                    {((stats.fullyInvoiced / stats.total) * 100).toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">{t.awaitingInvoice}:</span>
                                <span className="font-bold text-orange-600">
                                    {stats.notInvoiced.toLocaleString('ar-EG')}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600 dark:text-gray-400">مؤكدة بدون فواتير:</span>
                                <span className="font-bold text-red-600">
                                    {stats.confirmedWithoutInvoices.toLocaleString('ar-EG')}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Status Breakdown */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                        <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-4">{t.statusBreakdown}</h3>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.confirmed}</span>
                                    <span className="text-sm font-bold">{stats.confirmed}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(stats.confirmed / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.invoiced}</span>
                                    <span className="text-sm font-bold">{stats.fullyInvoiced}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(stats.fullyInvoiced / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.notInvoicedShort}</span>
                                    <span className="text-sm font-bold">{stats.notInvoiced}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(stats.notInvoiced / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-1">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">{t.withoutInvoices}</span>
                                    <span className="text-sm font-bold">{stats.confirmedWithoutInvoices}</span>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                    <div
                                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(stats.confirmedWithoutInvoices / stats.total) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Modal */}
            <OrdersModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                orders={orders}
                loading={loadingOrders}
            />
        </div>
    );
}
