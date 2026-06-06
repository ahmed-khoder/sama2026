"use client";

import Script from "next/script";
import { canMakePhoneCalls } from "@/lib/smart-phone";

// ─── GA4 Measurement ID ──────────────────────────────────
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-33C7XZ028K";

// ─── Typed Conversion Events ─────────────────────────────
export type ConversionEvent =
    // Click-level (intent)
    | "quote_click"
    | "whatsapp_click"
    | "call_click"
    // Conversion-level (actual lead)
    | "quote_submit"
    | "whatsapp_open"
    | "call_intent"
    // Other
    | "download_pdf"
    | "service_card_click";

export interface TrackParams {
    /** Page where the event occurred (e.g. 'home', 'services', 'container-transport') */
    page?: string;
    /** Button location on the page (e.g. 'hero', 'cta', 'sidebar', 'footer', 'card') */
    location?: string;
    /** Device type — auto-detected if omitted */
    device?: "mobile" | "desktop";
    /** Form type for quote submissions */
    form_type?: string;
    /** Any extra params */
    [key: string]: string | number | boolean | undefined;
}

// ─── gtag type declaration ───────────────────────────────
declare global {
    interface Window {
        gtag?: (...args: any[]) => void;
    }
}

/**
 * Fire-and-forget GA4 event tracking.
 * - SSR-safe: silently no-ops on server
 * - Non-blocking: never delays navigation
 * - Auto-detects device type
 */
export function trackEvent(
    eventName: ConversionEvent | string,
    params: TrackParams = {},
): void {
    // Debug mode — localhost only, stripped from production builds
    if (process.env.NODE_ENV !== "production") {
        const label = eventName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        console.log(`%c🔔 ${label} Fired`, "color:#F97316;font-weight:bold", params);
    }

    if (typeof window === "undefined" || !window.gtag) return;

    const finalParams: TrackParams = {
        device: canMakePhoneCalls() ? "mobile" : "desktop",
        ...params,
    };

    try {
        window.gtag("event", eventName, finalParams);
    } catch {
        // Silently fail — analytics should never break UX
    }
}

/**
 * Track a high-value conversion event.
 * Same as trackEvent but also sends to GA4 as a recommended conversion.
 */
export function trackConversion(
    eventName: "quote_submit" | "whatsapp_open" | "call_intent",
    params: TrackParams = {},
): void {
    // Debug mode — localhost only, stripped from production builds
    if (process.env.NODE_ENV !== "production") {
        const label = eventName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        console.log(`%c⚡ Conversion: ${label}`, "color:#25D366;font-weight:bold", params);
    }
    trackEvent(eventName, { ...params, conversion: true });
}

// ─── Component ───────────────────────────────────────────
export default function GoogleAnalytics() {
    // Prevent running on localhost (development)
    if (process.env.NODE_ENV !== "production") return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="ga-script" strategy="afterInteractive">
                {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());

          gtag('config', '${GA_ID}');
        `}
            </Script>
        </>
    );
}
