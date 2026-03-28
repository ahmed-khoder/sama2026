'use client';

import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Ship, Mail, Phone, MapPin,
  ArrowRight, ArrowLeft, Sparkles, Send, Check, CheckCircle, Award, ChevronDown, Copy
} from 'lucide-react';

// ══════════════════════════════════════════════════════════════
// Hapag-Lloyd style outlined social media SVG icons
// Outline / Line Art — thin uniform orange strokes, no fill
// ══════════════════════════════════════════════════════════════

// Facebook: Rounded square with "f" — vertical stem merges with bottom border,
// horizontal bar merges with right border
const HLFacebookIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Outer rounded square — bottom-right portion open where "f" merges */}
    <path d="M10 4h24a6 6 0 016 6v24a6 6 0 01-6 6H24V24h6l1-6h-7v-3c0-2 1-3 3-3h3V6h-4c-5 0-8 3-8 8v4h-5v6h5v12H10a6 6 0 01-6-6V10a6 6 0 016-6z" />
  </svg>
);

// LinkedIn: Thick hollow outlined "in" block letters — no box
const HLLinkedInIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeLinejoin="round">
    {/* Dot of "i" — outlined circle */}
    <circle cx="9" cy="7" r="3.5" strokeWidth="2" />
    {/* Body of "i" — tall outlined rectangle */}
    <rect x="5.5" y="15" width="7" height="20" rx="1.5" strokeWidth="2" />
    {/* Letter "n" — outlined block shape: left stem + arch + right stem */}
    <path d="M18.5 35V24c0-5.5 3-9 8.5-9 5.5 0 8.5 3.5 8.5 9v11h-7V25c0-2-1.2-3.2-3.2-3.2h-.6c-2 0-3.2 1.2-3.2 3.2v10z" strokeWidth="2" />
    <line x1="18.5" y1="15" x2="18.5" y2="35" strokeWidth="2" />
  </svg>
);

// Instagram: Heavy-radius squircle, center circle, small top-right dot
const HLInstagramIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="4" y="4" width="32" height="32" rx="10" />
    <circle cx="20" cy="20" r="7.5" />
    <circle cx="30" cy="10" r="1.8" fill="currentColor" stroke="none" />
  </svg>
);

// TikTok: Thick outlined musical note — actual TikTok brand shape
// Vertical stem with notch at top-right, circular loop at bottom-left
const HLTikTokIcon = ({ className = '' }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {/* Main stem + bottom circle loop */}
    <path d="M22 5v20.5a8 8 0 11-8-8" />
    {/* Top-right arm extending outward then up — the characteristic TikTok notch */}
    <path d="M22 5c0 5 3.5 8 8 8" />
    <path d="M22 11c0 2.5 1.8 4.5 4 5" />
  </svg>
);

// Hapag-Lloyd style social icon wrapper — outlined, no fill, orange stroke
function SocialIconHL({ icon, href, label }: { icon: React.ReactNode; href: string; label: string }) {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.92 }}
      className="w-11 h-11 flex items-center justify-center text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-colors"
      title={label}
    >
      {icon}
    </motion.a>
  );
}
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import DynamicLogo from './DynamicLogo';
import MobileFooter from './MobileFooter';

