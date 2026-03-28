/**
 * Rate Limiter — حماية API من الاستخدام المفرط والهجمات
 * 
 * يعمل بنظام Sliding Window مع تخزين في الذاكرة.
 * ملاحظة: في بيئة multi-instance (مثل Vercel)، يجب استبداله بـ Redis/Upstash.
 * لكنه يعمل بشكل ممتاز لسيرفر واحد (Node.js / VPS / Docker).
 */

interface RateLimitEntry {
    count: number;
    resetTime: number;
}

interface RateLimitConfig {
    /** الحد الأقصى للطلبات في النافذة الزمنية */
    maxRequests: number;
    /** النافذة الزمنية بالملي ثانية */
    windowMs: number;
}

class RateLimiter {
    private store = new Map<string, RateLimitEntry>();
    private config: RateLimitConfig;
    private cleanupInterval: NodeJS.Timer;

    constructor(config: RateLimitConfig) {
        this.config = config;
        // تنظيف تلقائي كل 5 دقائق لمنع تسريب الذاكرة
        this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }

    /**
     * التحقق مما إذا كان الطلب مسموحاً
     * @returns { allowed, remaining, resetIn }
     */
    check(key: string): { allowed: boolean; remaining: number; resetInSeconds: number } {
        const now = Date.now();
        const entry = this.store.get(key);

        // لا يوجد سجل سابق أو انتهت النافذة الزمنية — أنشئ جديد
        if (!entry || now > entry.resetTime) {
            this.store.set(key, {
                count: 1,
                resetTime: now + this.config.windowMs,
            });
            return { 
                allowed: true, 
                remaining: this.config.maxRequests - 1,
                resetInSeconds: Math.ceil(this.config.windowMs / 1000),
            };
        }

        // تجاوز الحد
        if (entry.count >= this.config.maxRequests) {
            return { 
                allowed: false, 
                remaining: 0,
                resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
            };
        }

        // زيادة العداد
        entry.count++;
        return { 
            allowed: true, 
            remaining: this.config.maxRequests - entry.count,
            resetInSeconds: Math.ceil((entry.resetTime - now) / 1000),
        };
    }

    /** تنظيف السجلات المنتهية لمنع تسريب الذاكرة */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.store.entries()) {
            if (now > entry.resetTime) {
                this.store.delete(key);
            }
        }
    }
}

// ═══════════════════════════════════════════════
// Rate Limiters المعرّفة مسبقاً لكل API
// ═══════════════════════════════════════════════

/** Login: 5 محاولات كل 15 دقيقة لكل IP */
export const loginLimiter = new RateLimiter({
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 دقيقة
});

/** Contact: 3 رسائل كل 10 دقائق لكل IP */
export const contactLimiter = new RateLimiter({
    maxRequests: 3,
    windowMs: 10 * 60 * 1000, // 10 دقائق
});

/** عام: 60 طلب في الدقيقة لكل IP */
export const generalLimiter = new RateLimiter({
    maxRequests: 60,
    windowMs: 60 * 1000, // دقيقة واحدة
});

/**
 * استخراج IP العميل من الطلب
 */
export function getClientIP(req: Request): string {
    // x-forwarded-for يحتوي على IP الأصلي خلف proxy/CDN
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp;

    return 'unknown';
}
