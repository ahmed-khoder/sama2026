'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import Link from 'next/link';
import Image from 'next/image';
import { getPosts } from '@/app/actions/blog';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Loader2, ArrowRight, ArrowLeft, Newspaper, BookOpen, Calendar, Tag } from 'lucide-react';
import { getOverlayColor, highlightText } from '@/lib/hero-utils';
import { HeroSlideshow } from '@/components/HeroSlideshow';
import type { BlogPostListItem } from '@/types';

interface BlogHeroSettings {
  blurAmount: number;
  overlayOpacity: number;
  overlayColor: string;
  showGrid: boolean;
  titleColor: string;
  subtitleColor: string;
  badgeColor: string;
  highlightColor: string;
  highlightWordsAr: string;
  highlightWordsEn: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  badgeAr: string;
  badgeEn: string;
  image: string | null;
  articleLayout: string;
  cardSize: string;
}

interface BlogSlide {
  id: string;
  imageDesktopAr?: string;
  imageDesktopEn?: string;
  imageMobile?: string | null;
  order: number;
}

const categories = [
  { id: 'all', labelAr: 'الكل', labelEn: 'All' },
  { id: 'news', labelAr: 'أخبار', labelEn: 'News' },
  { id: 'updates', labelAr: 'تحديثات', labelEn: 'Updates' },
  { id: 'tips', labelAr: 'نصائح', labelEn: 'Tips' },
];

