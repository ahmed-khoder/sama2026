/**
 * SAMA Logistics — Company Profile PDF (v4 — CORPORATE EDITION)
 * ═════════════════════════════════════════════════════════════
 * Clean A4 corporate document. Professional, structured, printable.
 * Inspired by DHL / Hapag-Lloyd annual reports.
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
} from '@react-pdf/renderer';
import path from 'path';

// ═══════════════════════════════════════════════
// BRAND COLOR SYSTEM
// ═══════════════════════════════════════════════
const C = {
  navy: '#0A1428',
  navyLight: '#152952',
  orange: '#F97316',
  orangePale: '#FFF7ED',
  white: '#FFFFFF',
  bg: '#FAFBFC',
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
  mapImage?: string;
  heroBg: {
    cargoPort?: string;
    marbleQuarry?: string;
    trucksHighway?: string;
    controlRoom?: string;
    safetyWorkers?: string;
    portSunset?: string;
  };
  realOpImages: string[];
  stockImages?: { cover?: string; fleet?: string; port?: string; tech?: string };
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
const ff = (l: string) => l === 'ar' ? 'Amiri' : 'Inter';

// ═══════════════════════════════════════════════
// SHARED: Corporate page header (logo + section)
// ═══════════════════════════════════════════════
function PageHeader({ logo, section, lang }: { logo?: string; section?: string; lang: string }) {
  return (
    <View style={{
      flexDirection: 'row' as const, justifyContent: 'space-between' as const,
      alignItems: 'center' as const, paddingHorizontal: 48, paddingTop: 32, paddingBottom: 16,
      borderBottomWidth: 1, borderBottomColor: C.gray200,
    }}>
      <View style={{ flexDirection: 'row' as const, alignItems: 'center' as const, gap: 10 }}>
        {logo && <Image src={logo} style={{ width: 24, height: 24, objectFit: 'contain' as const }} />}
        <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: C.gray400, letterSpacing: 2 }}>
          SAMA LOGISTICS
        </Text>
      </View>
      {section && (
        <Text style={{ fontFamily: ff(lang), fontSize: 8, fontWeight: 700, color: C.orange, letterSpacing: 1 }}>
          {section}
        </Text>
      )}
    </View>
  );
}

// ═══════════════════════════════════════════════
// SHARED: Corporate page footer (page number)
// ═══════════════════════════════════════════════
function PageFooter({ pageNum }: { pageNum: number }) {
  return (
    <View style={{
      position: 'absolute' as const, bottom: 0, left: 0, right: 0,
      borderTopWidth: 1, borderTopColor: C.gray200,
      paddingHorizontal: 48, paddingVertical: 12,
      flexDirection: 'row' as const, justifyContent: 'space-between' as const,
      alignItems: 'center' as const,
    }}>
      <Text style={{ fontFamily: 'Inter', fontSize: 7, color: C.gray400 }}>
        SAMA Logistics  •  Company Profile
      </Text>
      <Text style={{ fontFamily: 'Inter', fontSize: 7, color: C.gray400 }}>
        {pageNum}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════
// SHARED: Section Title with orange underline
// ═══════════════════════════════════════════════
function SectionTitle({ title, lang }: { title: string; lang: string }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontFamily: ff(lang), fontSize: 22, fontWeight: 700, color: C.navy, marginBottom: 8 }}>
        {title}
      </Text>
      <View style={{ width: 40, height: 3, backgroundColor: C.orange, borderRadius: 1 }} />
    </View>
  );
}

// ═══════════════════════════════════════════════
// SHARED: Metric card for stats
// ═══════════════════════════════════════════════
function MetricCard({ value, label, lang }: { value: string; label: string; lang: string }) {
  return (
    <View style={{
      flex: 1, alignItems: 'center' as const, paddingVertical: 18,
      backgroundColor: C.white, borderRadius: 6,
      borderWidth: 1, borderColor: C.gray200,
    }}>
      <Text style={{ fontFamily: 'Inter', fontSize: 24, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
        {value}
      </Text>
      <Text style={{ fontFamily: ff(lang), fontSize: 8, color: C.gray500, textAlign: 'center' as const }}>
        {label}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 1 — COVER
// ═══════════════════════════════════════════════════════════════
function CoverPage({ lang, data }: Props) {
  const bgImg = data.stockImages?.cover || data.heroBg?.cargoPort;
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.navy, position: 'relative' as const }}>
      {/* Full Bleed Background */}
      {bgImg && <Image src={bgImg} style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, objectFit: 'cover' as const }} />}
      {/* Dark Overlay for trust and drama */}
      <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 20, 40, 0.4)' }} />

      {/* Top Left Logo Block */}
      <View style={{ paddingHorizontal: 48, paddingTop: 48, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 }}>
        {data.logo && <Image src={data.logo} style={{ width: 44, height: 44, objectFit: 'contain' as const }} />}
      </View>

      {/* Content Block (Bottom Aligned) */}
      <View style={{ position: 'absolute' as const, bottom: 80, left: 48, right: 48 }}>
        <Text style={{ fontFamily: ff(lang), fontSize: 34, fontWeight: 700, color: C.white, marginBottom: 8 }}>
          {t(lang, 'من شق الثعبان إلى الميناء', 'From Shaq El-Thoban to the Port')}
        </Text>
        
        <View style={{ width: 60, height: 4, backgroundColor: C.orange, borderRadius: 2, marginBottom: 16 }} />
        
        <Text style={{ fontFamily: ff(lang), fontSize: 16, fontWeight: 700, color: C.gray200, letterSpacing: 1, marginBottom: 24 }}>
          {t(lang, 'تجهيز. تأمين. تسليم.', 'Prepare. Secure. Deliver.')}
        </Text>

        {/* Authority Badges */}
        <View style={{ flexDirection: 'row' as const, gap: 12, flexWrap: 'wrap' as const }}>
          {[
            { ar: '+25 سنة خبرة', en: '+25 Years Experience' },
            { ar: '0 حالات تلف رئيسية', en: '0 Major Damage Cases' },
            { ar: 'خبرة متخصصة في التصدير', en: 'Export Specialist Expertise' }
          ].map((badge, i) => (
            <View key={i} style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Text style={{ fontFamily: ff(lang), fontSize: 9, fontWeight: 700, color: C.white }}>{t(lang, badge.ar, badge.en)}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom info */}
      <View style={{ position: 'absolute' as const, bottom: 30, left: 48, right: 48, flexDirection: 'row' as const, justifyContent: 'space-between' as const }}>
        <Text style={{ fontFamily: 'Inter', fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>SAMA Logistics Company Profile</Text>
        <Text style={{ fontFamily: 'Inter', fontSize: 8, color: 'rgba(255,255,255,0.6)' }}>samalogs.com</Text>
      </View>

      {/* Very Bottom orange accent */}
      <View style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: 6, backgroundColor: C.orange }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 2 — COMPANY OVERVIEW
// ═══════════════════════════════════════════════════════════════
function OverviewPage({ lang, data }: Props) {
  const bgImg = data.stockImages?.port || data.realOpImages[3];
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.white, position: 'relative' as const }}>
      {/* 40% Hero Section */}
      <View style={{ width: '100%', height: '40%', position: 'relative' as const }}>
        {bgImg && <Image src={bgImg} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />}
        <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 20, 40, 0.3)' }} />
        
        <View style={{ position: 'absolute' as const, top: 40, left: 48, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 20, height: 20, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: C.gray200, letterSpacing: 2 }}>SAMA LOGISTICS</Text>
        </View>

        <View style={{ position: 'absolute' as const, bottom: 40, left: lang === 'en' ? 48 : undefined, right: lang === 'ar' ? 48 : undefined }}>
          <Text style={{ fontFamily: ff(lang), fontSize: 24, fontWeight: 700, color: C.white }}>
            {t(lang, 'من نحن', 'Who We Are')}
          </Text>
        </View>
      </View>

      {/* 60% Content Area */}
      <View style={{ paddingHorizontal: 48, paddingTop: 32, paddingBottom: 24 }}>
        <Text style={{ fontFamily: ff(lang), fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 12, lineHeight: 1.6, maxWidth: 450 }}>
          {t(lang,
            'على مدار أكثر من 25 عامًا، تقوم SAMA Logistics بإدارة عمليات تصدير الرخام من منطقة شق الثعبان إلى الموانئ الرئيسية في مصر.',
            'For over 25 years, SAMA Logistics has managed marble export operations from the Shaq El-Thoban zone to major Egyptian ports.'
          )}
        </Text>
        
        <Text style={{ fontFamily: ff(lang), fontSize: 10, color: C.gray700, lineHeight: 1.8, marginBottom: 28, maxWidth: 450 }}>
          {t(lang,
            'نحن متخصصون في تجهيز شحنات الرخام للتصدير الدولي — بأمان وكفاءة وموثوقية.',
            'We specialize in preparing marble shipments for international export — safely, efficiently, and reliably.'
          )}
        </Text>

        {/* Partners */}
        {data.partners.length > 0 && (
          <View style={{ marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: C.gray200 }}>
            <Text style={{ fontFamily: ff(lang), fontSize: 8, fontWeight: 700, color: C.gray400, letterSpacing: 2, marginBottom: 16 }}>
              {t(lang, 'كبار الوكلاء والشركاء', 'MAJOR PARTNERS & AGENTS')}
            </Text>
            <View style={{ flexDirection: 'row' as const, gap: 24, flexWrap: 'wrap' as const, alignItems: 'center' as const }}>
              {data.partners.slice(0, 6).map((p, i) => (
                p.logo ? (
                  <Image key={i} src={p.logo} style={{ width: 60, height: 35, objectFit: 'contain' as const }} />
                ) : null
              ))}
            </View>
          </View>
        )}
      </View>
      <PageFooter pageNum={2} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 3 — EXPERIENCE & SCALE
// ═══════════════════════════════════════════════════════════════
function ExperiencePage({ lang, data }: Props) {
  const bgImg = data.realOpImages[4]; // Heavy loader
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.white, position: 'relative' as const }}>
      {/* 40% Hero Section */}
      <View style={{ width: '100%', height: '40%', position: 'relative' as const }}>
        {bgImg && <Image src={bgImg} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />}
        <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 20, 40, 0.3)' }} />
        
        <View style={{ position: 'absolute' as const, top: 40, left: 48, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 20, height: 20, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: C.gray200, letterSpacing: 2 }}>SAMA LOGISTICS</Text>
        </View>

        <View style={{ position: 'absolute' as const, bottom: 40, left: lang === 'en' ? 48 : undefined, right: lang === 'ar' ? 48 : undefined }}>
          <Text style={{ fontFamily: ff(lang), fontSize: 24, fontWeight: 700, color: C.white }}>
            {t(lang, 'خبرتنا', 'Our Experience')}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 48, paddingTop: 32 }}>
        <Text style={{ fontFamily: ff(lang), fontSize: 10, color: C.gray700, lineHeight: 1.8, marginBottom: 24, maxWidth: 450 }}>
          {t(lang,
            'نتائج موثقة تثبت قدرتنا على التعامل مع أثقل الشحنات وأكثرها حساسية.',
            'Proven results demonstrating our capacity to safely handle the heaviest and most sensitive export shipments.'
          )}
        </Text>

        {/* Metrics Box Pattern */}
        <View style={{ flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12 }}>
          <View style={{ width: '48%', marginBottom: 12 }}>
            <MetricCard value="+25" label={t(lang, 'سنة خبرة', 'Years Experience')} lang={lang} />
          </View>
          <View style={{ width: '48%', marginBottom: 12 }}>
            <MetricCard value="+10,000" label={t(lang, 'شحنة', 'Shipments')} lang={lang} />
          </View>
          <View style={{ width: '48%', marginBottom: 12 }}>
            <MetricCard value="0" label={t(lang, 'حالات تلف رئيسية', 'Major Damage Cases')} lang={lang} />
          </View>
          <View style={{ width: '48%', marginBottom: 12 }}>
            <MetricCard value="3" label={t(lang, 'موانئ رئيسية', 'Major Ports')} lang={lang} />
          </View>
          <View style={{ width: '100%' }}>
            <View style={{
              alignItems: 'center' as const, paddingVertical: 18,
              backgroundColor: C.navy, borderRadius: 6,
            }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 20, fontWeight: 700, color: C.orange, marginBottom: 4 }}>
                60 {t(lang, 'طن', 'Tons')}
              </Text>
              <Text style={{ fontFamily: ff(lang), fontSize: 8, color: C.white, textAlign: 'center' as const }}>
                {t(lang, 'قدرة تحميل تصل إلى 60 طن', 'Loading Capacity up to 60T')}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <PageFooter pageNum={3} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 4 — SERVICES
