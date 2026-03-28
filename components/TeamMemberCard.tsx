'use client';

import React from 'react';

interface TeamMemberCardProps {
    image: string;
    name: string;
    role: string;
    quote: string;
}

export default function TeamMemberCard({ image, name, role, quote }: TeamMemberCardProps) {
    return (
        <div className="group relative isolate transform-gpu backface-hidden overflow-hidden rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-lg dark:shadow-none hover:shadow-xl transition-shadow duration-500">
            <div className="aspect-[4/5] overflow-hidden relative">
                {/* Light mode gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent z-10 opacity-80 group-hover:opacity-70 transition-opacity duration-300 dark:hidden" />
                {/* Dark mode gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-marine-950 via-marine-950/40 to-transparent z-10 opacity-90 group-hover:opacity-80 transition-opacity duration-300 hidden dark:block" />

                {/* Image — ONLY this element scales */}
                <img
                    src={image}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover transform-gpu will-change-transform backface-hidden transition-transform duration-500 ease-out group-hover:scale-110 grayscale group-hover:grayscale-0"
                    loading="lazy"
                />

                {/* Text — absolute bottom, only opacity + translate animate, ZERO layout flow */}
                <div className="absolute bottom-0 left-0 w-full p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <h3 className="text-xl font-bold text-white mb-1">{name}</h3>
                    <p className="text-brand-orange font-medium text-sm mb-3 tracking-wide">{role}</p>
                    <div className="h-0.5 w-12 bg-white/50 mb-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <p className="text-gray-200 text-sm italic opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3">
                        &ldquo;{quote}&rdquo;
                    </p>
                </div>
            </div>
        </div>
    );
}

