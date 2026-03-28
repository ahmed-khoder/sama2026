'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    trend?: string;
    trendUp?: boolean;
    icon: React.ReactNode;
    bg: string;
    loading?: boolean;
    error?: string;
    iconColor?: string;
    onClick?: () => void;
}

export default function StatCard({
    title,
    value,
    trend,
    trendUp,
    icon,
    bg,
    loading = false,
    error,
    iconColor = 'text-current',
    onClick
}: StatCardProps) {
    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800">
                <div className="animate-pulse">
                    <div className="flex justify-between items-start mb-4">
                        <div className={`w-12 h-12 ${bg} rounded-xl`}></div>
                        <div className="h-6 w-16 bg-gray-200 dark:bg-slate-800 rounded"></div>
                    </div>
                    <div className="h-4 w-24 bg-gray-200 dark:bg-slate-800 rounded mb-2"></div>
                    <div className="h-8 w-20 bg-gray-200 dark:bg-slate-800 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-red-200 dark:border-red-900">
                <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center`}>
                        <span className="text-red-500 text-2xl">⚠️</span>
                    </div>
                </div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
                <p className="text-sm text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className={`bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
                }`}
        >
            <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center ${iconColor}`}>
                    {icon}
                </div>
                {trend && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className={`flex items-center gap-1 text-sm font-bold px-2 py-1 rounded-full ${trendUp
                            ? 'text-green-600 bg-green-50 dark:bg-green-900/20'
                            : 'text-red-600 bg-red-50 dark:bg-red-900/20'
                            }`}
                    >
                        {trendUp ? '↑' : '↓'} {trend}
                    </motion.div>
                )}
            </div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
            <p className="text-2xl font-bold text-marine-900 dark:text-white">{value}</p>
        </motion.div>
    );
}
