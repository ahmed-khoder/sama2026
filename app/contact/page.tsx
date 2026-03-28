'use client';

import { Mail, Phone, Smartphone, MapPin } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import ContactForm from '@/components/features/contact/ContactForm';
import { motion } from 'framer-motion';
import { useSearchParams } from 'next/navigation';

export default function Contact() {
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();
  const defaultType = searchParams.get('tab') === 'quote' ? 'QUOTE_REQUEST' : 'INQUIRY';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 py-24">
      {/* Hero Section */}
      <div className="relative overflow-hidden mb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-marine-50 to-transparent dark:from-marine-950/30 dark:to-transparent" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block py-1.5 px-4 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-semibold mb-4">
              {t('contact')}
            </span>
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-marine-900 dark:text-white mb-6">
              {language === 'ar' ? 'تواصل ' : 'Get in '}
              <span className="text-brand-orange">{language === 'ar' ? 'معنا' : 'Touch'}</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 font-normal leading-relaxed">
              {language === 'ar'
                ? 'نحن هنا للإجابة على استفساراتكم ومساعدتكم في جميع احتياجاتكم اللوجستية.'
                : 'We are here to answer your inquiries and help you with all your logistics needs.'
              }
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700">
              <h3 className="text-lg md:text-xl font-semibold text-marine-900 dark:text-white mb-6">
                {language === 'ar' ? 'بيانات التواصل' : 'Contact Information'}
              </h3>

              <div className="space-y-6">
                {/* Phone & WhatsApp */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-marine-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-brand-orange shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-marine-900 dark:text-white mb-1.5">
                      {language === 'ar' ? 'هاتف وواتساب' : 'Phone & WhatsApp'}
                    </h4>
                    <div className="flex items-center gap-2 mb-1" dir="ltr">
                      <span className="text-sm text-gray-600 dark:text-gray-400 select-all">+20 122 130 0036</span>
                      <a href="tel:+201221300036" className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-all"><Phone className="w-3.5 h-3.5" /></a>
                      <a href="https://wa.me/201221300036" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
                    </div>
                    <div className="flex items-center gap-2" dir="ltr">
                      <span className="text-sm text-gray-600 dark:text-gray-400 select-all">+20 121 175 5925</span>
                      <a href="tel:+201211755925" className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-all"><Phone className="w-3.5 h-3.5" /></a>
                      <a href="https://wa.me/201211755925" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all"><svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></a>
                    </div>
                  </div>
                </div>
                {/* Landline */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-marine-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-brand-orange shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-marine-900 dark:text-white mb-1">{language === 'ar' ? 'هاتف أرضي' : 'Landline'}</h4>
                    <div className="flex items-center gap-2" dir="ltr">
                      <span className="text-sm text-gray-600 dark:text-gray-400 select-all">+20 66 374 4469</span>
                      <a href="tel:+20663744469" className="w-7 h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center text-brand-orange hover:bg-brand-orange hover:text-white transition-all"><Phone className="w-3.5 h-3.5" /></a>
                    </div>
                  </div>
                </div>
                <ContactItem
                  icon={<Mail className="w-5 h-5" />}
                  title={language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  content="info@samalogs.com"
                  href="mailto:info@samalogs.com"
                />
                <ContactItem
                  icon={<MapPin className="w-5 h-5" />}
                  title={language === 'ar' ? 'العنوان' : 'Address'}
                  content={language === 'ar'
                    ? '7 ابراج ارض الجولف، حى الشرق، بورسعيد، جمهورية مصر العربية'
                    : '7 Golf Land Towers, Al-Sharq District, Port Said, Egypt'
                  }
                  href="https://maps.google.com/?q=7+Golf+Land+Towers+Port+Said+Egypt"
                />
              </div>
            </div>

            {/* Working Hours Card */}
            <div className="bg-gradient-to-br from-marine-600 to-marine-800 p-6 rounded-2xl text-white">
              <h4 className="font-semibold text-lg mb-4">
                {language === 'ar' ? '🕐 ساعات العمل' : '🕐 Working Hours'}
              </h4>

              {/* Office Hours */}
              <div className="mb-4">
                <p className="text-xs text-white/70 mb-2 font-medium">
                  {language === 'ar' ? '📍 مقر الشركة' : '📍 Office Hours'}
                </p>
                <div className="space-y-2 text-sm text-white/90">
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'السبت - الخميس' : 'Sat - Thu'}</span>
                    <span className="font-mono" dir="ltr">9:00 AM - 6:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>{language === 'ar' ? 'الجمعة' : 'Friday'}</span>
                    <span className="text-red-300">{language === 'ar' ? 'مغلق' : 'Closed'}</span>
                  </div>
                </div>
              </div>

              {/* 24/7 Shipping */}
              <div className="pt-3 border-t border-white/20">
                <div className="flex items-center gap-2 text-brand-orange font-semibold mb-1">
                  <span>🚢</span>
                  <span>{language === 'ar' ? 'عمليات الشحن' : 'Shipping Operations'}</span>
                </div>
                <p className="text-sm text-white/90">
                  {language === 'ar'
                    ? '24 ساعة / 7 أيام في الأسبوع'
                    : '24/7 Around the clock'}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {language === 'ar'
                    ? 'خدمات التتبع والشحن متاحة على مدار الساعة'
                    : 'Tracking & shipping services available 24/7'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-2"
          >
            <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-800">
              <h3 className="text-xl md:text-2xl font-semibold tracking-tight text-marine-900 dark:text-white mb-8">
                {language === 'ar' ? 'أرسل لنا رسالة' : 'Send us a Message'}
              </h3>

              <ContactForm language={language} defaultType={defaultType} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function ContactItem({
  icon,
  title,
  content,
  href,
  isPhone = false
}: {
  icon: React.ReactNode;
  title: string;
  content: string;
  isPhone?: boolean;
  href: string;
}) {
  return (
    <a href={href} className="flex items-start gap-4 group">
      <div className="w-12 h-12 bg-marine-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-brand-orange group-hover:bg-brand-orange group-hover:text-white transition-all duration-300 shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-medium text-marine-900 dark:text-white mb-1">{title}</h4>
        <p className="text-gray-600 dark:text-gray-400 group-hover:text-marine-600 dark:group-hover:text-marine-400 transition-colors text-sm" dir={isPhone ? 'ltr' : undefined}>
          {content}
        </p>
      </div>
    </a>
  );
}