// ═══════════════════════════════════════════════════════════════
function ServicesPage({ lang, data }: Props) {
  const bgImg = data.heroBg?.cargoPort; // Keep using port image
  const services = [
    { title: t(lang, 'نقل الرخام', 'Marble Transport'), desc: t(lang, 'من شق الثعبان إلى الموانئ.', 'From Shaq El-Thoban to major export ports.') },
    { title: t(lang, 'تحميل الحاويات', 'Container Loading'), desc: t(lang, 'نمتلك المهارة والمعدات لتحميل أثقل الحاويات.', 'We possess the skill and equipment to load the heaviest containers.') },
    { title: t(lang, 'التعبئة والتغليف', 'Packing & Bagging'), desc: t(lang, 'تعبئة وتغليف متخصص يضاعف الحماية.', 'Specialized packing and bagging that doubles protection.') },
    { title: t(lang, 'التخليص الجمركي', 'Customs Clearance'), desc: t(lang, 'تيسير الإجراءات في موانئ التصدير.', 'Streamlined customs procedures at export ports.') },
    { title: t(lang, 'إدارة عمليات التصدير', 'Export Operations Management'), desc: t(lang, 'حلول متكاملة من التحميل حتى التسليم.', 'End-to-end solutions from loading to delivery.') },
  ];
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.white, position: 'relative' as const }}>
      {/* 40% Hero Section */}
      <View style={{ width: '100%', height: '40%', position: 'relative' as const }}>
        {bgImg && <Image src={bgImg} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />}
        <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 20, 40, 0.4)' }} />
        
        <View style={{ position: 'absolute' as const, top: 40, left: 48, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 20, height: 20, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: C.gray200, letterSpacing: 2 }}>SAMA LOGISTICS</Text>
        </View>

        <View style={{ position: 'absolute' as const, bottom: 40, left: lang === 'en' ? 48 : undefined, right: lang === 'ar' ? 48 : undefined }}>
          <Text style={{ fontFamily: ff(lang), fontSize: 24, fontWeight: 700, color: C.white }}>
            {t(lang, 'الخدمات', 'Services')}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 48, paddingTop: 32 }}>
        {services.map((svc, i) => (
          <View key={i} style={{
            flexDirection: 'row' as const, gap: 14, marginBottom: 12,
            backgroundColor: C.bg, borderRadius: 6, padding: 14,
            borderWidth: 1, borderColor: C.gray200,
          }}>
            <View style={{
              width: 30, height: 30, borderRadius: 4, backgroundColor: C.orange,
              justifyContent: 'center' as const, alignItems: 'center' as const,
            }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: C.white }}>
                {String(i + 1).padStart(2, '0')}
              </Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' as const }}>
              <Text style={{ fontFamily: ff(lang), fontSize: 10, fontWeight: 700, color: C.navy, marginBottom: 4 }}>
                {svc.title}
              </Text>
              <Text style={{ fontFamily: ff(lang), fontSize: 9, color: C.gray600 }}>
                {svc.desc}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <PageFooter pageNum={4} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 5 — EXPORT LOGISTICS (Hybrid Corporate with Real Images)
// ═══════════════════════════════════════════════════════════════
function SpecializationPage({ lang, data }: Props) {
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.white, position: 'relative' as const }}>
      {/* Top 40% Hero Section */}
      <View style={{ width: '100%', height: '40%', position: 'relative' as const }}>
        {data.heroBg?.cargoPort && <Image src={data.heroBg.cargoPort} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />}
        {/* Very Light Overlay */}
        <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 20, 40, 0.2)' }} />
        
        {/* Section Tag */}
        <View style={{ position: 'absolute' as const, top: 40, left: lang === 'en' ? 48 : undefined, right: lang === 'ar' ? 48 : undefined }}>
          <View style={{ backgroundColor: C.orange, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 }}>
            <Text style={{ fontFamily: ff(lang), fontSize: 9, fontWeight: 700, color: C.white, letterSpacing: 1 }}>
              {t(lang, 'تخصصنا', 'SPECIALIZATION')}
            </Text>
          </View>
        </View>

        {/* Strong Title on Hero */}
        <View style={{ position: 'absolute' as const, bottom: 40, left: lang === 'en' ? 48 : undefined, right: lang === 'ar' ? 48 : undefined }}>
          <Text style={{ fontFamily: ff(lang), fontSize: 24, fontWeight: 700, color: C.white }}>
            {t(lang, 'متخصصون في لوجستيات مسارات التصدير', 'Expert Export Logistics.')}
          </Text>
        </View>
      </View>

      {/* Bottom 60% Content Area */}
      <View style={{ paddingHorizontal: 48, paddingTop: 32, paddingBottom: 24 }}>
        
        {/* Main Positioning */}
        <View style={{ flexDirection: 'row' as const, gap: 12, marginBottom: 16 }}>
          <View style={{ width: 4, backgroundColor: C.orange, borderRadius: 2 }} />
          <View>
            <Text style={{ fontFamily: ff(lang), fontSize: 13, fontWeight: 700, color: C.navy, marginBottom: 6 }}>
              {t(lang, 'متخصصون في لوجستيات تصدير الرخام', 'Marble Export Logistics Specialists')}
            </Text>
            <Text style={{ fontFamily: ff(lang), fontSize: 10, color: C.gray700, lineHeight: 1.8, maxWidth: 450 }}>
              {t(lang, 
                'نحن متخصصون في نقل الرخام من منطقة شق الثعبان الصناعية إلى موانئ التصدير في مصر. تشمل عملياتنا تحميل الحاويات، والتعبئة، وتجهيز الشحنات للتصدير الدولي.', 
                'We specialize in marble export logistics from the Shaq El-Thoban industrial zone to export ports in Egypt. Our operations include container loading, packing, and preparing shipments for international export.'
              )}
            </Text>
          </View>
        </View>

        {/* Standout Sentence */}
        <View style={{ backgroundColor: C.bg, borderRadius: 6, padding: 12, marginBottom: 20, borderWidth: 1, borderColor: C.gray200, borderLeftWidth: lang==='en'? 3: 1, borderRightWidth: lang==='ar'? 3: 1, borderLeftColor: lang==='en'? C.orange: C.gray200, borderRightColor: lang==='ar'? C.orange: C.gray200 }}>
          <Text style={{ fontFamily: ff(lang), fontSize: 10, fontWeight: 700, color: C.navy }}>
            {t(lang, 'نحن لا نقوم فقط بنقل الرخام — بل نقوم بتجهيزه للتصدير', 'We don\'t just transport marble — we prepare it for export.')}
          </Text>
        </View>

        {/* Integrated Export Operations Management */}
        <Text style={{ fontFamily: ff(lang), fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 12 }}>
          {t(lang, 'إدارة متكاملة لعمليات التصدير', 'Integrated Export Operations Management')}
        </Text>

        {/* Real Operations Image Grid */}
        <View style={{ flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12 }}>
          {/* 1. Container Loading */}
          <View style={{ width: '48%' }}>
            {data.realOpImages && data.realOpImages[3] && (
              <Image src={data.realOpImages[3]} style={{ width: '100%', height: 100, objectFit: 'cover' as const, borderRadius: 6, marginBottom: 6 }} />
            )}
            <Text style={{ fontFamily: ff(lang), fontSize: 9, fontWeight: 700, color: C.navy }}>{t(lang, 'تحميل الحاويات', 'Container Loading')}</Text>
          </View>
          
          {/* 2. Packing & Bagging */}
          <View style={{ width: '48%' }}>
            {data.realOpImages && data.realOpImages[0] && (
              <Image src={data.realOpImages[0]} style={{ width: '100%', height: 100, objectFit: 'cover' as const, borderRadius: 6, marginBottom: 6 }} />
            )}
            <Text style={{ fontFamily: ff(lang), fontSize: 9, fontWeight: 700, color: C.navy }}>{t(lang, 'التعبئة والتغليف', 'Packing & Bagging')}</Text>
          </View>

          {/* 3. Storage Yards */}
          <View style={{ width: '48%' }}>
            {data.realOpImages && data.realOpImages[2] && (
              <Image src={data.realOpImages[2]} style={{ width: '100%', height: 100, objectFit: 'cover' as const, borderRadius: 6, marginBottom: 6 }} />
            )}
            <Text style={{ fontFamily: ff(lang), fontSize: 9, fontWeight: 700, color: C.navy }}>{t(lang, 'ساحات التخزين والتجهيز', 'Processing & Storage Yards')}</Text>
          </View>

          {/* 4. Shipment Securing (Using Heavy Equipment/Loader) */}
          <View style={{ width: '48%' }}>
            {data.realOpImages && data.realOpImages[4] && (
              <Image src={data.realOpImages[4]} style={{ width: '100%', height: 100, objectFit: 'cover' as const, borderRadius: 6, marginBottom: 6 }} />
            )}
            <Text style={{ fontFamily: ff(lang), fontSize: 9, fontWeight: 700, color: C.navy }}>{t(lang, 'تأمين وتجهيز الشحنات', 'Shipment Securing & Preparation')}</Text>
          </View>
        </View>

      </View>
      
      {/* Standard Footer */}
      <PageFooter pageNum={5} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 6 — FLEET