export default function Footer() {
  const { t, language } = useLanguage();
  const isRTL = language === 'ar';
  const year = new Date().getFullYear();
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  return (
    <>
      {/* ── Mobile Footer (md:hidden) — separate component ── */}
      <MobileFooter />

      {/* ── Desktop/Tablet Footer (hidden on mobile) ── */}
      <footer className="relative bg-white dark:bg-slate-950 overflow-hidden hidden md:block">
        {/* Parallax Background */}
        <motion.div
          style={{ y: backgroundY }}
          className="absolute inset-0 opacity-5 dark:opacity-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(249,115,22,0.2),transparent_50%),radial-gradient(circle_at_70%_80%,rgba(30,58,95,0.3),transparent_50%)]" />
        </motion.div>

        {/* Main Content */}
        <div className="relative border-t border-gray-100 dark:border-slate-800">
          <div className="container mx-auto px-4 py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

              {/* Company Info */}
              <CompanyColumn isRTL={isRTL} language={language} />

              {/* Quick Links */}
              <QuickLinksColumn isRTL={isRTL} language={language} t={t} />

              {/* Services */}
              <ServicesColumn isRTL={isRTL} language={language} t={t} />

              {/* Contact */}
              <ContactColumn isRTL={isRTL} language={language} />

            </div>

            {/* Bottom Bar */}
            <BottomBar year={year} language={language} t={t} />
          </div>
        </div>
      </footer>
    </>
  );
}

// Company Column
function CompanyColumn({ isRTL, language }: { isRTL: boolean; language: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <Link href="/" className="inline-block group">
        <DynamicLogo className="h-12 w-48 transition-transform group-hover:scale-105" />
      </Link>

      <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
        {language === 'ar'
          ? 'شريكك الموثوق في الحلول اللوجستية المتكاملة. نقدم خدمات شحن بحري وجوي وبري وتخليص جمركي بأعلى معايير الجودة والأمان.'
          : 'Your trusted partner in integrated logistics solutions. We provide sea, air, and land freight and customs clearance services with the highest standards of quality and safety.'}
      </p>

      {/* Hapag-Lloyd Style Social Icons — outlined, orange */}
      <div className="flex items-center gap-1">
        <SocialIconHL icon={<HLFacebookIcon className="w-8 h-8" />} href="https://www.facebook.com/Samallogseg/" label="Facebook" />
        <SocialIconHL icon={<HLLinkedInIcon className="w-8 h-8" />} href="https://www.linkedin.com/company/sama-logistic" label="LinkedIn" />
        <SocialIconHL icon={<HLInstagramIcon className="w-8 h-8" />} href="#" label="Instagram" />
        <SocialIconHL icon={<HLTikTokIcon className="w-8 h-8" />} href="#" label="TikTok" />
      </div>
    </motion.div>
  );
}

// Quick Links Column  
function QuickLinksColumn({ isRTL, language, t }: { isRTL: boolean; language: string; t: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-brand-orange to-brand-gold rounded-full" />
        {language === 'ar' ? 'روابط سريعة' : 'Quick Links'}
      </h3>
      <ul className="space-y-3">
        <FooterLink href="/" label={t('home')} isRTL={isRTL} />
        <FooterLink href="/services" label={t('services')} isRTL={isRTL} />
        <FooterLink href="/about" label={t('about')} isRTL={isRTL} />
        <FooterLink href="/careers" label={language === 'ar' ? 'الوظائف' : 'Careers'} isRTL={isRTL} />
        <FooterLink href="/blog" label={t('blog') || (language === 'ar' ? 'المدونة' : 'Blog')} isRTL={isRTL} />
        <FooterLink href="/contact" label={t('contact')} isRTL={isRTL} />
      </ul>
    </motion.div>
  );
}

// Services Column - Dynamic from API with caching
function ServicesColumn({ isRTL, language, t }: { isRTL: boolean; language: string; t: any }) {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    // Check sessionStorage cache first (5 min TTL)
    try {
      const cached = sessionStorage.getItem('footer_services');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          setServices(data);
          return;
        }
      }
    } catch { }

    fetch('/api/cms/services')
      .then(res => res.json())
      .then(data => {
        const activeServices = data.filter((s: any) => s.isActive);
        setServices(activeServices);
        // Cache for 5 minutes
        try {
          sessionStorage.setItem('footer_services', JSON.stringify({
            data: activeServices,
            timestamp: Date.now()
          }));
        } catch { }
      })
      .catch(err => console.error('Error loading services:', err));
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-brand-orange to-brand-gold rounded-full" />
        {language === 'ar' ? 'خدماتنا' : 'Our Services'}
      </h3>
      <ul className="space-y-3">
        {services.map((service) => (
          <FooterLink
            key={service.id}
            href={`/services/${service.slug}`}
            label={language === 'ar' ? service.titleAr : service.titleEn}
            isRTL={isRTL}
          />
        ))}
      </ul>
    </motion.div>
  );
}

