import React from 'react';

export function SaudiFlag({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 24"
            className={className}
            aria-hidden="true"
        >
            <rect width="32" height="24" fill="#165d31" rx="2" />
            <g transform="translate(16 12) scale(0.6)">
                <path fill="#fff" d="M0,5c-4,0-9-1-12-3h24C9,4,5,5,0,5z M-11,2h22c-3,2-8,3-11,3S-9,4-11,2z M-12-1v-1l3,1 l-3,1V-1z M12-1v-1l-3,1 l3,1V-1z" />
                <path fill="#fff" d="M-6-5h2v3h-2V-5z M-2-5h2v3h-2V-5z M2-5h2v3h-2V-5z M6-5h2v3h-2V-5z" />
                <path fill="#fff" d="M-8-8c0,0,2,2,4,0s4-2,4,0s2,2,4,0" />
            </g>
            <path
                fill="#fff"
                d="M8,17 l16,0 l0,1.5 l-16,0 z M10,19 l4,0 l0,1 l-4,0 z"
                opacity="0.95"
            />
        </svg>
    );
}

export function UKFlag({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
            <clipPath id="s">
                <path d="M0,0v30h60v-30z" />
            </clipPath>
            <clipPath id="t">
                <path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z" />
            </clipPath>
            <g clipPath="url(#s)">
                <path d="M0,0v30h60v-30z" fill="#012169" />
                <path d="M0,0l60,30m0-30l-60,30" stroke="#fff" strokeWidth="6" />
                <path d="M0,0l60,30m0-30l-60,30" clipPath="url(#t)" stroke="#c8102e" strokeWidth="4" />
                <path d="M30,0v30m-30-15h60" stroke="#fff" strokeWidth="10" />
                <path d="M30,0v30m-30-15h60" stroke="#c8102e" strokeWidth="6" />
            </g>
        </svg>
    );
}
