/**
 * SAMA Logistics — Conversion Analytics API
 * ═══════════════════════════════════════════
 * GET /api/analytics/conversions
 *
 * Fetches conversion funnel data from GA4 Data API:
 *   - Click events: quote_click, whatsapp_click, call_click
 *   - Conversion events: quote_submit, whatsapp_open, call_intent
 *   - Broken down by pagePath and deviceCategory
 *   - User-based conversion rates
 *   - Automated insights engine
 *
 * Auth: getUserFromRequest + view_analytics permission
 * Fallback: Safe response when GA4 credentials are missing
 *
 * ⚠️ Additive-only — does NOT modify any existing route or file.
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { hasPermission, parsePermissions } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// ─── Config ──────────────────────────────────────────────
const GA4_PROPERTY_ID = process.env.GA4_PROPERTY_ID || '';
const GA4_CLIENT_EMAIL = process.env.GA4_CLIENT_EMAIL || '';
const GA4_PRIVATE_KEY = (process.env.GA4_PRIVATE_KEY || '').replace(/\\n/g, '\n');
const API_TIMEOUT = 8000;

const CLICK_EVENTS = ['quote_click', 'whatsapp_click', 'call_click'] as const;
const CONVERSION_EVENTS = ['quote_submit', 'whatsapp_open', 'call_intent'] as const;
const ALL_EVENTS = [...CLICK_EVENTS, ...CONVERSION_EVENTS];

// ─── GA4 Auth (same as /api/analytics) ───────────────────
async function getAccessToken(): Promise<string | null> {
    if (!GA4_CLIENT_EMAIL || !GA4_PRIVATE_KEY) return null;

    try {
        const now = Math.floor(Date.now() / 1000);
        const header = { alg: 'RS256', typ: 'JWT' };
        const payload = {
            iss: GA4_CLIENT_EMAIL,
            scope: 'https://www.googleapis.com/auth/analytics.readonly',
            aud: 'https://oauth2.googleapis.com/token',
            iat: now,
            exp: now + 3600,
        };

        const { createSign } = await import('crypto');
        const encode = (obj: object) =>
            Buffer.from(JSON.stringify(obj)).toString('base64url');

        const headerB64 = encode(header);
        const payloadB64 = encode(payload);
        const signatureInput = `${headerB64}.${payloadB64}`;

        const sign = createSign('RSA-SHA256');
        sign.update(signatureInput);
        const signature = sign.sign(GA4_PRIVATE_KEY, 'base64url');
        const jwt = `${signatureInput}.${signature}`;

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
            signal: controller.signal,
        });

        clearTimeout(timeout);
        if (!tokenRes.ok) return null;
        const tokenData = await tokenRes.json();
        return tokenData.access_token || null;
    } catch {
        return null;
    }
}

// ─── GA4 Report Fetcher ──────────────────────────────────
async function fetchGA4Report(
    accessToken: string,
    body: object,
): Promise<any> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
        const res = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            },
        );
        clearTimeout(timeout);
        if (!res.ok) return null;
        return await res.json();
    } catch {
        clearTimeout(timeout);
        return null;
    }
}

// ─── Helpers ─────────────────────────────────────────────
interface EventRow {
    eventName: string;
    users: number;
    dimension?: string;
}

function parseRows(report: any, hasDimension: boolean): EventRow[] {
    if (!report?.rows) return [];
    return report.rows.map((row: any) => {
        const dims = row.dimensionValues || [];
        const eventName = dims[0]?.value || '';
        const dimension = hasDimension ? (dims[1]?.value || '(not set)') : undefined;
        const users = parseInt(row.metricValues?.[0]?.value || '0', 10);
        return { eventName, users, dimension };
    });
}

function safeRate(numerator: number, denominator: number): number {
    if (denominator === 0) return 0;
    return Math.round((numerator / denominator) * 10000) / 100; // e.g. 12.34%
}

function formatPageLabel(path: string): string {
    if (path === '/' || path === '/en' || path === '/ar') return 'Homepage';
    const clean = path.replace(/^\/(en|ar)\/?/, '/');
    if (clean.startsWith('/services/container-transport')) return 'Container Transport';
    if (clean.startsWith('/services')) return 'Services';
    if (clean.startsWith('/contact')) return 'Contact';
    if (clean.startsWith('/about')) return 'About';
    return clean;
}

// ─── Build Fallback Response ─────────────────────────────
function buildFallback(source: string, message?: string) {
    const emptyTotals = {
        quote_click: 0, whatsapp_click: 0, call_click: 0,
        quote_submit: 0, whatsapp_open: 0, call_intent: 0,
    };
    return {
        period: 'last_30_days',
        totals: emptyTotals,
        conversionRates: {
            quote: 0,
            whatsapp: 0,
            call: 0,
        },
        dropoffs: {
            quote: 0,
            whatsapp: 0,
            call: 0,
        },
        byPage: [],
        byDevice: [],
        insights: {
            bestPage: null,
            highestVolumePage: null,
            bestDevice: null,
            weakestFunnel: null,
        },
        optimization_recommendations: [],
        source,
        message,
    };
}

// ─── GET Handler ─────────────────────────────────────────
export async function GET(req: Request) {
    try {
        // ── Auth Guard ──
        const user = await getUserFromRequest(req as any);
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const userPermissions = parsePermissions((user as any).permissions);
        const canView = hasPermission((user as any).role, userPermissions, 'view_analytics')
            || hasPermission((user as any).role, userPermissions, 'view_conversion_analytics');
        if (!canView) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // ── Check Credentials ──
        if (!GA4_PROPERTY_ID || !GA4_CLIENT_EMAIL || !GA4_PRIVATE_KEY) {
            return NextResponse.json(buildFallback(
                'no-credentials',
                'GA4 credentials not configured. Set GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, and GA4_PRIVATE_KEY.',
            ));
        }

        const accessToken = await getAccessToken();
        if (!accessToken) {
            return NextResponse.json(buildFallback(
                'auth-failed',
                'Failed to authenticate with Google Analytics.',
            ));
        }

        // ── Build event name filter ──
        const eventFilter = {
            filter: {
                fieldName: 'eventName',
                inListFilter: { values: ALL_EVENTS as unknown as string[] },
            },
        };

        // ── Fetch all 3 reports in parallel ──
        const dateRange = { startDate: '30daysAgo', endDate: 'today' };

        const [totalsReport, pageReport, deviceReport] = await Promise.all([
            // 1) Totals by eventName (users)
            fetchGA4Report(accessToken, {
                dateRanges: [dateRange],
                dimensions: [{ name: 'eventName' }],
                metrics: [{ name: 'totalUsers' }],
                dimensionFilter: eventFilter,
            }).catch(() => null),

            // 2) Breakdown by pagePath
            fetchGA4Report(accessToken, {
                dateRanges: [dateRange],
                dimensions: [{ name: 'eventName' }, { name: 'pagePath' }],
                metrics: [{ name: 'totalUsers' }],
                dimensionFilter: eventFilter,
            }).catch(() => null),

            // 3) Breakdown by deviceCategory
            fetchGA4Report(accessToken, {
                dateRanges: [dateRange],
                dimensions: [{ name: 'eventName' }, { name: 'deviceCategory' }],
                metrics: [{ name: 'totalUsers' }],
                dimensionFilter: eventFilter,
            }).catch(() => null),
        ]);

        // ── Parse Totals ──
        const totalsRows = parseRows(totalsReport, false);
        const totals: Record<string, number> = {};
        for (const e of ALL_EVENTS) totals[e] = 0;
        for (const row of totalsRows) {
            if (row.eventName in totals) totals[row.eventName] = row.users;
        }

        // ── Conversion Rates (user-based) ──
        const conversionRates = {
            quote: safeRate(totals.quote_submit, totals.quote_click),
            whatsapp: safeRate(totals.whatsapp_open, totals.whatsapp_click),
            call: safeRate(totals.call_intent, totals.call_click),
        };

        // ── Drop-off Analysis ──
        const dropoffs = {
            quote: Math.max(0, totals.quote_click - totals.quote_submit),
            whatsapp: Math.max(0, totals.whatsapp_click - totals.whatsapp_open),
            call: Math.max(0, totals.call_click - totals.call_intent),
        };

        // ── Breakdown by Page ──
        const pageRows = parseRows(pageReport, true);
        const pageMap = new Map<string, Record<string, number>>();
        for (const row of pageRows) {
            const path = row.dimension || '(not set)';
            if (!pageMap.has(path)) {
                const entry: Record<string, number> = {};
                for (const e of ALL_EVENTS) entry[e] = 0;
                pageMap.set(path, entry);
            }
            const entry = pageMap.get(path)!;
            if (row.eventName in entry) entry[row.eventName] = row.users;
        }

        const byPage = Array.from(pageMap.entries())
            .map(([page, events]) => ({
                page,
                clicks: events.quote_click + events.whatsapp_click + events.call_click,
                conversions: events.quote_submit + events.whatsapp_open + events.call_intent,
                conversionRate: safeRate(
                    events.quote_submit + events.whatsapp_open + events.call_intent,
                    events.quote_click + events.whatsapp_click + events.call_click,
                ),
                events,
            }))
            .filter(p => p.clicks > 0 || p.conversions > 0)
            .sort((a, b) => b.clicks - a.clicks);

        // ── Breakdown by Device ──
        const deviceRows = parseRows(deviceReport, true);
        const deviceMap = new Map<string, Record<string, number>>();
        for (const row of deviceRows) {
            const device = row.dimension || 'unknown';
            if (!deviceMap.has(device)) {
                const entry: Record<string, number> = {};
                for (const e of ALL_EVENTS) entry[e] = 0;
                deviceMap.set(device, entry);
            }
            const entry = deviceMap.get(device)!;
            if (row.eventName in entry) entry[row.eventName] = row.users;
        }

        const byDevice = Array.from(deviceMap.entries())
            .map(([device, events]) => ({
                device,
                clicks: events.quote_click + events.whatsapp_click + events.call_click,
                conversions: events.quote_submit + events.whatsapp_open + events.call_intent,
                conversionRate: safeRate(
                    events.quote_submit + events.whatsapp_open + events.call_intent,
                    events.quote_click + events.whatsapp_click + events.call_click,
                ),
                events,
            }))
            .filter(d => d.clicks > 0 || d.conversions > 0)
            .sort((a, b) => b.clicks - a.clicks);

        // ── Insights Engine ──
        const MIN_TRAFFIC = 2; // Minimum users to qualify for "best page"

        // Best page (highest conversion rate with minimum traffic)
        const qualifiedPages = byPage.filter(p => p.clicks >= MIN_TRAFFIC);
        const bestPage = qualifiedPages.length > 0
            ? qualifiedPages.reduce((a, b) => a.conversionRate > b.conversionRate ? a : b)
            : null;

        // Highest volume page
        const highestVolumePage = byPage.length > 0
            ? byPage.reduce((a, b) => a.clicks > b.clicks ? a : b)
            : null;

        // Best device
        const bestDevice = byDevice.length > 0
            ? byDevice.reduce((a, b) => a.conversionRate > b.conversionRate ? a : b)
            : null;

        // Weakest funnel point (highest drop-off)
        const funnelPoints = [
            { name: 'quote', dropoff: dropoffs.quote, clicks: totals.quote_click, rate: conversionRates.quote },
            { name: 'whatsapp', dropoff: dropoffs.whatsapp, clicks: totals.whatsapp_click, rate: conversionRates.whatsapp },
            { name: 'call', dropoff: dropoffs.call, clicks: totals.call_click, rate: conversionRates.call },
        ].filter(f => f.clicks > 0);

        const weakestFunnel = funnelPoints.length > 0
            ? funnelPoints.reduce((a, b) => a.dropoff > b.dropoff ? a : b)
            : null;

        // ── Optimization Recommendation Engine (v2 — Relative + Impact) ──
        const MIN_RECO_TRAFFIC = 20; // Minimum users to generate a recommendation

        // Calculate site-wide average conversion rate (user-based)
        const totalSiteClicks = (totals.quote_click || 0) + (totals.whatsapp_click || 0) + (totals.call_click || 0);
        const totalSiteConversions = (totals.quote_submit || 0) + (totals.whatsapp_open || 0) + (totals.call_intent || 0);
        const siteAvgRate = safeRate(totalSiteConversions, totalSiteClicks); // e.g. 15.5%

        type Severity = 'high' | 'medium' | 'low';
        interface Recommendation {
            id: string;
            severity: Severity;
            title_en: string;
            title_ar: string;
            description_en: string;
            description_ar: string;
            metric?: string;
            page?: string;
            impact_score: number;
            lost_leads: number;
            dropoff_rate?: number;
        }
        const recommendations: Recommendation[] = [];

        // ⚠️ Safety: No recommendations if site average is not available (insufficient data)
        const hasSufficientData = totalSiteClicks >= MIN_RECO_TRAFFIC && siteAvgRate > 0;

        if (hasSufficientData) {
            const lowThreshold = siteAvgRate * 0.7;   // Below 70% of average = underperforming
            const highThreshold = siteAvgRate * 1.3;   // Above 130% of average = strong

            // Rule 1: High Intent / Low Conversion (relative to site average)
            for (const p of byPage) {
                if (p.clicks >= MIN_RECO_TRAFFIC && p.conversionRate < lowThreshold) {
                    const expectedConv = Math.round(p.clicks * (siteAvgRate / 100));
                    const lostLeads = Math.max(0, expectedConv - p.conversions);
                    const impactScore = p.clicks * ((100 - p.conversionRate) / 100);

                    recommendations.push({
                        id: `high_intent_low_conv_${p.page}`,
                        severity: p.conversionRate < (siteAvgRate * 0.4) ? 'high' : 'medium',
                        title_en: `High Traffic, Low Conversion: ${formatPageLabel(p.page)}`,
                        title_ar: `زيارات عالية، تحويل منخفض: ${formatPageLabel(p.page)}`,
                        description_en: `${p.clicks} users clicked but only ${p.conversions} converted (${p.conversionRate}% vs site avg ${siteAvgRate}%). Expected ~${expectedConv} conversions. Optimize CTA visibility or simplify the form.`,
                        description_ar: `${p.clicks} مستخدم ضغطوا لكن ${p.conversions} فقط تحولوا (${p.conversionRate}% مقابل متوسط الموقع ${siteAvgRate}%). المتوقع ~${expectedConv} تحويل. حسّن وضوح الأزرار أو بسّط النموذج.`,
                        metric: `${p.conversionRate}% vs avg ${siteAvgRate}%`,
                        page: p.page,
                        impact_score: Math.round(impactScore),
                        lost_leads: lostLeads,
                    });
                }
            }

            // Rule 2: Severe Drop-off (>60%)
            const funnelNames = ['quote', 'whatsapp', 'call'] as const;
            for (const key of funnelNames) {
                const clicks = totals[`${key}_click`] || 0;
                const drop = dropoffs[key];
                if (clicks >= MIN_RECO_TRAFFIC && clicks > 0) {
                    const dropRate = Math.round((drop / clicks) * 100);
                    if (dropRate > 60) {
                        const expectedConv = Math.round(clicks * (siteAvgRate / 100));
                        const convKey = key === 'quote' ? 'quote_submit' : key === 'whatsapp' ? 'whatsapp_open' : 'call_intent';
                        const actual = totals[convKey] || 0;
                        const lostLeads = Math.max(0, expectedConv - actual);

                        recommendations.push({
                            id: `severe_dropoff_${key}`,
                            severity: dropRate > 80 ? 'high' : 'medium',
                            title_en: `Severe Drop-off: ${key.charAt(0).toUpperCase() + key.slice(1)} Funnel`,
                            title_ar: `فقد شديد: قمع ${key === 'quote' ? 'عروض الأسعار' : key === 'whatsapp' ? 'واتساب' : 'المكالمات'}`,
                            description_en: `${drop} out of ${clicks} users dropped off (${dropRate}%). Expected ~${expectedConv} conversions at site average.`,
                            description_ar: `${drop} من ${clicks} مستخدم فقدوا (${dropRate}%). المتوقع ~${expectedConv} تحويل بمتوسط الموقع.`,
                            metric: `${dropRate}% drop-off`,
                            impact_score: Math.round(clicks * (dropRate / 100)),
                            lost_leads: lostLeads,
                            dropoff_rate: dropRate,
                        });
                    }
                }
            }

            // Rule 3: Device Gap (mobile vs desktop)
            const mobileData = byDevice.find(d => d.device === 'mobile');
            const desktopData = byDevice.find(d => d.device === 'desktop');
            if (mobileData && desktopData && mobileData.clicks >= MIN_RECO_TRAFFIC && desktopData.clicks >= MIN_RECO_TRAFFIC) {
                const gap = desktopData.conversionRate - mobileData.conversionRate;
                if (gap > 5) {
                    const expectedMobileConv = Math.round(mobileData.clicks * (desktopData.conversionRate / 100));
                    const lostLeads = Math.max(0, expectedMobileConv - mobileData.conversions);

                    recommendations.push({
                        id: 'device_gap_mobile',
                        severity: gap > 15 ? 'high' : 'medium',
                        title_en: `Mobile Underperforming by ${gap.toFixed(1)}pp`,
                        title_ar: `أداء الموبايل أقل بـ ${gap.toFixed(1)} نقطة`,
                        description_en: `Mobile conversion is ${mobileData.conversionRate}% vs desktop ${desktopData.conversionRate}%. If mobile matched desktop, you'd gain ~${lostLeads} extra leads.`,
                        description_ar: `تحويل الموبايل ${mobileData.conversionRate}% مقابل ${desktopData.conversionRate}% للديسكتوب. لو الموبايل وصل لنفس المستوى، ستكسب ~${lostLeads} عميل إضافي.`,
                        metric: `${mobileData.conversionRate}% vs ${desktopData.conversionRate}%`,
                        impact_score: Math.round(mobileData.clicks * (gap / 100)),
                        lost_leads: lostLeads,
                    });
                }
            }

            // Rule 4: Low Volume Pages
            for (const p of byPage) {
                if (p.clicks > 0 && p.clicks < MIN_RECO_TRAFFIC && p.conversions === 0) {
                    recommendations.push({
                        id: `low_volume_${p.page}`,
                        severity: 'low',
                        title_en: `Low Traffic: ${formatPageLabel(p.page)}`,
                        title_ar: `زيارات منخفضة: ${formatPageLabel(p.page)}`,
                        description_en: `Only ${p.clicks} clicks — insufficient data to evaluate. Improve visibility via internal links or SEO.`,
                        description_ar: `${p.clicks} نقرات فقط — بيانات غير كافية للتقييم. حسّن الظهور بالروابط الداخلية أو SEO.`,
                        metric: `${p.clicks} clicks`,
                        page: p.page,
                        impact_score: 0,
                        lost_leads: 0,
                    });
                }
            }

            // Rule 5: Strong Performance (relative to site average)
            for (const p of byPage) {
                if (p.clicks >= MIN_RECO_TRAFFIC && p.conversionRate >= highThreshold) {
                    recommendations.push({
                        id: `strong_performance_${p.page}`,
                        severity: 'low',
                        title_en: `Strong Performance: ${formatPageLabel(p.page)}`,
                        title_ar: `أداء ممتاز: ${formatPageLabel(p.page)}`,
                        description_en: `${p.conversionRate}% conversion rate (${(p.conversionRate / siteAvgRate * 100).toFixed(0)}% of site avg) with ${p.clicks} clicks. Replicate this approach elsewhere.`,
                        description_ar: `معدل تحويل ${p.conversionRate}% (${(p.conversionRate / siteAvgRate * 100).toFixed(0)}% من متوسط الموقع) مع ${p.clicks} نقرة. كرّر هذا النهج في صفحات أخرى.`,
                        metric: `${p.conversionRate}% conv. rate`,
                        page: p.page,
                        impact_score: 0,
                        lost_leads: 0,
                    });
                }
            }
        }

        // Sort: severity (high→medium→low), then impact_score desc
        const severityOrder: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
        recommendations.sort((a, b) => {
            const sevDiff = severityOrder[a.severity] - severityOrder[b.severity];
            if (sevDiff !== 0) return sevDiff;
            return b.impact_score - a.impact_score;
        });

        return NextResponse.json({
            period: 'last_30_days',
            totals,
            conversionRates,
            dropoffs,
            byPage,
            byDevice,
            insights: {
                bestPage: bestPage ? { page: bestPage.page, rate: bestPage.conversionRate, clicks: bestPage.clicks } : null,
                highestVolumePage: highestVolumePage ? { page: highestVolumePage.page, clicks: highestVolumePage.clicks, conversions: highestVolumePage.conversions } : null,
                bestDevice: bestDevice ? { device: bestDevice.device, rate: bestDevice.conversionRate, clicks: bestDevice.clicks } : null,
                weakestFunnel: weakestFunnel ? { funnel: weakestFunnel.name, dropoff: weakestFunnel.dropoff, rate: weakestFunnel.rate } : null,
            },
            site_avg_conversion_rate: siteAvgRate,
            optimization_recommendations: recommendations,
            source: 'ga4',
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error('[Conversions API] Error:', error);
        return NextResponse.json(buildFallback('error', 'Internal server error'));
    }
}
