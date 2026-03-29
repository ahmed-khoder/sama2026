import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import ServiceDetailClient from './ServiceDetailClient';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = await prisma.service.findUnique({
    where: { slug: params.slug },
  });
  
  if (!service || !service.isActive) {
    return {
      title: 'خدمة غير موجودة | Service Not Found',
    };
  }

  const title = service.titleAr || service.titleEn;
  const description = service.shortDescAr || service.shortDescEn;
  const image = service.image || '';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'website',
      images: image ? [{ url: image, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: image ? [image] : [],
    },
  };
}

export default async function ServiceDetailPage({ params }: Props) {
  const allServices = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  const service = allServices.find((s) => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  // Serialize to avoid Next.js Date parsing warnings when passing from Server to Client
  const safeAllServices = JSON.parse(JSON.stringify(allServices));
  const safeService = JSON.parse(JSON.stringify(service));

  return <ServiceDetailClient service={safeService} allServices={safeAllServices} />;
}