// ═══════════════════════════════════════════════════════════════
function FleetPage({ lang, data }: Props) {
  const bgImg = data.stockImages?.fleet || data.fleet[0]?.image;
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.navy, position: 'relative' as const }}>
      {/* 100% Full Bleed Background */}
      {bgImg && <Image src={bgImg} style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, objectFit: 'cover' as const }} />}
      {/* Heavy Dark Overlay */}
      <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 20, 40, 0.6)' }} />

      <View style={{ paddingHorizontal: 48, paddingTop: 48, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 12 }}>
        {data.logo && <Image src={data.logo} style={{ width: 34, height: 34, objectFit: 'contain' as const }} />}
        <Text style={{ fontFamily: 'Inter', fontSize: 10, fontWeight: 700, color: C.gray200, letterSpacing: 2 }}>{t(lang, 'الأسطول', 'FLEET')}</Text>
      </View>

      <View style={{ position: 'absolute' as const, bottom: 60, left: 48, right: 48 }}>
        <Text style={{ fontFamily: ff(lang), fontSize: 24, fontWeight: 700, color: C.white, marginBottom: 12 }}>
          {t(lang, 'نحن لا نعمل كوسيط — نحن نتحكم في كل عملية نقل', 'We don\'t act as a broker — we control every transport operation.')}
        </Text>

        {/* Specifications grid floating */}
        <View style={{ flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12, marginTop: 24 }}>
          {[
            { label: t(lang, 'الملكية', 'Ownership'), value: t(lang, 'أسطول مملوك بالكامل', 'Fully Owned Fleet') },
            { label: t(lang, 'التتبع', 'Tracking'), value: t(lang, 'تتبع GPS لحظي', 'Real-time GPS Tracking') },
            { label: t(lang, 'القدرة', 'Capacity'), value: t(lang, 'قدرة تحميلية ضخمة', 'Massive Loading Capacity') },
            { label: t(lang, 'الطراز', 'Model'), value: 'Mercedes-Benz Actros' }
          ].map((spec, i) => (
            <View key={i} style={{ width: '48%', backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 8, color: C.orange, letterSpacing: 1, marginBottom: 4 }}>{spec.label.toUpperCase()}</Text>
              <Text style={{ fontFamily: ff(lang), fontSize: 11, fontWeight: 700, color: C.white }}>{spec.value}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom orange accent */}
      <View style={{ position: 'absolute' as const, bottom: 0, left: 0, right: 0, height: 6, backgroundColor: C.orange }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 7 — TECHNOLOGY
// ═══════════════════════════════════════════════════════════════
function TechnologyPage({ lang, data }: Props) {
  const bgImg = data.stockImages?.tech || data.heroBg?.controlRoom;
  const systems = [
    { title: t(lang, 'تتبع GPS', 'GPS Tracking'), desc: t(lang, 'مراقبة لحظية لموقع كل شاحنة وحالة الشحنة مع إشعارات فورية.', 'Real-time monitoring of every truck location and shipment status with instant notifications.') },
    { title: t(lang, 'نظام ERP', 'ERP System'), desc: t(lang, 'إدارة متكاملة للعمليات والفواتير لضمان سرعة وتدفق العمل.', 'Integrated management for operations and invoicing to ensure smooth workflows.') },
    { title: t(lang, 'مراقبة الشحنات', 'Shipment Tracking'), desc: t(lang, 'متابعة حالة الشحنة من شق الثعبان حتى الوصول للميناء.', 'Track shipment status from Shaq El-Thoban all the way to the port.') },
    { title: t(lang, 'تقارير الأداء', 'Performance Reports'), desc: t(lang, 'تحليلات دقيقة لضمان تحسين كفاءة التصدير باستمرار.', 'Accurate analytics to ensure continuous improvement of export efficiency.') },
  ];
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.white, position: 'relative' as const }}>
      {/* 40% Hero */}
      <View style={{ width: '100%', height: '40%', position: 'relative' as const }}>
        {bgImg && <Image src={bgImg} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />}
        <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 20, 40, 0.4)' }} />
        <View style={{ position: 'absolute' as const, top: 40, left: 48, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 20, height: 20, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: C.gray200, letterSpacing: 2 }}>{t(lang, 'التكنولوجيا', 'TECHNOLOGY')}</Text>
        </View>
        <View style={{ position: 'absolute' as const, bottom: 40, left: lang === 'en' ? 48 : undefined, right: lang === 'ar' ? 48 : undefined }}>
          <Text style={{ fontFamily: ff(lang), fontSize: 24, fontWeight: 700, color: C.white }}>
            {t(lang, 'رؤية كاملة. تحكم كامل.', 'Full Vision. Full Control.')}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 48, paddingTop: 32 }}>
        {/* System cards in 2x2 grid */}
        <View style={{ flexDirection: 'row' as const, flexWrap: 'wrap' as const, gap: 12 }}>
          {systems.map((sys, i) => (
            <View key={i} style={{ width: '48%', backgroundColor: C.bg, borderRadius: 6, padding: 16, borderWidth: 1, borderColor: C.gray200 }}>
              <View style={{ width: 12, height: 4, backgroundColor: C.orange, borderRadius: 2, marginBottom: 10 }} />
              <Text style={{ fontFamily: ff(lang), fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 6 }}>{sys.title}</Text>
              <Text style={{ fontFamily: ff(lang), fontSize: 9, color: C.gray600, lineHeight: 1.6 }}>{sys.desc}</Text>
            </View>
          ))}
        </View>
      </View>
      <PageFooter pageNum={7} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 8 — STRATEGIC LOCATION
