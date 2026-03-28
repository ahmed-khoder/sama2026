'use client';

import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

interface PageTransitionProps {
    children: ReactNode;
}

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20,
    },
    enter: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.4, 0, 0.2, 1],
            when: 'beforeChildren',
        },
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: {
            duration: 0.3,
            ease: [0.4, 0, 1, 1],
        },
    },
};

export default function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={pageVariants}
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}

// Fade In component for individual sections
interface FadeInProps {
    children: ReactNode;
    delay?: number;
    duration?: number;
    direction?: 'up' | 'down' | 'left' | 'right' | 'none';
    className?: string;
}

export function FadeIn({
    children,
    delay = 0,
    duration = 0.6,
    direction = 'up',
    className = '',
}: FadeInProps) {
    const directionOffset = {
        up: { y: 30 },
        down: { y: -30 },
        left: { x: 30 },
        right: { x: -30 },
        none: {},
    };

    return (
        <motion.div
            initial={{ opacity: 0, ...directionOffset[direction] }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration, delay, ease: [0.4, 0, 0.2, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Scale In component
interface ScaleInProps {
    children: ReactNode;
    delay?: number;
    className?: string;
}

export function ScaleIn({ children, delay = 0, className = '' }: ScaleInProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Stagger Children component
interface StaggerContainerProps {
    children: ReactNode;
    staggerDelay?: number;
    className?: string;
}

export function StaggerContainer({
    children,
    staggerDelay = 0.1,
    className = '',
}: StaggerContainerProps) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Parallax Section component
interface ParallaxProps {
    children: ReactNode;
    offset?: number;
    className?: string;
}

export function Parallax({ children, offset = 50, className = '' }: ParallaxProps) {
    return (
        <motion.div
            initial={{ y: offset }}
            whileInView={{ y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Reveal On Scroll
interface RevealProps {
    children: ReactNode;
    width?: 'fit' | 'full';
    className?: string;
}

export function Reveal({ children, width = 'fit', className = '' }: RevealProps) {
    return (
        <div className={`relative overflow-hidden ${width === 'full' ? 'w-full' : 'w-fit'}`}>
            <motion.div
                initial={{ opacity: 0, y: 75 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className={className}
            >
                {children}
            </motion.div>
            <motion.div
                initial={{ left: 0 }}
                whileInView={{ left: '100%' }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: 'easeIn' }}
                className="absolute top-0 bottom-0 left-0 right-0 bg-brand-orange z-10"
            />
        </div>
    );
}
