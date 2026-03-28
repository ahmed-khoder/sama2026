'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, User, DollarSign, Package } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

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

interface OrdersModalProps {
    isOpen: boolean;
    onClose: () => void;
    orders: Order[];
    loading: boolean;
}

const text = {
    ar: {
        title: 'أوامر البيع المؤكدة بدون فواتير',
        loading: 'جاري التحميل...',
        total: 'إجمالي',
        order: 'أمر بيع',
        orderNumber: 'رقم الأمر',
        customer: 'العميل',
        amount: 'المبلغ',
        date: 'التاريخ',
        salesperson: 'مسؤول المبيعات',
        noOrders: 'لا توجد أوامر بيع مؤكدة بدون فواتير',
        showing: 'عرض',
        of: 'من',
        confirmedOrders: 'أوامر البيع المؤكدة بدون فواتير',
        close: 'إغلاق',
    },
    en: {
        title: 'Confirmed Orders Without Invoices',
        loading: 'Loading...',
        total: 'Total',
        order: 'order',
        orderNumber: 'Order Number',
        customer: 'Customer',
        amount: 'Amount',
        date: 'Date',
        salesperson: 'Salesperson',
        noOrders: 'No confirmed orders without invoices',
        showing: 'Showing',
        of: 'of',
        confirmedOrders: 'confirmed orders without invoices',
        close: 'Close',
    },
};

export default function OrdersModal({ isOpen, onClose, orders, loading }: OrdersModalProps) {
    const { language } = useLanguage();
    const t = text[language];
    if (!isOpen) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ar-EG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatAmount = (amount: number) => {
        return amount.toLocaleString('ar-EG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{t.title}</h2>
                                <p className="text-red-100">
                                    {loading ? t.loading : `${t.total}: ${orders.length} ${t.order}`}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="animate-pulse bg-gray-200 dark:bg-slate-800 rounded-xl p-6 h-32" />
                                ))}
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="text-center py-12">
                                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">
                                    {t.noOrders}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order, index) => (
                                    <motion.div
                                        key={order.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-700 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {/* Order Number */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                                                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.orderNumber}</p>
                                                    <p className="font-bold text-marine-900 dark:text-white">{order.name}</p>
                                                </div>
                                            </div>

                                            {/* Customer */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.customer}</p>
                                                    <p className="font-bold text-marine-900 dark:text-white truncate max-w-[200px]">
                                                        {order.customerName}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Amount */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                                                    <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.amount}</p>
                                                    <p className="font-bold text-green-600 dark:text-green-400">
                                                        {formatAmount(order.amount)} {language === 'ar' ? 'ج.م' : 'EGP'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Date */}
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                                                    <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.date}</p>
                                                    <p className="font-bold text-marine-900 dark:text-white">
                                                        {formatDate(order.date)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Salesperson */}
                                            <div className="flex items-center gap-3 md:col-span-2 lg:col-span-2">
                                                <div className="w-10 h-10 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg flex items-center justify-center">
                                                    <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.salesperson}</p>
                                                    <p className="font-bold text-marine-900 dark:text-white">
                                                        {order.salesperson}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-50 dark:bg-slate-800 p-4 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t.showing} {orders.length} {t.of} {t.confirmedOrders}
                            </p>
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-marine-900 dark:text-white rounded-lg font-bold transition-colors"
                            >
                                {t.close}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
