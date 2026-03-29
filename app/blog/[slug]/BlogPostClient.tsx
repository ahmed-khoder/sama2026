'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Calendar, User, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ShareButtons from '@/components/ShareButtons';
import BlogGallery from '@/components/BlogGallery';
import type { BlogPost } from '@/types';

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const { language } = useLanguage();
  
  const title = language === 'ar' ? post.titleAr : post.titleEn;
  const content = language === 'ar' ? post.contentAr : post.contentEn;
  const isRTL = language === 'ar';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans pt-24 pb-20">

      {/* Back Link */}
      <div className="container mx-auto px-4 mb-8">
        <Link
          href="/blog"
          className="inline-flex items-center text-gray-500 hover:text-brand-orange transition-colors gap-2"
        >
          {isRTL ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          <span>{language === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}</span>
        </Link>
      </div>

      <article className="container mx-auto px-4 max-w-4xl">

        {/* Header */}
        <header className="mb-10 text-center">
          <div className="flex items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-orange" />
              <span>{format(new Date(post.createdAt), 'PPP', { locale: isRTL ? ar : enUS })}</span>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-brand-orange" />
              <span>{post.author.name || 'Admin'}</span>
            </div>
          </div>

          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight mb-8">
            {title}
          </h1>

          {post.image && (
            <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-2xl border border-gray-100 dark:border-slate-800 mb-10">
              <img
                src={post.image}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </header>

        {/* Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          {/* Render content with line breaks */}
          {content.split('\n').map((paragraph, idx) => (
            paragraph ? <p key={idx} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed text-base md:text-lg font-normal">{paragraph}</p> : <br key={idx} />
          ))}
        </div>

        {/* Gallery Section - Strict Null Guard (Only render if gallery has images) */}
        {(post.gallery && post.gallery.length > 0) && (
          <BlogGallery images={post.gallery} isRTL={isRTL} />
        )}

        {/* Share Buttons */}
        <ShareButtons title={title} url="" /> {/* URL will be auto-detected on client */}

      </article>
    </div>
  );
}

