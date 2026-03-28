'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import {
    Ship, Plane, Truck, Package, ArrowRight, ArrowLeft,
    Calculator, MapPin, Weight, Box, CheckCircle2, Loader2
} from 'lucide-react';

// Shipping types configuration
const shippingTypes = [
    { id: 'sea', icon: Ship, nameAr: 'شحن بحري', nameEn: 'Sea Freight', baseRate: 50, perKg: 2 },
    { id: 'air', icon: Plane, nameAr: 'شحن جوي', nameEn: 'Air Freight', baseRate: 150, perKg: 8 },
    { id: 'land', icon: Truck, nameAr: 'نقل بري', nameEn: 'Land Transport', baseRate: 30, perKg: 1.5 },
];

// Popular routes
const popularRoutes = [
    { from: { ar: 'الصين', en: 'China' }, to: { ar: 'مصر', en: 'Egypt' }, multiplier: 1.2 },
    { from: { ar: 'تركيا', en: 'Turkey' }, to: { ar: 'مصر', en: 'Egypt' }, multiplier: 0.8 },
    { from: { ar: 'الإمارات', en: 'UAE' }, to: { ar: 'مصر', en: 'Egypt' }, multiplier: 0.9 },
    { from: { ar: 'السعودية', en: 'Saudi Arabia' }, to: { ar: 'مصر', en: 'Egypt' }, multiplier: 0.7 },
    { from: { ar: 'ألمانيا', en: 'Germany' }, to: { ar: 'مصر', en: 'Egypt' }, multiplier: 1.3 },
];

interface QuoteResult {
    basePrice: number;
    weightCharge: number;
    routeMultiplier: number;
    totalPrice: number;
    estimatedDays: string;
}