// ═══════════════════════════════════════════════════════════════
function LocationPage({ lang, data }: Props) {
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.bg, position: 'relative' as const }}>
      <PageHeader logo={data.logo} section={t(lang, 'التواجد', 'LOCATION')} lang={lang} />
      <View style={{ paddingHorizontal: 48, paddingTop: 30 }}>
        <SectionTitle title={t(lang, 'التواجد الاستراتيجي', 'Strategic Presence')} lang={lang} />

        <Text style={{ fontFamily: ff(lang), fontSize: 11, color: C.gray700, lineHeight: 2, marginBottom: 24, maxWidth: 440 }}>
          {t(lang,
            'تقع بورسعيد على المدخل الشمالي لقناة السويس، الممر الذي يعبره 12% من التجارة العالمية. موقعنا الاستراتيجي يمنحنا وصولاً مباشراً إلى ثلاثة موانئ رئيسية.',
            'Port Said sits at the northern entrance of the Suez Canal, the corridor through which 12% of global trade passes. Our strategic location gives us direct access to three major ports.'
          )}
        </Text>

        {/* Map image */}
        {data.mapImage && (
          <View style={{ marginBottom: 20, borderRadius: 6, overflow: 'hidden' as const, borderWidth: 1, borderColor: C.gray200 }}>
            <Image src={data.mapImage} style={{ width: '100%', height: 180, objectFit: 'cover' as const }} />
          </View>
        )}

        {/* Port statistics */}
        <View style={{ flexDirection: 'row' as const, gap: 12, marginBottom: 24 }}>
          <MetricCard value="12%" label={t(lang, 'من التجارة العالمية', 'of Global Trade')} lang={lang} />
          <MetricCard value="10M" label={t(lang, 'حاوية سنوياً', 'TEU / Year')} lang={lang} />
          <MetricCard value="3" label={t(lang, 'موانئ رئيسية', 'Major Ports')} lang={lang} />
        </View>

        {/* Locations */}
        <View style={{ backgroundColor: C.white, borderRadius: 6, borderWidth: 1, borderColor: C.gray200 }}>
          {[
            { type: t(lang, 'المقر الرئيسي', 'Headquarters'), name: t(lang, 'أبراج أرض الجولف', 'Golf Land Towers'), addr: t(lang, '7 أبراج أرض الجولف، حي الشرق، بورسعيد', '7 Golf Land Towers, Al-Sharq, Port Said') },
            { type: t(lang, 'فرع العمليات', 'Operations Branch'), name: t(lang, 'ساحة النورس', 'Al-Nawras Square'), addr: t(lang, 'ميناء شرق بورسعيد، محور العمليات', 'East Port Said Port, Operations Hub') },
          ].map((loc, i) => (
            <View key={i} style={{ padding: 14, borderBottomWidth: i === 0 ? 1 : 0, borderBottomColor: C.gray100 }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 7, fontWeight: 700, color: C.orange, letterSpacing: 1, marginBottom: 4 }}>
                {loc.type.toUpperCase()}
              </Text>
              <Text style={{ fontFamily: ff(lang), fontSize: 10, fontWeight: 700, color: C.navy, marginBottom: 2 }}>
                {loc.name}
              </Text>
              <Text style={{ fontFamily: ff(lang), fontSize: 8, color: C.gray500 }}>
                {loc.addr}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <PageFooter pageNum={8} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 9 — SAFETY & RELIABILITY
// ═══════════════════════════════════════════════════════════════
function SafetyPage({ lang, data }: Props) {
  const bgImg = data.heroBg?.safetyWorkers;
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.white, position: 'relative' as const }}>
      {/* 40% Hero */}
      <View style={{ width: '100%', height: '40%', position: 'relative' as const }}>
        {bgImg && <Image src={bgImg} style={{ width: '100%', height: '100%', objectFit: 'cover' as const }} />}
        <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10, 20, 40, 0.4)' }} />
        <View style={{ position: 'absolute' as const, top: 40, left: 48, flexDirection: 'row' as const, alignItems: 'center' as const, gap: 8 }}>
          {data.logo && <Image src={data.logo} style={{ width: 20, height: 20, objectFit: 'contain' as const }} />}
          <Text style={{ fontFamily: 'Inter', fontSize: 8, fontWeight: 700, color: C.gray200, letterSpacing: 2 }}>{t(lang, 'الأمان', 'SAFETY')}</Text>
        </View>
        <View style={{ position: 'absolute' as const, bottom: 40, left: lang === 'en' ? 48 : undefined, right: lang === 'ar' ? 48 : undefined }}>
          <Text style={{ fontFamily: ff(lang), fontSize: 24, fontWeight: 700, color: C.white }}>
            {t(lang, 'بدون تلف. في كل مرة.', 'Zero Damage. Every Time.')}
          </Text>
        </View>
      </View>

      <View style={{ paddingHorizontal: 48, paddingTop: 32 }}>
        {/* Safety practices list */}
        {[
          { title: t(lang, '0 حوادث كبرى', '0 Major Accidents'), desc: t(lang, 'سجلنا يخلو من أي حوادث كبرى بفضل إجراءاتنا الصارمة.', 'Our record is free of major accidents thanks to strict protocols.') },
          { title: t(lang, 'تأمين شامل', 'Comprehensive Cargo Insurance'), desc: t(lang, 'جميع شحنات الرخام مؤمنة بالكامل أثناء العمليات والنقل.', 'All marble shipments fully insured during handling and transit.') },
          { title: t(lang, 'إجراءات تحميل صارمة', 'Strict Loading Protocols'), desc: t(lang, 'تثبيت متخصص لكل حاوية لضمان استقرار البضائع.', 'Specialized securing for every container ensuring cargo stability.') },
        ].map((item, i) => (
          <View key={i} style={{
            flexDirection: 'row' as const, gap: 12, marginBottom: 12,
            backgroundColor: C.bg, borderRadius: 6, padding: 16,
            borderWidth: 1, borderColor: C.gray200, borderLeftWidth: lang === 'en' ? 3 : 1, borderRightWidth: lang === 'ar' ? 3 : 1, borderLeftColor: lang === 'en' ? C.orange : C.gray200, borderRightColor: lang === 'ar' ? C.orange : C.gray200
          }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: ff(lang), fontSize: 11, fontWeight: 700, color: C.navy, marginBottom: 4 }}>{item.title}</Text>
              <Text style={{ fontFamily: ff(lang), fontSize: 9, color: C.gray600, lineHeight: 1.6 }}>{item.desc}</Text>
            </View>
          </View>
        ))}
      </View>
      <PageFooter pageNum={9} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       PAGE 10 — CONTACT
