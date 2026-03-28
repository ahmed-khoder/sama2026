'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export interface Milestone {
    year: string;
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
    image?: string;
}

export interface FuturePulseData {
    badgeAr: string;
    badgeEn: string;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    image?: string;
}

interface JourneyTimelineProps {
    milestones: Milestone[];
    futurePulse?: FuturePulseData;
}

export default function JourneyTimeline({ milestones, futurePulse }: JourneyTimelineProps) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const fp = futurePulse || {
        badgeAr: 'المستقبل', badgeEn: 'The Future',
        titleAr: 'طموحنا مستمر..', titleEn: 'Our Ambition Continues..',
        descriptionAr: 'نحو مستقبل لوجستي متكامل', descriptionEn: 'Towards an Integrated Logistics Future',
    };

    return (
        <>
        <div dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Mobile Layout - Vertical Stack */}
            <div className="md:hidden space-y-10 px-4">
                {milestones.map((milestone, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative"
                    >
                        {/* Year Badge - Sticking out from top */}
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                            <div className="bg-gradient-to-r from-brand-orange to-brand-darkOrange text-white px-6 py-2.5 rounded-full font-black text-xl shadow-xl shadow-brand-orange/30 border-4 border-white dark:border-slate-950">
                                {milestone.year}
                            </div>
                        </div>

                        {/* Card */}
                        <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden pt-8">
                            {/* Image */}
                            {milestone.image && (
                                <div className="relative h-44 w-full overflow-hidden">
                                    <img
                                        src={milestone.image}
                                        alt={isRTL ? milestone.titleAr : milestone.titleEn}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                                </div>
                            )}

                            {/* Content */}
                            <div className={`p-5 ${isRTL ? 'text-right' : 'text-left'}`}>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                    {isRTL ? milestone.titleAr : milestone.titleEn}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {isRTL ? milestone.descAr : milestone.descEn}
                                </p>
                            </div>
                        </div>

                        {/* Connector Line (always show — connects to future card too) */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-1 h-10 bg-gradient-to-b from-brand-orange to-marine-500 rounded-full" />
                    </motion.div>
                ))}

                {/* ── Future Pulse (Mobile) ── Full Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="relative flex flex-col items-center"
                >
                    {/* Pulsing Orange Circle Node */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-brand-orange/30 rounded-full animate-ping" />
                        <div className="absolute -inset-3 bg-brand-orange/10 rounded-full animate-pulse" />
                        <div className="relative w-14 h-14 bg-gradient-to-br from-brand-orange via-brand-darkOrange to-orange-700 rounded-full border-4 border-white dark:border-slate-950 shadow-2xl shadow-brand-orange/50" />
                    </div>

                    {/* Card */}
                    <div className="relative w-full">
                    {/* Badge */}
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 z-20">
                        <div className="bg-gradient-to-r from-brand-orange to-brand-darkOrange text-white px-6 py-2.5 rounded-full font-black text-xl shadow-xl shadow-brand-orange/30 border-4 border-white dark:border-slate-950">
                            {isRTL ? fp.badgeAr : fp.badgeEn}
                        </div>
                    </div>

                    {/* Card */}
                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden pt-8">
                        {/* Image */}
                        {fp.image ? (
                            <div className="relative h-44 w-full overflow-hidden">
                                <img
                                    src={fp.image}
                                    alt={isRTL ? fp.titleAr : fp.titleEn}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            </div>
                        ) : (
                            <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-brand-orange/20 via-brand-darkOrange/10 to-orange-100 dark:from-brand-orange/10 dark:via-brand-darkOrange/5 dark:to-slate-800" />
                        )}

                        {/* Content */}
                        <div className={`p-5 ${isRTL ? 'text-right' : 'text-left'}`}>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                                {isRTL ? fp.titleAr : fp.titleEn}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                {isRTL ? fp.descriptionAr : fp.descriptionEn}
                            </p>
                        </div>
                    </div>
                    </div>
                </motion.div>
            </div>

            {/* Desktop Layout - Alternating */}
            <div className="hidden md:block relative max-w-7xl mx-auto px-4">
                {/* Vertical Line */}
                <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-brand-orange via-marine-500 to-brand-orange rounded-full" />

                <div>
                    {milestones.map((milestone, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.15, duration: 0.5 }}
                            className="relative"
                            style={{ marginTop: idx > 0 ? '-144px' : 0, zIndex: idx + 1 }}
                        >
                            {/* Center Dot - Absolutely positioned */}
                            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
                                <motion.div
                                    whileHover={{ scale: 1.2 }}
                                    className="w-14 h-14 bg-gradient-to-br from-marine-500 to-marine-700 rounded-full border-4 border-white dark:border-slate-950 shadow-xl flex items-center justify-center"
                                >
                                    <span className="text-white font-bold">{idx + 1}</span>
                                </motion.div>
                            </div>

                            {/* Card - takes ~47% width, positioned on alternating sides */}
                            <div className={`w-[calc(50%-30px)] ${idx % 2 === 0 ? (isRTL ? 'mr-0 ml-auto' : 'ml-0 mr-auto') : (isRTL ? 'ml-0 mr-auto' : 'mr-0 ml-auto')}`}>
                                <div className="relative">
                                    {/* Year Badge - Sticking out from top corner */}
                                    <div className={`absolute -top-6 ${idx % 2 === 0 ? (isRTL ? 'left-6' : 'right-6') : (isRTL ? 'right-6' : 'left-6')} z-20`}>
                                        <motion.div
                                            whileHover={{ scale: 1.1, rotate: -3 }}
                                            className="bg-gradient-to-br from-brand-orange via-brand-darkOrange to-orange-700 text-white px-8 py-4 rounded-2xl font-black text-3xl shadow-xl shadow-brand-orange/40 border-4 border-white dark:border-slate-950 cursor-default"
                                        >
                                            {milestone.year}
                                        </motion.div>
                                    </div>

                                    {/* Card */}
                                    <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden pt-6 group hover:shadow-2xl transition-all duration-300">
                                        {/* Image */}
                                        {milestone.image && (
                                            <div className="relative h-72 w-full overflow-hidden mt-2">
                                                <img
                                                    src={milestone.image}
                                                    alt={isRTL ? milestone.titleAr : milestone.titleEn}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                            </div>
                                        )}

                                        {/* Content */}
                                        <div className={`p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                                {isRTL ? milestone.titleAr : milestone.titleEn}
                                            </h3>
                                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {isRTL ? milestone.descAr : milestone.descEn}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* ── Future Pulse (Desktop) ── Full Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
                    className="relative"
                    style={{ marginTop: '-144px', zIndex: milestones.length + 1 }}
                >
                    {/* Center Dot — numbered */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
                        <div className="absolute inset-0 bg-brand-orange/25 rounded-full animate-ping" />
                        <div className="absolute -inset-4 bg-brand-orange/10 rounded-full animate-pulse" />
                        <div className="relative w-28 h-28 bg-gradient-to-br from-brand-orange via-brand-darkOrange to-orange-700 rounded-full border-4 border-white dark:border-slate-950 shadow-2xl shadow-brand-orange/50 flex items-center justify-center">

                        </div>
                    </div>

                    {/* Card — dynamically opposite to last milestone */}
                    <div className={`w-[calc(50%-30px)] ${milestones.length % 2 !== 0
                        ? (isRTL ? 'ml-0 mr-auto' : 'mr-0 ml-auto')
                        : (isRTL ? 'mr-0 ml-auto' : 'ml-0 mr-auto')}`}
                    >
                        <div className="relative">
                            {/* Future Badge */}
                            <div className={`absolute -top-6 ${milestones.length % 2 !== 0 ? (isRTL ? 'right-6' : 'left-6') : (isRTL ? 'left-6' : 'right-6')} z-20`}>
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: -3 }}
                                    className="bg-gradient-to-br from-brand-orange via-brand-darkOrange to-orange-700 text-white px-8 py-4 rounded-2xl font-black text-3xl shadow-xl shadow-brand-orange/40 border-4 border-white dark:border-slate-950 cursor-default"
                                >
                                    {isRTL ? fp.badgeAr : fp.badgeEn}
                                </motion.div>
                            </div>

                            {/* Card with Radar Pulse */}
                            <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 overflow-hidden pt-6 group hover:shadow-2xl transition-all duration-300" style={{ animation: 'radar-pulse 2s ease-out infinite' }}>
                                {/* Image Area */}
                                <div className="relative h-72 w-full overflow-hidden mt-2">
                                    {fp.image ? (
                                        <>
                                            <img
                                                src={fp.image}
                                                alt={isRTL ? fp.titleAr : fp.titleEn}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-brand-orange/20 via-brand-darkOrange/10 to-orange-100 dark:from-brand-orange/10 dark:via-brand-darkOrange/5 dark:to-slate-800 flex items-center justify-center">

                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className={`p-6 ${isRTL ? 'text-right' : 'text-left'}`} dir={isRTL ? 'rtl' : 'ltr'}>
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                                        {isRTL ? fp.titleAr : fp.titleEn}
                                    </h3>
                                    <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {isRTL ? fp.descriptionAr : fp.descriptionEn}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>

        {/* Radar Pulse CSS Keyframes */}
        <style>{`
            @keyframes radar-pulse {
                0% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0.35); }
                70% { box-shadow: 0 0 0 18px rgba(249, 115, 22, 0); }
                100% { box-shadow: 0 0 0 0 rgba(249, 115, 22, 0); }
            }
        `}</style>
        </>
    );
}
