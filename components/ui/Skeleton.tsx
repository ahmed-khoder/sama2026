'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'rectangular' | 'circular';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

/**
 * Skeleton loading component for content placeholders
 * Use while data is being fetched
 */
export function Skeleton({
    className,
    variant = 'rectangular',
    width,
    height,
    animation = 'pulse',
}: SkeletonProps) {
    const baseStyles = 'bg-gray-200 dark:bg-slate-700';

    const variantStyles = {
        text: 'rounded-md h-4',
        rectangular: 'rounded-lg',
        circular: 'rounded-full',
    };

    const animationStyles = {
        pulse: 'animate-pulse',
        wave: 'animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 bg-[length:200%_100%]',
        none: '',
    };

    const style: React.CSSProperties = {
        width: width,
        height: height,
    };

    return (
        <div
            className={cn(baseStyles, variantStyles[variant], animationStyles[animation], className)}
            style={style}
        />
    );
}

// Common skeleton patterns
export function SkeletonCard() {
    return (
        <div className="p-6 space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-4 w-3/4" variant="text" />
            <Skeleton className="h-4 w-1/2" variant="text" />
        </div>
    );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <div className="space-y-2">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="text"
                    className={i === lines - 1 ? 'w-2/3' : 'w-full'}
                />
            ))}
        </div>
    );
}

export function SkeletonAvatar({ size = 40 }: { size?: number }) {
    return <Skeleton variant="circular" width={size} height={size} />;
}
