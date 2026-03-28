'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Linkedin, Twitter } from 'lucide-react';

interface TeamMember {
    nameAr: string;
    nameEn: string;
    roleAr: string;
    roleEn: string;
    image: string;
    linkedin: string;
    twitter: string;
}

interface TeamSectionProps {
    isRTL: boolean;
    teamMembers: TeamMember[];
}

/* ── Person Card (module-level, memoized) ─────────────────────────────── */
const PersonCard = React.memo(({
    member,
    index = 0,
    isRTL,
}: {
    member: TeamMember;
    index?: number;
    isRTL: boolean;
}) => {
    const name = isRTL ? member.nameAr : member.nameEn;
    const role = isRTL ? member.roleAr : member.roleEn;

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="lg:shrink-0 lg:w-[190px]"
        >
            <div
                className="relative overflow-hidden rounded-2xl aspect-[3/4] lg:aspect-auto lg:h-[380px] transform-gpu backface-hidden"
                style={{ contain: 'layout style paint' }}
            >
                <img
                    src={member.image}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                        const target = e.currentTarget;
                        target.onerror = null;
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 400' fill='%23cbd5e1'%3E%3Crect width='300' height='400' fill='%23e2e8f0'/%3E%3Ccircle cx='150' cy='140' r='55' fill='%23cbd5e1'/%3E%3Cellipse cx='150' cy='300' rx='80' ry='70' fill='%23cbd5e1'/%3E%3C/svg%3E";
                        target.classList.remove('object-top');
                        target.classList.add('object-center');
                    }}
                />

                <div className="absolute inset-x-0 bottom-0 h-[30%] sm:h-[35%] lg:h-[40%] bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                <div className="absolute bottom-0 left-0 w-full z-10 px-1.5 pb-2 sm:px-3 sm:pb-4 lg:px-4 lg:pb-5 text-center antialiased">
                    <h3 className="font-semibold text-white leading-tight drop-shadow-md text-[11px] sm:text-sm lg:text-base">
                        {name}
                    </h3>
                    <p className="text-brand-orange font-medium mt-0 sm:mt-0.5 drop-shadow-md text-[8px] sm:text-[10px] lg:text-xs leading-tight">
                        {role}
                    </p>

                    {(member.linkedin || member.twitter) && (
                        <div className="hidden sm:flex justify-center gap-2 sm:gap-3 mt-1.5 sm:mt-2.5 opacity-60">
                            {member.linkedin && (
                                <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-full flex items-center justify-center text-white"
                                >
                                    <Linkedin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </a>
                            )}
                            {member.twitter && (
                                <a
                                    href={member.twitter}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-6 h-6 sm:w-7 sm:h-7 bg-white/20 rounded-full flex items-center justify-center text-white"
                                >
                                    <Twitter className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
});
PersonCard.displayName = 'PersonCard';

/* ── Team Section ─────────────────────────────────────────────────────── */
export default function TeamSection({ isRTL, teamMembers }: TeamSectionProps) {
    return (
        <section id="team" className="relative overflow-hidden antialiased">
            <div className="bg-gradient-to-b from-gray-50 via-white to-gray-50/50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 py-24 lg:py-32">
                <div className="container mx-auto px-4 max-w-7xl">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12 sm:mb-16 lg:mb-20"
                    >
                        <span className="inline-block px-4 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-xs font-semibold tracking-widest uppercase mb-4">
                            {isRTL ? 'فريقنا' : 'Our Team'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            {isRTL ? 'فريق القيادة' : 'Leadership Team'}
                        </h2>
                        <p className="text-base sm:text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto mt-4">
                            {isRTL ? 'خبراء متخصصون يقودون رؤيتنا نحو التميز' : 'Dedicated experts driving our vision of excellence'}
                        </p>
                    </motion.div>

                    {/* Mobile: 3-col grid | Desktop: flex-wrap centered rows */}
                    <div className="grid grid-cols-3 gap-3 sm:gap-4 lg:flex lg:flex-row lg:justify-center lg:gap-x-5 lg:gap-y-5 lg:items-stretch lg:flex-wrap">
                        {teamMembers.map((member, index) => (
                            <PersonCard
                                key={`team-${member.nameEn}-${index}`}
                                member={member}
                                index={index}
                                isRTL={isRTL}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
