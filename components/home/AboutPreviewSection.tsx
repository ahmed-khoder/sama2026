'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, ArrowLeft, Users, Award, CheckCircle2
} from 'lucide-react';

interface AboutContent {
    badgeAr: string; badgeEn: string;
    titleAr: string; titleEn: string;
    descriptionAr: string; descriptionEn: string;
    ctaTextAr: string; ctaTextEn: string; ctaLink: string;
    features: { ar: string; en: string }[];
    statsValue: string; statsLabelAr: string; statsLabelEn: string;
}

interface AboutPreviewSectionProps {
    isRTL: boolean;
    aboutContent: AboutContent;
    aboutImages: string[];
    aboutIndex: number;
    setAboutIndex: (idx: number) => void;
}

export default function AboutPreviewSection({
    isRTL, aboutContent, aboutImages, aboutIndex, setAboutIndex
}: AboutPreviewSectionProps) {
    return (
        <section className="py-24 bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Image Carousel */}
                    <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={aboutIndex}
                                    src={aboutImages[aboutIndex]}
                                    alt="Sama Logistics"
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                                    className="w-full h-full object-cover absolute inset-0"
                                />
                            </AnimatePresence>
                            <div className="absolute inset-0 bg-gradient-to-t from-marine-950/50 to-transparent" />

                            {/* Image Navigation */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {aboutImages.map((_, idx) => (
                                    <button key={idx} onClick={() => setAboutIndex(idx)} className={`w-2 h-2 rounded-full transition-all ${aboutIndex === idx ? 'bg-white w-6' : 'bg-white/50'}`} />
                                ))}
                            </div>
                        </div>

                        {/* Floating Stats Card */}
                        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
                            className="absolute -bottom-8 -right-8 bg-white dark:bg-[#1e293b] rounded-2xl p-6 shadow-2xl border border-gray-100 dark:border-white/10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-brand-orange rounded-xl flex items-center justify-center">
                                    <Award className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-gray-900 dark:text-white">{aboutContent.statsValue}</div>
                                    <div className="text-gray-500 dark:text-gray-400">{isRTL ? aboutContent.statsLabelAr : aboutContent.statsLabelEn}</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Content */}
                    <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-marine-50 dark:bg-marine-900/50 text-marine-600 dark:text-marine-400 text-sm font-bold mb-6 border border-marine-100 dark:border-marine-800">
                            <Users className="w-4 h-4" />
                            <span>{isRTL ? aboutContent.badgeAr : aboutContent.badgeEn}</span>
                        </div>

                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
                            {isRTL ? aboutContent.titleAr : aboutContent.titleEn}
                        </h2>

                        <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-8 leading-relaxed font-normal">
                            {isRTL ? aboutContent.descriptionAr : aboutContent.descriptionEn}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            {aboutContent.features.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                    <span className="text-gray-700 dark:text-gray-300 text-sm">{isRTL ? item.ar : item.en}</span>
                                </div>
                            ))}
                        </div>

                        <Link href={aboutContent.ctaLink} className="inline-flex items-center gap-2 px-6 py-3 bg-marine-600 hover:bg-marine-700 text-white font-bold rounded-xl transition-all">
                            {isRTL ? aboutContent.ctaTextAr : aboutContent.ctaTextEn}
                            {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </Link>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
