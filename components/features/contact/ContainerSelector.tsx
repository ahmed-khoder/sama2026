'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronDown, Box, Snowflake, Package, Layers, Droplets, LayoutGrid } from 'lucide-react';

// Container image mapping
const containerImages: Record<string, string> = {
    '20ft-standard': "/images/container/20' Standard Dry.png",
    '40ft-standard': "/images/container/40' Standard Dry.png",
    '40ft-hc': "/images/container/45' High Cube.png",
    '45ft-hc': "/images/container/45' High Cube.png",
    '20ft-reefer': "/images/container/20' Reefer.png",
    '40ft-reefer': "/images/container/40' Reefer.png",
    '40ft-hc-reefer': "/images/container/40' High Cube Reefer.png",
    '20ft-open-top': "/images/container/20' Open Top.png",
    '40ft-open-top': "/images/container/40' Open Top.png",
    '20ft-flat-rack': "/images/container/20' Flat Rack.webp",
    '40ft-flat-rack': "/images/container/40' Flat Rack.webp",
    '20ft-tank': "/images/container/20' Tank Container.png",
    '20ft-platform': "/images/container/20' Platform.png",
    '40ft-platform': "/images/container/20' Platform.png",
};

// Container type icons as SVG components for better rendering
const ContainerIcons = {
    dry: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 48 32" {...props}>
            <rect x="2" y="6" width="44" height="22" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="6" y="10" width="8" height="14" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
            <line x1="40" y1="10" x2="40" y2="24" stroke="currentColor" strokeWidth="1.5" />
            <line x1="42" y1="13" x2="44" y2="13" stroke="currentColor" strokeWidth="1" />
            <line x1="42" y1="16" x2="44" y2="16" stroke="currentColor" strokeWidth="1" />
        </svg>
    ),
    reefer: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 48 32" {...props}>
            <rect x="2" y="6" width="44" height="22" rx="1" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4" y="8" width="8" height="18" fill="currentColor" opacity="0.3" />
            <circle cx="8" cy="17" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
            <path d="M8 14v6M5 17h6" stroke="currentColor" strokeWidth="0.75" />
            <line x1="40" y1="10" x2="40" y2="24" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    'open-top': (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 48 32" {...props}>
            <path d="M2 8v18a2 2 0 002 2h40a2 2 0 002-2V8" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M4 6h40" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
            <line x1="40" y1="10" x2="40" y2="24" stroke="currentColor" strokeWidth="1.5" />
        </svg>
    ),
    'flat-rack': (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 48 32" {...props}>
            <rect x="2" y="24" width="44" height="4" rx="1" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4" y="8" width="4" height="16" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1" />
            <rect x="40" y="8" width="4" height="16" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1" />
        </svg>
    ),
    tank: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 48 32" {...props}>
            <rect x="2" y="6" width="44" height="22" rx="1" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.3" />
            <ellipse cx="24" cy="17" rx="18" ry="8" fill="currentColor" opacity="0.2" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="24" cy="9" r="3" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1" />
        </svg>
    ),
    platform: (props: React.SVGProps<SVGSVGElement>) => (
        <svg viewBox="0 0 48 32" {...props}>
            <rect x="2" y="22" width="44" height="6" rx="1" fill="currentColor" opacity="0.3" stroke="currentColor" strokeWidth="1.5" />
            <rect x="4" y="20" width="4" height="2" fill="currentColor" />
            <rect x="40" y="20" width="4" height="2" fill="currentColor" />
        </svg>
    ),
};

