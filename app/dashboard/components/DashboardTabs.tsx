'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OverviewTab from './tabs/OverviewTab';
import SalesTab from './tabs/SalesTab';
import { useLanguage } from '@/contexts/LanguageContext';

type TabId = 'overview' | 'sales' | 'invoices' | 'expenses';

interface Tab {
    id: TabId;
    labelAr: string;
    labelEn: string;
    enabled: boolean;
}

const tabs: Tab[] = [
    { id: 'overview', labelAr: 'نظرة عامة', labelEn: 'Overview', enabled: true },
    { id: 'sales', labelAr: 'المبيعات', labelEn: 'Sales', enabled: true },
    { id: 'invoices', labelAr: 'الفواتير', labelEn: 'Invoices', enabled: false },
    { id: 'expenses', labelAr: 'المصروفات', labelEn: 'Expenses', enabled: false },
];

export default function DashboardTabs() {
    const { language } = useLanguage();
    const [activeTab, setActiveTab] = useState<TabId>('overview');

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-2">
                <div className="flex flex-wrap gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => tab.enabled && setActiveTab(tab.id)}
                            disabled={!tab.enabled}
                            className={`
                relative px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300
                ${activeTab === tab.id
                                    ? 'text-white bg-brand-orange shadow-lg shadow-brand-orange/20'
                                    : tab.enabled
                                        ? 'text-gray-600 dark:text-gray-400 hover:text-brand-orange hover:bg-orange-50 dark:hover:bg-orange-900/10'
                                        : 'text-gray-300 dark:text-gray-700 cursor-not-allowed'
                                }
              `}
                        >
                            {language === 'ar' ? tab.labelAr : tab.labelEn}
                            {!tab.enabled && (
                                <span className="mr-2 text-xs opacity-50">
                                    ({language === 'ar' ? 'قريباً' : 'Coming Soon'})
                                </span>
                            )}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-brand-orange rounded-xl -z-10"
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'overview' && <OverviewTab />}
                    {activeTab === 'sales' && <SalesTab />}
                    {activeTab === 'invoices' && (
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                {language === 'ar' ? 'قريباً: تقارير الفواتير' : 'Coming Soon: Invoice Reports'}
                            </p>
                        </div>
                    )}
                    {activeTab === 'expenses' && (
                        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                {language === 'ar' ? 'قريباً: تقارير المصروفات' : 'Coming Soon: Expense Reports'}
                            </p>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
