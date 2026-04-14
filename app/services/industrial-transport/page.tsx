import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import IndustrialTransportClient from './IndustrialTransportClient';

// ─── Dynamic bilingual SEO metadata ───
export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const title = isArabic
        ? 'نقل حاويات المصانع والقطاع الصناعي | سما لوجيستك'
        : 'Factory & Industrial Container Transport | SAMA Logistics';
    const description = isArabic
        ? 'نقل حاويات 40 قدم والبضائع الصناعية من وإلى المصانع والمجمعات الصناعية في جميع المحافظات. أسطول مخصص، التزام بالمواعيد، تغطية شاملة للعاشر و6 أكتوبر والسادات وجميع المناطق الصناعية.'
        : 'Professional 40ft container and industrial cargo transport to and from factories and industrial zones across all governorates. Dedicated fleet, on-time delivery, full coverage of 10th of Ramadan, 6th of October, Sadat City, and all industrial areas.';

    return {
        title,
        description,
        keywords: isArabic
            ? 'نقل حاويات مصانع, نقل صناعي مصر, نقل حاويات مناطق صناعية, نقل بضائع صناعية, شركة نقل حاويات, العاشر من رمضان, 6 أكتوبر, السادات, سما لوجيستك'
            : 'factory container transport Egypt, industrial transport, industrial zone logistics, container transport factories, 10th of Ramadan, 6th of October, Sadat City, SAMA Logistics',
        openGraph: {
            title,
            description,
            type: 'website',
            url: 'https://samalogistics.com/services/industrial-transport',
        },
        alternates: {
            canonical: 'https://samalogistics.com/services/industrial-transport',
        },
    };
}

export const revalidate = 300;

// ─── Schema.org Structured Data ───
function getSchemaJsonLd(isArabic: boolean) {
    const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': 'https://samalogistics.com/services/industrial-transport#service',
        name: isArabic ? 'نقل حاويات المصانع والقطاع الصناعي' : 'Factory & Industrial Container Transport',
        description: isArabic
            ? 'نقل حاويات 40 قدم والبضائع الصناعية من وإلى المصانع والمجمعات الصناعية في جميع المحافظات بكفاءة تشغيلية عالية والتزام بالمواعيد'
            : 'Professional 40ft container and industrial cargo transport to and from factories and industrial zones across all governorates with high operational efficiency',
        provider: {
            '@type': 'LocalBusiness',
            '@id': 'https://samalogistics.com/#localbusiness',
            name: 'SAMA Logistics | سما لوجيستك',
            image: 'https://samalogistics.com/logo.png',
            telephone: '+201221300036',
            address: {
                '@type': 'PostalAddress',
                addressLocality: 'Port Said',
                addressRegion: 'Port Said',
                addressCountry: 'EG',
            },
            geo: {
                '@type': 'GeoCoordinates',
                latitude: 31.2565,
                longitude: 32.2841,
            },
            url: 'https://samalogistics.com',
            foundingDate: '2000',
            priceRange: '$$',
        },
        serviceType: 'Industrial Container Transport',
        areaServed: {
            '@type': 'Country',
            name: 'Egypt',
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: isArabic ? 'خدمات النقل الصناعي' : 'Industrial Transport Services',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: isArabic ? 'نقل حاويات 40 قدم' : '40ft Container Transport' },
                },
                {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: isArabic ? 'نقل منتجات صناعية' : 'Industrial Product Transport' },
                },
                {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: isArabic ? 'تشغيل منتظم للمصانع' : 'Regular Factory Operations' },
                },
            ],
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: isArabic ? 'الرئيسية' : 'Home', item: 'https://samalogistics.com' },
            { '@type': 'ListItem', position: 2, name: isArabic ? 'الخدمات' : 'Services', item: 'https://samalogistics.com/services' },
            { '@type': 'ListItem', position: 3, name: isArabic ? 'نقل حاويات المصانع' : 'Industrial Transport', item: 'https://samalogistics.com/services/industrial-transport' },
        ],
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: isArabic ? 'ما هي المناطق الصناعية التي تغطونها؟' : 'Which industrial zones do you cover?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'نغطي جميع المناطق الصناعية في مصر بما فيها العاشر من رمضان و6 أكتوبر ومدينة السادات والمنطقة الصناعية ببورسعيد وبرج العرب وغيرها.'
                        : 'We cover all industrial zones in Egypt including 10th of Ramadan, 6th of October, Sadat City, Port Said Industrial Zone, Borg El Arab, and more.',
                },
            },
            {
                '@type': 'Question',
                name: isArabic ? 'هل توفرون تشغيل منتظم للمصانع؟' : 'Do you offer regular factory operations?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'نعم، نوفر عقود تشغيل منتظمة للمصانع تشمل جدولة يومية أو أسبوعية لنقل الحاويات والمنتجات الصناعية بأسعار تنافسية.'
                        : 'Yes, we offer regular operation contracts for factories including daily or weekly scheduling for container and industrial product transport at competitive rates.',
                },
            },
            {
                '@type': 'Question',
                name: isArabic ? 'ما أنواع الحاويات التي تنقلونها للمصانع؟' : 'What container types do you transport for factories?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'ننقل حاويات 20 و40 قدم بجميع أنواعها (Standard Dry, Open Top, Flat Rack) بالإضافة للبضائع الصناعية السائبة والمعدات.'
                        : 'We transport 20ft and 40ft containers of all types (Standard Dry, Open Top, Flat Rack) plus bulk industrial goods and equipment.',
                },
            },
        ],
    };

    return [serviceSchema, breadcrumbSchema, faqSchema];
}

// ─── Server Component ───
export default async function IndustrialTransportPage() {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const schemas = getSchemaJsonLd(isArabic);

    return (
        <>
            {/* Schema.org JSON-LD */}
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
            <IndustrialTransportClient />
        </>
    );
}
