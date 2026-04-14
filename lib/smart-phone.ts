/**
 * Smart Phone Link Utility
 * ────────────────────────
 * Detects if the device can make phone calls.
 * - Mobile/Tablet with phone → tel: link (native dialer)
 * - Desktop / non-phone device → WhatsApp Web fallback
 *
 * Hybrid detection: User-Agent + Touch capability
 * UA alone misclassifies some devices; touch alone misclassifies
 * desktop touchscreens. Combined = most reliable client-side approach.
 */

const MOBILE_UA_PATTERN =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

/**
 * Returns true if the device likely supports native phone calls.
 * Uses hybrid detection:
 *   1. User-Agent matches known mobile patterns
 *   2. navigator.maxTouchPoints > 1 (phones/tablets = 5-10, desktop touchscreen = 1)
 * Either signal → mobile.
 * Safe for SSR — returns false on the server.
 */
export function canMakePhoneCalls(): boolean {
    if (typeof navigator === 'undefined') return false;

    const uaMatch = MOBILE_UA_PATTERN.test(navigator.userAgent);
    const touchCapable = (navigator.maxTouchPoints ?? 0) > 1;

    return uaMatch || touchCapable;
}

/**
 * Returns the appropriate href for a phone action:
 * - Mobile → tel:+20XXXXXXXXXX
 * - Desktop → WhatsApp Web with pre-filled message
 */
export function getSmartPhoneHref(
    phoneNumber: string,
    whatsappMessage?: string,
): string {
    if (canMakePhoneCalls()) {
        return `tel:${phoneNumber}`;
    }

    // Strip the leading "+" for WhatsApp format
    const waNumber = phoneNumber.replace(/^\+/, '');
    const message = whatsappMessage
        ? `&text=${encodeURIComponent(whatsappMessage)}`
        : '';
    // Desktop: web.whatsapp.com/send opens WhatsApp Web directly (no popup)
    return `https://web.whatsapp.com/send?phone=${waNumber}${message}`;
}

/**
 * Returns additional anchor props for the smart phone link:
 * - Mobile → no extra props (stays in same tab)
 * - Desktop → target="_blank" + rel="noopener noreferrer"
 */
export function getSmartPhoneProps(): Record<string, string> {
    if (canMakePhoneCalls()) {
        return {};
    }
    return {
        target: '_blank',
        rel: 'noopener noreferrer',
    };
}

/**
 * Returns the best WhatsApp URL based on device type:
 * - Mobile → wa.me (opens native WhatsApp app instantly)
 * - Desktop → web.whatsapp.com/send (opens WhatsApp Web directly, no popup)
 */
export function getWhatsAppHref(
    phoneNumber: string,
    message?: string,
): string {
    const encodedMsg = message ? encodeURIComponent(message) : '';

    if (canMakePhoneCalls()) {
        // Mobile: wa.me opens native app
        return `https://wa.me/${phoneNumber}${encodedMsg ? `?text=${encodedMsg}` : ''}`;
    }

    // Desktop: web.whatsapp.com/send opens WhatsApp Web directly (no intermediate page)
    return `https://web.whatsapp.com/send?phone=${phoneNumber}${encodedMsg ? `&text=${encodedMsg}` : ''}`;
}