export default function QuoteCalculator() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';

    // Form state
    const [shippingType, setShippingType] = useState('sea');
    const [selectedRoute, setSelectedRoute] = useState(0);
    const [weight, setWeight] = useState('');
    const [dimensions, setDimensions] = useState({ length: '', width: '', height: '' });
    const [isCalculating, setIsCalculating] = useState(false);
    const [result, setResult] = useState<QuoteResult | null>(null);
    const [step, setStep] = useState(1);

    const calculateQuote = () => {
        setIsCalculating(true);

        // Simulate API call
        setTimeout(() => {
            const selectedType = shippingTypes.find(t => t.id === shippingType)!;
            const route = popularRoutes[selectedRoute];
            const weightNum = parseFloat(weight) || 0;

            // Calculate volumetric weight
            const volumetricWeight = (
                (parseFloat(dimensions.length) || 0) *
                (parseFloat(dimensions.width) || 0) *
                (parseFloat(dimensions.height) || 0)
            ) / 5000;

            const chargeableWeight = Math.max(weightNum, volumetricWeight);

            const basePrice = selectedType.baseRate;
            const weightCharge = chargeableWeight * selectedType.perKg;
            const routeMultiplier = route.multiplier;
            const totalPrice = (basePrice + weightCharge) * routeMultiplier;

            // Estimate delivery days
            let estimatedDays = '';
            if (shippingType === 'air') estimatedDays = '3-5';
            else if (shippingType === 'sea') estimatedDays = '20-30';
            else estimatedDays = '7-14';

            setResult({
                basePrice,
                weightCharge,
                routeMultiplier,
                totalPrice: Math.round(totalPrice),
                estimatedDays,
            });

            setIsCalculating(false);
            setStep(3);
        }, 1500);
    };

    const resetCalculator = () => {
        setStep(1);
        setResult(null);
        setWeight('');
        setDimensions({ length: '', width: '', height: '' });
    };

    return (
        <section className="py-24 bg-gradient-to-b from-marine-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-96 h-96 bg-brand-orange rounded-full blur-[150px]" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-marine-500 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-bold mb-4">
                        <Calculator className="w-4 h-4" />
                        <span>{isRTL ? 'حاسبة الأسعار' : 'Price Calculator'}</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        {isRTL ? 'احسب تكلفة شحنتك' : 'Calculate Your Shipment Cost'}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {isRTL
                            ? 'احصل على عرض سعر تقديري فوري لشحنتك'
                            : 'Get an instant estimated quote for your shipment'}
                    </p>
                </motion.div>

                {/* Calculator Card */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="max-w-4xl mx-auto"
                >
                    <div className="glass-card-premium rounded-3xl p-8 md:p-12">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-center gap-4 mb-10">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className="flex items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                                ? 'bg-brand-orange text-white'
                                                : 'bg-gray-200 dark:bg-slate-700 text-gray-500'
                                            }`}
                                    >
                                        {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                                    </div>
                                    {s < 3 && (
                                        <div
                                            className={`w-16 h-1 mx-2 rounded-full transition-all ${step > s ? 'bg-brand-orange' : 'bg-gray-200 dark:bg-slate-700'
                                                }`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            {/* Step 1: Select Shipping Type & Route */}
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                >
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                                        {isRTL ? 'نوع الشحن والمسار' : 'Shipping Type & Route'}
                                    </h3>

                                    {/* Shipping Types */}
                                    <div className="grid grid-cols-3 gap-4 mb-8">
                                        {shippingTypes.map((type) => (
                                            <button
                                                key={type.id}
                                                onClick={() => setShippingType(type.id)}
                                                className={`p-6 rounded-2xl border-2 transition-all ${shippingType === type.id
                                                        ? 'border-brand-orange bg-brand-orange/10'
                                                        : 'border-gray-200 dark:border-slate-700 hover:border-brand-orange/50'
                                                    }`}
                                            >
                                                <type.icon className={`w-8 h-8 mx-auto mb-3 ${shippingType === type.id ? 'text-brand-orange' : 'text-gray-500'
                                                    }`} />
                                                <p className={`text-sm font-bold ${shippingType === type.id ? 'text-brand-orange' : 'text-gray-600 dark:text-gray-400'
                                                    }`}>
                                                    {isRTL ? type.nameAr : type.nameEn}
                                                </p>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Route Selection */}
                                    <div className="mb-8">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">
                                            <MapPin className="w-4 h-4 inline mr-2" />
                                            {isRTL ? 'اختر المسار' : 'Select Route'}
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {popularRoutes.map((route, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => setSelectedRoute(idx)}
                                                    className={`p-4 rounded-xl border-2 text-start transition-all ${selectedRoute === idx
                                                            ? 'border-marine-500 bg-marine-50 dark:bg-marine-900/30'
                                                            : 'border-gray-200 dark:border-slate-700 hover:border-marine-300'
                                                        }`}
                                                >
                                                    <span className="text-gray-900 dark:text-white font-medium">
                                                        {isRTL ? route.from.ar : route.from.en}
                                                    </span>
                                                    <span className="mx-2 text-gray-400">→</span>
                                                    <span className="text-brand-orange font-bold">
                                                        {isRTL ? route.to.ar : route.to.en}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => setStep(2)}
                                        className="w-full btn-premium text-white flex items-center justify-center gap-2"
                                    >
                                        {isRTL ? 'التالي' : 'Next'}
                                        {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                    </button>
                                </motion.div>
                            )}

                            {/* Step 2: Enter Dimensions */}
                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -50 }}
                                >
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                                        {isRTL ? 'تفاصيل الشحنة' : 'Shipment Details'}
                                    </h3>

                                    {/* Weight */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            <Weight className="w-4 h-4 inline mr-2" />
                                            {isRTL ? 'الوزن (كجم)' : 'Weight (kg)'}
                                        </label>
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            placeholder={isRTL ? 'أدخل الوزن' : 'Enter weight'}
                                            className="w-full p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-brand-orange focus:outline-none transition-colors"
                                        />
                                    </div>

                                    {/* Dimensions */}
                                    <div className="mb-8">
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            <Box className="w-4 h-4 inline mr-2" />
                                            {isRTL ? 'الأبعاد (سم)' : 'Dimensions (cm)'}
                                        </label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <input
                                                type="number"
                                                value={dimensions.length}
                                                onChange={(e) => setDimensions({ ...dimensions, length: e.target.value })}
                                                placeholder={isRTL ? 'الطول' : 'Length'}
                                                className="p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-brand-orange focus:outline-none transition-colors"
                                            />
                                            <input
                                                type="number"
                                                value={dimensions.width}
                                                onChange={(e) => setDimensions({ ...dimensions, width: e.target.value })}
                                                placeholder={isRTL ? 'العرض' : 'Width'}
                                                className="p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-brand-orange focus:outline-none transition-colors"
                                            />
                                            <input
                                                type="number"
                                                value={dimensions.height}
                                                onChange={(e) => setDimensions({ ...dimensions, height: e.target.value })}
                                                placeholder={isRTL ? 'الارتفاع' : 'Height'}
                                                className="p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:border-brand-orange focus:outline-none transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            {isRTL ? 'السابق' : 'Back'}
                                        </button>
                                        <button
                                            onClick={calculateQuote}
                                            disabled={!weight}
                                            className="flex-1 btn-premium text-white flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isCalculating ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    {isRTL ? 'جاري الحساب...' : 'Calculating...'}
                                                </>
                                            ) : (
                                                <>
                                                    <Calculator className="w-5 h-5" />
                                                    {isRTL ? 'احسب السعر' : 'Calculate Price'}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {/* Step 3: Results */}
                            {step === 3 && result && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center"
                                >
                                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <CheckCircle2 className="w-10 h-10 text-green-500" />
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                        {isRTL ? 'عرض السعر التقديري' : 'Estimated Quote'}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                                        {isRTL ? 'هذا السعر تقديري وقد يختلف حسب التفاصيل النهائية' : 'This is an estimate and may vary based on final details'}
                                    </p>

                                    {/* Price Display */}
                                    <div className="bg-gradient-to-br from-marine-600 to-marine-800 rounded-2xl p-8 mb-8 text-white">
                                        <p className="text-sm opacity-80 mb-2">{isRTL ? 'السعر الإجمالي التقديري' : 'Estimated Total Price'}</p>
                                        <div className="text-5xl font-black mb-4">
                                            ${result.totalPrice}
                                            <span className="text-lg font-normal opacity-80"> USD</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-sm opacity-80">
                                            <Package className="w-4 h-4" />
                                            <span>
                                                {isRTL ? `وقت التوصيل المتوقع: ${result.estimatedDays} يوم` : `Estimated delivery: ${result.estimatedDays} days`}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Price Breakdown */}
                                    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-6 mb-8 text-start">
                                        <h4 className="font-bold text-gray-900 dark:text-white mb-4">
                                            {isRTL ? 'تفاصيل السعر' : 'Price Breakdown'}
                                        </h4>
                                        <div className="space-y-3 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">{isRTL ? 'السعر الأساسي' : 'Base Rate'}</span>
                                                <span className="font-bold text-gray-900 dark:text-white">${result.basePrice}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">{isRTL ? 'رسوم الوزن' : 'Weight Charge'}</span>
                                                <span className="font-bold text-gray-900 dark:text-white">${result.weightCharge.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">{isRTL ? 'معامل المسار' : 'Route Multiplier'}</span>
                                                <span className="font-bold text-gray-900 dark:text-white">x{result.routeMultiplier}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={resetCalculator}
                                            className="flex-1 py-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 font-bold hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                        >
                                            {isRTL ? 'حساب جديد' : 'New Calculation'}
                                        </button>
                                        <a
                                            href="/contact"
                                            className="flex-1 btn-premium text-white flex items-center justify-center gap-2"
                                        >
                                            {isRTL ? 'طلب عرض رسمي' : 'Request Official Quote'}
                                            {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                        </a>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
