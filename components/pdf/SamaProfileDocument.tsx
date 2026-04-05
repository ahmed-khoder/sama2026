/**
 * SAMA Logistics — Company Profile PDF (v3 — ROYAL EDITION)
 * ═════════════════════════════════════════════════════════════
 * Editorial-luxury design. Mercedes catalog quality.
 * Official SAMA logo on cover + every page footer.
 * Full-quality images. Wide spacing. Premium typography.
 *
 * FOUNDATION YEAR: 2000
 * SILVER JUBILEE: 2000–2025
 *
 * Standalone — NO auth/middleware dependencies.
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  Image,
  Font,
  StyleSheet,
  Link,
} from '@react-pdf/renderer';
import path from 'path';

// ═══════════════════════════════════════════════
// BRAND COLOR SYSTEM
// ═══════════════════════════════════════════════
const B = {
  navy: '#0A1428',
  navyMid: '#0E1E3A',
  navyLight: '#152952',
  orange: '#F97316',
  orangeGlow: '#FB923C',
  orangePale: '#FFF7ED',
  gold: '#D4A84B',
  white: '#FFFFFF',
  offWhite: '#FAFBFC',
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray900: '#111827',
};

// ═══════════════════════════════════════════════
// FONTS — Amiri (Arabic) + Inter (Latin)
// ═══════════════════════════════════════════════
const fontsDir = path.join(process.cwd(), 'public', 'fonts');

Font.register({
  family: 'Amiri',
  fonts: [
    { src: path.join(fontsDir, 'Amiri-Regular.ttf'), fontWeight: 400 },
    { src: path.join(fontsDir, 'Amiri-Bold.ttf'), fontWeight: 700 },
  ],
});

Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(fontsDir, 'Inter-Regular.ttf'), fontWeight: 400 },
    { src: path.join(fontsDir, 'Inter-Bold.ttf'), fontWeight: 700 },
  ],
});

Font.registerHyphenationCallback((word) => [word]);

// ═══════════════════════════════════════════════
// DATA TYPES
// ═══════════════════════════════════════════════
export interface ProfileData {
  logo?: string;
  coverImage?: string;
  services: Array<{
    id: string;
    titleAr: string; titleEn: string;
    shortDescAr: string; shortDescEn: string;
    featuresJson: string;
    iconName: string;
    image?: string;
  }>;
  fleet: Array<{
    nameAr: string; nameEn: string;
    descAr: string; descEn: string;
    image?: string;
    specsJson: string;
  }>;
  ports: Array<{
    nameAr: string; nameEn: string;
    descAr: string; descEn: string;
    image?: string;
    factsJson: string;
  }>;
  specializedCargo: Array<{
    titleAr: string; titleEn: string;
    descAr: string; descEn: string;
    badgeAr: string; badgeEn: string;
  }>;
  milestones: Array<{
    year: string;
    titleAr: string; titleEn: string;
    descriptionAr: string; descriptionEn: string;
  }>;
  accreditations: Array<{ id: string; logo?: string }>;
  partners: Array<{ name: string; logo: string }>;
  whySection: {
    titleAr: string; titleEn: string;
    descriptionAr: string; descriptionEn: string;
    reasonsJson: string;
    statsValue: string;
    statsLabelAr: string; statsLabelEn: string;
  };
}

interface Props {
  lang: 'ar' | 'en';
  data: ProfileData;
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
const t = (l: string, ar: string, en: string) => l === 'ar' ? ar : en;
const f = (l: string) => l === 'ar' ? 'Amiri' : 'Inter';
function json<T>(s: string, fb: T): T {
  try { return typeof s === 'string' ? JSON.parse(s) : s || fb; } catch { return fb; }
}

// ═══════════════════════════════════════════════
// SHARED: Page footer with logo
// ═══════════════════════════════════════════════
function PageFooter({ logo, pageNum, light }: { logo?: string; pageNum: number; light?: boolean }) {
  return (
    <View style={{
      position: 'absolute' as const, bottom: 0, left: 0, right: 0,
      flexDirection: 'row' as const, alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 44, paddingVertical: 14,
    }}>
      <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const }}>
        {logo && <Image src={logo} style={{ width: 18, height: 18, objectFit: 'contain' as const, marginRight: 8 }} />}
        <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: light ? 'rgba(255,255,255,0.35)' : B.gray400, letterSpacing: 2 }}>
          SAMA LOGISTICS
        </Text>
      </View>
      <Text style={{ fontFamily: 'Inter', fontSize: 7, color: light ? 'rgba(255,255,255,0.25)' : B.gray400 }}>
        {pageNum}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════
// SHARED: Section Header
// ═══════════════════════════════════════════════
function SectionTitle({ badge, title, subtitle, lang, light }: {
  badge: string; title: string; subtitle?: string; lang: string; light?: boolean;
}) {
  const dir = lang === 'ar' ? { textAlign: 'right' as const } : {};
  return (
    <View style={[dir, { marginBottom: 16 }]}>
      <Text style={{
        fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: B.orange,
        letterSpacing: 3, textTransform: 'uppercase' as const,
        marginBottom: 8,
      }}>{badge}</Text>
      <Text style={{
        fontFamily: f(lang), fontSize: 24, fontWeight: 700,
        color: light ? B.white : B.navy, marginBottom: 6,
      }}>{title}</Text>
      <View style={{ width: 50, height: 3, backgroundColor: B.orange, borderRadius: 2, marginBottom: subtitle ? 12 : 0 }} />
      {subtitle && (
        <Text style={{
          fontFamily: f(lang), fontSize: 10, color: light ? 'rgba(255,255,255,0.6)' : B.gray500,
          lineHeight: 1.8, maxWidth: 400, marginTop: 6,
        }}>{subtitle}</Text>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 1 — COVER (DHL-LEVEL LUXURY HERO)
// ═══════════════════════════════════════════════════════════════
function CoverPage({ lang, data }: Props) {
  return (
    <Page size="A4" style={{ backgroundColor: B.navy, position: 'relative' as const }}>
      {/* FULL-BLEED HERO — cinematic fullscreen truck image */}
      {data.coverImage && (
        <Image src={data.coverImage} style={{
          position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0,
          objectFit: 'cover' as const,
        }} />
      )}
      {/* Cinematic dark overlay — text-readable but image shows through */}
      <View style={{
        position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(10,20,40,0.72)',
      }} />

      {/* ── ORANGE TOP ACCENT (DHL signature — 6px) ── */}
      <View style={{ height: 6, backgroundColor: B.orange, position: 'relative' as const }} />

      {/* ── TOP HEADER: Logo + COMPANY PROFILE badge ── */}
      <View style={{
        flexDirection: 'row' as const, justifyContent: 'space-between' as const,
        alignItems: 'center' as const,
        paddingHorizontal: 44, paddingTop: 28, position: 'relative' as const,
      }}>
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 }}>
          {data.logo && <Image src={data.logo} style={{ width: 32, height: 32, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 3 }}>SAMA LOGISTICS</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(249,115,22,0.15)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.3)', borderRadius: 4, paddingHorizontal: 10, paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: B.orange, letterSpacing: 2 }}>
            {t(lang, 'ملف تعريف الشركة', 'COMPANY PROFILE')}
          </Text>
        </View>
      </View>

      {/* ── MAIN HERO — centered vertically ── */}
      <View style={{ flex: 1, justifyContent: 'center' as const, alignItems: 'center' as const, paddingHorizontal: 50, position: 'relative' as const }}>
        {/* MASSIVE OFFICIAL LOGO — 160px (The King) */}
        {data.logo && (
          <Image src={data.logo} style={{ width: 160, height: 160, objectFit: 'contain' as const, marginBottom: 28 }} />
        )}
        {/* COMPANY NAME — 56pt hero */}
        <Text style={{ fontFamily: 'Inter', fontSize: 56, fontWeight: 700, color: B.white, letterSpacing: 14 }}>SAMA</Text>
        <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: B.orange, letterSpacing: 12, textTransform: 'uppercase' as const, marginBottom: 36 }}>LOGISTICS</Text>
        {/* Triple luxury divider */}
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, marginBottom: 28 }}>
          <View style={{ width: 40, height: 1, backgroundColor: 'rgba(249,115,22,0.3)' }} />
          <View style={{ width: 30, height: 3, backgroundColor: B.orange, borderRadius: 2 }} />
          <View style={{ width: 40, height: 1, backgroundColor: 'rgba(249,115,22,0.3)' }} />
        </View>
        {/* TAGLINE */}
        <Text style={{ fontFamily: f(lang), fontSize: 16, fontWeight: 700, color: B.white, letterSpacing: 2, marginBottom: 8, textAlign: 'center' as const }}>
          {t(lang, 'خدمات لوجستية متخصصة. توصيل آمن.', 'Specialized Logistics. Safely Delivered.')}
        </Text>
        <Text style={{ fontFamily: f(lang), fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 24, textAlign: 'center' as const }}>
          {t(lang, 'شريكك الاستراتيجي في بوابة قناة السويس', 'Your Strategic Partner at the Suez Canal Gateway')}
        </Text>
        {/* EST. 2000 premium pill badge */}
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12, backgroundColor: 'rgba(249,115,22,0.1)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.25)', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 8 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: 700, color: B.orange }}>2000</Text>
          <View style={{ width: 1, height: 20, backgroundColor: 'rgba(249,115,22,0.3)' }} />
          <View>
            <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>ESTABLISHED</Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 9, fontWeight: 700, color: B.white }}>Port Said, Egypt</Text>
          </View>
        </View>
      </View>

      {/* ── BOTTOM INFO BAR ── */}
      <View style={{ flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingHorizontal: 44, paddingBottom: 16, position: 'relative' as const }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 7, color: 'rgba(255,255,255,0.3)', letterSpacing: 1 }}>PORT SAID  ·  DAMIETTA  ·  EAST PORT SAID</Text>
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: B.orange }} />
          <Text style={{ fontFamily: 'Inter', fontSize: 8, color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>samalogs.com</Text>
        </View>
      </View>
      {/* ── ORANGE BOTTOM ACCENT (DHL signature — 6px) ── */}
      <View style={{ height: 6, backgroundColor: B.orange, position: 'relative' as const }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 2 — TABLE OF CONTENTS (Clean Grid)
// ═══════════════════════════════════════════════════════════════
function TOCPage({ lang, data }: Props) {
  const sections = [
    { num: '01', ar: 'الغلاف', en: 'Cover', descAr: 'الانطباع الأول', descEn: 'First Impression' },
    { num: '02', ar: 'الفهرس', en: 'Contents', descAr: 'محتويات البروفايل', descEn: 'Profile Contents' },
    { num: '03', ar: 'رسالة التميز', en: 'Excellence', descAr: 'منذ عام 2000', descEn: 'Since 2000' },
    { num: '04', ar: 'القدرات', en: 'Capabilities', descAr: 'خدماتنا اللوجستية', descEn: 'Our Logistics Services' },
    { num: '05', ar: 'القطاعات', en: 'Sectors', descAr: 'رخام وبضائع ثقيلة', descEn: 'Marble & Heavy Cargo' },
    { num: '06', ar: 'الأسطول', en: 'Fleet', descAr: 'مرسيدس وفولفو', descEn: 'Mercedes & Volvo' },
    { num: '07', ar: 'الأمان والبيئة', en: 'HSE', descAr: 'السلامة والصحة', descEn: 'Health, Safety & Environment' },
    { num: '08', ar: 'التكنولوجيا', en: 'Technology', descAr: 'أنظمة التتبع', descEn: 'Tracking Systems' },
    { num: '09', ar: 'التواجد الاستراتيجي', en: 'Presence', descAr: 'بورسعيد ودمياط', descEn: 'Port Said & Damietta' },
    { num: '10', ar: 'التواصل', en: 'Contact', descAr: 'تواصل معنا', descEn: 'Get in Touch' },
  ];
  return (
    <Page size="A4" style={{ backgroundColor: B.white, position: 'relative' as const }}>
      <View style={{ height: 6, backgroundColor: B.orange }} />
      <View style={{ paddingHorizontal: 44, paddingTop: 20, paddingBottom: 10, flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const }}>
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 22, height: 22, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: B.gray400, letterSpacing: 2 }}>SAMA LOGISTICS</Text>
        </View>
        <Text style={{ fontFamily: 'Inter', fontSize: 7, color: B.gray400 }}>02</Text>
      </View>
      <View style={{ paddingHorizontal: 50, paddingTop: 24, paddingBottom: 40 }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: B.orange, letterSpacing: 4, marginBottom: 6 }}>
          {t(lang, 'الفهرس', 'TABLE OF CONTENTS')}
        </Text>
        <Text style={{ fontFamily: f(lang), fontSize: 28, fontWeight: 700, color: B.navy, marginBottom: 4 }}>
          {t(lang, 'محتويات البروفايل', 'Profile Contents')}
        </Text>
        <View style={{ width: 50, height: 3, backgroundColor: B.orange, borderRadius: 2, marginBottom: 30 }} />
        {sections.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row' as const, alignItems: 'center' as const, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: i < sections.length - 1 ? B.gray100 : 'transparent' }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: 700, color: B.orange, width: 44 }}>{s.num}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f(lang), fontSize: 13, fontWeight: 700, color: B.navy }}>{t(lang, s.ar, s.en)}</Text>
              <Text style={{ fontFamily: f(lang), fontSize: 8, color: B.gray500 }}>{t(lang, s.descAr, s.descEn)}</Text>
            </View>
            <View style={{ width: 80, height: 1, backgroundColor: B.gray200, marginRight: 12 }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, color: B.gray400 }}>{s.num}</Text>
          </View>
        ))}
      </View>
      <View style={{ height: 6, backgroundColor: B.orange, position: 'absolute' as const, bottom: 0, left: 0, right: 0 }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 3 — EXCELLENCE MESSAGE (Since 2000)
// ═══════════════════════════════════════════════════════════════
function ExcellencePage({ lang, data }: Props) {
  const dir = lang === 'ar' ? { textAlign: 'right' as const } : {};
  return (
    <Page size="A4" style={{ backgroundColor: B.white, position: 'relative' as const }}>
      {/* ══ MASSIVE GHOST '2000' — overlapping editorial typography ══ */}
      <View style={{ position: 'absolute' as const, top: 60, right: -20 }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 130, fontWeight: 700, color: 'rgba(249,115,22,0.04)' }}>2000</Text>
      </View>
      {/* ══ GHOST WATERMARK LOGO ══ */}
      {data.logo && (
        <Image src={data.logo} style={{
          position: 'absolute' as const, bottom: 40, left: -30,
          width: 200, height: 200, objectFit: 'contain' as const, opacity: 0.03,
        }} />
      )}
      {/* ══ DIAGONAL ACCENT STRIPE ══ */}
      <View style={{ position: 'absolute' as const, top: 0, right: 50, width: 2, height: '100%', backgroundColor: 'rgba(249,115,22,0.06)', transform: 'skewX(-5deg)' }} />

      <View style={{ height: 6, backgroundColor: B.orange }} />
      <View style={{ paddingHorizontal: 44, paddingTop: 20, paddingBottom: 10, flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const }}>
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 22, height: 22, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: B.gray400, letterSpacing: 2 }}>SAMA LOGISTICS</Text>
        </View>
        <Text style={{ fontFamily: 'Inter', fontSize: 7, color: B.gray400 }}>03</Text>
      </View>
      <View style={{ paddingHorizontal: 50, paddingTop: 20, paddingBottom: 20, position: 'relative' as const }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: B.orange, letterSpacing: 4, marginBottom: 6 }}>
          {t(lang, 'رسالة التميز', 'A MESSAGE OF EXCELLENCE')}
        </Text>
        <Text style={{ fontFamily: f(lang), fontSize: 32, fontWeight: 700, color: B.navy, marginBottom: 4 }}>
          {t(lang, 'منذ عام 2000', 'Since 2000')}
        </Text>
        <View style={{ width: 50, height: 3, backgroundColor: B.orange, borderRadius: 2, marginBottom: 14 }} />
        <Text style={[{ fontFamily: f(lang), fontSize: 10, color: B.gray700, lineHeight: 1.8, marginBottom: 18, maxWidth: 480 }, dir]}>
          {t(lang,
            'على مدى أكثر من 25 عاماً، بنت سما للخدمات اللوجستية سمعة راسخة في بورسعيد وشرق التفريعة كشريك لوجستي موثوق. نجمع بين الخبرة المحلية العميقة في منطقة قناة السويس والمعرفة العالمية لنقدم حلولاً متكاملة تشمل النقل البري والتخليص الجمركي والشحن البحري.',
            'Over 25 years, SAMA Logistics has built an unshakeable reputation in Port Said and East Port Said as a trusted logistics partner. We combine deep local expertise in the Suez Canal zone with global knowledge to deliver integrated solutions spanning land transport, customs clearance, and maritime freight.'
          )}
        </Text>
        {/* Stats */}
        <View style={{ flexDirection: 'row' as const, gap: 10, marginBottom: 18 }}>
          {[
            { n: '25+', ar: 'سنة خبرة', en: 'Years of Excellence' },
            { n: '50+', ar: 'ميناء عالمي', en: 'Global Ports' },
            { n: '10K+', ar: 'شحنة ناجحة', en: 'Successful Shipments' },
            { n: '500+', ar: 'عميل موثوق', en: 'Trusted Clients' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' as const, paddingVertical: 12, backgroundColor: i === 0 ? B.navy : B.offWhite, borderRadius: 8 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 700, color: i === 0 ? B.orange : B.navy, marginBottom: 2 }}>{s.n}</Text>
              <Text style={{ fontFamily: f(lang), fontSize: 7, color: i === 0 ? 'rgba(255,255,255,0.6)' : B.gray500, textAlign: 'center' as const }}>{t(lang, s.ar, s.en)}</Text>
            </View>
          ))}
        </View>
        {/* Vision & Mission */}
        <View style={{ flexDirection: 'row' as const, gap: 10 }}>
          <View style={{ flex: 1, backgroundColor: B.navy, borderRadius: 10, padding: 20, position: 'relative' as const, overflow: 'hidden' as const }}>
            <View style={{ position: 'absolute' as const, top: -25, right: -25, width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(249,115,22,0.08)' }} />
            <View style={{ height: 3, width: 36, backgroundColor: B.orange, borderRadius: 2, marginBottom: 12 }} />
            <Text style={[{ fontFamily: f(lang), fontSize: 13, fontWeight: 700, color: B.white, marginBottom: 8 }, dir]}>{t(lang, 'رؤيتنا', 'Our Vision')}</Text>
            <Text style={[{ fontFamily: f(lang), fontSize: 8.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }, dir]}>
              {t(lang, 'أن نكون الشريك اللوجستي الأول في الشرق الأوسط وشمال أفريقيا، من خلال حلول مبتكرة تسهل التجارة العالمية.', 'To be the first-choice logistics partner in the MENA region, delivering innovative solutions that facilitate global trade.')}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: B.orangePale, borderRadius: 10, padding: 20, borderWidth: 1, borderColor: '#FDBA74', position: 'relative' as const, overflow: 'hidden' as const }}>
            <View style={{ position: 'absolute' as const, bottom: -18, left: -18, width: 55, height: 55, borderRadius: 28, backgroundColor: 'rgba(249,115,22,0.06)' }} />
            <View style={{ height: 3, width: 36, backgroundColor: B.orange, borderRadius: 2, marginBottom: 12 }} />
            <Text style={[{ fontFamily: f(lang), fontSize: 13, fontWeight: 700, color: B.navy, marginBottom: 8 }, dir]}>{t(lang, 'رسالتنا', 'Our Mission')}</Text>
            <Text style={[{ fontFamily: f(lang), fontSize: 8.5, color: B.gray700, lineHeight: 1.8 }, dir]}>
              {t(lang, 'تمكين الشركات من الوصول للأسواق العالمية بكفاءة، عبر خدمات لوجستية موثوقة وآمنة تفوق التوقعات.', 'Empowering businesses to access global markets efficiently through reliable, safe logistics services that exceed expectations.')}
            </Text>
          </View>
        </View>
      </View>
      <View style={{ height: 6, backgroundColor: B.orange, position: 'absolute' as const, bottom: 0, left: 0, right: 0 }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 3 — SERVICES (Full-bleed image cards)
// ═══════════════════════════════════════════════════════════════
function ServicesPage({ lang, data }: Props) {
  const dir = lang === 'ar' ? { textAlign: 'right' as const } : {};
  return (
    <Page size="A4" style={{ backgroundColor: B.offWhite, position: 'relative' as const }}>
      <View style={{ height: 4, backgroundColor: B.orange }} />
      <View style={{ paddingHorizontal: 50, paddingTop: 30, paddingBottom: 30 }}>
        <SectionTitle
          badge={t(lang, 'خدماتنا', 'OUR SERVICES')}
          title={t(lang, 'حلول لوجستية متكاملة', 'Complete Logistics Solutions')}
          lang={lang}
        />

        <View style={{ flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 10 }}>
          {data.services.slice(0, 6).map((svc, i) => {
            const features: Array<{ ar: string; en: string }> = json(svc.featuresJson, []);
            return (
              <View key={i} style={{
                width: '48%', borderRadius: 10, overflow: 'hidden' as const,
                backgroundColor: B.white, borderWidth: 1, borderColor: B.gray200,
              }}>
                {svc.image && (
                  <Image src={svc.image} style={{
                    width: '100%', height: 70, objectFit: 'cover' as const,
                  }} />
                )}
                <View style={{ padding: 10 }}>
                  <Text style={[{
                    fontFamily: f(lang), fontSize: 10, fontWeight: 700,
                    color: B.navy, marginBottom: 3,
                  }, dir]}>{t(lang, svc.titleAr, svc.titleEn)}</Text>
                  <Text style={[{
                    fontFamily: f(lang), fontSize: 7, color: B.gray500,
                    lineHeight: 1.6, marginBottom: 4,
                  }, dir]}>{t(lang, svc.shortDescAr, svc.shortDescEn)}</Text>
                  {features.slice(0, 2).map((ft, fi) => (
                    <View key={fi} style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 5, marginBottom: 2 }}>
                      <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: B.orange }} />
                      <Text style={{ fontFamily: f(lang), fontSize: 6.5, color: B.gray600 }}>{t(lang, ft.ar, ft.en)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      </View>
      <PageFooter logo={data.logo} pageNum={3} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 6 — FLEET (EDITORIAL FULL-BLEED: Each truck = full page)
// ═══════════════════════════════════════════════════════════════
function FleetPage({ lang, data }: Props) {
  const defaultSpecs: Record<number, Array<{ labelAr: string; labelEn: string; valueAr: string; valueEn: string }>> = {
    0: [
      { labelAr: 'الحمولة القصوى', labelEn: 'Max Payload', valueAr: '60 طن', valueEn: '60 Tons' },
      { labelAr: 'المحرك', labelEn: 'Engine', valueAr: 'OM 457 LA', valueEn: 'OM 457 LA' },
      { labelAr: 'القوة', labelEn: 'Power', valueAr: '428 حصان', valueEn: '428 HP' },
      { labelAr: 'المحاور', labelEn: 'Axle Config', valueAr: '6×4', valueEn: '6×4' },
    ],
    1: [
      { labelAr: 'الحمولة القصوى', labelEn: 'Max Payload', valueAr: '55 طن', valueEn: '55 Tons' },
      { labelAr: 'المحرك', labelEn: 'Engine', valueAr: 'D13K', valueEn: 'D13K 500' },
      { labelAr: 'القوة', labelEn: 'Power', valueAr: '500 حصان', valueEn: '500 HP' },
      { labelAr: 'المحاور', labelEn: 'Axle Config', valueAr: '6×2', valueEn: '6×2' },
    ],
  };
  const payloads = ['60', '55'];
  return (
    <>
      {data.fleet.slice(0, 2).map((truck, i) => {
        const dbSpecs: Array<{ labelAr: string; labelEn: string; valueAr: string; valueEn: string }> = json(truck.specsJson, []);
        const specs = dbSpecs.length > 0 ? dbSpecs : (defaultSpecs[i] || []);
        return (
          <Page key={i} size="A4" style={{ backgroundColor: B.navy, position: 'relative' as const }}>
            {/* ══ FULL-BLEED TRUCK IMAGE — THE ENTIRE PAGE IS THE IMAGE ══ */}
            {truck.image && (
              <Image src={truck.image} style={{
                position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0,
                objectFit: 'cover' as const,
              }} />
            )}
            {/* Cinematic gradient overlay — darker at bottom for text readability */}
            <View style={{
              position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(10,20,40,0.55)',
            }} />
            {/* Secondary bottom gradient — extra dark for specs panel */}
            <View style={{
              position: 'absolute' as const, left: 0, right: 0, bottom: 0, height: '45%',
              backgroundColor: 'rgba(10,20,40,0.6)',
            }} />

            {/* ══ GHOST WATERMARK LOGO — faded luxury ══ */}
            {data.logo && (
              <Image src={data.logo} style={{
                position: 'absolute' as const, top: 120, right: -40,
                width: 220, height: 220, objectFit: 'contain' as const, opacity: 0.06,
              }} />
            )}

            {/* ══ DIAGONAL ACCENT STRIPE (Editorial signature) ══ */}
            <View style={{
              position: 'absolute' as const, top: 0, right: 80,
              width: 3, height: '100%', backgroundColor: 'rgba(249,115,22,0.2)',
              transform: 'skewX(-8deg)',
            }} />

            {/* ═══ ORANGE TOP ACCENT ═══ */}
            <View style={{ height: 6, backgroundColor: B.orange, position: 'relative' as const }} />

            {/* ═══ TOP HEADER ═══ */}
            <View style={{ flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingHorizontal: 44, paddingTop: 20, position: 'relative' as const }}>
              <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
                {data.logo && <Image src={data.logo} style={{ width: 22, height: 22, objectFit: 'contain' as const }} />}
                <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 2 }}>SAMA LOGISTICS</Text>
              </View>
              <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
                <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: B.orange, letterSpacing: 3 }}>{t(lang, 'أسطولنا', 'OUR FLEET')}</Text>
                <Text style={{ fontFamily: 'Inter', fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>0{6 + i}</Text>
              </View>
            </View>

            {/* ═══ MASSIVE PAYLOAD NUMBER — "breaks" the image boundary ═══ */}
            <View style={{ position: 'absolute' as const, top: 80, left: 44, zIndex: 10 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 72, fontWeight: 700, color: B.orange, opacity: 0.9 }}>{payloads[i]}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: 4, marginTop: -10 }}>
                {t(lang, 'طن حمولة قصوى', 'TONS MAX PAYLOAD')}
              </Text>
            </View>

            {/* ═══ BOTTOM GLASSMORPHISM PANEL — specs float over image ═══ */}
            <View style={{ position: 'absolute' as const, bottom: 40, left: 30, right: 30 }}>
              {/* Truck name + description — frosted glass */}
              <View style={{
                backgroundColor: 'rgba(10,20,40,0.75)', borderRadius: 14, padding: 22,
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', marginBottom: 12,
              }}>
                <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'space-between' as const, marginBottom: 8 }}>
                  <View>
                    <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: B.orange, letterSpacing: 3, marginBottom: 4 }}>
                      {i === 0 ? 'MERCEDES-BENZ' : 'VOLVO TRUCKS'}
                    </Text>
                    <Text style={{ fontFamily: f(lang), fontSize: 22, fontWeight: 700, color: B.white }}>{t(lang, truck.nameAr, truck.nameEn)}</Text>
                  </View>
                  {/* Payload badge */}
                  <View style={{ backgroundColor: 'rgba(249,115,22,0.15)', borderWidth: 1, borderColor: 'rgba(249,115,22,0.4)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, alignItems: 'center' as const }}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 700, color: B.orange }}>{payloads[i]}T</Text>
                    <Text style={{ fontFamily: 'Inter', fontSize: 5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', letterSpacing: 2 }}>{t(lang, 'حمولة', 'PAYLOAD')}</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: f(lang), fontSize: 8.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, maxWidth: 400 }}>{t(lang, truck.descAr, truck.descEn)}</Text>
              </View>

              {/* Technical specs — frosted glass grid */}
              <View style={{ flexDirection: 'row' as const, gap: 8 }}>
                {specs.slice(0, 4).map((sp, si) => (
                  <View key={si} style={{
                    flex: 1, backgroundColor: 'rgba(10,20,40,0.7)', borderRadius: 10,
                    paddingHorizontal: 12, paddingVertical: 10,
                    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
                  }}>
                    <Text style={{ fontFamily: 'Inter', fontSize: 5.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, marginBottom: 3 }}>{t(lang, sp.labelAr, sp.labelEn).toUpperCase()}</Text>
                    <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: B.white }}>{t(lang, sp.valueAr, sp.valueEn)}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* ═══ ORANGE BOTTOM ACCENT ═══ */}
            <View style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: 6, backgroundColor: B.orange }} />
          </Page>
        );
      })}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 5 — SPECIALIZED CARGO
// ═══════════════════════════════════════════════════════════════
function SpecializedCargoPage({ lang, data }: Props) {
  const dir = lang === 'ar' ? { textAlign: 'right' as const } : {};
  if (data.specializedCargo.length === 0) return null;

  return (
    <Page size="A4" style={{ backgroundColor: B.navy, position: 'relative' as const }}>
      <View style={{ height: 4, backgroundColor: B.orange }} />
      <View style={{ paddingHorizontal: 50, paddingTop: 30, paddingBottom: 30, flex: 1 }}>
        <SectionTitle
          badge={t(lang, 'الحمولات المتخصصة', 'SPECIALIZED CARGO')}
          title={t(lang, 'خبرة في نقل الحمولات الصعبة', 'Expertise in Challenging Cargo')}
          subtitle={t(lang,
            'قدرة على التعامل مع أصعب أنواع الشحنات بكفاءة واحترافية',
            'Capable of handling the most challenging shipment types with efficiency and professionalism'
          )}
          lang={lang}
          light
        />

        <View style={{ flexDirection: 'row' as const, gap: 10, marginBottom: 14 }}>
          {data.specializedCargo.slice(0, 3).map((cargo, i) => (
            <View key={i} style={{
              flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10,
              padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
              position: 'relative' as const, overflow: 'hidden' as const,
            }}>
              <View style={{
                position: 'absolute' as const, top: -15, right: -15,
                width: 50, height: 50, borderRadius: 25,
                backgroundColor: 'rgba(249,115,22,0.08)',
              }} />
              {/* Badge */}
              <Text style={{
                fontFamily: 'Inter', fontSize: 7.5, fontWeight: 700,
                color: B.orange, backgroundColor: 'rgba(249,115,22,0.12)',
                paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4,
                alignSelf: 'flex-start' as const, marginBottom: 10,
              }}>{t(lang, cargo.badgeAr, cargo.badgeEn)}</Text>
              <Text style={[{
                fontFamily: f(lang), fontSize: 12, fontWeight: 700,
                color: B.white, marginBottom: 8,
              }, dir]}>{t(lang, cargo.titleAr, cargo.titleEn)}</Text>
              <Text style={[{
                fontFamily: f(lang), fontSize: 8, color: 'rgba(255,255,255,0.55)',
                lineHeight: 1.7,
              }, dir]}>{t(lang, cargo.descAr, cargo.descEn)}</Text>
            </View>
          ))}
        </View>

        {/* Why Choose Us section */}
        <View style={{
          backgroundColor: 'rgba(249,115,22,0.08)', borderRadius: 12,
          padding: 16, borderWidth: 1, borderColor: 'rgba(249,115,22,0.15)',
        }}>
          <Text style={[{
            fontFamily: f(lang), fontSize: 13, fontWeight: 700,
            color: B.white, marginBottom: 10,
          }, dir]}>{t(lang, data.whySection.titleAr, data.whySection.titleEn)}</Text>

          {(() => {
            const reasons: Array<{ ar: string; en: string }> = json(data.whySection.reasonsJson, []);
            return (
              <View style={{ flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 8 }}>
                {reasons.slice(0, 6).map((r, i) => (
                  <View key={i} style={{
                    width: '47%', flexDirection: 'row' as const,
                    alignItems: 'center' as const, gap: 8, marginBottom: 4,
                  }}>
                    <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: B.orange, flexShrink: 0 }} />
                    <Text style={{ fontFamily: f(lang), fontSize: 8, color: 'rgba(255,255,255,0.75)', flex: 1 }}>
                      {t(lang, r.ar, r.en)}
                    </Text>
                  </View>
                ))}
              </View>
            );
          })()}

          {/* Stats */}
          <View style={{
            flexDirection: 'row' as const, alignItems: 'center' as const,
            gap: 10, marginTop: 10, backgroundColor: 'rgba(0,0,0,0.2)',
            borderRadius: 8, padding: 10, alignSelf: 'flex-start' as const,
          }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 30, fontWeight: 700, color: B.orange }}>
              {data.whySection.statsValue}
            </Text>
            <Text style={{ fontFamily: f(lang), fontSize: 11, fontWeight: 700, color: B.white }}>
              {t(lang, data.whySection.statsLabelAr, data.whySection.statsLabelEn)}
            </Text>
          </View>
        </View>
      </View>
      <PageFooter logo={data.logo} pageNum={5} light />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 7 — HSE (Health, Safety & Environment)
// ═══════════════════════════════════════════════════════════════
function HSEPage({ lang, data }: Props) {
  const policies = [
    { ar: 'تأمين شامل لجميع الشحنات', en: 'Comprehensive cargo insurance', icon: '🛡' },
    { ar: 'فحص يومي لجميع المركبات', en: 'Daily vehicle inspection protocol', icon: '✓' },
    { ar: 'تدريب دوري للسائقين على السلامة', en: 'Regular driver safety training', icon: '⚙' },
    { ar: 'نظام GPS لتتبع الأسطول لحظياً', en: 'Real-time GPS fleet tracking', icon: '📡' },
    { ar: 'التزام بمعايير ADR للبضائع الخطرة', en: 'ADR compliance for hazardous goods', icon: '⚠' },
    { ar: 'سياسة صفر حوادث', en: 'Zero-incident policy', icon: '🎯' },
  ];
  return (
    <Page size="A4" style={{ backgroundColor: B.navy, position: 'relative' as const }}>
      <View style={{ height: 6, backgroundColor: B.orange }} />
      <View style={{ paddingHorizontal: 44, paddingTop: 20, paddingBottom: 10, flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const }}>
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 22, height: 22, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>SAMA LOGISTICS</Text>
        </View>
        <Text style={{ fontFamily: 'Inter', fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>07</Text>
      </View>
      <View style={{ paddingHorizontal: 50, paddingTop: 20, paddingBottom: 20 }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: B.orange, letterSpacing: 4, marginBottom: 6 }}>
          {t(lang, 'الأمان والبيئة', 'HEALTH, SAFETY & ENVIRONMENT')}
        </Text>
        <Text style={{ fontFamily: f(lang), fontSize: 22, fontWeight: 700, color: B.white, marginBottom: 4 }}>
          {t(lang, 'التزامنا بالسلامة', 'Our Safety Commitment')}
        </Text>
        <View style={{ width: 50, height: 3, backgroundColor: B.orange, borderRadius: 2, marginBottom: 10 }} />
        <Text style={{ fontFamily: f(lang), fontSize: 9, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 400, marginBottom: 14 }}>
          {t(lang,
            'نلتزم بأعلى معايير السلامة والصحة المهنية والبيئة في جميع عملياتنا اللوجستية، بما يتوافق مع المعايير الدولية.',
            'We uphold the highest HSE standards across all logistics operations, aligned with international best practices.'
          )}
        </Text>
        <View style={{ flexDirection: 'row' as const, gap: 10, marginBottom: 14 }}>
          {[
            { n: '99.8%', ar: 'معدل التوصيل الآمن', en: 'Safe Delivery Rate' },
            { n: '0', ar: 'حوادث كبرى 2024', en: 'Major Incidents 2024' },
            { n: '100%', ar: 'تأمين الشحنات', en: 'Cargo Insured' },
          ].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' as const, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 18, fontWeight: 700, color: B.orange, marginBottom: 2 }}>{s.n}</Text>
              <Text style={{ fontFamily: f(lang), fontSize: 7, color: 'rgba(255,255,255,0.5)', textAlign: 'center' as const }}>{t(lang, s.ar, s.en)}</Text>
            </View>
          ))}
        </View>
        <View style={{ flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 10 }}>
          {policies.map((p, i) => (
            <View key={i} style={{ width: '47%', flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
              <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: 'rgba(249,115,22,0.12)', justifyContent: 'center' as const, alignItems: 'center' as const }}>
                <Text style={{ fontSize: 10 }}>{p.icon}</Text>
              </View>
              <Text style={{ fontFamily: f(lang), fontSize: 8, color: 'rgba(255,255,255,0.7)', flex: 1, lineHeight: 1.6 }}>{t(lang, p.ar, p.en)}</Text>
            </View>
          ))}
        </View>
        <View style={{ marginTop: 12, backgroundColor: 'rgba(249,115,22,0.08)', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: 'rgba(249,115,22,0.15)' }}>
          <Text style={{ fontFamily: f(lang), fontSize: 10, fontWeight: 700, color: B.white, marginBottom: 4 }}>
            {t(lang, 'الالتزام البيئي', 'Environmental Commitment')}
          </Text>
          <Text style={{ fontFamily: f(lang), fontSize: 8, color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
            {t(lang,
              'نعمل على تقليل البصمة الكربونية من خلال صيانة دورية للأسطول وتحسين كفاءة استهلاك الوقود واستخدام أحدث تقنيات المحركات الأوروبية.',
              'We minimize our carbon footprint through regular fleet maintenance, fuel efficiency optimization, and the latest Euro-standard engine technology.'
            )}
          </Text>
        </View>
      </View>
      <View style={{ height: 6, backgroundColor: B.orange, position: 'absolute' as const, bottom: 0, left: 0, right: 0 }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 8 — TECHNOLOGY (Material Management + Odoo)
// ═══════════════════════════════════════════════════════════════
function TechnologyPage({ lang, data }: Props) {
  const systems = [
    { titleAr: 'نظام إدارة المواد', titleEn: 'Material Management System', descAr: 'تتبع ومراقبة جميع المواد والشحنات في الوقت الحقيقي عبر منصة متكاملة', descEn: 'Real-time tracking and monitoring of all materials and shipments through an integrated platform', badge: 'MMS' },
    { titleAr: 'تكامل Odoo ERP', titleEn: 'Odoo ERP Integration', descAr: 'ربط كامل مع نظام Odoo لإدارة العمليات والفواتير والمخزون والشركاء بشكل آلي', descEn: 'Full integration with Odoo ERP for automated operations, invoicing, inventory, and partner management', badge: 'ERP' },
    { titleAr: 'تتبع الشحنات', titleEn: 'Shipment Tracking', descAr: 'تتبع لحظي لموقع الشحنات وحالتها مع إشعارات فورية للعملاء', descEn: 'Real-time shipment location tracking with instant client notifications', badge: 'GPS' },
    { titleAr: 'لوحة التحكم الذكية', titleEn: 'Smart Dashboard', descAr: 'لوحة تحكم متقدمة تعرض تحليلات الأداء والتقارير المالية بشكل مباشر', descEn: 'Advanced dashboard displaying real-time performance analytics and financial reports', badge: 'BI' },
  ];
  return (
    <Page size="A4" style={{ backgroundColor: B.white, position: 'relative' as const }}>
      <View style={{ height: 6, backgroundColor: B.orange }} />
      <View style={{ paddingHorizontal: 44, paddingTop: 20, paddingBottom: 10, flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const }}>
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 22, height: 22, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: B.gray400, letterSpacing: 2 }}>SAMA LOGISTICS</Text>
        </View>
        <Text style={{ fontFamily: 'Inter', fontSize: 7, color: B.gray400 }}>08</Text>
      </View>
      <View style={{ paddingHorizontal: 50, paddingTop: 20, paddingBottom: 20 }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: B.orange, letterSpacing: 4, marginBottom: 6 }}>
          {t(lang, 'التكنولوجيا', 'TECHNOLOGY')}
        </Text>
        <Text style={{ fontFamily: f(lang), fontSize: 22, fontWeight: 700, color: B.navy, marginBottom: 4 }}>
          {t(lang, 'البنية التقنية الذكية', 'Smart Technology Infrastructure')}
        </Text>
        <View style={{ width: 50, height: 3, backgroundColor: B.orange, borderRadius: 2, marginBottom: 10 }} />
        <Text style={{ fontFamily: f(lang), fontSize: 9, color: B.gray500, lineHeight: 1.7, maxWidth: 400, marginBottom: 14 }}>
          {t(lang,
            'نوظف أحدث التقنيات لتقديم خدمات لوجستية ذكية وشفافة، مع ربط كامل بنظام Odoo ERP لإدارة العمليات بكفاءة.',
            'We leverage cutting-edge technology for smart, transparent logistics services, fully integrated with Odoo ERP for efficient operations management.'
          )}
        </Text>
        {systems.map((sys, i) => (
          <View key={i} style={{ flexDirection: 'row' as const, gap: 10, marginBottom: 10, backgroundColor: B.offWhite, borderRadius: 8, padding: 12, borderWidth: 1, borderColor: B.gray200 }}>
            <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: B.navy, justifyContent: 'center' as const, alignItems: 'center' as const }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: B.orange }}>{sys.badge}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: f(lang), fontSize: 10, fontWeight: 700, color: B.navy, marginBottom: 2 }}>{t(lang, sys.titleAr, sys.titleEn)}</Text>
              <Text style={{ fontFamily: f(lang), fontSize: 7.5, color: B.gray500, lineHeight: 1.6 }}>{t(lang, sys.descAr, sys.descEn)}</Text>
            </View>
          </View>
        ))}
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 6, marginTop: 10, paddingVertical: 10, backgroundColor: B.navy, borderRadius: 8 }}>
          {[
            { ar: 'استلام الطلب', en: 'Order Receipt' },
            { ar: 'التخطيط', en: 'Planning' },
            { ar: 'التنفيذ', en: 'Execution' },
            { ar: 'التتبع', en: 'Tracking' },
            { ar: 'التسليم', en: 'Delivery' },
          ].map((step, i) => (
            <View key={i} style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6 }}>
              <View style={{ backgroundColor: 'rgba(249,115,22,0.15)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 }}>
                <Text style={{ fontFamily: f(lang), fontSize: 7, fontWeight: 700, color: B.orange }}>{t(lang, step.ar, step.en)}</Text>
              </View>
              {i < 4 && <Text style={{ fontFamily: 'Inter', fontSize: 10, color: 'rgba(14,30,58,0.2)' }}>→</Text>}
            </View>
          ))}
        </View>
      </View>
      <View style={{ height: 6, backgroundColor: B.orange, position: 'absolute' as const, bottom: 0, left: 0, right: 0 }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 9 — STRATEGIC PRESENCE (EDITORIAL INFOGRAPHIC MAP)
// ═══════════════════════════════════════════════════════════════
function StrategicPresencePage({ lang, data }: Props) {
  return (
    <Page size="A4" style={{ backgroundColor: B.navy, position: 'relative' as const }}>
      {/* ══ GHOST WATERMARK LOGO ══ */}
      {data.logo && (
        <Image src={data.logo} style={{
          position: 'absolute' as const, bottom: 80, left: -50,
          width: 240, height: 240, objectFit: 'contain' as const, opacity: 0.04,
        }} />
      )}
      {/* ══ DIAGONAL ACCENT STRIPES (Editorial depth) ══ */}
      <View style={{ position: 'absolute' as const, top: 0, left: 60, width: 2, height: '100%', backgroundColor: 'rgba(249,115,22,0.08)', transform: 'skewX(-5deg)' }} />
      <View style={{ position: 'absolute' as const, top: 0, left: 70, width: 1, height: '100%', backgroundColor: 'rgba(249,115,22,0.04)', transform: 'skewX(-5deg)' }} />

      {/* ═══ ORANGE TOP ACCENT ═══ */}
      <View style={{ height: 6, backgroundColor: B.orange, position: 'relative' as const }} />

      {/* ═══ TOP HEADER ═══ */}
      <View style={{ flexDirection: 'row' as const, justifyContent: 'space-between' as const, alignItems: 'center' as const, paddingHorizontal: 44, paddingTop: 20, position: 'relative' as const }}>
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 22, height: 22, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>SAMA LOGISTICS</Text>
        </View>
        <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: B.orange, letterSpacing: 3 }}>{t(lang, 'التواجد', 'PRESENCE')}</Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 7, color: 'rgba(255,255,255,0.25)' }}>09</Text>
        </View>
      </View>

      {/* ═══ MASSIVE NUMBER — "3" PORTS — overlapping typography ═══ */}
      <View style={{ position: 'absolute' as const, top: 50, right: 30 }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 140, fontWeight: 700, color: 'rgba(249,115,22,0.08)' }}>3</Text>
      </View>
      <View style={{ paddingHorizontal: 50, paddingTop: 30, position: 'relative' as const }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: B.orange, letterSpacing: 4, marginBottom: 6 }}>
          {t(lang, 'التواجد الاستراتيجي', 'STRATEGIC PRESENCE')}
        </Text>
        <Text style={{ fontFamily: f(lang), fontSize: 32, fontWeight: 700, color: B.white, marginBottom: 2 }}>
          {t(lang, 'بوابة العالم', 'Gateway to the World')}
        </Text>
        <View style={{ width: 50, height: 3, backgroundColor: B.orange, borderRadius: 2, marginBottom: 12 }} />
        <Text style={{ fontFamily: f(lang), fontSize: 10, color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, maxWidth: 340, marginBottom: 20 }}>
          {t(lang,
            'هيمنة استراتيجية على ثلاث بوابات رئيسية لقناة السويس — أهم ممر مائي تجاري في العالم.',
            'Strategic dominance across three key Suez Canal gateways — the world\'s most vital trade corridor.'
          )}
        </Text>
      </View>

      {/* ═══ VISUAL MAP — Minimalist pins + connection lines ═══ */}
      <View style={{ marginHorizontal: 30, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)', position: 'relative' as const }}>
        {/* Suez Canal line — horizontal */}
        <View style={{ position: 'absolute' as const, top: '50%', left: 40, right: 40, height: 2, backgroundColor: 'rgba(249,115,22,0.15)' }} />
        {/* Canal label */}
        <View style={{ position: 'absolute' as const, top: '50%', left: '50%', marginLeft: -50, marginTop: -8 }}>
          <View style={{ backgroundColor: 'rgba(10,20,40,0.9)', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 4 }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 6, fontWeight: 700, color: 'rgba(249,115,22,0.5)', letterSpacing: 3, textAlign: 'center' as const }}>SUEZ CANAL</Text>
          </View>
        </View>
        {/* Three port pins with stats */}
        <View style={{ flexDirection: 'row' as const, justifyContent: 'space-between' as const }}>
          {[
            { nameAr: 'بورسعيد', nameEn: 'Port Said', stat: '12%', statLabel: { ar: 'تجارة عالمية', en: 'Global Trade' }, y: 0 },
            { nameAr: 'دمياط', nameEn: 'Damietta', stat: '2nd', statLabel: { ar: 'أكبر ميناء', en: 'Largest Port' }, y: 20 },
            { nameAr: 'شرق التفريعة', nameEn: 'East Port Said', stat: '10M', statLabel: { ar: 'حاوية سنوياً', en: 'TEU/Year' }, y: 0 },
          ].map((city, i) => (
            <View key={i} style={{ alignItems: 'center' as const, flex: 1, paddingTop: city.y }}>
              {/* Pin dot with pulse ring */}
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(249,115,22,0.12)', justifyContent: 'center' as const, alignItems: 'center' as const, marginBottom: 8 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: B.orange }} />
              </View>
              {/* City name — BOLD */}
              <Text style={{ fontFamily: f(lang), fontSize: 12, fontWeight: 700, color: B.white, marginBottom: 4, textAlign: 'center' as const }}>{t(lang, city.nameAr, city.nameEn)}</Text>
              {/* Stat number — big orange */}
              <Text style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: 700, color: B.orange, marginBottom: 1 }}>{city.stat}</Text>
              <Text style={{ fontFamily: f(lang), fontSize: 7, color: 'rgba(255,255,255,0.4)', textAlign: 'center' as const }}>{t(lang, city.statLabel.ar, city.statLabel.en)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ═══ LOCATION CARDS — Frosted glass over navy ═══ */}
      {[
        { nameAr: 'المقر الرئيسي — أبراج أرض الجولف', nameEn: 'HQ — Golf Land Towers', descAr: '7 أبراج أرض الجولف، حي الشرق، بورسعيد', descEn: '7 Golf Land Towers, Al-Sharq, Port Said', type: 'HQ' },
        { nameAr: 'فرع ساحة النورس', nameEn: 'Al-Nawras Branch', descAr: 'ميناء شرق بورسعيد — محور العمليات', descEn: 'East Port Said Port — Operations Hub', type: 'BR' },
      ].map((loc, i) => (
        <View key={i} style={{ marginHorizontal: 30, marginBottom: 8, flexDirection: 'row' as const, gap: 14, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' }}>
          <View style={{ width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(249,115,22,0.12)', justifyContent: 'center' as const, alignItems: 'center' as const }}>
            <Text style={{ fontFamily: 'Inter', fontSize: 11, fontWeight: 700, color: B.orange }}>{loc.type}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: f(lang), fontSize: 11, fontWeight: 700, color: B.white, marginBottom: 3 }}>{t(lang, loc.nameAr, loc.nameEn)}</Text>
            <Text style={{ fontFamily: f(lang), fontSize: 8, color: 'rgba(255,255,255,0.45)' }}>{t(lang, loc.descAr, loc.descEn)}</Text>
          </View>
        </View>
      ))}

      {/* ═══ MARBLE ROUTES — visual flow diagram ═══ */}
      <View style={{ marginHorizontal: 30, marginTop: 8, backgroundColor: 'rgba(249,115,22,0.06)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(249,115,22,0.12)' }}>
        <Text style={{ fontFamily: f(lang), fontSize: 11, fontWeight: 700, color: B.orange, marginBottom: 10 }}>
          {t(lang, 'المسارات اللوجستية المتخصصة', 'Specialized Logistics Routes')}
        </Text>
        {[
          { from: { ar: 'شق الثعبان', en: 'Shaq El-Thoban' }, to: { ar: 'ميناء بورسعيد', en: 'Port Said Port' }, cargo: { ar: 'رخام', en: 'Marble' } },
          { from: { ar: 'شق الثعبان', en: 'Shaq El-Thoban' }, to: { ar: 'ميناء دمياط', en: 'Damietta Port' }, cargo: { ar: 'رخام', en: 'Marble' } },
          { from: { ar: 'القاهرة', en: 'Cairo' }, to: { ar: 'شرق التفريعة', en: 'East Port Said' }, cargo: { ar: 'بضائع ثقيلة', en: 'Heavy Cargo' } },
        ].map((r, i) => (
          <View key={i} style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 6, marginBottom: 6 }}>
            {/* Origin */}
            <View style={{ backgroundColor: 'rgba(10,20,40,0.8)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontFamily: f(lang), fontSize: 8, fontWeight: 700, color: B.white }}>{t(lang, r.from.ar, r.from.en)}</Text>
            </View>
            {/* Arrow line */}
            <View style={{ flex: 1, height: 1.5, backgroundColor: 'rgba(249,115,22,0.3)' }} />
            <Text style={{ fontFamily: 'Inter', fontSize: 8, color: B.orange }}>→</Text>
            <View style={{ flex: 1, height: 1.5, backgroundColor: 'rgba(249,115,22,0.3)' }} />
            {/* Destination */}
            <View style={{ backgroundColor: 'rgba(10,20,40,0.8)', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ fontFamily: f(lang), fontSize: 8, fontWeight: 700, color: B.white }}>{t(lang, r.to.ar, r.to.en)}</Text>
            </View>
            {/* Cargo type badge */}
            <View style={{ backgroundColor: 'rgba(249,115,22,0.2)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
              <Text style={{ fontFamily: f(lang), fontSize: 6, fontWeight: 700, color: B.orange }}>{t(lang, r.cargo.ar, r.cargo.en)}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* ═══ ORANGE BOTTOM ACCENT ═══ */}
      <View style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: 6, backgroundColor: B.orange }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 10 — CONTACT (Back Cover — Navy Prestige)
// ═══════════════════════════════════════════════════════════════
function ContactPage({ lang, data }: Props) {
  const dir = lang === 'ar' ? { textAlign: 'right' as const } : {};
  const contacts = [
    { icon: 'M', l: t(lang, 'هاتف وواتساب', 'Phone & WhatsApp'), v: '+20 122 130 0036' },
    { icon: 'M', l: t(lang, 'هاتف وواتساب', 'Phone & WhatsApp'), v: '+20 121 175 5925' },
    { icon: 'T', l: t(lang, 'هاتف أرضي', 'Landline'), v: '+20 66 374 4469' },
    { icon: '@', l: t(lang, 'البريد الالكتروني', 'Email'), v: 'info@samalogs.com' },
    { icon: 'HQ', l: t(lang, 'المقر الرئيسي', 'Headquarters'), v: t(lang, '7 أبراج أرض الجولف، حي الشرق، بورسعيد', '7 Golf Land Towers, Al-Sharq, Port Said') },
    { icon: 'BR', l: t(lang, 'فرع الميناء', 'Port Branch'), v: t(lang, 'مكتب 12، ساحة النورس، ميناء شرق بورسعيد', 'Office 12, Al-Nawras Square, East Port Said Port') },
  ];

  return (
    <Page size="A4" style={{ backgroundColor: B.navy, position: 'relative' as const }}>
      <View style={{ height: 5, backgroundColor: B.orange }} />

      <View style={{ paddingHorizontal: 50, paddingTop: 30, paddingBottom: 30, flex: 1, justifyContent: 'center' as const }}>
        <SectionTitle
          badge={t(lang, 'تواصل معنا', 'CONTACT US')}
          title={t(lang, 'نحن في خدمتك', 'At Your Service')}
          lang={lang}
          light
        />

        {/* Contact grid */}
        {contacts.map((c, i) => (
          <View key={i} style={{
            flexDirection: 'row' as const, alignItems: 'center' as const,
            marginBottom: 14, gap: 14,
          }}>
            <View style={{
              width: 36, height: 36, borderRadius: 10,
              backgroundColor: 'rgba(249,115,22,0.08)',
              justifyContent: 'center' as const, alignItems: 'center' as const,
              borderWidth: 1, borderColor: 'rgba(249,115,22,0.15)',
            }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, color: B.orange }}>
                {c.icon}
              </Text>
            </View>
            <View style={[{ flex: 1 }, dir]}>
              <Text style={{ fontFamily: f(lang), fontSize: 7, color: 'rgba(255,255,255,0.35)', marginBottom: 2 }}>
                {c.l}
              </Text>
              <Text style={{ fontFamily: f(lang), fontSize: 10, color: B.white }}>
                {c.v}
              </Text>
            </View>
          </View>
        ))}

        {/* Working hours */}
        <View style={{
          backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12,
          padding: 18, marginTop: 18,
          borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
        }}>
          <Text style={[{
            fontFamily: f(lang), fontSize: 10, fontWeight: 700,
            color: B.white, marginBottom: 10,
          }, dir]}>{t(lang, 'ساعات العمل', 'Working Hours')}</Text>
          <View style={{ flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 4 }}>
            <Text style={{ fontFamily: f(lang), fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
              {t(lang, 'السبت - الخميس', 'Sat - Thu')}
            </Text>
            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: B.white }}>9:00 AM - 6:00 PM</Text>
          </View>
          <View style={{ flexDirection: 'row' as const, justifyContent: 'space-between' as const, marginBottom: 10 }}>
            <Text style={{ fontFamily: f(lang), fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
              {t(lang, 'الجمعة', 'Friday')}
            </Text>
            <Text style={{ fontFamily: f(lang), fontSize: 9, color: '#EF4444' }}>
              {t(lang, 'مغلق', 'Closed')}
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.08)', marginBottom: 10 }} />
          <Text style={{ fontFamily: f(lang), fontSize: 9, fontWeight: 700, color: B.orange }}>
            {t(lang, 'عمليات الشحن: 24/7 على مدار الساعة', 'Shipping Operations: 24/7 Around the Clock')}
          </Text>
        </View>

        {/* Social links */}
        <View style={{
          flexDirection: 'row' as const, justifyContent: 'center' as const,
          gap: 24, marginTop: 16,
        }}>
          <Link src="https://www.facebook.com/Samallogseg/">
            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: B.orange }}>Facebook</Text>
          </Link>
          <Link src="https://www.linkedin.com/company/sama-logistic">
            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: B.orange }}>LinkedIn</Text>
          </Link>
          <Link src="https://samalogs.com">
            <Text style={{ fontFamily: 'Inter', fontSize: 9, color: B.orange, fontWeight: 700 }}>samalogs.com</Text>
          </Link>
        </View>

        {/* Footer logo + copyright */}
        <View style={{ alignItems: 'center' as const, marginTop: 20 }}>
          {data.logo && (
            <Image src={data.logo} style={{ width: 50, height: 50, objectFit: 'contain' as const, marginBottom: 12 }} />
          )}
          <Text style={{ fontFamily: 'Inter', fontSize: 22, fontWeight: 700, color: B.white, letterSpacing: 6 }}>
            SAMA
          </Text>
          <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: B.orange, letterSpacing: 6 }}>
            LOGISTICS
          </Text>
          <Text style={{
            fontFamily: f(lang), fontSize: 7, color: 'rgba(255,255,255,0.2)', marginTop: 12,
          }}>
            {`\u00A9 2000-${new Date().getFullYear()} SAMA Logistics. ${t(lang, 'جميع الحقوق محفوظة', 'All rights reserved.')}`}
          </Text>
        </View>
      </View>

      <View style={{ height: 5, backgroundColor: B.orange }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       MAIN DOCUMENT ASSEMBLY — 10 PAGES (DHL EDITION)
// ═══════════════════════════════════════════════════════════════
export default function SamaProfileDocument({ lang, data }: Props) {
  return (
    <Document
      title={lang === 'ar' ? 'ملف تعريف شركة سما للخدمات اللوجستية' : 'SAMA Logistics Company Profile'}
      author="SAMA Logistics"
      subject="Company Profile — DHL Edition"
      creator="SAMA Logistics Platform"
    >
      <CoverPage lang={lang} data={data} />
      <ExcellencePage lang={lang} data={data} />
      <ServicesPage lang={lang} data={data} />
      <SpecializedCargoPage lang={lang} data={data} />
      <FleetPage lang={lang} data={data} />
      <HSEPage lang={lang} data={data} />
      <TechnologyPage lang={lang} data={data} />
      <StrategicPresencePage lang={lang} data={data} />
      <ContactPage lang={lang} data={data} />
    </Document>
  );
}