// Contact Column
function ContactColumn({ isRTL, language }: { isRTL: boolean; language: string }) {
  const [copied, setCopied] = useState('');

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <h3 className="text-lg font-bold text-marine-900 dark:text-white mb-6 flex items-center gap-2">
        <div className="w-1 h-6 bg-gradient-to-b from-brand-orange to-brand-gold rounded-full" />
        {language === 'ar' ? 'تواصل معنا' : 'Contact Us'}
      </h3>
      <ul className="space-y-4">
        {/* 1. Mobile & WhatsApp (merged) */}
        <li>
          <motion.div whileHover={{ x: 4 }} className="flex items-start gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-orange/20 to-green-500/20 dark:from-brand-orange/10 dark:to-green-500/10 flex items-center justify-center flex-shrink-0 text-brand-orange group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5">
                {language === 'ar' ? 'هاتف وواتساب' : 'Phone & WhatsApp'}
              </span>
              {/* Number 1 */}
              <div className="flex items-center gap-1.5 mb-1" dir="ltr">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-all">+20 122 130 0036</span>
                <div className="flex items-center gap-0.5">
                  <a href="tel:+201221300036" title={language === 'ar' ? 'اتصال' : 'Call'} className="w-6 h-6 rounded-md hover:bg-brand-orange/10 flex items-center justify-center text-gray-400 hover:text-brand-orange transition-colors"><Phone className="w-3 h-3" /></a>
                  <a href="https://wa.me/201221300036" target="_blank" rel="noopener noreferrer" title="WhatsApp" className="w-6 h-6 rounded-md hover:bg-green-500/10 flex items-center justify-center text-gray-400 hover:text-green-500 transition-colors"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
                  <button onClick={() => copyToClipboard('+201221300036', 'phone1')} title={language === 'ar' ? 'نسخ' : 'Copy'} className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">{copied === 'phone1' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}</button>
                </div>
              </div>
              {/* Number 2 */}
              <div className="flex items-center gap-1.5" dir="ltr">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-all">+20 121 175 5925</span>
                <div className="flex items-center gap-0.5">
                  <a href="tel:+201211755925" title={language === 'ar' ? 'اتصال' : 'Call'} className="w-6 h-6 rounded-md hover:bg-brand-orange/10 flex items-center justify-center text-gray-400 hover:text-brand-orange transition-colors"><Phone className="w-3 h-3" /></a>
                  <a href="https://wa.me/201211755925" target="_blank" rel="noopener noreferrer" title="WhatsApp" className="w-6 h-6 rounded-md hover:bg-green-500/10 flex items-center justify-center text-gray-400 hover:text-green-500 transition-colors"><svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
                  <button onClick={() => copyToClipboard('+201211755925', 'phone2')} title={language === 'ar' ? 'نسخ' : 'Copy'} className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">{copied === 'phone2' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}</button>
                </div>
              </div>
            </div>
          </motion.div>
        </li>

        {/* 2. Landline */}
        <li>
          <motion.div whileHover={{ x: 4 }} className="flex items-start gap-3 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-orange/20 to-brand-gold/20 dark:from-brand-orange/10 dark:to-brand-gold/10 flex items-center justify-center flex-shrink-0 text-brand-orange group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
                {language === 'ar' ? 'هاتف أرضي' : 'Landline'}
              </span>
              <div className="flex items-center gap-1.5" dir="ltr">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 select-all">+20 66 374 4469</span>
                <div className="flex items-center gap-0.5">
                  <a href="tel:+20663744469" title={language === 'ar' ? 'اتصال' : 'Call'} className="w-6 h-6 rounded-md hover:bg-brand-orange/10 flex items-center justify-center text-gray-400 hover:text-brand-orange transition-colors"><Phone className="w-3 h-3" /></a>
                  <button onClick={() => copyToClipboard('+20663744469', 'landline')} title={language === 'ar' ? 'نسخ' : 'Copy'} className="w-6 h-6 rounded-md hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">{copied === 'landline' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}</button>
                </div>
              </div>
            </div>
          </motion.div>
        </li>

        {/* 3. Email */}
        <ContactCard
          icon={<Mail className="w-5 h-5" />}
          label={language === 'ar' ? 'البريد' : 'Email'}
          value="info@samalogs.com"
          href="mailto:info@samalogs.com"
          onCopy={() => copyToClipboard('info@samalogs.com', 'email')}
          copied={copied === 'email'}
        />

        {/* 4. Address */}
        <ContactCard
          icon={<MapPin className="w-5 h-5" />}
          label={language === 'ar' ? 'العنوان' : 'Address'}
          value={language === 'ar' ? '7 أبراج أرض الجولف، بورسعيد' : '7 Golf Land Towers, Port Said'}
          href="https://maps.google.com/?q=7+Golf+Land+Towers+Port+Said+Egypt"
        />

        {/* 5. Office */}
        <ContactCard
          icon={<MapPin className="w-5 h-5" />}
          label={language === 'ar' ? 'المكتب' : 'Office'}
          value={language === 'ar' ? 'مكتب 12 بساحة النورس، ميناء شرق بورسعيد' : 'Office 12, Al-Nawras Square, East Port Said Port'}
          href="https://maps.google.com/?q=East+Port+Said+Port+Egypt"
        />
      </ul>
    </motion.div>
  );
}