// Complete container types with accurate dimensions
export const containerTypes = [
    // Standard Dry Containers
    {
        id: '20ft-standard',
        nameAr: 'حاوية 20 قدم قياسية',
        nameEn: "20' Standard Dry",
        length: '5.90m',
        width: '2.35m',
        height: '2.39m',
        capacity: '33.2 CBM',
        maxWeight: '28,200 kg',
        tareWeight: '2,300 kg',
        category: 'dry',
        color: 'text-blue-600',
    },
    {
        id: '40ft-standard',
        nameAr: 'حاوية 40 قدم قياسية',
        nameEn: "40' Standard Dry",
        length: '12.03m',
        width: '2.35m',
        height: '2.39m',
        capacity: '67.7 CBM',
        maxWeight: '28,750 kg',
        tareWeight: '3,750 kg',
        category: 'dry',
        color: 'text-blue-600',
    },
    {
        id: '40ft-hc',
        nameAr: 'حاوية 40 قدم عالية',
        nameEn: "40' High Cube",
        length: '12.03m',
        width: '2.35m',
        height: '2.70m',
        capacity: '76.3 CBM',
        maxWeight: '28,580 kg',
        tareWeight: '3,940 kg',
        category: 'dry',
        color: 'text-blue-700',
    },
    {
        id: '45ft-hc',
        nameAr: 'حاوية 45 قدم عالية',
        nameEn: "45' High Cube",
        length: '13.56m',
        width: '2.35m',
        height: '2.70m',
        capacity: '86.0 CBM',
        maxWeight: '27,600 kg',
        tareWeight: '4,800 kg',
        category: 'dry',
        color: 'text-blue-800',
    },
    // Refrigerated Containers (Reefers)
    {
        id: '20ft-reefer',
        nameAr: 'حاوية 20 قدم مبردة',
        nameEn: "20' Reefer",
        length: '5.44m',
        width: '2.29m',
        height: '2.27m',
        capacity: '28.3 CBM',
        maxWeight: '27,400 kg',
        tareWeight: '3,080 kg',
        tempRange: '-30°C to +30°C',
        category: 'reefer',
        color: 'text-cyan-600',
    },
    {
        id: '40ft-reefer',
        nameAr: 'حاوية 40 قدم مبردة',
        nameEn: "40' Reefer",
        length: '11.56m',
        width: '2.29m',
        height: '2.25m',
        capacity: '59.3 CBM',
        maxWeight: '29,520 kg',
        tareWeight: '4,480 kg',
        tempRange: '-30°C to +30°C',
        category: 'reefer',
        color: 'text-cyan-600',
    },
    {
        id: '40ft-hc-reefer',
        nameAr: 'حاوية 40 قدم مبردة عالية',
        nameEn: "40' High Cube Reefer",
        length: '11.56m',
        width: '2.29m',
        height: '2.55m',
        capacity: '67.5 CBM',
        maxWeight: '29,180 kg',
        tareWeight: '4,820 kg',
        tempRange: '-30°C to +30°C',
        category: 'reefer',
        color: 'text-cyan-700',
    },
    // Open Top Containers
    {
        id: '20ft-open-top',
        nameAr: 'حاوية 20 قدم مفتوحة',
        nameEn: "20' Open Top",
        length: '5.89m',
        width: '2.34m',
        height: '2.31m',
        capacity: '32.0 CBM',
        maxWeight: '28,130 kg',
        tareWeight: '2,370 kg',
        category: 'open-top',
        color: 'text-amber-600',
    },
    {
        id: '40ft-open-top',
        nameAr: 'حاوية 40 قدم مفتوحة',
        nameEn: "40' Open Top",
        length: '12.03m',
        width: '2.34m',
        height: '2.31m',
        capacity: '65.0 CBM',
        maxWeight: '26,630 kg',
        tareWeight: '3,870 kg',
        category: 'open-top',
        color: 'text-amber-600',
    },
    // Flat Rack Containers
    {
        id: '20ft-flat-rack',
        nameAr: 'حاوية 20 قدم مسطحة',
        nameEn: "20' Flat Rack",
        length: '5.62m',
        width: '2.20m',
        height: '2.23m',
        capacity: '-',
        maxWeight: '28,480 kg',
        tareWeight: '2,520 kg',
        category: 'flat-rack',
        color: 'text-purple-600',
    },
    {
        id: '40ft-flat-rack',
        nameAr: 'حاوية 40 قدم مسطحة',
        nameEn: "40' Flat Rack",
        length: '12.13m',
        width: '2.20m',
        height: '2.00m',
        capacity: '-',
        maxWeight: '40,000 kg',
        tareWeight: '5,000 kg',
        category: 'flat-rack',
        color: 'text-purple-600',
    },
    // Tank Containers
    {
        id: '20ft-tank',
        nameAr: 'حاوية صهريج 20 قدم',
        nameEn: "20' Tank Container",
        length: '6.06m',
        width: '2.44m',
        height: '2.59m',
        capacity: '21,000 - 26,000 L',
        maxWeight: '36,000 kg',
        tareWeight: '3,070 kg',
        category: 'tank',
        color: 'text-green-600',
    },
    // Platform Containers
    {
        id: '20ft-platform',
        nameAr: 'منصة 20 قدم',
        nameEn: "20' Platform",
        length: '6.06m',
        width: '2.44m',
        height: '-',
        capacity: '-',
        maxWeight: '31,280 kg',
        tareWeight: '2,220 kg',
        category: 'platform',
        color: 'text-gray-600',
    },
    {
        id: '40ft-platform',
        nameAr: 'منصة 40 قدم',
        nameEn: "40' Platform",
        length: '12.19m',
        width: '2.44m',
        height: '-',
        capacity: '-',
        maxWeight: '39,200 kg',
        tareWeight: '5,800 kg',
        category: 'platform',
        color: 'text-gray-600',
    },
];

