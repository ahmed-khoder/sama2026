'use client';

import React from 'react';

interface FeatureCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <div className="bg-white dark:bg-[#1e293b] p-8 rounded-lg shadow-sm border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow duration-300 group hover:border-marine-200 dark:hover:border-marine-800">
            <div className="w-16 h-16 bg-marine-50 dark:bg-slate-700 rounded-lg flex items-center justify-center text-marine-600 dark:text-marine-400 mb-6 group-hover:bg-marine-100 dark:group-hover:bg-marine-900/50 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{title}</h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                {description}
            </p>
        </div>
    );
}