// Contact Card with Copy
function ContactCard({
  icon,
  label,
  value,
  href,
  onCopy,
  copied,
  rtl
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
  onCopy?: () => void;
  copied?: boolean;
  rtl?: boolean;
}) {
  const content = (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-start gap-3 group cursor-pointer"
    >
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-orange/20 to-brand-gold/20 dark:from-brand-orange/10 dark:to-brand-gold/10 flex items-center justify-center flex-shrink-0 text-brand-orange group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <span className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">
          {label}
        </span>
        <span
          className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-brand-orange dark:group-hover:text-brand-orange transition-colors break-words"
          dir={rtl ? "ltr" : undefined}
        >
          {value}
        </span>
      </div>
      {onCopy && (
        <button
          onClick={(e) => {
            e.preventDefault();
            onCopy();
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400 hover:text-brand-orange" />
          )}
        </button>
      )}
    </motion.div>
  );

  return href ? (
    <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">
      {content}
    </a>
  ) : (
    content
  );
}


// Bottom Bar
function BottomBar({ year, language, t }: { year: number; language: string; t: any }) {
  return (
    <div className="pt-8 mt-8 border-t border-gray-100 dark:border-slate-800">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <p className="text-gray-500 dark:text-gray-400 text-center md:text-start">
          © {year} SAMA Logistics. {t('copyright')}
        </p>
        <div className="flex items-center gap-6 text-gray-500 dark:text-gray-400">
          <Link href="#" className="hover:text-brand-orange transition-colors">
            {language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}
          </Link>
          <Link href="#" className="hover:text-brand-orange transition-colors">
            {language === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Enhanced Footer Link
function FooterLink({ href, label, isRTL }: { href: string; label: string; isRTL: boolean }) {
  return (
    <li>
      <Link
        href={href}
        className="group flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-brand-orange dark:hover:text-brand-orange transition-colors text-sm"
      >
        <span className="relative">
          {label}
          <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-orange group-hover:w-full transition-all duration-300" />
        </span>
        {isRTL ? (
          <ArrowLeft className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand-orange" />
        ) : (
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-brand-orange" />
        )}
      </Link>
    </li>
  );
}
