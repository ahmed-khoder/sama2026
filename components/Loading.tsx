'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Loading() {
    return (
        <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex items-center justify-center">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-orange/10 rounded-full blur-[150px]" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-marine-500/10 rounded-full blur-[150px]" />
            </div>

            <div className="relative z-10 text-center">
                {/* Animated Logo */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8"
                >
                    <div className="w-24 h-24 mx-auto relative">
                        {/* Outer ring */}
                        <motion.div
                            className="absolute inset-0 border-4 border-marine-200 dark:border-marine-800 rounded-full"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Spinning arc */}
                        <motion.div
                            className="absolute inset-0 border-4 border-transparent border-t-brand-orange rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />

                        {/* Inner circle with logo text */}
                        <motion.div
                            className="absolute inset-2 bg-gradient-to-br from-marine-600 to-marine-700 rounded-full flex items-center justify-center"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.3 }}
                        >
                            <span className="text-white font-bold text-2xl">S</span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Text */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        سما لوجستيك
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400">
                        جاري التحميل...
                    </p>
                </motion.div>

                {/* Loading dots */}
                <motion.div
                    className="flex justify-center gap-2 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-brand-orange rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </motion.div>
            </div>
        </div>
    );
}

// Skeleton Loading Component
export function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 animate-pulse">
            <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-xl mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-5/6" />
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2 animate-pulse">
            {Array.from({ length: lines }).map((_, i) => (
                <div
                    key={i}
                    className={`h-3 bg-gray-200 dark:bg-slate-700 rounded ${i === lines - 1 ? 'w-3/4' : 'w-full'
                        }`}
                />
            ))}
        </div>
    );
}

export function SkeletonImage() {
    return (
        <div className="w-full aspect-video bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
    );
}
