import { prisma } from '@/lib/db';
import ServicesPageClient from './ServicesPageClient';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';

// ISR: revalidate every 5 minutes
export const revalidate = 300;

// ─── Dynamic bilingual SEO metadata ───
export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const title = isArabic
        ? 'خدمات النقل اللوجستي ونقل الحاويات في بورسعيد'
        : 'Freight, Customs & Transport Services in Port Said';
    const description = isArabic
        ? 'خدمات احترافية في نقل الحاويات والشحن والتخليص الجمركي في بورسعيد. حلول لوجستية سريعة وآمنة وموثوقة من شركة سما لوجيستك.'
        : 'Sea freight, land transport, customs clearance, warehousing, and cargo insurance from Port Said, Egypt. Explore SAMA Logistics services.';

    return {
        title,
        description,
        keywords: isArabic
            ? 'نقل حاويات مصر, شركة لوجستية بورسعيد, شحن بحري مصر, تخليص جمركي, خدمات شحن, خدمات لوجستية, تخزين, توزيع'
            : 'container transport Egypt, logistics company Port Said, freight forwarding Egypt, customs clearance Egypt, shipping services Egypt, logistics services, warehousing, distribution',
        openGraph: {
            title,
            description,
            type: 'website',
            url: 'https://samalogistics.com/services',
            images: [
                {
                    url: '/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: isArabic ? 'خدمات سما لوجيستك اللوجستية' : 'SAMA Logistics Services',
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: ['/og-image.jpg'],
        },
        alternates: {
            canonical: 'https://samalogistics.com/services',
        },
    };
}

export default async function ServicesPage() {
    // Fetch services server-side (same query as /api/cms/services GET)
    let services: any[] = [];
    try {
        const raw = await prisma.service.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            include: {
                images: {
                    orderBy: { order: 'asc' },
                },
            },
        });

        services = raw.map(s => ({
            ...JSON.parse(JSON.stringify(s)), // serialize Prisma objects
            features: (() => { try { return JSON.parse(s.featuresJson || '[]'); } catch { return []; } })(),
        }));
    } catch {
        services = [];
    }

    // Fetch fleet server-side (same query as /api/cms/fleet GET)
    let fleet: any[] = [];
    try {
        const raw = await prisma.fleetTruck.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        fleet = JSON.parse(JSON.stringify(raw));
    } catch {
        fleet = [];
    }

    // Fetch ports server-side (same query as /api/cms/ports GET)
    let ports: any[] = [];
    try {
        const raw = await prisma.portOperation.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        ports = JSON.parse(JSON.stringify(raw));
    } catch {
        ports = [];
    }

    // Fetch specialized cargo server-side (same query as /api/cms/specialized-cargo GET)
    let cargo: any[] = [];
    try {
        const raw = await prisma.specializedCargo.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
        });
        cargo = JSON.parse(JSON.stringify(raw));
    } catch {
        cargo = [];
    }

    return <ServicesPageClient initialServices={services} initialFleet={fleet} initialPorts={ports} initialCargo={cargo} />;
}
