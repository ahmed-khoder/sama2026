'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
    id: number;
    nameAr: string;
    nameEn: string;
    roleAr: string;
    roleEn: string;
    companyAr: string;
    companyEn: string;
    contentAr: string;
    contentEn: string;
    image: string;
    rating: number;
}

const testimonials: Testimonial[] = [
    {
        id: 1,
        nameAr: 'محمد العمري',
        nameEn: 'Mohammed Al-Omari',
        roleAr: 'مدير العمليات',
        roleEn: 'Operations Manager',
        companyAr: 'شركة النخبة للتجارة',
        companyEn: 'Elite Trading Co.',
        contentAr: 'تعاملنا مع سما لوجستيك منذ 5 سنوات. خدمة التخليص الجمركي لديهم استثنائية والأسعار تنافسية جداً. فريق محترف يفهم احتياجاتنا.',
        contentEn: 'We have been working with Sama Logistics for 5 years. Their customs clearance service is exceptional and prices are very competitive. A professional team that understands our needs.',
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
        rating: 5,
    },
    {
        id: 2,
        nameAr: 'سارة الحربي',
        nameEn: 'Sara Al-Harbi',
        roleAr: 'مديرة المشتريات',
        roleEn: 'Procurement Director',
        companyAr: 'مجموعة الفيصل',
        companyEn: 'Al-Faisal Group',
        contentAr: 'أفضل شريك لوجستي تعاملنا معه. الشحنات تصل دائماً في الوقت المحدد والتواصل معهم سهل للغاية. أنصح بهم بشدة.',
        contentEn: 'Best logistics partner we have worked with. Shipments always arrive on time and communication with them is very easy. Highly recommend them.',
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
        rating: 5,
    },
    {
        id: 3,
        nameAr: 'أحمد منصور',
        nameEn: 'Ahmed Mansour',
        roleAr: 'الرئيس التنفيذي',
        roleEn: 'CEO',
        companyAr: 'شركة الخليج للصناعات',
        companyEn: 'Gulf Industries',
        contentAr: 'سما لوجستيك حولت تجربة الشحن لدينا تماماً. نظام التتبع الخاص بهم ممتاز ولم نواجه أي مشاكل في التخليص الجمركي.',
        contentEn: 'Sama Logistics completely transformed our shipping experience. Their tracking system is excellent and we never faced any customs clearance issues.',
        image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200',
        rating: 5,
    },
    {
        id: 4,
        nameAr: 'فاطمة السيد',
        nameEn: 'Fatima Al-Sayed',
        roleAr: 'مديرة سلسلة التوريد',
        roleEn: 'Supply Chain Manager',
        companyAr: 'شركة المستقبل',
        companyEn: 'Future Company',
        contentAr: 'خدمة عملاء استثنائية ودعم متواصل على مدار الساعة. فريق سما لوجستيك يعاملنا كشركاء حقيقيين وليس مجرد عملاء.',
        contentEn: 'Exceptional customer service and 24/7 support. Sama Logistics team treats us as real partners, not just clients.',
        image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
        rating: 5,
    },
];

interface TestimonialsCarouselProps {
    autoPlayInterval?: number;
}

export default function TestimonialsCarousel({
    autoPlayInterval = 5000,
}: TestimonialsCarouselProps) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const nextSlide = useCallback(() => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, []);

    const prevSlide = useCallback(() => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }, []);

    // Auto-play
    useEffect(() => {
        const timer = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(timer);
    }, [nextSlide, autoPlayInterval]);

    const current = testimonials[currentIndex];

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0,
        }),
    };

    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute inset-0 opacity-5">
                <div className="absolute top-20 left-10 w-72 h-72 bg-brand-orange rounded-full blur-[120px]" />
                <div className="absolute bottom-20 right-10 w-72 h-72 bg-marine-500 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                        {isRTL ? 'ماذا يقول عملاؤنا' : 'What Our Clients Say'}
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {isRTL
                            ? 'ثقة عملائنا هي أكبر إنجاز نفخر به'
                            : 'Our clients\' trust is our greatest achievement'}
                    </p>
                    <div className="w-20 h-1 bg-gradient-to-r from-brand-orange to-brand-gold mx-auto mt-6 rounded-full" />
                </motion.div>

                {/* Testimonial Card */}
                <div className="max-w-4xl mx-auto relative">
                    {/* Navigation Buttons */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-brand-orange hover:text-white transition-colors"
                        aria-label="Previous testimonial"
                    >
                        {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-brand-orange hover:text-white transition-colors"
                        aria-label="Next testimonial"
                    >
                        {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </button>

                    {/* Card Container */}
                    <div className="relative h-[400px] md:h-[350px] overflow-hidden">
                        <AnimatePresence custom={direction} mode="wait">
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute inset-0"
                            >
                                <div className="glass-card-premium rounded-3xl p-8 md:p-12 h-full flex flex-col justify-center">
                                    {/* Quote Icon */}
                                    <div className="absolute top-6 right-8 opacity-10">
                                        <Quote className="w-20 h-20 text-brand-orange" />
                                    </div>

                                    {/* Rating */}
                                    <div className="flex gap-1 mb-6">
                                        {[...Array(current.rating)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, scale: 0 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                            </motion.div>
                                        ))}
                                    </div>

                                    {/* Content */}
                                    <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 relative z-10">
                                        &quot;{isRTL ? current.contentAr : current.contentEn}&quot;
                                    </p>

                                    {/* Author */}
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={current.image}
                                            alt={isRTL ? current.nameAr : current.nameEn}
                                            className="w-14 h-14 rounded-full object-cover border-2 border-brand-orange"
                                        />
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">
                                                {isRTL ? current.nameAr : current.nameEn}
                                            </h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {isRTL ? current.roleAr : current.roleEn} -{' '}
                                                <span className="text-brand-orange">
                                                    {isRTL ? current.companyAr : current.companyEn}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-8">
                        {testimonials.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                }}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'bg-brand-orange w-8'
                                    : 'bg-gray-300 dark:bg-slate-600 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
