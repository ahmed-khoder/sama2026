'use client';

import React from 'react';

interface FleetFeatureProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function FleetFeature({ icon, title, description }: FleetFeatureProps) {
    return (
        <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-slate-900/50 hover:bg-white dark:hover:bg-slate-800 transition-colors duration-300 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 shadow-sm hover:shadow-md group">
            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-marine-600 dark:text-marine-400 group-hover:text-brand-orange transition-colors shadow-sm">
                {icon}
            </div>
            <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
