'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RefreshCw, Plus, Trash2, Mountain, BarChart3, AlertTriangle, Sparkles, Award } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/contexts/ToastContext';
import { authFetch } from '@/lib/auth-fetch';

// ── Types ──────────────────────────────────────────
interface MarbleHero {
    titleLine1Ar: string;
    titleLine1En: string;
    titleLine2Ar: string;
    titleLine2En: string;
    descAr: string;
    descEn: string;
    image: string;
    overlayOpacity: number;
    blurAmount: number;
    overlayColor: string;
}

interface MarbleStat {
    valueAr: string;
    valueEn: string;
    labelAr: string;
    labelEn: string;
}

interface MarbleProblem {
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
}

interface MarbleFeature {
    titleAr: string;
    titleEn: string;
    descAr: string;
    descEn: string;
}

interface MarbleTrustStat {
    valueAr: string;
    valueEn: string;
    labelAr: string;
    labelEn: string;
}

interface MarblePageData {
    hero: MarbleHero;
    stats: MarbleStat[];
    problems: { sectionTitleAr: string; sectionTitleEn: string; items: MarbleProblem[] };
    features: { sectionTitleAr: string; sectionTitleEn: string; cards: MarbleFeature[] };
}

// ── Section keys stored in SiteSetting ──
const SECTION = 'industrial-page';
const KEYS = { hero: 'hero', stats: 'stats', problems: 'problems', features: 'features', trust: 'trust', solutions: 'solutions' };

