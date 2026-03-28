'use client';

import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useBranding, resolveLogoUrl } from '@/hooks/useBranding';
import AnimatedLogo from './AnimatedLogo';

// SSR-safe dynamic import for Lottie — never loaded on server
const LottiePlayer = dynamic(() => import('lottie-react'), {
    ssr: false,
    loading: () => null,
});

// ═══════════════════════════════════════════════════════════════
// 🛡️ القاعدة الذهبية: الثابت هو الأصل، المتحرك "ضيف"
// ═══════════════════════════════════════════════════════════════

const SWAP_TIMEOUT_MS = 5000; // 5-Second silent rule

// ── Preloader: warm up lottie-react chunk in background ──
let _preloaded = false;
function preloadLottie() {
    if (_preloaded) return;
    _preloaded = true;
    // Fire-and-forget: import the chunk so browser caches it
    import('lottie-react').catch(() => {});
}

interface DynamicLogoProps {
    className?: string;
    variant?: 'auto' | 'light';
    /** Dashboard mode: skip timeout, force-render animation immediately */
    forceAnimation?: boolean;
}

export default function DynamicLogo({
    className = 'h-14 w-60',
    variant = 'auto',
    forceAnimation = false,
}: DynamicLogoProps) {
    const { branding, loading } = useBranding();
    const resolved = useMemo(() => resolveLogoUrl(branding), [branding]);

    const [guestReady, setGuestReady] = useState(false);
    const [guestFailed, setGuestFailed] = useState(false);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(0);

    // ── Preload lottie-react as soon as we know animation is enabled ──
    useEffect(() => {
        if (branding.animationEnabled && branding.logoAnimated) {
            preloadLottie();
        }
    }, [branding.animationEnabled, branding.logoAnimated]);

    // Reset when URL changes + start timeout
    useEffect(() => {
        setGuestReady(false);
        setGuestFailed(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        if (resolved.url) {
            startTimeRef.current = performance.now();

            // Dashboard mode: no timeout
            if (!forceAnimation) {
                timeoutRef.current = setTimeout(() => {
                    const elapsed = Math.round(performance.now() - startTimeRef.current);
                    console.warn(
                        `⏱️ DynamicLogo TIMEOUT: Animation not ready after ${elapsed}ms — keeping static logo.`,
                        `\n   URL: ${resolved.url}`,
                        `\n   Reason: TIMEOUT (>${SWAP_TIMEOUT_MS}ms)`
                    );
                    setGuestFailed(true);
                }, SWAP_TIMEOUT_MS);
            }
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [resolved.url, forceAnimation]);

    // ── Callbacks with resolved.url dependency ──
    const onGuestReady = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const elapsed = Math.round(performance.now() - startTimeRef.current);
        console.log(`✅ DynamicLogo: Animation ready in ${elapsed}ms — swapping to animated logo`);
        setGuestReady(true);
    }, [resolved.url]);

    const onGuestError = useCallback(() => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        const elapsed = Math.round(performance.now() - startTimeRef.current);
        console.error(
            `❌ DynamicLogo ERROR: Failed after ${elapsed}ms — keeping static logo.`,
            `\n   URL: ${resolved.url}`,
            `\n   Reason: RENDER_ERROR`
        );
        setGuestFailed(true);
    }, [resolved.url]);

    // ═══ VISIBILITY LOGIC ═══
    // Static stays opacity:1 until guest is 100% ready
    const showStatic = !guestReady || guestFailed || !resolved.url || loading;
    const showGuest = guestReady && !guestFailed && !!resolved.url && !loading;

    return (
        <div
            className={`relative ${className}`}
            style={{ minWidth: 160, minHeight: 40 }}
        >
            {/* ── Layer 1: STATIC — Always in DOM, opacity:1 until guest ready ── */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    opacity: showStatic ? 1 : 0,
                    transition: 'opacity 500ms ease',
                    pointerEvents: showStatic ? 'auto' : 'none',
                }}
            >
                <AnimatedLogo className="w-full h-full" variant={variant} />
            </div>

            {/* ── Layer 2: GUEST — fades in only after onDOMLoaded ── */}
            {resolved.url && !guestFailed && (
                <div
                    className="absolute inset-0 flex items-center justify-center dark:drop-shadow-[0_0_12px_rgba(249,115,22,0.25)]"
                    style={{
                        opacity: showGuest ? 1 : 0,
                        transition: 'opacity 500ms ease',
                        pointerEvents: showGuest ? 'auto' : 'none',
                    }}
                >
                    {resolved.isAnimated && resolved.url.endsWith('.json') ? (
                        <LottieRenderer
                            url={resolved.url}
                            onDOMReady={onGuestReady}
                            onError={onGuestError}
                        />
                    ) : (
                        <Image
                            src={resolved.url}
                            alt="SAMA Logistics"
                            fill
                            className="object-contain"
                            priority
                            unoptimized={resolved.url.endsWith('.svg')}
                            onLoad={onGuestReady}
                            onError={onGuestError}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ─── Lottie Renderer ────────────────────────────────────────
function LottieRenderer({
    url,
    onDOMReady,
    onError,
}: {
    url: string;
    onDOMReady: () => void;
    onError: () => void;
}) {
    const [animationData, setAnimationData] = useState<object | null>(null);

    useEffect(() => {
        let cancelled = false;
        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (!cancelled) setAnimationData(data);
            })
            .catch(err => {
                console.error('❌ Lottie fetch failed:', err);
                if (!cancelled) onError();
            });
        return () => { cancelled = true; };
    }, [url, onError]);

    if (!animationData) return null;

    return (
        <LottiePlayer
            animationData={animationData}
            loop
            autoplay
            renderer="svg"
            rendererSettings={{
                preserveAspectRatio: 'xMidYMid meet',
            }}
            onDOMLoaded={onDOMReady}
            style={{ width: '100%', height: '100%' }}
        />
    );
}
