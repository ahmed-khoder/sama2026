'use client';

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
    titleAr?: string;
    titleEn?: string;
    messageAr?: string;
    messageEn?: string;
    isRTL?: boolean;
    onRetry?: () => void;
}

export default function ErrorState({
    titleAr = 'حدث خطأ',
    titleEn = 'Something went wrong',
    messageAr = 'يرجى المحاولة مرة أخرى لاحقاً',
    messageEn = 'Please try again later',
    isRTL = false,
    onRetry,
}: ErrorStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
                <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isRTL ? titleAr : titleEn}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                {isRTL ? messageAr : messageEn}
            </p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-brand-orange hover:bg-brand-darkOrange text-white font-bold rounded-xl transition-colors"
                >
                    <RefreshCw className="w-4 h-4" />
                    {isRTL ? 'إعادة المحاولة' : 'Try Again'}
                </button>
            )}
        </div>
    );
}