// ── Helpers ──────────────────────────────────────────
function InputField({ label, value, onChange, multiline }: { label: string; value: string; onChange: (v: string) => void; multiline?: boolean }) {
    const shared = 'w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange transition';
    return (
        <div>
            <label className="text-xs text-gray-500 mb-1 block">{label}</label>
            {multiline ? (
                <textarea value={value} onChange={e => onChange(e.target.value)} rows={2} className={shared} />
            ) : (
                <input value={value} onChange={e => onChange(e.target.value)} className={shared} />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════
export function IndustrialPageTab() {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const { success, error: toastError } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [settingIds, setSettingIds] = useState<Record<string, string>>({});

    // ── Data State ──
    const [hero, setHero] = useState<MarbleHero>({
        titleLine1Ar: 'نقل حاويات المصانع',
        titleLine1En: 'Factory Container Transport',
        titleLine2Ar: 'في جميع المناطق الصناعية',
        titleLine2En: 'Across All Industrial Zones',
        descAr: 'خدمات نقل حاويات 40 قدم والبضائع الصناعية من وإلى المصانع والمجمعات الصناعية في جميع المحافظات بكفاءة تشغيلية عالية والتزام كامل بالمواعيد.',
        descEn: 'Professional 40ft container and industrial cargo transport to and from factories and industrial complexes across all governorates with high operational efficiency and full schedule commitment.',
        image: '',
        overlayOpacity: 0.4,
        blurAmount: 0,
        overlayColor: 'blue',
    });

    const [stats, setStats] = useState<MarbleStat[]>([
        { valueAr: '+25', valueEn: '25+', labelAr: 'سنة خبرة', labelEn: 'Years Experience' },
        { valueAr: '15+', valueEn: '15+', labelAr: 'شاحنة مخصصة', labelEn: 'Dedicated Trucks' },
        { valueAr: '+500', valueEn: '500+', labelAr: 'مصنع وشركة', labelEn: 'Factories & Companies' },
        { valueAr: '98%', valueEn: '98%', labelAr: 'التزام بالمواعيد', labelEn: 'On-Time Rate' },
    ]);

    const [problems, setProblems] = useState<{ sectionTitleAr: string; sectionTitleEn: string; items: MarbleProblem[] }>({
        sectionTitleAr: 'مشاكل تكلف المصانع خسائر يومية',
        sectionTitleEn: 'Problems Costing Factories Daily Losses',
        items: [
            { titleAr: 'تأخير في استلام أو تسليم الحاويات', titleEn: 'Container Pickup & Delivery Delays', descAr: 'التأخير يُعطل خطوط الإنتاج ويكلف المصنع خسائر يومية. نضمن مواعيد محددة ومنتظمة لكل شحنة.', descEn: 'Delays disrupt production lines and cost factories daily losses. We guarantee fixed, regular schedules for every shipment.' },
            { titleAr: 'صعوبة التنسيق داخل المناطق الصناعية', titleEn: 'Complex Industrial Zone Coordination', descAr: 'المناطق الصناعية لها متطلبات دخول وتصاريح خاصة. فريقنا يعرف كل منطقة وإجراءاتها بالتفصيل.', descEn: 'Industrial zones have special entry requirements and permits. Our team knows every zone and its procedures in detail.' },
            { titleAr: 'تلف أو تحميل غير آمن', titleEn: 'Damaged Cargo or Unsafe Loading', descAr: 'التحميل العشوائي يسبب تلف المنتجات وخسائر مالية. نستخدم فرق تحميل متخصصة ومعدات مناسبة لكل نوع بضاعة.', descEn: 'Random loading causes product damage and financial losses. We use specialized loading teams and equipment suited for each cargo type.' },
            { titleAr: 'عدم الالتزام بالمواعيد', titleEn: 'Schedule Non-Compliance', descAr: 'المصانع تعمل بجداول إنتاج محددة. أي تأخير يعني توقف. نعمل بنظام تشغيل منتظم مع التزام صارم بالمواعيد.', descEn: 'Factories operate on tight production schedules. Any delay means downtime. We operate with regular schedules and strict time commitments.' },
        ],
    });

    const [features, setFeatures] = useState<{ sectionTitleAr: string; sectionTitleEn: string; cards: MarbleFeature[] }>({
        sectionTitleAr: 'لماذا سما لوجيستك؟',
        sectionTitleEn: 'Why SAMA Logistics?',
        cards: [
            { titleAr: 'أسطول مخصص للحاويات', titleEn: 'Dedicated Container Fleet', descAr: 'أسطول من الشاحنات الثقيلة المجهزة خصيصاً لنقل حاويات 20 و40 قدم بكفاءة وأمان.', descEn: 'A fleet of heavy trucks specially equipped for efficient and safe transport of 20ft and 40ft containers.' },
            { titleAr: 'خبرة في التعامل مع المصانع', titleEn: 'Factory Operations Expertise', descAr: 'نفهم متطلبات القطاع الصناعي — من جداول الإنتاج والتحميل إلى إجراءات المناطق الصناعية.', descEn: 'We understand industrial sector needs — from production schedules and loading to industrial zone procedures.' },
            { titleAr: 'التزام بالمواعيد', titleEn: 'On-Time Commitment', descAr: 'نسبة التزام 98% بالمواعيد المحددة. خطوط إنتاجك لن تتوقف بسبب تأخير النقل.', descEn: "98% on-time delivery rate. Your production lines won't stop due to transport delays." },
            { titleAr: 'تغطية جميع المناطق الصناعية', titleEn: 'Full Industrial Zone Coverage', descAr: 'العاشر من رمضان، 6 أكتوبر، مدينة السادات، بورسعيد، برج العرب — نغطي كل المناطق الصناعية.', descEn: '10th of Ramadan, 6th of October, Sadat City, Port Said, Borg El Arab — we cover all industrial zones.' },
        ],
    });

    const [trust, setTrust] = useState<MarbleTrustStat[]>([
        { valueAr: '+25', valueEn: '25+', labelAr: 'سنة في السوق المصري', labelEn: 'Years in Egyptian Market' },
        { valueAr: '15+', valueEn: '15+', labelAr: 'شاحنة ثقيلة مجهزة', labelEn: 'Equipped Heavy Trucks' },
        { valueAr: '+500', valueEn: '500+', labelAr: 'مصنع وشركة صناعية', labelEn: 'Factories & Industrial Companies' },
        { valueAr: '3', valueEn: '3', labelAr: 'موانئ رئيسية مغطاة', labelEn: 'Major Ports Covered' },
    ]);

    const [solutions, setSolutions] = useState([
        { titleAr: 'نقل حاويات 40 قدم', titleEn: '40ft Container Transport', descAr: 'نقل حاويات 40 قدم الكاملة من وإلى المصانع والموانئ بشاحنات مجهزة وسائقين محترفين.', descEn: 'Full 40ft container transport to and from factories and ports with equipped trucks and professional drivers.' },
        { titleAr: 'نقل منتجات صناعية', titleEn: 'Industrial Product Transport', descAr: 'نقل المنتجات الصناعية بمختلف أنواعها مع تأمين شامل وتحميل احترافي يحافظ على سلامة البضاعة.', descEn: 'Transport of industrial products of all types with comprehensive insurance and professional loading that preserves cargo integrity.' },
        { titleAr: 'نقل من وإلى المناطق الصناعية', titleEn: 'Industrial Zone Logistics', descAr: 'خدمات نقل متكاملة تربط المصانع بالموانئ ومراكز التوزيع عبر جميع المحافظات المصرية.', descEn: 'Integrated transport services connecting factories to ports and distribution centers across all Egyptian governorates.' },
        { titleAr: 'تشغيل منتظم للمصانع', titleEn: 'Regular Factory Operations', descAr: 'عقود تشغيل يومية وأسبوعية مصممة حسب جدول إنتاج المصنع مع مرونة كاملة في التعديل.', descEn: "Daily and weekly operation contracts designed around the factory's production schedule with full flexibility for adjustments." },
    ]);

    // ── Fetch existing data from SiteSetting ──
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await authFetch(`/api/cms/settings?section=${SECTION}`);
                if (res.ok) {
                    const data = await res.json();
                    const ids: Record<string, string> = {};
                    for (const item of data) {
                        ids[item.key] = item.id;
                        try {
                            const parsed = JSON.parse(item.extra || '{}');
                            switch (item.key) {
                                case KEYS.hero: setHero(parsed); break;
                                case KEYS.stats: setStats(parsed); break;
                                case KEYS.problems: setProblems(parsed); break;
                                case KEYS.features: setFeatures(parsed); break;
                                case KEYS.trust: setTrust(parsed); break;
                                case KEYS.solutions: setSolutions(parsed); break;
                            }
                        } catch { /* keep defaults */ }
                    }
                    setSettingIds(ids);
                }
            } catch (err) {
                console.error('Failed to fetch marble page settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // ── Save / Upsert helper ──
    const upsertSetting = useCallback(async (key: string, data: unknown) => {
        const json = JSON.stringify(data);
        const existingId = settingIds[key];

        if (existingId) {
            // Update existing
            const res = await authFetch(`/api/cms/settings/${existingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ extra: json }),
            });
            return res.ok;
        } else {
            // Create new
            const res = await authFetch('/api/cms/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: SECTION,
                    key,
                    valueAr: key,
                    valueEn: key,
                    extra: json,
                    order: 0,
                }),
            });
            if (res.ok) {
                const created = await res.json();
                setSettingIds(prev => ({ ...prev, [key]: created.id }));
            }
            return res.ok;
        }
    }, [settingIds]);

    // ── Save All ──
    const handleSaveAll = useCallback(async () => {
        setSaving(true);
        try {
            const results = await Promise.all([
                upsertSetting(KEYS.hero, hero),
                upsertSetting(KEYS.stats, stats),
                upsertSetting(KEYS.problems, problems),
                upsertSetting(KEYS.features, features),
                upsertSetting(KEYS.trust, trust),
                upsertSetting(KEYS.solutions, solutions),
            ]);
            if (results.every(Boolean)) {
                success(isRTL ? 'تم حفظ إعدادات صفحة النقل الصناعي!' : 'Industrial page settings saved!', isRTL ? '✅ تم الحفظ' : '✅ Saved');
            } else {
                toastError(isRTL ? 'فشل حفظ بعض الإعدادات' : 'Some settings failed to save', '❌');
            }
        } catch (err) {
            console.error(err);
            toastError(isRTL ? 'خطأ في الحفظ' : 'Save error', '❌');
        } finally {
            setSaving(false);
        }
    }, [hero, stats, problems, features, trust, solutions, upsertSetting, isRTL, success, toastError]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 animate-spin text-brand-orange" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Mountain className="w-5 h-5 text-brand-orange" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        {isRTL ? 'صفحة النقل الصناعي' : 'Industrial Transport Page'}
                    </h3>
                </div>
                <button
                    onClick={handleSaveAll}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isRTL ? 'حفظ الكل' : 'Save All'}
                </button>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400">
                {isRTL ? 'تحكم في محتوى صفحة النقل الصناعي وحاويات المصانع من هنا.' : 'Control the industrial transport page content from here.'}
            </p>

            {/* ═══ Section 1: Hero ═══ */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800/50 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Mountain className="w-4 h-4 text-brand-orange" />
                    <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                        {isRTL ? '1. قسم الهيرو' : '1. Hero Section'}
                    </h4>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <InputField label={isRTL ? 'العنوان السطر 1 (عربي)' : 'Title Line 1 (AR)'} value={hero.titleLine1Ar} onChange={v => setHero(p => ({ ...p, titleLine1Ar: v }))} />
                    <InputField label={isRTL ? 'العنوان السطر 1 (إنجليزي)' : 'Title Line 1 (EN)'} value={hero.titleLine1En} onChange={v => setHero(p => ({ ...p, titleLine1En: v }))} />
                    <InputField label={isRTL ? 'العنوان السطر 2 (عربي)' : 'Title Line 2 (AR)'} value={hero.titleLine2Ar} onChange={v => setHero(p => ({ ...p, titleLine2Ar: v }))} />
                    <InputField label={isRTL ? 'العنوان السطر 2 (إنجليزي)' : 'Title Line 2 (EN)'} value={hero.titleLine2En} onChange={v => setHero(p => ({ ...p, titleLine2En: v }))} />
                    <div className="col-span-2"><InputField label={isRTL ? 'الوصف (عربي)' : 'Description (AR)'} value={hero.descAr} onChange={v => setHero(p => ({ ...p, descAr: v }))} multiline /></div>
                    <div className="col-span-2"><InputField label={isRTL ? 'الوصف (إنجليزي)' : 'Description (EN)'} value={hero.descEn} onChange={v => setHero(p => ({ ...p, descEn: v }))} multiline /></div>
                    <div className="col-span-2 space-y-3">
                        <label className="text-xs text-gray-500 block">{isRTL ? 'صورة الهيرو' : 'Hero Image'}</label>
                        {/* Upload button */}
                        <div className="flex items-center gap-3">
                            <label className="flex items-center gap-2 px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition cursor-pointer text-sm font-medium">
                                <Mountain className="w-4 h-4" />
                                {uploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'رفع صورة' : 'Upload Image')}
                                <input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    setUploading(true);
                                    try {
                                        const fd = new FormData();
                                        fd.append('file', file);
                                        fd.append('folder', 'hero');
                                        const res = await authFetch('/api/upload', { method: 'POST', body: fd });
                                        if (res.ok) {
                                            const data = await res.json();
                                            setHero(p => ({ ...p, image: data.path }));
                                            success(isRTL ? 'تم رفع الصورة!' : 'Image uploaded!', '✅');
                                        } else {
                                            toastError(isRTL ? 'فشل رفع الصورة' : 'Upload failed', '❌');
                                        }
                                    } catch {
                                        toastError(isRTL ? 'خطأ في الرفع' : 'Upload error', '❌');
                                    } finally {
                                        setUploading(false);
                                        e.target.value = '';
                                    }
                                }} />
                            </label>
                            <span className="text-xs text-gray-400">{isRTL ? 'أو أدخل رابط مباشر' : 'or enter URL directly'}</span>
                        </div>
                        {/* URL input fallback */}
                        <InputField label={isRTL ? 'رابط الصورة (URL)' : 'Image URL'} value={hero.image} onChange={v => setHero(p => ({ ...p, image: v }))} />
                        {/* Preview */}
                        {hero.image && (
                            <div className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 h-40">
                                <img src={hero.image} alt="Hero preview" className="w-full h-full object-cover" />
                                <button onClick={() => setHero(p => ({ ...p, image: '' }))} className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-lg hover:bg-red-600 transition">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        )}
                    </div>
                    {/* Overlay Controls */}
                    <div className="col-span-2 grid grid-cols-3 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">{isRTL ? 'شفافية الطبقة' : 'Overlay Opacity'}</label>
                            <input type="range" min="0" max="1" step="0.05" value={hero.overlayOpacity} onChange={e => setHero(p => ({ ...p, overlayOpacity: parseFloat(e.target.value) }))} className="w-full accent-brand-orange" />
                            <span className="text-xs text-gray-400 block text-center">{hero.overlayOpacity}</span>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">{isRTL ? 'مقدار الضبابية' : 'Blur (px)'}</label>
                            <input type="range" min="0" max="20" step="1" value={hero.blurAmount} onChange={e => setHero(p => ({ ...p, blurAmount: parseInt(e.target.value) }))} className="w-full accent-brand-orange" />
                            <span className="text-xs text-gray-400 block text-center">{hero.blurAmount}px</span>
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">{isRTL ? 'لون الطبقة' : 'Overlay Color'}</label>
                            <select value={hero.overlayColor} onChange={e => setHero(p => ({ ...p, overlayColor: e.target.value }))} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:border-gray-700 text-sm">
                                <option value="blue">{isRTL ? 'أزرق بحري' : 'Marine Blue'}</option>
                                <option value="dark">{isRTL ? 'داكن' : 'Dark'}</option>
                                <option value="orange">{isRTL ? 'برتقالي' : 'Orange'}</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══ Section 2: Stats ═══ */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800/50 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                        {isRTL ? '2. الإحصائيات' : '2. Stats'}
                    </h4>
                </div>
                <div className="space-y-3">
                    {stats.map((stat, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-end p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <InputField label={isRTL ? 'الرقم (عربي)' : 'Number (AR)'} value={stat.valueAr} onChange={v => setStats(p => p.map((s, i) => i === idx ? { ...s, valueAr: v } : s))} />
                            <InputField label={isRTL ? 'الرقم (إنجليزي)' : 'Number (EN)'} value={stat.valueEn} onChange={v => setStats(p => p.map((s, i) => i === idx ? { ...s, valueEn: v } : s))} />
                            <InputField label={isRTL ? 'التسمية (عربي)' : 'Label (AR)'} value={stat.labelAr} onChange={v => setStats(p => p.map((s, i) => i === idx ? { ...s, labelAr: v } : s))} />
                            <InputField label={isRTL ? 'التسمية (إنجليزي)' : 'Label (EN)'} value={stat.labelEn} onChange={v => setStats(p => p.map((s, i) => i === idx ? { ...s, labelEn: v } : s))} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ Section 3: Problems ═══ */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800/50 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                            {isRTL ? '3. التحديات / المشاكل' : '3. Problems / Challenges'}
                        </h4>
                    </div>
                    <button
                        onClick={() => setProblems(p => ({ ...p, items: [...p.items, { titleAr: '', titleEn: '', descAr: '', descEn: '' }] }))}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        <Plus className="w-3.5 h-3.5" />{isRTL ? 'إضافة' : 'Add'}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <InputField label={isRTL ? 'عنوان القسم (عربي)' : 'Section Title (AR)'} value={problems.sectionTitleAr} onChange={v => setProblems(p => ({ ...p, sectionTitleAr: v }))} />
                    <InputField label={isRTL ? 'عنوان القسم (إنجليزي)' : 'Section Title (EN)'} value={problems.sectionTitleEn} onChange={v => setProblems(p => ({ ...p, sectionTitleEn: v }))} />
                </div>
                <div className="space-y-3">
                    {problems.items.map((item, idx) => (
                        <div key={idx} className="relative p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">#{idx + 1}</span>
                                <button onClick={() => setProblems(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <InputField label={isRTL ? 'العنوان (عربي)' : 'Title (AR)'} value={item.titleAr} onChange={v => setProblems(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, titleAr: v } : it) }))} />
                                <InputField label={isRTL ? 'العنوان (إنجليزي)' : 'Title (EN)'} value={item.titleEn} onChange={v => setProblems(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, titleEn: v } : it) }))} />
                                <InputField label={isRTL ? 'الوصف (عربي)' : 'Desc (AR)'} value={item.descAr} onChange={v => setProblems(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, descAr: v } : it) }))} multiline />
                                <InputField label={isRTL ? 'الوصف (إنجليزي)' : 'Desc (EN)'} value={item.descEn} onChange={v => setProblems(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, descEn: v } : it) }))} multiline />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ Section 4: Features ═══ */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800/50 space-y-4">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-orange" />
                        <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                            {isRTL ? '4. المميزات' : '4. Features / Why Us'}
                        </h4>
                    </div>
                    <button
                        onClick={() => setFeatures(p => ({ ...p, cards: [...p.cards, { titleAr: '', titleEn: '', descAr: '', descEn: '' }] }))}
                        className="flex items-center gap-1 px-2.5 py-1 text-xs bg-brand-orange text-white rounded-lg hover:bg-brand-orange/90 transition"
                    >
                        <Plus className="w-3.5 h-3.5" />{isRTL ? 'إضافة' : 'Add'}
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <InputField label={isRTL ? 'عنوان القسم (عربي)' : 'Section Title (AR)'} value={features.sectionTitleAr} onChange={v => setFeatures(p => ({ ...p, sectionTitleAr: v }))} />
                    <InputField label={isRTL ? 'عنوان القسم (إنجليزي)' : 'Section Title (EN)'} value={features.sectionTitleEn} onChange={v => setFeatures(p => ({ ...p, sectionTitleEn: v }))} />
                </div>
                <div className="space-y-3">
                    {features.cards.map((card, idx) => (
                        <div key={idx} className="relative p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-400">#{idx + 1}</span>
                                <button onClick={() => setFeatures(p => ({ ...p, cards: p.cards.filter((_, i) => i !== idx) }))} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <InputField label={isRTL ? 'العنوان (عربي)' : 'Title (AR)'} value={card.titleAr} onChange={v => setFeatures(p => ({ ...p, cards: p.cards.map((c, i) => i === idx ? { ...c, titleAr: v } : c) }))} />
                                <InputField label={isRTL ? 'العنوان (إنجليزي)' : 'Title (EN)'} value={card.titleEn} onChange={v => setFeatures(p => ({ ...p, cards: p.cards.map((c, i) => i === idx ? { ...c, titleEn: v } : c) }))} />
                                <InputField label={isRTL ? 'الوصف (عربي)' : 'Desc (AR)'} value={card.descAr} onChange={v => setFeatures(p => ({ ...p, cards: p.cards.map((c, i) => i === idx ? { ...c, descAr: v } : c) }))} multiline />
                                <InputField label={isRTL ? 'الوصف (إنجليزي)' : 'Desc (EN)'} value={card.descEn} onChange={v => setFeatures(p => ({ ...p, cards: p.cards.map((c, i) => i === idx ? { ...c, descEn: v } : c) }))} multiline />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* ═══ Section 5: Solutions ═══ */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800/50 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                        {isRTL ? '5. حلول النقل (الكروت الأربعة)' : '5. Transport Solutions (4 Cards)'}
                    </h4>
                </div>
                <div className="space-y-3">
                    {solutions.map((sol, idx) => (
                        <div key={idx} className="relative p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg space-y-2">
                            <span className="text-xs text-gray-400">#{idx + 1}</span>
                            <div className="grid grid-cols-2 gap-2">
                                <InputField label={isRTL ? 'العنوان (عربي)' : 'Title (AR)'} value={sol.titleAr} onChange={v => setSolutions(p => p.map((s, i) => i === idx ? { ...s, titleAr: v } : s))} />
                                <InputField label={isRTL ? 'العنوان (إنجليزي)' : 'Title (EN)'} value={sol.titleEn} onChange={v => setSolutions(p => p.map((s, i) => i === idx ? { ...s, titleEn: v } : s))} />
                                <InputField label={isRTL ? 'الوصف (عربي)' : 'Desc (AR)'} value={sol.descAr} onChange={v => setSolutions(p => p.map((s, i) => i === idx ? { ...s, descAr: v } : s))} multiline />
                                <InputField label={isRTL ? 'الوصف (إنجليزي)' : 'Desc (EN)'} value={sol.descEn} onChange={v => setSolutions(p => p.map((s, i) => i === idx ? { ...s, descEn: v } : s))} multiline />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══ Section 6: Trust Statistics ═══ */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800/50 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <BarChart3 className="w-4 h-4 text-marine-600" />
                    <h4 className="font-semibold text-gray-800 dark:text-white text-sm">
                        {isRTL ? '6. إحصائيات الثقة (لماذا يثق المقاولون)' : '6. Trust Statistics (Why Contractors Trust)'}
                    </h4>
                </div>
                <div className="space-y-3">
                    {trust.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-4 gap-2 items-end p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                            <InputField label={isRTL ? 'الرقم (عربي)' : 'Value (AR)'} value={item.valueAr} onChange={v => setTrust(p => p.map((s, i) => i === idx ? { ...s, valueAr: v } : s))} />
                            <InputField label={isRTL ? 'الرقم (إنجليزي)' : 'Value (EN)'} value={item.valueEn} onChange={v => setTrust(p => p.map((s, i) => i === idx ? { ...s, valueEn: v } : s))} />
                            <InputField label={isRTL ? 'التسمية (عربي)' : 'Label (AR)'} value={item.labelAr} onChange={v => setTrust(p => p.map((s, i) => i === idx ? { ...s, labelAr: v } : s))} />
                            <InputField label={isRTL ? 'التسمية (إنجليزي)' : 'Label (EN)'} value={item.labelEn} onChange={v => setTrust(p => p.map((s, i) => i === idx ? { ...s, labelEn: v } : s))} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
