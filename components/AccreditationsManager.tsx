'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

interface AccreditationItem {
    id: string;
    logo: string;
}

export default function AccreditationsManager({ type }: { type: 'home' | 'about' | 'footer' }) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [items, setItems] = useState<AccreditationItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const cached = sessionStorage.getItem('accreditations_cache');
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                if (Date.now() - timestamp < 30 * 1000) {
                    setItems(data);
                    setLoading(false);
                    return;
                }
            }
        } catch { }

        fetch('/api/cms/accreditations')
            .then(res => res.ok ? res.json() : [])
            .then((data: AccreditationItem[]) => {
                setItems(data);
                try {
                    sessionStorage.setItem('accreditations_cache', JSON.stringify({
                        data,
                        timestamp: Date.now(),
                    }));
                } catch { }
            })
            .catch(() => setItems([]))
            .finally(() => setLoading(false));
    }, []);

    // ── Skeleton ──
    if (loading) {
        if (type === 'footer') {
            return (
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-12 md:h-14 w-20 md:w-24 rounded-lg bg-gray-100 dark:bg-slate-800/50 animate-pulse" />
                    ))}
                </div>
            );
        }
        return (
            <section className={type === 'about' ? 'py-16 md:py-24 bg-white dark:bg-slate-950' : 'py-14 md:py-20 bg-gray-50/80 dark:bg-slate-900/50'}>
                <div className="container mx-auto px-5 md:px-8">
                    <div className="text-center mb-10">
                        <div className="h-3 w-40 bg-gray-200 dark:bg-slate-800 rounded mx-auto mb-3 animate-pulse" />
                        <div className="w-12 h-0.5 bg-gray-200 dark:bg-slate-800 mx-auto rounded-full" />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-5 md:gap-8">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-20 md:h-28 w-28 md:w-40 rounded-2xl bg-gray-200 dark:bg-slate-800 animate-pulse" />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    if (items.length === 0) return null;

    // ═══════════════════════════════════════════════════════
    // FOOTER — Compact Trust Ribbon
    // ═══════════════════════════════════════════════════════
    if (type === 'footer') {
        return (
            <div className="space-y-3">
                {/* Micro badge */}
                <div className="flex items-center justify-center gap-2">
                    <svg className="w-3.5 h-3.5 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.15em]">
                        {isRTL ? 'معتمدون ومرخصون' : 'Certified & Accredited'}
                    </span>
                </div>
                {/* Logo ribbon */}
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
                    {items.map((item) => (
                        <div key={item.id}
                            className="group relative flex items-center justify-center 
                                        w-20 h-12 md:w-24 md:h-14 rounded-lg
                                        bg-white/80 dark:bg-white/5
                                        border border-gray-100/80 dark:border-white/10
                                        hover:border-brand-orange/40 dark:hover:border-brand-orange/30
                                        hover:bg-white dark:hover:bg-white/10
                                        transition-all duration-500"
                        >
                            <Image
                                src={item.logo}
                                alt="Certification"
                                width={80}
                                height={50}
                                className="max-h-[70%] w-auto object-contain
                                           opacity-70 group-hover:opacity-100
                                           transition-all duration-500"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════
    // ABOUT — Premium Glassmorphism Cards
    // ═══════════════════════════════════════════════════════
    if (type === 'about') {
        return (
            <section className="relative py-16 md:py-24 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-marine-400/5 rounded-full blur-[100px]" />
                </div>

                <div className="container mx-auto px-5 md:px-8 relative z-10">
                    {/* Section Header */}
                    <div className="text-center mb-12 md:mb-16">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 mb-5
                                        bg-brand-orange/10 border border-brand-orange/20
                                        rounded-full">
                            <svg className="w-4 h-4 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                <path d="m9 12 2 2 4-4" />
                            </svg>
                            <span className="text-xs font-bold text-brand-orange uppercase tracking-[0.18em]">
                                {isRTL ? 'معتمدون ومرخصون' : 'Certified & Accredited'}
                            </span>
                        </div>

                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'الاعتمادات والعضويات' : 'Accreditations & Memberships'}
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm md:text-base font-normal leading-relaxed">
                            {isRTL
                                ? 'نلتزم بأعلى معايير الجودة والامتثال الدولية، مما يضمن لعملائنا خدمات لوجستية آمنة وموثوقة.'
                                : 'We uphold the highest international quality and compliance standards, ensuring safe and reliable logistics services for our clients.'}
                        </p>
                    </div>

                    {/* Accreditation Cards */}
                    <div className="flex flex-wrap items-stretch justify-center gap-5 md:gap-8">
                        {items.map((item) => (
                            <div key={item.id} className="group relative">
                                <div className="relative flex items-center justify-center 
                                                w-32 h-24 md:w-44 md:h-32
                                                rounded-2xl md:rounded-3xl p-4 md:p-6
                                                bg-white dark:bg-slate-800/60
                                                border border-gray-100 dark:border-slate-700/50
                                                shadow-[0_2px_20px_-4px_rgba(0,0,0,0.06)]
                                                backdrop-blur-xl
                                                hover:shadow-[0_8px_40px_-8px_rgba(249,115,22,0.15)]
                                                hover:border-brand-orange/30
                                                hover:-translate-y-2
                                                transition-all duration-500 ease-out"
                                >
                                    {/* Top accent line on hover */}
                                    <div className="absolute top-0 left-4 right-4 md:left-6 md:right-6 h-[2px] 
                                                    bg-gradient-to-r from-transparent via-transparent to-transparent
                                                    group-hover:via-brand-orange/60
                                                    transition-all duration-500 rounded-full" />

                                    <Image
                                        src={item.logo}
                                        alt="Accreditation"
                                        width={160}
                                        height={100}
                                        className="max-h-full w-auto object-contain relative z-10
                                                   group-hover:scale-110
                                                   transition-transform duration-500 ease-out"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // ═══════════════════════════════════════════════════════
    // HOME — Infinite Marquee Ribbon
    // ═══════════════════════════════════════════════════════
    return (
        <section className="relative py-14 md:py-20 bg-gradient-to-b from-gray-50/80 to-white dark:from-slate-900/60 dark:to-slate-950 overflow-hidden">
            <div className="container mx-auto px-5 md:px-8 relative z-10">
                {/* Section Header */}
                <div className="text-center mb-10 md:mb-14">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4
                                    bg-brand-orange/10 border border-brand-orange/15
                                    rounded-full">
                        <svg className="w-3.5 h-3.5 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                        <span className="text-[10px] font-bold text-brand-orange uppercase tracking-[0.18em]">
                            {isRTL ? 'معتمدون رسمياً' : 'Officially Accredited'}
                        </span>
                    </div>
                    <h3 className="text-lg md:text-xl lg:text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                        {isRTL ? 'الاعتمادات والعضويات' : 'Accreditations & Memberships'}
                    </h3>
                    <div className="w-12 h-[2px] bg-gradient-to-r from-brand-orange to-brand-gold mx-auto mt-3 rounded-full" />
                </div>

                {/* Marquee Ribbon */}
                <div className="relative">
                    {/* Fade edges */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 md:w-20 z-20
                                    bg-gradient-to-r from-white dark:from-slate-950 to-transparent
                                    pointer-events-none" />
                    <div className="absolute right-0 top-0 bottom-0 w-12 md:w-20 z-20
                                    bg-gradient-to-l from-white dark:from-slate-950 to-transparent
                                    pointer-events-none" />

                    {/* Scrolling track */}
                    <div className="overflow-hidden">
                        <div className="flex animate-marquee-scroll gap-6 md:gap-10 items-center"
                            style={{ width: 'max-content' }}
                        >
                            {/* Duplicate items 3x for seamless loop */}
                            {[...items, ...items, ...items].map((item, idx) => (
                                <div key={`${item.id}-${idx}`}
                                    className="group relative flex items-center justify-center flex-shrink-0
                                                w-28 h-20 md:w-36 md:h-24
                                                rounded-xl md:rounded-2xl p-3 md:p-5
                                                bg-white dark:bg-slate-800/50
                                                border border-gray-100/80 dark:border-slate-700/40
                                                shadow-sm
                                                hover:shadow-[0_4px_24px_-4px_rgba(249,115,22,0.12)]
                                                hover:border-brand-orange/25
                                                hover:-translate-y-1
                                                transition-all duration-500"
                                >
                                    {/* Hover accent line */}
                                    <div className="absolute top-0 left-3 right-3 h-[1.5px]
                                                    bg-gradient-to-r from-transparent via-transparent to-transparent
                                                    group-hover:via-brand-orange/50
                                                    transition-all duration-500 rounded-full" />

                                    <Image
                                        src={item.logo}
                                        alt="Certification"
                                        width={120}
                                        height={70}
                                        className="max-h-full w-auto object-contain
                                                   opacity-80 group-hover:opacity-100
                                                   group-hover:scale-110
                                                   transition-all duration-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
