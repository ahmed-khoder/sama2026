'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Trash2, AlertCircle, X } from 'lucide-react';
import { ConfirmType } from '@/contexts/ConfirmContext';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmType;
    onConfirm: () => void;
    onCancel: () => void;
}

const typeConfig = {
    danger: {
        icon: Trash2,
        gradient: 'from-red-500 via-rose-500 to-pink-500',
        iconBg: 'bg-red-100 dark:bg-red-900/40',
        iconColor: 'text-red-600 dark:text-red-400',
        confirmBg: 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600',
        ringColor: 'ring-red-500/30',
    },
    warning: {
        icon: AlertTriangle,
        gradient: 'from-amber-500 via-yellow-500 to-orange-400',
        iconBg: 'bg-amber-100 dark:bg-amber-900/40',
        iconColor: 'text-amber-600 dark:text-amber-400',
        confirmBg: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600',
        ringColor: 'ring-amber-500/30',
    },
    info: {
        icon: AlertCircle,
        gradient: 'from-marine-600 via-blue-600 to-cyan-600',
        iconBg: 'bg-marine-100 dark:bg-marine-900/40',
        iconColor: 'text-marine-600 dark:text-marine-400',
        confirmBg: 'bg-gradient-to-r from-marine-500 to-blue-500 hover:from-marine-600 hover:to-blue-600',
        ringColor: 'ring-marine-500/30',
    },
};

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger',
    onConfirm,
    onCancel,
}: ConfirmModalProps) {
    const config = typeConfig[type];
    const Icon = config.icon;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onCancel}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className={`
                            relative w-full max-w-md overflow-hidden rounded-3xl
                            bg-white dark:bg-slate-800 shadow-2xl
                            ring-2 ${config.ringColor} ring-offset-2 ring-offset-white dark:ring-offset-slate-900
                        `}
                    >
                        {/* Gradient Background Effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-5`} />

                        {/* Animated Glow */}
                        <div className={`absolute -inset-1 bg-gradient-to-r ${config.gradient} opacity-20 blur-2xl`} />

                        {/* Content */}
                        <div className="relative p-6">
                            {/* Close Button */}
                            <motion.button
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                whileHover={{ scale: 1.1, rotate: 90 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={onCancel}
                                className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </motion.button>

                            {/* Icon */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                className="flex justify-center mb-5"
                            >
                                <div className={`p-4 rounded-2xl ${config.iconBg} shadow-lg`}>
                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${config.gradient} shadow-inner`}>
                                        <Icon className="w-8 h-8 text-white" strokeWidth={2} />
                                    </div>
                                </div>
                            </motion.div>

                            {/* Title */}
                            <motion.h3
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.15 }}
                                className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2"
                            >
                                {title}
                            </motion.h3>

                            {/* Message */}
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-center text-gray-600 dark:text-gray-400 mb-6 leading-relaxed"
                            >
                                {message}
                            </motion.p>

                            {/* Buttons */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.25 }}
                                className="flex gap-3"
                            >
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onCancel}
                                    className="flex-1 px-5 py-3.5 rounded-xl font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                    {cancelText}
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.3)' }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={onConfirm}
                                    className={`flex-1 px-5 py-3.5 rounded-xl font-semibold text-white ${config.confirmBg} shadow-lg transition-all`}
                                >
                                    {confirmText}
                                </motion.button>
                            </motion.div>
                        </div>

                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                initial={{ x: '-100%' }}
                                animate={{ x: '200%' }}
                                transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
