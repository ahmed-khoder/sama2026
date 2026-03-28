'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Search, Package, Truck, Ship, Plane, CheckCircle2,
    Clock, MapPin, AlertCircle, Loader2, Box, Calendar
} from 'lucide-react';

// Mock shipment data
const mockShipments: Record<string, ShipmentData> = {
    'SAMA-2024-001': {
        id: 'SAMA-2024-001',
        status: 'in_transit',
        type: 'sea',
        origin: { ar: 'شنغهاي، الصين', en: 'Shanghai, China' },
        destination: { ar: 'الإسكندرية، مصر', en: 'Alexandria, Egypt' },
        estimatedDelivery: '2024-12-25',
        weight: '2,500 kg',
        description: { ar: 'معدات إلكترونية', en: 'Electronic Equipment' },
        timeline: [
            { status: 'picked_up', date: '2024-12-01', completed: true },
            { status: 'in_warehouse', date: '2024-12-03', completed: true },
            { status: 'shipped', date: '2024-12-05', completed: true },
            { status: 'in_transit', date: '2024-12-10', completed: true },
            { status: 'customs', date: '2024-12-20', completed: false },
            { status: 'delivered', date: '2024-12-25', completed: false },
        ],
    },
    'SAMA-2024-002': {
        id: 'SAMA-2024-002',
        status: 'customs',
        type: 'air',
        origin: { ar: 'دبي، الإمارات', en: 'Dubai, UAE' },
        destination: { ar: 'القاهرة، مصر', en: 'Cairo, Egypt' },
        estimatedDelivery: '2024-12-18',
        weight: '150 kg',
        description: { ar: 'عينات تجارية', en: 'Commercial Samples' },
        timeline: [
            { status: 'picked_up', date: '2024-12-12', completed: true },
            { status: 'in_warehouse', date: '2024-12-13', completed: true },
            { status: 'shipped', date: '2024-12-14', completed: true },
            { status: 'in_transit', date: '2024-12-15', completed: true },
            { status: 'customs', date: '2024-12-16', completed: true },
            { status: 'delivered', date: '2024-12-18', completed: false },
        ],
    },
};

interface ShipmentData {
    id: string;
    status: string;
    type: 'sea' | 'air' | 'land';
    origin: { ar: string; en: string };
    destination: { ar: string; en: string };
    estimatedDelivery: string;
    weight: string;
    description: { ar: string; en: string };
    timeline: Array<{
        status: string;
        date: string;
        completed: boolean;
    }>;
}

const statusLabels: Record<string, { ar: string; en: string; color: string }> = {
    picked_up: { ar: 'تم الاستلام', en: 'Picked Up', color: 'text-blue-500' },
    in_warehouse: { ar: 'في المستودع', en: 'In Warehouse', color: 'text-purple-500' },
    shipped: { ar: 'تم الشحن', en: 'Shipped', color: 'text-indigo-500' },
    in_transit: { ar: 'في الطريق', en: 'In Transit', color: 'text-amber-500' },
    customs: { ar: 'التخليص الجمركي', en: 'Customs Clearance', color: 'text-orange-500' },
    delivered: { ar: 'تم التوصيل', en: 'Delivered', color: 'text-green-500' },
};

