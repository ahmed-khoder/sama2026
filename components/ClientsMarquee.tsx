'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Partner {
    name: string;
    logo: string;
}

export default function ClientsMarquee() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [clients, setClients] = useState<Partner[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const res = await fetch('/api/odoo/featured-partners');
                if (!res.ok) throw new Error('Failed to fetch partners');
                const data = await res.json();
                if (data.partners && data.partners.length > 0) {
                    const mapped: Partner[] = data.partners
                        .filter((p: any) => p.image_128 && p.image_128.startsWith('data:image'))
                        .map((p: any) => ({
                            name: p.name,
                            logo: p.image_128,
                        }));
                    if (mapped.length > 0) {
                        setClients(mapped);
                    }
                }
            } catch (error) {
                console.error('Error fetching featured partners:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPartners();
    }, []);

    if (clients.length === 0 && !isLoading) return null;

    if (isLoading) {
        return (
            <section dir="ltr" className="py-10 bg-white dark:bg-slate-950 border-y border-gray-100 dark:border-slate-800 overflow-hidden">
                <div className="container mx-auto px-4 mb-6 text-center">
                    <p className="text-sm font-bold text-marine-600 dark:text-marine-400 uppercase tracking-wider">
                        {isRTL ? 'شركاء النجاح' : 'Trusted by Industry Leaders'}
                    </p>
                </div>
                <div className="flex gap-6 justify-center px-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-36 h-24 md:w-44 md:h-28 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                    ))}
                </div>
            </section>
        );
    }

    if (clients.length === 0) return null;

    // ── Row distribution ──
    // Set to `false` to revert to original behavior (both rows show ALL logos)
    const SPLIT_ROWS = true;

    // Animation duration (longer = slower)
    const duration = 120; // seconds for one complete cycle

    const halfCount = Math.ceil(clients.length / 2);

    // When SPLIT_ROWS is true:  Row 1 = first half, Row 2 = second half (distinct sets)
    // When SPLIT_ROWS is false: Row 1 = all logos,   Row 2 = all logos offset (original)
    const row1Logos = SPLIT_ROWS ? clients.slice(0, halfCount) : clients;
    const row2Logos = SPLIT_ROWS
        ? clients.slice(halfCount)
        : [...clients.slice(halfCount), ...clients.slice(0, halfCount)];

    // Render logo card - logos fill the container
    const renderLogo = (client: Partner, key: string) => (
        <div
            key={key}
            className="flex-shrink-0 w-36 h-24 md:w-44 md:h-28 bg-white dark:bg-slate-800 rounded-xl p-0.5 shadow-sm hover:shadow-md transition-shadow border border-gray-100 dark:border-slate-700"
        >
            <img
                src={client.logo}
                alt=""
                className="w-full h-full object-contain"
            />
        </div>
    );

    return (
        <section
            ref={containerRef}
            dir="ltr"
            className="py-10 bg-white dark:bg-slate-950 border-y border-gray-100 dark:border-slate-800 overflow-hidden"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="container mx-auto px-4 mb-6 text-center">
                <p className="text-sm font-bold text-marine-600 dark:text-marine-400 uppercase tracking-wider">
                    {isRTL ? 'شركاء النجاح' : 'Trusted by Industry Leaders'}
                </p>
            </div>

            <div className="relative flex flex-col gap-3">
                {/* Gradient Masks */}
                <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />

                {/* Row 1 - Moving Right to Left */}
                <div className="overflow-hidden">
                    <div
                        className="flex gap-6 marquee-track"
                        style={{
                            animationDuration: `${duration}s`,
                            animationPlayState: isPaused ? 'paused' : 'running',
                        }}
                    >
                        {row1Logos.map((c, i) => renderLogo(c, `r1a-${i}`))}
                        {row1Logos.map((c, i) => renderLogo(c, `r1b-${i}`))}
                    </div>
                </div>

                {/* Row 2 - Moving Left to Right (opposite direction) */}
                <div className="overflow-hidden">
                    <div
                        className="flex gap-6 marquee-track-reverse"
                        style={{
                            animationDuration: `${duration}s`,
                            animationPlayState: isPaused ? 'paused' : 'running',
                        }}
                    >
                        {row2Logos.map((c, i) => renderLogo(c, `r2a-${i}`))}
                        {row2Logos.map((c, i) => renderLogo(c, `r2b-${i}`))}
                    </div>
                </div>
            </div>

            {/* Keyframes for seamless infinite scroll */}
            <style>{`
                .marquee-track {
                    display: flex;
                    width: max-content;
                    animation: marquee-scroll linear infinite;
                    will-change: transform;
                }
                
                .marquee-track-reverse {
                    display: flex;
                    width: max-content;
                    animation: marquee-scroll-reverse linear infinite;
                    will-change: transform;
                }
                
                @keyframes marquee-scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                
                @keyframes marquee-scroll-reverse {
                    0% { transform: translateX(-50%); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </section>
    );
}

