'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface CTASectionProps {
    isRTL: boolean;
}

export default function CTASection({ isRTL }: CTASectionProps) {
    return (
        <section className="py-24 bg-white dark:bg-slate-950">
            <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    className="relative bg-gradient-to-br from-marine-600 to-marine-800 rounded-3xl p-12 md:p-16 text-center overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/30 rounded-full blur-[100px]" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-[80px]" />

                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-6">{isRTL ? 'مستعد لبدء شحنتك؟' : 'Ready to Start Your Shipment?'}</h2>
                        <p className="text-lg text-gray-200/80 max-w-2xl mx-auto mb-10 font-normal">{isRTL ? 'تواصل معنا اليوم واحصل على عرض سعر مخصص لاحتياجاتك' : 'Contact us today and get a customized quote for your needs'}</p>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Link href="/contact" className="px-10 py-5 bg-brand-orange hover:bg-brand-darkOrange text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-orange/30 flex items-center gap-2 text-lg">
                                {isRTL ? 'تواصل معنا الآن' : 'Contact Us Now'}
                                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                            </Link>
                            <Link href="/services" className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all text-lg">
                                {isRTL ? 'استعرض الخدمات' : 'View Services'}
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