export default function BlogPage() {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [posts, setPosts] = useState<BlogPostListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [blogSlides, setBlogSlides] = useState<BlogSlide[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  // Dynamic Hero Settings
  const [heroSettings, setHeroSettings] = useState<BlogHeroSettings>({
    blurAmount: 0,
    overlayOpacity: 75,
    overlayColor: 'marine',
    showGrid: true,
    titleColor: '#ffffff',
    subtitleColor: '#ffffffcc',
    badgeColor: '#F97316',
    highlightColor: '#F97316',
    highlightWordsAr: '',
    highlightWordsEn: '',
    titleAr: 'آخر الأخبار والمقالات',
    titleEn: 'Latest News & Articles',
    subtitleAr: 'تابع أحدث أخبار الشحن، اتجاهات السوق، ونصائح الخبراء لتعزيز سلسلة الإمداد الخاصة بك.',
    subtitleEn: 'Stay updated with the latest shipping news, market trends, and expert tips to optimize your supply chain.',
    badgeAr: 'المدونة والأخبار',
    badgeEn: 'Blog & News',
    image: null,
    articleLayout: 'grid',
    cardSize: 'medium',
  });

  useEffect(() => {
    // Fetch hero settings
    fetch('/api/cms/blog-hero')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setHeroSettings(data);
      })
      .catch(() => { });

    // Fetch slides
    fetch('/api/cms/blog-hero/slides')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBlogSlides(data);
      })
      .catch(() => { });

    // Detect mobile
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);

    // Fetch posts
    const fetchPosts = async () => {
      const res = await getPosts(true);
      if (res.success && res.posts) {
        setPosts(res.posts as BlogPostListItem[]);
      }
      setLoading(false);
    };
    fetchPosts();

    return () => window.removeEventListener('resize', check);
  }, []);

  // Only use CMS-uploaded fallback image (no hardcoded URLs)
  const heroImage = heroSettings.image || null;

  // Filter slides that actually have images
  const validSlides = blogSlides.filter(s => s.imageDesktopAr || s.imageDesktopEn || s.imageMobile);

  // Helper for HeroSlideshow
  const getSlideImageUrl = (slide: any, lang: string, mobile?: boolean) => {
    if (mobile && slide.imageMobile) return slide.imageMobile;
    return lang === 'ar' ? (slide.imageDesktopAr || slide.imageDesktopEn || null) : (slide.imageDesktopEn || slide.imageDesktopAr || null);
  };

  // Dynamic layout classes
  const gridClasses = heroSettings.articleLayout === 'list'
    ? 'flex flex-col gap-6'
    : 'grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8';

  const imageClasses = heroSettings.cardSize === 'small'
    ? 'h-40'
    : heroSettings.cardSize === 'large'
      ? 'h-72'
      : 'aspect-video';

  const titleClasses = heroSettings.cardSize === 'small'
    ? 'text-base font-bold'
    : heroSettings.cardSize === 'large'
      ? 'text-2xl font-bold'
      : 'text-xl font-bold';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">

      {/* ══════════════════════════════════════════════════
                HERO — Dynamic CMS-driven, side-aligned RTL/LTR
               ══════════════════════════════════════════════════ */}
      <section className="relative min-h-[85vh] pt-20 flex items-center overflow-hidden">
        {/* Background — dynamic slides, CMS image, or solid color */}
        <div className="absolute inset-0 overflow-hidden z-0">
          {validSlides.length > 0 ? (
            <HeroSlideshow
              slides={validSlides}
              language={language}
              isMobile={isMobile}
              getImageUrl={getSlideImageUrl}
              fallbackImage={heroImage || '/images/hero/placeholder.jpg'}
              blurAmount={heroSettings.blurAmount}
            />
          ) : heroImage ? (
            <img
              src={heroImage}
              alt="Blog Background"
              className="w-full h-full object-cover"
              style={{ filter: heroSettings.blurAmount > 0 ? `blur(${heroSettings.blurAmount}px)` : undefined }}
            />
          ) : (
            /* No slides & no CMS image → solid themed background */
            <div className="w-full h-full bg-[#032541]" />
          )}
        </div>

        {/* Dynamic CMS overlay */}
        <div
          className="absolute inset-0 z-[2]"
          style={{ backgroundColor: getOverlayColor(heroSettings.overlayColor, heroSettings.overlayOpacity) }}
        />
        <div className={`absolute inset-0 z-[3] pointer-events-none`} style={{ background: `radial-gradient(ellipse 90% 80% at ${isRTL ? '70%' : '30%'} 50%, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.32) 15%, rgba(0,0,0,0.22) 30%, rgba(0,0,0,0.12) 45%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.01) 75%, transparent 90%)` }} />

        <div className="container mx-auto px-4 relative z-20 min-h-[50vh] flex items-center">
          <div className="grid lg:grid-cols-2 gap-16 items-center w-full">
            <motion.div
              initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className={`max-w-2xl relative ${isRTL ? 'text-right lg:order-2' : 'text-left'}`}
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8"
              >
                <span className="text-sm font-semibold tracking-wide" style={{ color: heroSettings.badgeColor || '#F97316' }}>{isRTL ? heroSettings.badgeAr : heroSettings.badgeEn}</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="text-3xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]"
                style={{ color: heroSettings.titleColor || '#ffffff' }}
              >
                {highlightText(
                  isRTL ? heroSettings.titleAr : heroSettings.titleEn,
                  isRTL ? heroSettings.highlightWordsAr : heroSettings.highlightWordsEn,
                  heroSettings.highlightColor
                )}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-lg md:text-xl max-w-xl font-normal leading-relaxed mb-8"
                style={{ color: heroSettings.subtitleColor || '#ffffffcc' }}
              >
                {isRTL ? heroSettings.subtitleAr : heroSettings.subtitleEn}
              </motion.p>

              {/* Decorative Line */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className={`w-24 h-1.5 bg-gradient-to-r from-brand-orange via-brand-gold to-brand-orange rounded-full origin-${isRTL ? 'right' : 'left'}`}
              />
            </motion.div>
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-10" />
      </section>

      {/* ══════════════════════════════════════════════════
                BLOG GRID — Category Tabs + Premium Cards
               ══════════════════════════════════════════════════ */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-slate-900/50">
        <div className="container mx-auto px-4">

          {/* Category Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 md:gap-5 mb-12 md:mb-16"
          >
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`cursor-pointer px-7 py-3.5 md:px-10 md:py-4 text-base md:text-lg font-bold rounded-full transition-all duration-300 border-2 select-none ${activeCategory === cat.id
                  ? 'bg-gradient-to-r from-brand-orange to-brand-darkOrange text-white border-brand-orange shadow-xl shadow-brand-orange/25 scale-105'
                  : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-slate-700 hover:border-brand-orange hover:text-brand-orange hover:shadow-md'
                  }`}
              >
                {isRTL ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </motion.div>

          {/* Posts Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
            </div>
          ) : posts.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={gridClasses}
            >
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * index, type: 'spring', stiffness: 100 }}
                >
                  <Link href={`/blog/${post.slug}`} className="group h-full block">
                    <article className="h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-3 transition-all duration-300 border border-gray-100 dark:border-slate-800 hover:border-brand-orange/40 flex flex-col">
                      {/* Image - Only render if available */}
                      {post.image && (
                        <div className={`relative ${imageClasses} overflow-hidden bg-gray-100 dark:bg-slate-800 shrink-0`}>
                          <Image
                            src={post.image}
                            alt={isRTL ? post.titleAr : post.titleEn}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          {/* Hover Gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          {/* Shine */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        </div>
                      )}

                      {/* Content */}
                      <div className="p-6 flex-1 flex flex-col">
                        {/* Meta Row */}
                        <div className="flex items-center gap-3 mb-4">
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-brand-orange/15 to-brand-gold/15 text-brand-orange px-3.5 py-1.5 rounded-full font-bold text-xs tracking-wide">
                            {isRTL ? 'أخبار' : 'News'}
                          </span>
                          <span className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs font-medium">
                            {format(new Date(post.createdAt), 'MMM d, yyyy', { locale: isRTL ? ar : enUS })}
                          </span>
                        </div>

                        {/* Title */}
                        <h2 className={`${titleClasses} text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-brand-orange transition-colors duration-300 line-clamp-2`}>
                          {isRTL ? post.titleAr : post.titleEn}
                        </h2>

                        {/* Excerpt */}
                        <p className="text-gray-500 dark:text-gray-400 mb-6 line-clamp-3 flex-1 leading-relaxed text-sm font-normal">
                          {isRTL
                            ? post.contentAr.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...'
                            : post.contentEn.substring(0, 150).replace(/<[^>]*>?/gm, '') + '...'}
                        </p>

                        {/* Read More */}
                        <div className="flex items-center text-brand-orange font-semibold text-sm group/link pt-2 border-t border-gray-100 dark:border-slate-800">
                          <span className={isRTL ? 'ml-2' : 'mr-2'}>{isRTL ? 'اقرأ المزيد' : 'Read More'}</span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                <Newspaper className="w-10 h-10 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
                {isRTL ? 'لا توجد مقالات منشورة حالياً' : 'No published posts available yet'}
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {isRTL ? 'تابعنا قريباً للمزيد' : 'Check back soon for updates'}
              </p>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
}
