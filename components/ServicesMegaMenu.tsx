'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Ship, Plane, Truck, FileCheck, Warehouse, Shield, ChevronDown, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Icon mapping
const iconMap: Record<string, any> = {
    Ship, Plane, Truck, FileCheck, Warehouse, Shield
};

interface ServiceItem {
    id: string;
    slug: string;
    iconName: string;
    titleAr: string;
    titleEn: string;
    shortDescAr: string;
    shortDescEn: string;
    color: string;
    isActive: boolean;
}

export default function ServicesMegaMenu() {
    const { language, t } = useLanguage();
    const isRTL = language === 'ar';
    const [isOpen, setIsOpen] = useState(false);
    const [services, setServices] = useState<ServiceItem[]>([]);

    useEffect(() => {
        fetch('/api/cms/services')
            .then(res => res.ok ? res.json() : [])
            .then(data => setServices(data.filter((s: ServiceItem) => s.isActive !== false)))
            .catch(() => []);
    }, []);

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Trigger */}
            <Link
                href="/services"
                className="relative px-4 py-2 rounded-md group transition-colors flex items-center gap-1"
            >
                <span className={`text-sm font-medium transition-colors duration-200 ${isOpen ? 'text-marine-700 dark:text-brand-orange' : 'text-gray-600 dark:text-gray-300'}`}>
                    {t('services')}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-marine-700 dark:text-brand-orange' : 'text-gray-400'}`} />

                {/* Underline */}
                <span className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-marine-600 to-brand-orange transform transition-transform duration-300 origin-center ${isOpen ? 'scale-x-100' : 'scale-x-0'}`} />
            </Link>

            {/* Mega Menu Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className={`absolute top-full ${isRTL ? 'right-0' : 'left-0'} mt-2 w-[600px] max-w-[90vw] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-slate-800 overflow-hidden z-50`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-marine-600 to-marine-700 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-bold text-lg">{isRTL ? 'خدماتنا اللوجستية' : 'Our Logistics Services'}</h3>
                                <p className="text-marine-200 text-sm">{isRTL ? 'حلول متكاملة لكل احتياجاتك' : 'Complete solutions for all your needs'}</p>
                            </div>
                            <Sparkles className="w-8 h-8 text-brand-orange" />
                        </div>

                        {/* Services Grid */}
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {services.slice(0, 6).map((service) => {
                                const Icon = iconMap[service.iconName] || Ship;
                                return (
                                    <Link
                                        key={service.id}
                                        href={`/services/${service.slug}`}
                                        className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
                                    >
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform"
                                            style={{ backgroundColor: service.color }}
                                        >
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 dark:text-white text-sm group-hover:text-marine-600 dark:group-hover:text-marine-400 transition-colors">
                                                {isRTL ? service.titleAr : service.titleEn}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                                                {isRTL ? service.shortDescAr : service.shortDescEn}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Footer CTA */}
                        <div className="bg-gray-50 dark:bg-slate-800/50 px-6 py-3 flex items-center justify-between border-t border-gray-100 dark:border-slate-800">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {services.length} {isRTL ? 'خدمة متاحة' : 'services available'}
                            </span>
                            <Link
                                href="/services"
                                className="flex items-center gap-1.5 text-sm font-bold text-marine-600 dark:text-marine-400 hover:text-brand-orange transition-colors"
                            >
                                {isRTL ? 'عرض جميع الخدمات' : 'View All Services'}
                                {isRTL ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
