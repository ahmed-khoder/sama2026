'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface AnimatedCounterProps {
    value: string;
    duration?: number;
    className?: string;
    suffix?: string;
    prefix?: string;
}

export default function AnimatedCounter({
    value,
    duration = 2,
    className = '',
    suffix = '',
    prefix = '',
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });
    const [displayValue, setDisplayValue] = useState('0');

    useEffect(() => {
        if (!isInView) return;

        // Extract numeric part from value (e.g., "15+" -> 15, "10K+" -> 10)
        const numericMatch = value.match(/[\d.]+/);
        if (!numericMatch) {
            setDisplayValue(value);
            return;
        }

        const numericValue = parseFloat(numericMatch[0]);
        const isDecimal = numericValue % 1 !== 0;
        const startTime = Date.now();
        const endTime = startTime + duration * 1000;

        const animate = () => {
            const now = Date.now();
            const progress = Math.min((now - startTime) / (duration * 1000), 1);

            // Easing function: easeOutExpo
            const easeOutExpo = 1 - Math.pow(2, -10 * progress);

            const currentValue = numericValue * easeOutExpo;

            if (isDecimal) {
                setDisplayValue(currentValue.toFixed(1));
            } else {
                setDisplayValue(Math.floor(currentValue).toString());
            }

            if (now < endTime) {
                requestAnimationFrame(animate);
            } else {
                // Set final value with original formatting
                setDisplayValue(numericMatch[0]);
            }
        };

        requestAnimationFrame(animate);
    }, [isInView, value, duration]);

    // Get the suffix from original value (e.g., "+" or "K+")
    const originalSuffix = value.replace(/[\d.]+/, '');

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            {prefix}
            {displayValue}
            {originalSuffix || suffix}
        </motion.span>
    );
}

// Animated Stats Card Component
interface StatCardProps {
    value: string;
    label: string;
    icon?: React.ReactNode;
    delay?: number;
    className?: string;
}

export function AnimatedStatCard({
    value,
    label,
    icon,
    delay = 0,
    className = '',
}: StatCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: '-30px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.6, delay, ease: 'easeOut' }}
            className={`text-center ${className}`}
        >
            {icon && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: delay + 0.2, type: 'spring' }}
                    className="mb-2"
                >
                    {icon}
                </motion.div>
            )}
            <AnimatedCounter
                value={value}
                className="text-3xl md:text-4xl font-extrabold text-white"
                duration={2.5}
            />
            <div className="text-sm text-gray-300 mt-1">{label}</div>
        </motion.div>
    );
}

// Animated Number with Glow Effect
interface GlowingCounterProps {
    value: string;
    label: string;
    className?: string;
}

export function GlowingCounter({ value, label, className = '' }: GlowingCounterProps) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8, type: 'spring' }}
            className={`relative ${className}`}
        >
            {/* Glow background */}
            <div className="absolute inset-0 bg-brand-orange/20 blur-2xl rounded-full" />

            <div className="relative">
                <AnimatedCounter
                    value={value}
                    className="text-4xl md:text-5xl font-black gradient-text"
                    duration={2}
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
        </motion.div>
    );
}
