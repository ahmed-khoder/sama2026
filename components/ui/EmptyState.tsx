'use client';

import React from 'react';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
    titleAr?: string;
    titleEn?: string;
    messageAr?: string;
    messageEn?: string;
    isRTL?: boolean;
    icon?: React.ReactNode;
    action?: React.ReactNode;
}

export default function EmptyState({
    titleAr = 'لا توجد بيانات',
    titleEn = 'No data found',
    messageAr = 'لا توجد عناصر لعرضها حالياً',
    messageEn = 'There are no items to display at the moment',
    isRTL = false,
    icon,
    action,
}: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-6">
                {icon || <Inbox className="w-8 h-8 text-gray-400 dark:text-gray-500" />}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isRTL ? titleAr : titleEn}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                {isRTL ? messageAr : messageEn}
            </p>
            {action && <div>{action}</div>}
        </div>
    );
}
