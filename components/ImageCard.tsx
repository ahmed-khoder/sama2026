'use client';

import React from 'react';

interface ImageCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    image: string;
}

export default function ImageCard({ icon, title, description, image }: ImageCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-3xl h-[400px] shadow-2xl shadow-brand-orange/20 lg:shadow-xl lg:shadow-gray-200/50 lg:dark:shadow-black/50 hover:shadow-2xl transition-all duration-300 animate-float lg:animate-none">
            {/* Background Image with Ken Burns Effect for Mobile */}
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110 animate-ken-burns lg:animate-none"
                style={{ backgroundImage: `url(${image})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-marine-950 via-marine-900/80 to-transparent opacity-90" />

            <div className="relative z-10 h-full flex flex-col justify-end p-8">
                {/* Icon - Always Visible */}
                <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-brand-orange mb-6 border border-white/20 group-hover:bg-white/20 transition-colors shadow-[0_0_20px_rgba(249,115,22,0.6)] animate-pulse-slow lg:animate-none lg:shadow-none">
                    {icon}
                </div>

                {/* Title - Always Visible */}
                <h3 className="text-2xl font-bold text-white mb-2 group-hover:mb-3 transition-all duration-300">{title}</h3>

                {/* Description - Desktop: Hover Reveal / Mobile: Always Visible */}
                <div className="lg:max-h-0 lg:opacity-0 lg:group-hover:max-h-40 lg:group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden">
                    <p className="text-gray-300 text-lg leading-relaxed font-light border-l-2 border-brand-orange pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4 pt-2 hidden lg:block">
                        {description}
                    </p>
                </div>

                {/* Mobile Only Description */}
                <div className="lg:hidden">
                    <p className="text-gray-300 text-lg leading-relaxed font-light border-l-2 border-brand-orange pl-4 rtl:border-l-0 rtl:border-r-2 rtl:pl-0 rtl:pr-4">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
