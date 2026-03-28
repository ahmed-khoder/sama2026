'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getPostBySlug } from '@/app/actions/blog';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { Loader2, Calendar, User, ArrowRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ShareButtons from '@/components/ShareButtons';
import BlogGallery from '@/components/BlogGallery';
import type { BlogPost } from '@/types';

export default function SinglePostPage({ params }: { params: { slug: string } }) {
  const { language } = useLanguage();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const res = await getPostBySlug(params.slug);
      if (res.success && res.post) {
        setPost(res.post as BlogPost);
      } else {
        setError(true);
      }
      setLoading(false);
    };
    fetchPost();
  }, [params.slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
      </div>
    );
  }

  if (error || !post) {
    return notFound();
  }

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

        {/* Gallery Section - Checks for real gallery, falls back to mock for demo */}
        {(post.gallery && post.gallery.length > 0) ? (
          <BlogGallery images={post.gallery} isRTL={isRTL} />
        ) : (
          <BlogGallery
            isRTL={isRTL}
            images={[
              { id: '1', url: 'https://images.unsplash.com/photo-1494412574643-35d324698420?auto=format&fit=crop&q=80&w=1200', caption: 'Global Shipping' },
              { id: '2', url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=1200', caption: 'Port Operations' },
              { id: '3', url: 'https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&q=80&w=1200', caption: 'Logistics Center' },
            ]}
          />
        )}

        {/* Share Buttons */}
        <ShareButtons title={title} url="" /> {/* URL will be auto-detected on client */}

      </article>
    </div>
  );
}

