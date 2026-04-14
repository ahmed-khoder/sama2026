'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import {
    Ship, Truck, Shield, CheckCircle2, ArrowRight, ArrowLeft,
    Anchor, Container, Globe, Clock, Package,
    Phone, TrendingUp, Award, MessageCircle,
    AlertTriangle, Wrench, FileCheck, MapPin, Eye,
    ChevronDown, X as XIcon,
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import AnimatedCounter from '@/components/AnimatedCounter';
import ClientsMarquee from '@/components/ClientsMarquee';
import { getSmartPhoneHref, getSmartPhoneProps, getWhatsAppHref } from '@/lib/smart-phone';
import { trackEvent, trackConversion } from '@/components/GoogleAnalytics';

// ─── WhatsApp Config ──────────────────────────────────────
const WHATSAPP_NUMBER = '201221300036';

// ─── Static Content (Approved Copywriting) ───────────────
const content = {
    hero: {
        badgeEn: 'Specialized in Container & Heavy Cargo Transport',
        badgeAr: 'متخصصون في نقل الحاويات والبضائع الثقيلة',
        titleLine1En: 'Your Containers Arrive',
        titleLine1Ar: 'حاوياتك تصل',
        titleLine2En: 'On Time — Zero Losses',
        titleLine2Ar: 'في الموعد — بدون خسائر',
        descEn: 'Tired of port delays, cargo damage, and customs bottlenecks? SAMA Logistics moves 10,000+ containers yearly from Port Said with 98% on-time delivery. From marble slabs out of Shaq El-Thoaban to full container loads across Egypt — we handle the heavy work so you don\'t have to.',
        descAr: 'تعبت من التأخير في الميناء، تلف البضائع، وتعقيدات الجمارك؟ سما لوجيستك تنقل أكثر من 10,000 حاوية سنوياً من بورسعيد بنسبة التزام 98% بالمواعيد. من ألواح الرخام في شق الثعبان إلى الحاويات الكاملة عبر مصر — نتولى الشغل الثقيل بدلاً عنك.',
    },
    stats: [
        { valueEn: '10,000+', valueAr: '+10,000', labelEn: 'Containers Yearly', labelAr: 'حاوية سنوياً' },
        { valueEn: '3', valueAr: '3', labelEn: 'Major Ports Covered', labelAr: 'موانئ رئيسية' },
        { valueEn: '98%', valueAr: '98%', labelEn: 'On-Time Delivery', labelAr: 'التزام بالمواعيد' },
        { valueEn: '25+', valueAr: '+25', labelEn: 'Years of Operations', labelAr: 'سنة في السوق' },
    ],
    painPoints: [
        {
            icon: Clock,
            problemEn: 'Your container sits at the port for days. Demurrage fees pile up. Your client is calling.',
            problemAr: 'حاويتك قاعدة في الميناء أيام. رسوم الأرضيات بتزيد. والعميل بيتصل يسأل.',
            solutionEn: 'Pre-coordinated port operations. We clear containers in 24-48 hours — not days.',
            solutionAr: 'تنسيق مسبق مع الميناء. نفسح الحاويات في 24-48 ساعة — مش أيام.',
            titleEn: 'Port Delays',
            titleAr: 'تأخير الميناء',
        },
        {
            icon: AlertTriangle,
            problemEn: 'Marble slabs cracked during loading. Heavy machinery scratched in transit. No insurance.',
            problemAr: 'ألواح الرخام اتكسرت في التحميل. المعدات الثقيلة اتخدشت. وماكانش في تأمين.',
            solutionEn: 'Professional loading teams trained for marble, steel, and heavy cargo. Full insurance on every shipment.',
            solutionAr: 'فرق تحميل متخصصة في الرخام والحديد والبضائع الثقيلة. تأمين شامل على كل شحنة.',
            titleEn: 'Cargo Damage',
            titleAr: 'تلف البضائع',
        },
        {
            icon: FileCheck,
            problemEn: 'Customs paperwork takes forever. Wrong documents mean delays. Nobody picks up the phone.',
            problemAr: 'ورق الجمارك بياخد وقت. مستندات غلط يعني تأخير. ومحدش بيرد على التليفون.',
            solutionEn: 'Dedicated customs team in Port Said. Complete documentation + clearance in 48 hours. Direct line, always.',
            solutionAr: 'فريق تخليص جمركي في بورسعيد. مستندات كاملة + إفراج في 48 ساعة. خط مباشر — دايماً.',
            titleEn: 'Customs Complexity',
            titleAr: 'تعقيدات الجمارك',
        },
    ],
    services: [
        {
            icon: Ship,
            titleEn: 'Full Container Load (FCL)',
            titleAr: 'حاويات كاملة (FCL)',
            descEn: 'Your cargo, your container — zero sharing, zero risk. Dedicated 20ft and 40ft containers with professional securing for any cargo type, from electronics to marble.',
            descAr: 'بضاعتك في حاويتك — بدون مشاركة، بدون مخاطر. حاويات 20 و40 قدم مخصصة مع تثبيت احترافي لأي نوع بضائع، من الإلكترونيات للرخام.',
        },
        {
            icon: Package,
            titleEn: 'Shared Container (LCL)',
            titleAr: 'حمولات مشتركة (LCL)',
            descEn: 'Ship small loads at big-load efficiency — save up to 60% on freight costs. Your goods are separated, secured, and tracked individually.',
            descAr: 'اشحن حمولات صغيرة بكفاءة الحمولات الكبيرة — وفر حتى 60% من تكاليف الشحن. بضاعتك مفصولة ومؤمنة ومتتبعة بشكل فردي.',
        },
        {
            icon: Truck,
            titleEn: 'Door-to-Port Transport',
            titleAr: 'النقل من الباب للميناء',
            descEn: 'From your factory door to the port gate in 24 hours — anywhere in Egypt. Our fleet handles 20ft, 40ft, flat-rack, and open-top containers.',
            descAr: 'من باب مصنعك لبوابة الميناء في 24 ساعة — في أي مكان بمصر. أسطولنا يتعامل مع حاويات 20 و40 قدم والمسطحة والمفتوحة.',
        },
        {
            icon: Anchor,
            titleEn: 'Port Operations & Clearance',
            titleAr: 'عمليات الموانئ والتخليص',
            descEn: 'Zero port delays — we manage everything from vessel arrival to gate-out. Operational presence at Port Said, East Port Said, and Damietta.',
            descAr: 'بدون تأخير في الميناء — نتولى كل شيء من وصول السفينة لخروج الحاوية. تواجد تشغيلي في بورسعيد وشرق بورسعيد ودمياط.',
        },
    ],
    trust: [
        {
            icon: Wrench,
            titleEn: 'Marble & Stone Transport Specialists',
            titleAr: 'متخصصون في نقل الرخام والأحجار',
            descEn: 'We transport marble slabs from Shaq El-Thoaban\'s quarries to Port Said for export — flat-rack containers, precision loading, and anti-vibration securing.',
            descAr: 'ننقل ألواح الرخام من محاجر شق الثعبان إلى بورسعيد للتصدير — حاويات مسطحة، تحميل دقيق، وتثبيت مقاوم للاهتزاز.',
            image: 'https://images.unsplash.com/photo-1590496793929-36417d3117de?auto=format&fit=crop&q=80&w=800',
            imageAlt: 'Marble slabs loaded on flat-rack container',
        },
        {
            icon: Shield,
            titleEn: 'Heavy & Oversized Cargo',
            titleAr: 'بضائع ثقيلة وكبيرة الحجم',
            descEn: 'Steel beams, factory equipment, construction machinery — we\'ve moved it all with low-bed trailers and crane-equipped trucks.',
            descAr: 'كمرات حديد، معدات مصانع، آلات بناء — نقلنا كل شيء بمقطورات منخفضة وشاحنات مجهزة بأوناش.',
            image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800',
            imageAlt: 'Heavy cargo being loaded with crane',
        },
        {
            icon: MapPin,
            titleEn: '3 Major Ports, 1 Team',
            titleAr: '3 موانئ رئيسية، فريق واحد',
            descEn: 'Operational teams at Port Said, East Port Said, and Damietta. We don\'t subcontract — our people are on the ground, every day.',
            descAr: 'فرق تشغيلية في بورسعيد وشرق بورسعيد ودمياط. لا نتعاقد من الباطن — فريقنا موجود على الأرض، كل يوم.',
            image: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80&w=800',
            imageAlt: 'Container port terminal operations',
        },
        {
            icon: Award,
            titleEn: '25+ Years in the Egyptian Market',
            titleAr: '25+ سنة في السوق المصري',
            descEn: 'Operating since 2000 — through economic shifts and regulation changes. That experience means we solve problems before they happen.',
            descAr: 'نعمل منذ عام 2000 — عبر التغيرات الاقتصادية وتعديلات القوانين. هذه الخبرة تعني أننا نحل المشاكل قبل ما تحصل.',
            image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800',
            imageAlt: 'Container trucks fleet',
        },
        {
            icon: Eye,
            titleEn: 'Track Every Container, Every Step',
            titleAr: 'تتبع كل حاوية، كل خطوة',
            descEn: 'GPS tracking on every truck. Status updates at every milestone. You\'ll never have to call to ask "where\'s my container?"',
            descAr: 'تتبع GPS على كل شاحنة. تحديثات الحالة عند كل مرحلة. مش هتحتاج تتصل تسأل "فين حاويتي؟"',
            image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&q=80&w=800',
            imageAlt: 'GPS tracking dashboard for container logistics',
        },
    ],
    featuresSafety: [
        { en: 'Comprehensive cargo insurance on every shipment', ar: 'تأمين شامل على البضائع في كل شحنة' },
        { en: 'GPS tracking — know where your container is, always', ar: 'تتبع GPS — اعرف مكان حاويتك دايماً' },
        { en: 'Professional securing for marble, steel & fragile goods', ar: 'تثبيت احترافي للرخام والحديد والبضائع الحساسة' },
        { en: 'Temperature-controlled containers for sensitive cargo', ar: 'حاويات مبردة للبضائع الحساسة' },
    ],
    featuresSpeed: [
        { en: 'Customs clearance in 48 hours — documents included', ar: 'تخليص جمركي في 48 ساعة — المستندات مشمولة' },
        { en: 'Door-to-door delivery — anywhere in Egypt', ar: 'توصيل من الباب للباب — في أي مكان بمصر' },
        { en: 'Open-top & flat-rack for oversized loads', ar: 'حاويات مفتوحة ومسطحة للبضائع كبيرة الحجم' },
        { en: 'Dedicated account manager — one call, one person', ar: 'مدير حساب مخصص — اتصال واحد، شخص واحد' },
    ],
    process: [
        { step: 1, titleEn: 'You Tell Us What You Need', titleAr: 'أخبرنا بما تحتاج', descEn: 'Call, WhatsApp, or fill the form. We\'ll reply with a detailed quote within 1 hour.', descAr: 'اتصل، واتساب، أو املأ النموذج. هنرد بعرض سعر مفصل خلال ساعة.' },
        { step: 2, titleEn: 'We Plan Everything', titleAr: 'نخطط لكل شيء', descEn: 'Route, container type, vessel booking, customs documents — all sorted before your cargo moves.', descAr: 'المسار، نوع الحاوية، حجز السفينة، مستندات الجمارك — كل شيء جاهز قبل ما بضاعتك تتحرك.' },
        { step: 3, titleEn: 'Professional Loading & Dispatch', titleAr: 'تحميل وإرسال احترافي', descEn: 'Our trained teams load and secure your cargo with equipment designed for heavy and fragile goods.', descAr: 'فرقنا المدربة تحمل وتثبت بضاعتك بمعدات مصممة للبضائع الثقيلة والحساسة.' },
        { step: 4, titleEn: 'Track & Receive', titleAr: 'تتبع واستلم', descEn: 'Real-time GPS tracking until safe delivery. We call you before arrival — no surprises.', descAr: 'تتبع GPS لحظي حتى التسليم الآمن. نتصل بك قبل الوصول — بدون مفاجآت.' },
    ],
    faq: [
        {
            qEn: 'How much does it cost to transport a container in Egypt?',
            qAr: 'كم تكلفة نقل حاوية في مصر؟',
            aEn: 'Pricing depends on container size (20ft or 40ft), route, cargo type, and additional services like customs clearance. We provide detailed quotes within 1 hour — contact us via WhatsApp or phone for an instant estimate.',
            aAr: 'التكلفة تعتمد على حجم الحاوية (20 أو 40 قدم)، المسار، نوع البضاعة، والخدمات الإضافية مثل التخليص الجمركي. نقدم عروض أسعار مفصلة خلال ساعة — تواصل معنا عبر واتساب أو الهاتف لتقدير فوري.',
        },
        {
            qEn: 'How long does it take to ship a container from Port Said?',
            qAr: 'كم يستغرق شحن حاوية من بورسعيد؟',
            aEn: 'Inland transport: 12-48 hours depending on destination within Egypt. Port clearance: 24-48 hours. International sea freight depends on destination port — we provide exact timelines with your quote.',
            aAr: 'النقل البري: 12-48 ساعة حسب الوجهة داخل مصر. إفراج الميناء: 24-48 ساعة. الشحن البحري الدولي يعتمد على ميناء الوصول — نقدم مواعيد دقيقة مع عرض السعر.',
        },
        {
            qEn: 'Is there insurance on my cargo during transport?',
            qAr: 'هل يوجد تأمين على البضاعة أثناء النقل؟',
            aEn: 'Yes, every shipment is covered by comprehensive cargo insurance. For high-value goods like marble, electronics, or machinery, we offer enhanced coverage. Insurance details are included in your quote.',
            aAr: 'نعم، كل شحنة مغطاة بتأمين شامل. للبضائع عالية القيمة مثل الرخام والإلكترونيات والمعدات، نوفر تغطية معززة. تفاصيل التأمين مشمولة في عرض السعر.',
        },
        {
            qEn: 'Do you handle marble slabs and heavy/oversized cargo?',
            qAr: 'هل تتعاملون مع ألواح الرخام والبضائع الثقيلة؟',
            aEn: 'This is our specialty. We transport marble from Shaq El-Thoaban quarries to Port Said using flat-rack containers with anti-vibration securing. We also handle steel, machinery, and oversized cargo.',
            aAr: 'هذا تخصصنا. ننقل الرخام من محاجر شق الثعبان إلى بورسعيد باستخدام حاويات فلات راك مع تثبيت مقاوم للاهتزاز. نتعامل أيضاً مع الحديد والمعدات والبضائع كبيرة الحجم.',
        },
        {
            qEn: 'Which Egyptian ports do you cover?',
            qAr: 'أي موانئ مصرية تغطونها؟',
            aEn: 'We have operational teams at Port Said, East Port Said (SCCT), and Damietta Port. We handle all port operations in-house — no subcontracting.',
            aAr: 'عندنا فرق تشغيلية في ميناء بورسعيد وشرق بورسعيد (SCCT) وميناء دمياط. نتولى جميع عمليات الموانئ بأنفسنا — بدون تعاقد من الباطن.',
        },
        {
            qEn: 'How do I request a container transport quote?',
            qAr: 'كيف أطلب عرض سعر لنقل حاوية؟',
            aEn: 'Three ways: 1) WhatsApp us directly for instant reply. 2) Call our operations team. 3) Fill out the quote form on our contact page. You\'ll receive a detailed quote within 1 hour.',
            aAr: 'ثلاث طرق: 1) راسلنا على واتساب — رد فوري. 2) اتصل بفريق العمليات. 3) املأ نموذج عرض السعر في صفحة التواصل. ستحصل على عرض سعر مفصل خلال ساعة.',
        },
    ],
};

