'use client';

import React from 'react';
import { Package, TrendingUp, Users, FileCheck, Database, BarChart3, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ─── Skeleton Card Component ──────────────────────────────────────────────────
function SkeletonStatCard({ title, icon, bg, iconColor }: {
    title: string;
    icon: React.ReactNode;
    bg: string;
    iconColor: string;
}) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center ${iconColor}`}>
                    {icon}
                </div>
                <div className="h-6 w-16 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{title}</h3>
            <div className="h-8 w-28 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
    );
}

export default function OverviewTab() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    return (
        <div className="space-y-8">
            {/* ── Odoo Integration Notice ── */}
            <div className="bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-900/10 dark:to-sky-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center shrink-0">
                    <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm">
                        {isRTL ? 'جارٍ جلب البيانات من Odoo ERP...' : 'Fetching data from Odoo ERP...'}
                    </h4>
                    <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                        {isRTL
                            ? 'سيتم ربط هذه الإحصائيات بالبيانات الفعلية من نظام Odoo. استخدم تاب "المبيعات" لعرض بيانات Odoo المتاحة حالياً.'
                            : 'These stats will be connected to live Odoo data. Use the "Sales" tab for currently available Odoo data.'}
                    </p>
                </div>
            </div>

            {/* ── Stats Grid — Skeleton Loading ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <SkeletonStatCard
                    title={isRTL ? 'إجمالي الشحنات' : 'Total Shipments'}
                    icon={<Package className="w-6 h-6" />}
                    bg="bg-blue-50 dark:bg-blue-900/20"
                    iconColor="text-blue-500"
                />
                <SkeletonStatCard
                    title={isRTL ? 'عروض الأسعار' : 'Quotations'}
                    icon={<FileCheck className="w-6 h-6" />}
                    bg="bg-orange-50 dark:bg-orange-900/20"
                    iconColor="text-brand-orange"
                />
                <SkeletonStatCard
                    title={isRTL ? 'العملاء الجدد' : 'New Clients'}
                    icon={<Users className="w-6 h-6" />}
                    bg="bg-purple-50 dark:bg-purple-900/20"
                    iconColor="text-purple-500"
                />
                <SkeletonStatCard
                    title={isRTL ? 'الأرباح (شهري)' : 'Revenue (Monthly)'}
                    icon={<TrendingUp className="w-6 h-6" />}
                    bg="bg-green-50 dark:bg-green-900/20"
                    iconColor="text-green-500"
                />
            </div>

            {/* ── Charts Section — Placeholder ── */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Chart Placeholder */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-6">
                        {isRTL ? 'تحليل الشحنات والمبيعات' : 'Shipments & Sales Analysis'}
                    </h3>
                    <div className="h-[300px] w-full flex flex-col items-center justify-center text-center">
                        <BarChart3 className="w-16 h-16 text-gray-300 dark:text-slate-700 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium">
                            {isRTL ? 'سيتم عرض الرسم البياني بعد ربط البيانات' : 'Chart will appear after data integration'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {isRTL ? 'يمكنك مراجعة بيانات Odoo من تاب "المبيعات"' : 'Review Odoo data from the "Sales" tab'}
                        </p>
                    </div>
                </div>

                {/* Recent Activity — Empty State */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                    <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-6">
                        {isRTL ? 'أحدث الطلبات' : 'Recent Orders'}
                    </h3>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <Clock className="w-12 h-12 text-gray-300 dark:text-slate-700 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                            {isRTL ? 'لا توجد طلبات مسجلة حالياً' : 'No orders recorded yet'}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                            {isRTL ? 'ستظهر الطلبات هنا بعد ربط النظام' : 'Orders will appear after system integration'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