export default function LiveShipmentTracker() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    const [trackingNumber, setTrackingNumber] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [shipment, setShipment] = useState<ShipmentData | null>(null);
    const [error, setError] = useState('');

    const handleSearch = () => {
        if (!trackingNumber.trim()) return;

        setIsSearching(true);
        setError('');

        // Simulate API call
        setTimeout(() => {
            const found = mockShipments[trackingNumber.toUpperCase()];
            if (found) {
                setShipment(found);
                setError('');
            } else {
                setShipment(null);
                setError(isRTL ? 'لم يتم العثور على الشحنة' : 'Shipment not found');
            }
            setIsSearching(false);
        }, 1500);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'sea': return Ship;
            case 'air': return Plane;
            case 'land': return Truck;
            default: return Package;
        }
    };

    const TypeIcon = shipment ? getTypeIcon(shipment.type) : Package;

    return (
        <section className="py-24 bg-white dark:bg-slate-950 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-dot-pattern" />

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-marine-100 dark:bg-marine-900/30 text-marine-600 dark:text-marine-400 text-sm font-bold mb-4">
                        <MapPin className="w-4 h-4" />
                        <span>{isRTL ? 'تتبع الشحنات' : 'Track Shipment'}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        {isRTL ? 'تتبع شحنتك الآن' : 'Track Your Shipment'}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {isRTL
                            ? 'أدخل رقم التتبع لمعرفة موقع شحنتك في الوقت الفعلي'
                            : 'Enter your tracking number to see your shipment status in real-time'}
                    </p>
                </motion.div>

                {/* Search Box */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-2xl mx-auto mb-12"
                >
                    <div className="glass-card-premium rounded-2xl p-6">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    placeholder={isRTL ? 'أدخل رقم التتبع (مثال: SAMA-2024-001)' : 'Enter tracking number (e.g., SAMA-2024-001)'}
                                    className="w-full p-4 pr-12 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-brand-orange focus:outline-none transition-colors"
                                />
                                <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            </div>
                            <button
                                onClick={handleSearch}
                                disabled={isSearching || !trackingNumber.trim()}
                                className="btn-premium text-white px-8 flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSearching ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Search className="w-5 h-5" />
                                )}
                                <span className="hidden md:inline">{isRTL ? 'تتبع' : 'Track'}</span>
                            </button>
                        </div>

                        {/* Demo hint */}
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
                            {isRTL
                                ? 'للتجربة استخدم: SAMA-2024-001 أو SAMA-2024-002'
                                : 'Try: SAMA-2024-001 or SAMA-2024-002'}
                        </p>
                    </div>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="max-w-2xl mx-auto mb-8"
                        >
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3 text-red-600 dark:text-red-400">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Shipment Details */}
                <AnimatePresence>
                    {shipment && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="max-w-4xl mx-auto"
                        >
                            <div className="glass-card-premium rounded-3xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-marine-600 to-marine-700 p-6 text-white">
                                    <div className="flex items-center justify-between flex-wrap gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center">
                                                <TypeIcon className="w-7 h-7" />
                                            </div>
                                            <div>
                                                <p className="text-sm opacity-80">{isRTL ? 'رقم التتبع' : 'Tracking Number'}</p>
                                                <p className="text-xl font-bold">{shipment.id}</p>
                                            </div>
                                        </div>
                                        <div className={`px-4 py-2 rounded-full bg-white/20 ${statusLabels[shipment.status]?.color || ''} font-bold`}>
                                            {isRTL
                                                ? statusLabels[shipment.status]?.ar
                                                : statusLabels[shipment.status]?.en}
                                        </div>
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-6 md:p-8">
                                    {/* Route Info */}
                                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">{isRTL ? 'من' : 'From'}</p>
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {isRTL ? shipment.origin.ar : shipment.origin.en}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                                                <MapPin className="w-6 h-6 text-brand-orange" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">{isRTL ? 'إلى' : 'To'}</p>
                                                <p className="font-bold text-gray-900 dark:text-white">
                                                    {isRTL ? shipment.destination.ar : shipment.destination.en}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl">
                                        <div className="text-center">
                                            <Box className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                            <p className="text-xs text-gray-500">{isRTL ? 'الوزن' : 'Weight'}</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{shipment.weight}</p>
                                        </div>
                                        <div className="text-center">
                                            <Package className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                            <p className="text-xs text-gray-500">{isRTL ? 'الوصف' : 'Description'}</p>
                                            <p className="font-bold text-gray-900 dark:text-white text-sm">
                                                {isRTL ? shipment.description.ar : shipment.description.en}
                                            </p>
                                        </div>
                                        <div className="text-center">
                                            <TypeIcon className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                            <p className="text-xs text-gray-500">{isRTL ? 'نوع الشحن' : 'Shipping Type'}</p>
                                            <p className="font-bold text-gray-900 dark:text-white capitalize">{shipment.type}</p>
                                        </div>
                                        <div className="text-center">
                                            <Calendar className="w-5 h-5 mx-auto text-gray-400 mb-1" />
                                            <p className="text-xs text-gray-500">{isRTL ? 'التوصيل المتوقع' : 'Est. Delivery'}</p>
                                            <p className="font-bold text-brand-orange">{shipment.estimatedDelivery}</p>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div>
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-6">
                                            {isRTL ? 'مسار الشحنة' : 'Shipment Timeline'}
                                        </h4>
                                        <div className="relative">
                                            {shipment.timeline.map((step, index) => {
                                                const isLast = index === shipment.timeline.length - 1;
                                                return (
                                                    <div key={index} className="flex gap-4 pb-6">
                                                        {/* Line & Dot */}
                                                        <div className="flex flex-col items-center">
                                                            <motion.div
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: index * 0.1 }}
                                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${step.completed
                                                                        ? 'bg-green-500 text-white'
                                                                        : 'bg-gray-200 dark:bg-slate-700 text-gray-400'
                                                                    }`}
                                                            >
                                                                {step.completed ? (
                                                                    <CheckCircle2 className="w-4 h-4" />
                                                                ) : (
                                                                    <Clock className="w-4 h-4" />
                                                                )}
                                                            </motion.div>
                                                            {!isLast && (
                                                                <div className={`w-0.5 flex-1 mt-2 ${step.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-slate-700'
                                                                    }`} />
                                                            )}
                                                        </div>
                                                        {/* Content */}
                                                        <div className="flex-1 pb-2">
                                                            <div className="flex items-center justify-between">
                                                                <p className={`font-bold ${step.completed ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                                                                    }`}>
                                                                    {isRTL
                                                                        ? statusLabels[step.status]?.ar
                                                                        : statusLabels[step.status]?.en}
                                                                </p>
                                                                <p className="text-sm text-gray-500">{step.date}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </section>
    );
}
