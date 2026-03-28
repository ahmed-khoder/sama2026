'use client';

import Image from 'next/image';
import Link from 'next/link';

interface LogoProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    showText?: boolean;
    linkTo?: string;
    className?: string;
}

const sizeConfig = {
    sm: { width: 100, height: 30 },
    md: { width: 140, height: 42 },
    lg: { width: 180, height: 54 },
    xl: { width: 220, height: 66 },
};

export function Logo({
    size = 'md',
    showText = true,
    linkTo = '/',
    className = ''
}: LogoProps) {
    const { width, height } = sizeConfig[size];

    const logoContent = (
        <div className={`flex items-center gap-3 ${className}`}>
            <Image
                src="/images/sama-logo.png"
                alt="SAMA Logistics"
                width={width}
                height={height}
                className="dark:brightness-100 brightness-100"
                priority
            />
        </div>
    );

    if (linkTo) {
        return (
            <Link href={linkTo} className="flex-shrink-0 group">
                {logoContent}
            </Link>
        );
    }

    return logoContent;
}

// Icon-only version for collapsed states or small spaces
export function LogoIcon({ size = 40, className = '' }: { size?: number; className?: string }) {
    return (
        <div
            className={`flex items-center justify-center rounded-lg bg-gradient-to-br from-marine-600 to-marine-800 shadow-lg ${className}`}
            style={{ width: size, height: size }}
        >
            <span className="text-white font-bold text-sm">SL</span>
        </div>
    );
}

export default Logo;
