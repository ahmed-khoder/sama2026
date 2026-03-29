import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug } from '@/app/actions/blog';
import BlogPostClient from './BlogPostClient';
import type { BlogPost } from '@/types';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const res = await getPostBySlug(params.slug);
  
  if (!res.success || !res.post) {
    return {
      title: 'مقال غير موجود | Post Not Found',
    };
  }

  const post = res.post;
  const title = post.titleAr || post.titleEn;
  
  // Clean HTML if necessary or just slice text
  const cleanContent = (post.contentAr || post.contentEn || '')
    .replace(/<[^>]*>?/gm, '') // Simple strip HTML just in case
    .substring(0, 160) + '...';

  return {
    title: title,
    description: cleanContent,
    openGraph: {
      title: title,
      description: cleanContent,
      type: 'article',
      publishedTime: post.createdAt.toISOString(),
      authors: [post.author?.name || 'SAMA Logistics'],
      images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: cleanContent,
      images: post.image ? [post.image] : [],
    },
  };
}

export default async function SinglePostPage({ params }: Props) {
  const res = await getPostBySlug(params.slug);

  if (!res.success || !res.post) {
    notFound();
  }

  return <BlogPostClient post={res.post as unknown as BlogPost} />;
}