// ─── Animation Variants ──────────────────────────────────
const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' },
    }),
};

// ═══════════════════════════════════════════════════════════
//  CLIENT COMPONENT
// ═══════════════════════════════════════════════════════════
interface ContainerTransportClientProps {
    clients: { name: string; logo: string }[];
}

export default function ContainerTransportClient({ clients }: ContainerTransportClientProps) {
    const { language } = useLanguage();
    const isRTL = language === 'ar';
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const whatsappUrl = getWhatsAppHref(
        WHATSAPP_NUMBER,
        isRTL
            ? 'مرحباً سما لوجيستك، أحتاج عرض سعر لنقل حاوية من الميناء إلى المصنع. ما هي التفاصيل المطلوبة؟'
            : 'Hi SAMA Logistics, I need a quote for container transport from port to factory. What details do you need?'
    );

    // Smart phone: tel on mobile, WhatsApp on desktop
    const smartPhoneHref = getSmartPhoneHref(
        '+201221300036',
        isRTL ? 'مرحباً، أريد الاستفسار عن أسعار نقل حاويات من الميناء' : 'Hi, I want to inquire about port container transport rates'
    );
    const smartPhoneProps = getSmartPhoneProps();

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">

            {/* ═══════════════════════════════════════════════════
                 1. BREADCRUMB
                ═══════════════════════════════════════════════════ */}
            <nav aria-label="Breadcrumb" className="border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-40">
                <div className="container mx-auto px-4 py-4">
                    <ol className="flex items-center gap-2 text-sm" itemScope itemType="https://schema.org/BreadcrumbList">
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href="/" itemProp="item" className="text-gray-600 dark:text-gray-400 hover:text-brand-orange transition-colors">
                                <span itemProp="name">{isRTL ? 'الرئيسية' : 'Home'}</span>
                            </Link>
                            <meta itemProp="position" content="1" />
                        </li>
                        <span className="text-gray-400">/</span>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <Link href="/services" itemProp="item" className="text-gray-600 dark:text-gray-400 hover:text-brand-orange transition-colors">
                                <span itemProp="name">{isRTL ? 'الخدمات' : 'Services'}</span>
                            </Link>
                            <meta itemProp="position" content="2" />
                        </li>
                        <span className="text-gray-400">/</span>
                        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
                            <span itemProp="name" className="text-brand-orange font-semibold">{isRTL ? 'نقل الحاويات' : 'Container Transport'}</span>
                            <meta itemProp="position" content="3" />
                        </li>
                    </ol>
                </div>
            </nav>

            {/* ═══════════════════════════════════════════════════
                 2. HERO SECTION
                ═══════════════════════════════════════════════════ */}
            <header className="relative min-h-[80vh] flex items-center overflow-hidden">
                {/* Background layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-marine-900 via-marine-800 to-slate-900" />
                <div className="absolute inset-0">
                    <Image
                        src="https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=60&w=1920"
                        alt={isRTL ? 'ميناء الحاويات في بورسعيد' : 'Container port terminal at Port Said'}
                        fill
                        className="object-cover opacity-20"
                        priority
                        sizes="100vw"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-marine-950/80 via-marine-900/40 to-transparent" />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange/10 rounded-full blur-[200px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-marine-500/15 rounded-full blur-[150px]" />

                <div className="container mx-auto px-4 relative z-10 py-20 md:py-0">
                    <div className="max-w-4xl">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8"
                        >
                            <Container className="w-4 h-4 text-brand-orange" />
                            <span className="text-sm font-semibold tracking-wide">
                                {isRTL ? content.hero.badgeAr : content.hero.badgeEn}
                            </span>
                        </motion.div>

                        {/* H1 Title */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                        >
                            <span className="text-white">
                                {isRTL ? content.hero.titleLine1Ar : content.hero.titleLine1En}
                            </span>
                            <br />
                            <span className="text-brand-orange">
                                {isRTL ? content.hero.titleLine2Ar : content.hero.titleLine2En}
                            </span>
                        </motion.h1>

                        {/* Description */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl font-normal"
                        >
                            {isRTL ? content.hero.descAr : content.hero.descEn}
                        </motion.p>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="flex flex-wrap gap-4"
                            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                        >
                            <Link
                                href="/contact?tab=quote"
                                onClick={() => trackEvent('quote_click', { page: 'container-transport', location: 'hero' })}
                                className="px-8 py-4 bg-brand-orange hover:bg-brand-darkOrange text-white font-semibold rounded-xl shadow-lg shadow-brand-orange/25 flex items-center gap-2 transition-all hover:scale-[1.03] hover:-translate-y-0.5"
                            >
                                {isRTL ? 'احصل على عرض سعر خلال ساعة' : 'Get a Quote Within 1 Hour'}
                                {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                            </Link>
                            <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => { trackEvent('whatsapp_click', { page: 'container-transport', location: 'hero' }); trackConversion('whatsapp_open', { page: 'container-transport', location: 'hero' }); }}
                                className="px-8 py-4 bg-[#25D366] hover:bg-[#1fba59] text-white font-semibold rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.03] hover:-translate-y-0.5"
                            >
                                <MessageCircle className="w-5 h-5" />
                                {isRTL ? 'واتساب — رد فوري' : 'WhatsApp — Instant Reply'}
                            </a>
                        </motion.div>
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════
                 3. STATS BAR
                ═══════════════════════════════════════════════════ */}
            <section className="relative z-10 -mt-8 md:-mt-10 pb-8">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                        {content.stats.map((stat, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                                className="text-center p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-800 shadow-xl border border-gray-100 dark:border-slate-700"
                            >
                                <AnimatedCounter value={isRTL ? stat.valueAr : stat.valueEn} className="text-2xl md:text-3xl font-black text-brand-orange mb-1" />
                                <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium">
                                    {isRTL ? stat.labelAr : stat.labelEn}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 4. PAIN POINTS
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-red-500/10 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold mb-4">
                            {isRTL ? 'تحديات شائعة' : 'Common Challenges'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'مشاكل ما المفروض تتعامل معاها' : 'Problems You Shouldn\'t Have to Deal With'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-2xl mx-auto font-normal">
                            {isRTL
                                ? 'شفنا المشاكل دي تكلف شركات ملايين. وهكذا نقضي عليها.'
                                : 'We\'ve seen these issues cost companies millions. Here\'s how we eliminate them.'}
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {content.painPoints.map((pain, idx) => (
                            <motion.div
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 rounded-3xl p-8 border border-gray-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                                    <pain.icon className="w-7 h-7 text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">{isRTL ? pain.titleAr : pain.titleEn}</h3>

                                {/* Problem */}
                                <div className="flex items-start gap-3 mb-6 p-4 bg-red-50 dark:bg-red-950/30 rounded-xl border border-red-100 dark:border-red-900/30">
                                    <XIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-800 dark:text-red-300 text-sm leading-relaxed">
                                        {isRTL ? pain.problemAr : pain.problemEn}
                                    </p>
                                </div>

                                {/* Solution */}
                                <div className="flex items-start gap-3 p-4 bg-green-50 dark:bg-green-950/30 rounded-xl border border-green-100 dark:border-green-900/30">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-green-800 dark:text-green-300 text-sm leading-relaxed font-medium">
                                        {isRTL ? pain.solutionAr : pain.solutionEn}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 5. SERVICES
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
                            <Ship className="w-4 h-4 inline-block mr-2 -mt-0.5" />
                            {isRTL ? 'حلولنا' : 'Our Solutions'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'خدمات حاويات مصممة لاحتياجات الشركات الحقيقية' : 'Container Services Built for Real Business Needs'}
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                        {content.services.map((service, idx) => (
                            <motion.article
                                key={idx}
                                custom={idx}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                className="group relative bg-white dark:bg-slate-800/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-orange to-brand-gold rounded-t-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex items-start gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-orange/15 to-brand-gold/10 flex items-center justify-center group-hover:from-brand-orange group-hover:to-orange-600 transition-all duration-300 flex-shrink-0 shadow-lg">
                                        <service.icon className="w-8 h-8 text-brand-orange group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 group-hover:text-brand-orange transition-colors">
                                            {isRTL ? service.titleAr : service.titleEn}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                                            {isRTL ? service.descAr : service.descEn}
                                        </p>
                                    </div>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 6. TRUST & PROOF
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
                        <span className="inline-block px-4 py-1.5 bg-marine-500/10 text-marine-600 dark:text-marine-400 rounded-full text-sm font-semibold mb-4">
                            {isRTL ? 'لماذا تثق الشركات بنا' : 'Why Companies Trust Us'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white mb-4">
                            {isRTL ? 'لسنا مجرد شركة نقل — نحن متخصصون في العمليات' : 'Not Just a Transport Company — We\'re Operations Specialists'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 text-base md:text-lg max-w-3xl mx-auto font-normal">
                            {isRTL
                                ? 'من محاجر الرخام في شق الثعبان إلى محطات حاويات بورسعيد، بنينا سمعتنا على إنجاز أصعب المهام بالشكل الصحيح.'
                                : 'From Shaq El-Thoaban\'s marble quarries to Port Said\'s container terminals, we\'ve built our reputation on getting the hardest jobs done right.'}
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {content.trust.map((item, idx) => (
                            <motion.article
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.08 }}
                                className={`group flex flex-col ${idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} gap-6 bg-white dark:bg-slate-800/80 rounded-3xl overflow-hidden shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl transition-shadow`}
                            >
                                {/* Image */}
                                <div className="relative w-full md:w-2/5 h-56 md:h-auto min-h-[220px] overflow-hidden">
                                    <Image
                                        src={item.image}
                                        alt={item.imageAlt}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 768px) 100vw, 40vw"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/10" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 p-8 flex flex-col justify-center">
                                    <div className="w-12 h-12 rounded-xl bg-brand-orange/10 flex items-center justify-center mb-4">
                                        <item.icon className="w-6 h-6 text-brand-orange" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 tracking-tight">
                                        {isRTL ? item.titleAr : item.titleEn}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                                        {isRTL ? item.descAr : item.descEn}
                                    </p>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 7. PARTNERS MARQUEE (Reused Component)
                ═══════════════════════════════════════════════════ */}
            <ClientsMarquee clients={clients} />

            {/* ═══════════════════════════════════════════════════
                 8. FEATURES / BENEFITS (Grouped)
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 bg-white dark:bg-slate-950 relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px]" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-marine-500/10 text-marine-600 dark:text-marine-400 rounded-full text-sm font-semibold mb-4">
                            {isRTL ? 'ما تحصل عليه' : 'What You Get'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            {isRTL ? 'كل ما شحنتك تحتاجه — مشمول' : 'Everything Your Shipment Needs — Included'}
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        {/* Safety Group */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-green-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isRTL ? 'الأمان والتأمين' : 'Safety & Insurance'}</h3>
                            </div>
                            <div className="space-y-3">
                                {content.featuresSafety.map((f, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800/70 rounded-xl border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{isRTL ? f.ar : f.en}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Speed Group */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{isRTL ? 'السرعة والكفاءة' : 'Speed & Efficiency'}</h3>
                            </div>
                            <div className="space-y-3">
                                {content.featuresSpeed.map((f, i) => (
                                    <motion.div key={i} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                                        className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-slate-800/70 rounded-xl border border-gray-100 dark:border-white/10 hover:shadow-md transition-shadow">
                                        <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium text-sm">{isRTL ? f.ar : f.en}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 9. PROCESS STEPS
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
                            {isRTL ? '4 خطوات بسيطة' : '4 Simple Steps'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            {isRTL ? 'من طلبك للتسليم — هكذا نعمل' : 'From Your Request to Delivery — Here\'s How'}
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {content.process.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.15 }}
                                className="relative bg-white dark:bg-slate-800/80 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-slate-700 hover:shadow-2xl transition-shadow group"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-orange to-orange-600 flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                                    {item.step}
                                </div>
                                {idx < content.process.length - 1 && (
                                    <div className="hidden lg:block absolute top-[3.5rem] right-0 w-[calc(50%)] h-0.5 bg-gradient-to-r from-brand-orange/30 to-transparent translate-x-full" />
                                )}
                                <h3 className="text-lg md:text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-3 group-hover:text-brand-orange transition-colors">
                                    {isRTL ? item.titleAr : item.titleEn}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm font-normal">
                                    {isRTL ? item.descAr : item.descEn}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 10. FAQ
                ═══════════════════════════════════════════════════ */}
            <section className="py-20 md:py-24 bg-white dark:bg-slate-950">
                <div className="container mx-auto px-4 max-w-4xl">
                    <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
                        <span className="inline-block px-4 py-1.5 bg-brand-orange/10 text-brand-orange rounded-full text-sm font-semibold mb-4">
                            {isRTL ? 'عندك أسئلة؟' : 'Have Questions?'}
                        </span>
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 dark:text-white">
                            {isRTL ? 'أسئلة شائعة عن نقل الحاويات' : 'Frequently Asked Questions About Container Transport'}
                        </h2>
                    </motion.div>

                    <div className="space-y-3">
                        {content.faq.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-gray-50 dark:bg-slate-800/70 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                    className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <span className="font-semibold text-gray-900 dark:text-white text-base md:text-lg pr-4">
                                        {isRTL ? item.qAr : item.qEn}
                                    </span>
                                    <ChevronDown className={`w-5 h-5 text-brand-orange flex-shrink-0 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {openFaq === idx && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <p className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed font-normal">
                                                {isRTL ? item.aAr : item.aEn}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 11. CTA FINAL
                ═══════════════════════════════════════════════════ */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-slate-900 dark:to-slate-950">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative bg-gradient-to-br from-marine-600 to-marine-800 rounded-3xl p-12 md:p-16 text-center overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/30 rounded-full blur-[100px]" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-[80px]" />

                        <div className="relative z-10">
                            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                                <Container className="w-16 h-16 text-brand-orange mx-auto mb-6 opacity-80" />
                            </motion.div>
                            <h2 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-6">
                                {isRTL ? 'ابدأ شحن حاوياتك — بدون تأخير، بدون مفاجآت' : 'Start Shipping Your Containers — No Delays, No Surprises'}
                            </h2>
                            <p className="text-lg text-gray-200/80 max-w-2xl mx-auto mb-10 font-normal">
                                {isRTL
                                    ? 'احصل على عرض سعر مفصل خلال ساعة. فريق العمليات جاهز.'
                                    : 'Get a detailed quote within 1 hour. Our operations team is standing by.'}
                            </p>

                            <div className="flex flex-wrap justify-center gap-4">
                                <Link
                                    href="/contact?tab=quote"
                                    onClick={() => trackEvent('quote_click', { page: 'container-transport', location: 'cta' })}
                                    className="px-10 py-5 bg-brand-orange hover:bg-brand-darkOrange text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-orange/30 flex items-center gap-2 text-lg hover:scale-[1.03]"
                                >
                                    {isRTL ? 'احصل على عرض سعرك الآن' : 'Get Your Quote Now'}
                                    {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                                </Link>
                                <a
                                    href={whatsappUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => { trackEvent('whatsapp_click', { page: 'container-transport', location: 'cta' }); trackConversion('whatsapp_open', { page: 'container-transport', location: 'cta' }); }}
                                    className="px-10 py-5 bg-[#25D366] hover:bg-[#1fba59] text-white font-bold rounded-xl transition-all text-lg flex items-center gap-2 hover:scale-[1.03]"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    {isRTL ? 'واتساب — رد فوري' : 'WhatsApp — Instant Reply'}
                                </a>
                                <a
                                    href={smartPhoneHref}
                                    {...smartPhoneProps}
                                    onClick={() => { trackEvent('call_click', { page: 'container-transport', location: 'cta' }); setTimeout(() => { if (document.hasFocus()) trackConversion('call_intent', { page: 'container-transport', location: 'cta' }); }, 3000); }}
                                    aria-label={isRTL ? 'اتصل بفريق العمليات' : 'Call Operations Team'}
                                    className="px-10 py-5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-xl transition-all text-lg flex items-center gap-2"
                                >
                                    <Phone className="w-5 h-5" />
                                    {isRTL ? 'اتصل بفريق العمليات' : 'Call Operations Team'}
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ═══════════════════════════════════════════════════
                 12. FLOATING WHATSAPP BUTTON
                ═══════════════════════════════════════════════════ */}
            <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => { trackEvent('whatsapp_click', { page: 'container-transport', location: 'floating' }); trackConversion('whatsapp_open', { page: 'container-transport', location: 'floating' }); }}
                aria-label={isRTL ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
                className={`fixed bottom-6 ${isRTL ? 'left-6' : 'right-6'} z-50 w-16 h-16 bg-[#25D366] hover:bg-[#1fba59] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/30 hover:scale-110 transition-all group`}
            >
                <MessageCircle className="w-8 h-8 text-white" />
                {/* Tooltip */}
                <span className={`absolute bottom-full mb-3 ${isRTL ? 'left-0' : 'right-0'} bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none`}>
                    {isRTL ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
                </span>
                {/* Pulse ring */}
                <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20" />
            </a>
        </div>
    );
}
