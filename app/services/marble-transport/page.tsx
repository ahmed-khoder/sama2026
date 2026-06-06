import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getMarbleTransportContent } from '@/lib/data/marble-transport.data';
import MarbleTransportClient from './MarbleTransportClient';

// ─── Dynamic bilingual SEO metadata ───
export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const title = isArabic
        ? 'نقل الرخام والمواد المحجرية والتعدينية | سما لوجيستك'
        : 'Marble, Quarry & Mining Transport | SAMA Logistics';
    const description = isArabic
        ? 'نقل الرخام والجرانيت والمواد المحجرية والتعدينية بأمان وكفاءة تشغيلية عالية من مواقع الإنتاج مثل شق الثعبان إلى مواقع العمل. أسطول متخصص للأحمال الثقيلة حتى 60 طن.'
        : 'Safe and efficient marble, granite, quarry, and mining materials transport from production sites like Shaq El-Tue\'ban to worksites. Specialized heavy-load fleet up to 60 tons.';

    return {
        title,
        description,
        keywords: isArabic
            ? 'نقل رخام, نقل جرانيت, نقل مواد محجرية, نقل تعدين, شق الثعبان, نقل أحمال ثقيلة, سما لوجيستك'
            : 'marble transport Egypt, granite transport, quarry materials, mining transport, Shaq El-Tueban, heavy load transport, SAMA Logistics',
        openGraph: {
            title,
            description,
            type: 'website',
            url: 'https://samalogistics.com/services/marble-transport',
            images: [
                {
                    url: '/og-image.jpg',
                    width: 1200,
                    height: 630,
                    alt: isArabic ? 'نقل الرخام والمواد المحجرية - سما لوجيستك' : 'Marble & Quarry Transport - SAMA Logistics',
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
            canonical: 'https://samalogistics.com/services/marble-transport',
        },
    };
}

// ─── Schema.org Structured Data ───
function getSchemaJsonLd(isArabic: boolean) {
    const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': 'https://samalogistics.com/services/marble-transport#service',
        name: isArabic ? 'نقل الرخام والمواد المحجرية والتعدينية' : 'Marble, Quarry & Mining Transport',
        description: isArabic
            ? 'نقل الرخام والجرانيت وجميع المواد المحجرية والتعدينية من مواقع الإنتاج إلى مواقع العمل بأمان وكفاءة تشغيلية عالية'
            : 'Safe and efficient transport of marble, granite, and all quarry and mining materials from production sites to worksites',
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
            url: 'https://samalogistics.com',
            foundingDate: '2000',
            priceRange: '$$',
        },
        serviceType: 'Heavy Load & Marble Transport',
        areaServed: {
            '@type': 'Country',
            name: 'Egypt',
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: isArabic ? 'خدمات نقل المواد المحجرية' : 'Quarry Materials Transport Services',
            itemListElement: [
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: isArabic ? 'نقل رخام وجرانيت' : 'Marble & Granite Transport' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: isArabic ? 'نقل مواد محجرية' : 'Quarry Materials Transport' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: isArabic ? 'نقل خامات تعدين' : 'Mining Materials Transport' } },
                { '@type': 'Offer', itemOffered: { '@type': 'Service', name: isArabic ? 'نقل أحمال ثقيلة' : 'Heavy Load Transport' } },
            ],
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: isArabic ? 'الرئيسية' : 'Home', item: 'https://samalogistics.com' },
            { '@type': 'ListItem', position: 2, name: isArabic ? 'الخدمات' : 'Services', item: 'https://samalogistics.com/services' },
            { '@type': 'ListItem', position: 3, name: isArabic ? 'نقل الرخام' : 'Marble Transport', item: 'https://samalogistics.com/services/marble-transport' },
        ],
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: isArabic ? 'ما أنواع المواد التي تنقلونها؟' : 'What types of materials do you transport?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'ننقل الرخام والجرانيت وجميع أنواع المواد المحجرية والتعدينية بما فيها الحجر الجيري والبازلت والرمال والكسر.'
                        : 'We transport marble, granite, and all types of quarry and mining materials including limestone, basalt, sand, and aggregate.',
                },
            },
            {
                '@type': 'Question',
                name: isArabic ? 'هل تنقلون من شق الثعبان؟' : 'Do you transport from Shaq El-Tueban?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'نعم، لدينا خبرة طويلة في النقل من منطقة شق الثعبان وجميع مناطق المحاجر في مصر.'
                        : 'Yes, we have extensive experience transporting from Shaq El-Tueban and all quarry areas across Egypt.',
                },
            },
            {
                '@type': 'Question',
                name: isArabic ? 'ما أقصى وزن يمكنكم نقله؟' : 'What is the maximum weight you can transport?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'أسطولنا مجهز لنقل أحمال تصل إلى 60 طن باستخدام شاحنات مخصصة للأوزان الثقيلة.'
                        : 'Our fleet is equipped to transport loads up to 60 tons using trucks specially designed for heavy weights.',
                },
            },
        ],
    };

    return [serviceSchema, breadcrumbSchema, faqSchema];
}

// ─── Server Component ───
export default async function MarbleTransportPage() {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    // Fetch validated CMS data via the data pipeline (cached + tag-based revalidation)
    const content = await getMarbleTransportContent();

    const schemas = getSchemaJsonLd(isArabic);

    return (
        <>
            {schemas.map((schema, i) => (
                <script
                    key={i}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
            <MarbleTransportClient content={content} />
        </>
    );
}
