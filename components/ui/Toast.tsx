'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
    id: string;
    type: ToastType;
    title?: string;
    message: string;
    duration?: number;
}

interface ToastProps {
    toasts: ToastMessage[];
    removeToast: (id: string) => void;
}

const toastConfig = {
    success: {
        icon: CheckCircle2,
        gradient: 'from-brand-orange via-orange-500 to-amber-500',
        ringColor: 'ring-brand-orange/50',
        bgColor: 'bg-orange-50 dark:bg-orange-950/30',
        borderColor: 'border-orange-200 dark:border-orange-800',
        textColor: 'text-orange-900 dark:text-orange-100',
        iconColor: 'text-brand-orange dark:text-orange-400',
        progressColor: 'bg-brand-orange',
    },
    error: {
        icon: XCircle,
        gradient: 'from-red-500 via-rose-500 to-pink-500',
        ringColor: 'ring-red-500/50',
        bgColor: 'bg-red-50 dark:bg-red-950/30',
        borderColor: 'border-red-200 dark:border-red-800',
        textColor: 'text-red-900 dark:text-red-100',
        iconColor: 'text-red-600 dark:text-red-400',
        progressColor: 'bg-red-500',
    },
    warning: {
        icon: AlertCircle,
        gradient: 'from-amber-500 via-yellow-500 to-orange-400',
        ringColor: 'ring-amber-500/50',
        bgColor: 'bg-amber-50 dark:bg-amber-950/30',
        borderColor: 'border-amber-200 dark:border-amber-800',
        textColor: 'text-amber-900 dark:text-amber-100',
        iconColor: 'text-amber-600 dark:text-amber-400',
        progressColor: 'bg-amber-500',
    },
    info: {
        icon: Info,
        gradient: 'from-marine-600 via-blue-600 to-cyan-600',
        ringColor: 'ring-marine-500/50',
        bgColor: 'bg-marine-50 dark:bg-marine-950/30',
        borderColor: 'border-marine-200 dark:border-marine-800',
        textColor: 'text-marine-900 dark:text-marine-100',
        iconColor: 'text-marine-600 dark:text-marine-400',
        progressColor: 'bg-marine-600',
    },
};

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
    const [progress, setProgress] = useState(100);
    const config = toastConfig[toast.type];
    const Icon = config.icon;
    const duration = toast.duration || 4000;

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);

            if (remaining === 0) {
                clearInterval(interval);
                onRemove();
            }
        }, 16);

        return () => clearInterval(interval);
    }, [duration, onRemove]);

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.8, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
                relative overflow-hidden rounded-2xl shadow-2xl border-2 backdrop-blur-xl
                ${config.bgColor} ${config.borderColor} ${config.ringColor}
                ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-900
                min-w-[320px] max-w-md
            `}
            whileHover={{ scale: 1.02, y: -2 }}
            onMouseEnter={() => setProgress(100)}
        >
            {/* Gradient Background Effect */}
            <div className={`absolute inset-0 bg-gradient-to-r ${config.gradient} opacity-5`} />

            {/* Animated Glow Effect */}
            <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} opacity-20 blur-xl animate-pulse`} />

            <div className="relative p-5">
                <div className="flex items-start gap-4">
                    {/* Icon with Animation */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                        className={`flex-shrink-0 p-2 rounded-xl bg-gradient-to-br ${config.gradient} shadow-lg`}
                    >
                        <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {toast.title && (
                            <motion.h3
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.15 }}
                                className={`font-bold text-base mb-1 ${config.textColor}`}
                            >
                                {toast.title}
                            </motion.h3>
                        )}
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`text-sm ${config.textColor} opacity-90 leading-relaxed`}
                        >
                            {toast.message}
                        </motion.p>
                    </div>

                    {/* Close Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.25 }}
                        whileHover={{ scale: 1.1, rotate: 90 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={onRemove}
                        className={`
                            flex-shrink-0 p-1.5 rounded-lg transition-colors
                            ${config.iconColor} hover:bg-white/50 dark:hover:bg-black/20
                        `}
                    >
                        <X className="w-5 h-5" />
                    </motion.button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                        className={`h-full ${config.progressColor} rounded-full shadow-lg`}
                        initial={{ width: '100%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                    />
                </div>
            </div>

            {/* Shimmer Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    animate={{ x: '200%' }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                />
            </div>
        </motion.div>
    );
}

export default function Toast({ toasts, removeToast }: ToastProps) {
    return (
        <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <div key={toast.id} className="pointer-events-auto">
                        <ToastItem toast={toast} onRemove={() => removeToast(toast.id)} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
}