export type ContainerType = typeof containerTypes[0];

const categoryLabels = {
    dry: { ar: 'حاويات جافة', en: 'Dry Containers', icon: Box },
    reefer: { ar: 'حاويات مبردة', en: 'Reefer Containers', icon: Snowflake },
    'open-top': { ar: 'حاويات مفتوحة', en: 'Open Top', icon: Package },
    'flat-rack': { ar: 'حاويات مسطحة', en: 'Flat Rack', icon: Layers },
    tank: { ar: 'حاويات صهريج', en: 'Tank Containers', icon: Droplets },
    platform: { ar: 'منصات', en: 'Platforms', icon: LayoutGrid },
};

interface ContainerSelectorProps {
    value: string | null;
    onChange: (containerType: ContainerType | null) => void;
    language?: 'ar' | 'en';
    error?: string;
}

export default function ContainerSelector({
    value,
    onChange,
    language = 'ar',
    error,
}: ContainerSelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const selectedContainer = containerTypes.find(c => c.id === value);

    const handleSelect = (container: ContainerType) => {
        onChange(container);
        setIsOpen(false);
    };

    // Group containers by category
    const groupedContainers = containerTypes.reduce((acc, container) => {
        const cat = container.category;
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(container);
        return acc;
    }, {} as Record<string, ContainerType[]>);

    const getContainerIcon = (category: string) => {
        const IconComponent = ContainerIcons[category as keyof typeof ContainerIcons];
        return IconComponent || ContainerIcons.dry;
    };

    return (
        <div className="space-y-4">
            {/* Dropdown Selector */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "w-full flex items-center justify-between px-4 py-3 rounded-lg bg-gray-50 dark:bg-slate-800 border transition-all duration-200",
                        error
                            ? "border-red-500"
                            : "border-gray-200 dark:border-slate-700 hover:border-marine-500 focus:border-marine-500 focus:ring-2 focus:ring-marine-200 dark:focus:ring-marine-800"
                    )}
                >
                    <div className="flex items-center gap-3">
                        {selectedContainer && (
                            <div className="w-12 h-8 relative bg-white dark:bg-slate-600 rounded-md overflow-hidden flex-shrink-0">
                                {containerImages[selectedContainer.id] ? (
                                    <Image
                                        src={containerImages[selectedContainer.id]}
                                        alt={language === 'ar' ? selectedContainer.nameAr : selectedContainer.nameEn}
                                        fill
                                        unoptimized
                                        className="object-contain p-0.5"
                                        sizes="48px"
                                    />
                                ) : (
                                    <div className={cn("w-full h-full flex items-center justify-center", selectedContainer.color)}>
                                        {React.createElement(getContainerIcon(selectedContainer.category), { className: "w-full h-full" })}
                                    </div>
                                )}
                            </div>
                        )}
                        <span className={cn(
                            "text-sm",
                            selectedContainer
                                ? "text-gray-900 dark:text-white font-medium"
                                : "text-gray-400 dark:text-gray-500"
                        )}>
                            {selectedContainer
                                ? (language === 'ar' ? selectedContainer.nameAr : selectedContainer.nameEn)
                                : (language === 'ar' ? 'اختر نوع الحاوية' : 'Select container type')
                            }
                        </span>
                    </div>
                    <ChevronDown className={cn(
                        "w-5 h-5 text-gray-400 transition-transform duration-200",
                        isOpen && "rotate-180"
                    )} />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
                        >
                            <div className="max-h-96 overflow-y-auto">
                                {Object.entries(groupedContainers).map(([category, containers]) => {
                                    const categoryInfo = categoryLabels[category as keyof typeof categoryLabels];
                                    const CategoryIcon = categoryInfo?.icon || Box;

                                    return (
                                        <div key={category}>
                                            {/* Category Header */}
                                            <div className="sticky top-0 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-xs font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide flex items-center gap-2">
                                                <CategoryIcon className="w-3.5 h-3.5" />
                                                {language === 'ar' ? categoryInfo?.ar : categoryInfo?.en}
                                            </div>

                                            {containers.map((container) => {
                                                const ContainerIcon = getContainerIcon(container.category);

                                                return (
                                                    <button
                                                        key={container.id}
                                                        type="button"
                                                        onClick={() => handleSelect(container)}
                                                        className={cn(
                                                            "w-full flex items-center gap-3 px-4 py-3 transition-colors text-left rtl:text-right",
                                                            value === container.id
                                                                ? "bg-marine-50 dark:bg-marine-900/30 text-marine-700 dark:text-marine-300"
                                                                : "hover:bg-gray-50 dark:hover:bg-slate-700"
                                                        )}
                                                    >
                                                        <div className="w-16 h-10 relative flex-shrink-0 bg-white dark:bg-slate-600 rounded-lg overflow-hidden">
                                                            {containerImages[container.id] ? (
                                                                <Image
                                                                    src={containerImages[container.id]}
                                                                    alt={language === 'ar' ? container.nameAr : container.nameEn}
                                                                    fill
                                                                    unoptimized
                                                                    className="object-contain p-1"
                                                                    sizes="64px"
                                                                />
                                                            ) : (
                                                                <ContainerIcon className={cn("w-full h-full p-1", container.color)} />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                                                                {language === 'ar' ? container.nameAr : container.nameEn}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                {container.length} × {container.width} × {container.height}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs font-mono text-gray-400 shrink-0">
                                                            {container.capacity}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Error Message */}
            {error && (
                <p className="text-sm text-red-500">{error}</p>
            )}

            {/* Container Preview with Icon */}
            <AnimatePresence>
                {selectedContainer && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl border border-gray-200 dark:border-slate-700">
                            <div className="flex flex-col md:flex-row gap-6 items-center">
                                {/* Container Image */}
                                <motion.div
                                    className="w-44 h-32 md:w-56 md:h-40 relative rounded-2xl overflow-hidden flex-shrink-0 group cursor-pointer"
                                    initial={{ scale: 0.6, opacity: 0, rotateY: -30, rotateX: 10 }}
                                    animate={{
                                        scale: 1,
                                        opacity: 1,
                                        rotateY: 0,
                                        rotateX: 0,
                                        y: [0, -10, 0],
                                        boxShadow: [
                                            "0 10px 30px -10px rgba(0,0,0,0.3)",
                                            "0 20px 40px -10px rgba(0,0,0,0.4)",
                                            "0 10px 30px -10px rgba(0,0,0,0.3)"
                                        ]
                                    }}
                                    transition={{
                                        duration: 0.6,
                                        type: "spring",
                                        stiffness: 100,
                                        y: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        },
                                        boxShadow: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }}
                                    whileHover={{
                                        scale: 1.12,
                                        rotateY: 8,
                                        rotateX: -5,
                                        y: -15,
                                        boxShadow: "0 30px 60px -15px rgba(249, 115, 22, 0.4)",
                                        transition: { duration: 0.3, type: "spring", stiffness: 300 }
                                    }}
                                    style={{ perspective: 1000, transformStyle: "preserve-3d" }}
                                >
                                    {/* Gradient Background - supports dark mode */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-slate-800 dark:via-slate-700 dark:to-slate-900" />

                                    {/* Subtle animated overlay for depth */}
                                    <motion.div
                                        className="absolute inset-0 opacity-30 dark:opacity-20"
                                        animate={{
                                            background: [
                                                "radial-gradient(circle at 20% 20%, rgba(249,115,22,0.15) 0%, transparent 50%)",
                                                "radial-gradient(circle at 80% 80%, rgba(249,115,22,0.15) 0%, transparent 50%)",
                                                "radial-gradient(circle at 20% 20%, rgba(249,115,22,0.15) 0%, transparent 50%)"
                                            ]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    />

                                    {/* Shine Sweep Effect */}
                                    <div className="absolute inset-0 overflow-hidden">
                                        <motion.div
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -skew-x-12"
                                            initial={{ x: "-200%" }}
                                            animate={{ x: "200%" }}
                                            transition={{
                                                duration: 3,
                                                repeat: Infinity,
                                                repeatDelay: 2,
                                                ease: "easeInOut"
                                            }}
                                        />
                                    </div>


                                    {containerImages[selectedContainer.id] ? (
                                        <motion.div
                                            className="relative w-full h-full z-10"
                                            whileHover={{ scale: 1.08 }}
                                            transition={{ type: "spring", stiffness: 400 }}
                                        >
                                            <Image
                                                src={containerImages[selectedContainer.id]}
                                                alt={language === 'ar' ? selectedContainer.nameAr : selectedContainer.nameEn}
                                                fill
                                                unoptimized
                                                className="object-contain p-3 drop-shadow-xl"
                                                sizes="(max-width: 768px) 176px, 224px"
                                                priority
                                            />
                                        </motion.div>
                                    ) : (
                                        <div className={cn("w-full h-full flex items-center justify-center p-4 relative z-10", selectedContainer.color)}>
                                            {React.createElement(getContainerIcon(selectedContainer.category), {
                                                className: "w-full h-full"
                                            })}
                                        </div>
                                    )}
                                </motion.div>

                                {/* Specifications */}
                                <div className="flex-1 text-center md:text-start">
                                    <h4 className="font-bold text-lg text-marine-900 dark:text-white mb-3">
                                        {language === 'ar' ? selectedContainer.nameAr : selectedContainer.nameEn}
                                    </h4>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                                {language === 'ar' ? 'الطول' : 'Length'}
                                            </p>
                                            <p className="text-sm font-bold text-marine-600 dark:text-marine-400">
                                                {selectedContainer.length}
                                            </p>
                                        </div>
                                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                                {language === 'ar' ? 'العرض' : 'Width'}
                                            </p>
                                            <p className="text-sm font-bold text-marine-600 dark:text-marine-400">
                                                {selectedContainer.width}
                                            </p>
                                        </div>
                                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                                {language === 'ar' ? 'الارتفاع' : 'Height'}
                                            </p>
                                            <p className="text-sm font-bold text-marine-600 dark:text-marine-400">
                                                {selectedContainer.height}
                                            </p>
                                        </div>
                                        <div className="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                                                {language === 'ar' ? 'السعة' : 'Capacity'}
                                            </p>
                                            <p className="text-sm font-bold text-brand-orange">
                                                {selectedContainer.capacity}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Additional Info */}
                                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex flex-wrap justify-center md:justify-start gap-4 text-xs">
                                        <span className="text-gray-500 dark:text-gray-400">
                                            <span className="font-medium">{language === 'ar' ? 'أقصى وزن:' : 'Max Weight:'}</span> {selectedContainer.maxWeight}
                                        </span>
                                        <span className="text-gray-500 dark:text-gray-400">
                                            <span className="font-medium">{language === 'ar' ? 'وزن الحاوية:' : 'Tare Weight:'}</span> {selectedContainer.tareWeight}
                                        </span>
                                        {'tempRange' in selectedContainer && selectedContainer.tempRange && (
                                            <span className="text-cyan-600 dark:text-cyan-400">
                                                <span className="font-medium">{language === 'ar' ? 'نطاق الحرارة:' : 'Temp Range:'}</span> {selectedContainer.tempRange}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