// ═══════════════════════════════════════════════════════════════
function ContactPage({ lang, data }: Props) {
  return (
    <Page size="A4" wrap={false} style={{ backgroundColor: C.navy, position: 'relative' as const, justifyContent: 'center' as const, alignItems: 'center' as const }}>
      {/* Heavy Dark Overlay for impact */}
      <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: C.navy }} />

      <View style={{ padding: 48, alignItems: 'center' as const, width: '100%' }}>
        {data.logo && <Image src={data.logo} style={{ width: 80, height: 80, objectFit: 'contain' as const, marginBottom: 24 }} />}
        
        <Text style={{ fontFamily: 'Inter', fontSize: 14, fontWeight: 700, color: C.gray200, letterSpacing: 4, marginBottom: 8 }}>SAMA LOGISTICS</Text>
        <View style={{ width: 40, height: 2, backgroundColor: C.orange, borderRadius: 1, marginBottom: 40 }} />

        <View style={{ width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 8, padding: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
          <Text style={{ fontFamily: ff(lang), fontSize: 16, fontWeight: 700, color: C.white, textAlign: 'center' as const, marginBottom: 24 }}>
            {t(lang, 'تواصل معنا لتصدير أسرع وأكثر أماناً', 'Contact Us for Faster, Safer Export')}
          </Text>

          <View style={{ flexDirection: 'row' as const, justifyContent: 'center' as const, flexWrap: 'wrap' as const, gap: 32 }}>
            <View style={{ alignItems: 'center' as const }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 8, color: C.orange, letterSpacing: 1, marginBottom: 6 }}>{t(lang, 'الهاتف', 'PHONE')}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: C.white }}>+20 66 324 1047</Text>
            </View>
            <View style={{ alignItems: 'center' as const }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 8, color: C.orange, letterSpacing: 1, marginBottom: 6 }}>{t(lang, 'البريد الإلكتروني', 'EMAIL')}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: C.white }}>info@samalogs.com</Text>
            </View>
            <View style={{ alignItems: 'center' as const }}>
              <Text style={{ fontFamily: 'Inter', fontSize: 8, color: C.orange, letterSpacing: 1, marginBottom: 6 }}>{t(lang, 'الموقع', 'WEBSITE')}</Text>
              <Text style={{ fontFamily: 'Inter', fontSize: 12, fontWeight: 700, color: C.white }}>samalogs.com</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Bottom info */}
      <View style={{ position: 'absolute' as const, bottom: 40, left: 48, right: 48, alignItems: 'center' as const }}>
        <Text style={{ fontFamily: ff(lang), fontSize: 9, color: 'rgba(255,255,255,0.4)', textAlign: 'center' as const }}>
          {t(lang, 'بورسعيد • العبور • الإسكندرية', 'Port Said • Al Obour • Alexandria')}
        </Text>
      </View>

      {/* Top orange accent */}
      <View style={{ position: 'absolute' as const, top: 0, left: 0, right: 0, height: 6, backgroundColor: C.orange }} />
    </Page>
  );
}

// ═══════════════════════════════════════════════════════════════
//       DOCUMENT ASSEMBLY — 10 Pages
// ═══════════════════════════════════════════════════════════════
export default function SamaProfileDocument({ lang, data }: Props) {
  return (
    <Document
      title={lang === 'ar' ? 'ملف تعريف شركة سما للخدمات اللوجستية' : 'SAMA Logistics Company Profile'}
      author="SAMA Logistics"
      subject="Company Profile"
      creator="SAMA Logistics Platform"
    >
      <CoverPage lang={lang} data={data} />
      <OverviewPage lang={lang} data={data} />
      <ExperiencePage lang={lang} data={data} />
      <ServicesPage lang={lang} data={data} />
      <SpecializationPage lang={lang} data={data} />
      <FleetPage lang={lang} data={data} />
      <TechnologyPage lang={lang} data={data} />
      <LocationPage lang={lang} data={data} />
      <SafetyPage lang={lang} data={data} />
      <ContactPage lang={lang} data={data} />
    </Document>
  );
}
