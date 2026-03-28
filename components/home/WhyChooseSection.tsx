'use client';

import React from 'react';
import { StaggerContainer, StaggerItem } from '@/components/PageTransition';
import { motion } from 'framer-motion';
import {
    Globe2, ShieldCheck, TrendingUp, Award
} from 'lucide-react';

// Features
const features = [
    { icon: Globe2, titleAr: 'تغطية عالمية', titleEn: 'Global Coverage', descAr: 'شبكة شركاء في أكثر من 50 دولة', descEn: 'Partner network in 50+ countries' },
    { icon: ShieldCheck, titleAr: 'أمان البضائع', titleEn: 'Cargo Safety', descAr: 'تأمين شامل وتتبع مباشر', descEn: 'Comprehensive insurance and live tracking' },
    { icon: TrendingUp, titleAr: 'حلول مخصصة', titleEn: 'Custom Solutions', descAr: 'خدمات مصممة لاحتياجاتك', descEn: 'Services tailored to your needs' },
    { icon: Award, titleAr: 'جودة معتمدة', titleEn: 'Certified Quality', descAr: 'شهادات ISO وضمان الجودة', descEn: 'ISO certified quality assurance' },
];

interface WhyChooseSectionProps {
    isRTL: boolean;
}

export default function WhyChooseSection({ isRTL }: WhyChooseSectionProps) {
    return (
        <section className="py-24 bg-gray-50 dark:bg-slate-900 relative">
            <div className="container mx-auto px-4">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">{isRTL ? 'لماذا تختار سما؟' : 'Why Choose Sama?'}</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-normal">{isRTL ? 'نقدم لك تجربة لوجستية استثنائية بمعايير عالمية' : 'We deliver an exceptional logistics experience with global standards'}</p>
                    <div className="w-20 h-1 bg-brand-orange mx-auto mt-6 rounded-full" />
                </motion.div>

                <StaggerContainer staggerDelay={0.15} className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {features.map((feature, index) => (
                        <StaggerItem key={index}>
                            <div className="card-premium group p-4 md:p-8 h-full">
                                <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-marine-100 to-marine-50 dark:from-marine-900/50 dark:to-marine-800/30 rounded-xl md:rounded-2xl flex items-center justify-center text-marine-600 dark:text-marine-400 mb-3 md:mb-6 group-hover:bg-gradient-to-br group-hover:from-brand-orange group-hover:to-brand-gold group-hover:text-white transition-all duration-300 shadow-lg shadow-marine-500/10 group-hover:shadow-brand-orange/20">
                                    <feature.icon className="w-6 h-6 md:w-8 md:h-8" />
                                </div>
                                <h3 className="text-base md:text-xl font-semibold text-gray-900 dark:text-white mb-1 md:mb-3">{isRTL ? feature.titleAr : feature.titleEn}</h3>
                                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">{isRTL ? feature.descAr : feature.descEn}</p>
                            </div>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            </div>
        </section>
    );
}
