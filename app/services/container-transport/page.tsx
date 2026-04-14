import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getFeaturedPartners } from '@/lib/odooClient';
import ContainerTransportClient from './ContainerTransportClient';

// ─── Dynamic bilingual SEO metadata ───
export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const title = isArabic
        ? 'نقل حاويات بورسعيد — شحن كامل ومشترك FCL & LCL | سما لوجيستك'
        : 'Container Transport in Port Said — FCL & LCL Shipping | SAMA Logistics';
    const description = isArabic
        ? 'نقل حاويات احترافي من بورسعيد. شحن كامل ومشترك، تخليص جمركي، نقل رخام وبضائع ثقيلة. خبرة 25+ سنة، أكثر من 10,000 حاوية سنوياً. عرض سعر خلال ساعة.'
        : 'Professional container transport from Port Said. FCL & LCL shipping, customs clearance, marble & heavy cargo transport. 25+ years, 10,000+ containers yearly. Get a quote within 1 hour.';

    return {
        title,
        description,
        keywords: isArabic
            ? 'نقل حاويات بورسعيد, شحن حاويات مصر, نقل رخام شق الثعبان, شحن بضائع ثقيلة, تخليص جمركي بورسعيد, شركة شحن مصر, سما لوجيستك, FCL, LCL'
            : 'container transport Port Said, container shipping Egypt, marble transport Shaq El-Thoaban, heavy cargo Egypt, customs clearance Port Said, shipping company Egypt, SAMA Logistics, FCL, LCL',
        openGraph: {
            title,
            description,
            type: 'website',
            url: 'https://samalogistics.com/services/container-transport',
        },
        alternates: {
            canonical: 'https://samalogistics.com/services/container-transport',
        },
    };
}

export const revalidate = 300;

// ─── Schema.org Structured Data ───
function getSchemaJsonLd(isArabic: boolean) {
    const serviceSchema = {
        '@context': 'https://schema.org',
        '@type': 'Service',
        '@id': 'https://samalogistics.com/services/container-transport#service',
        name: isArabic ? 'نقل الحاويات' : 'Container Transport',
        description: isArabic
            ? 'خدمات نقل حاويات احترافية من بورسعيد — شحن كامل FCL ومشترك LCL، نقل رخام وبضائع ثقيلة، تخليص جمركي'
            : 'Professional container transport services from Port Said — FCL & LCL shipping, marble & heavy cargo transport, customs clearance',
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
            openingHoursSpecification: {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
                opens: '08:00',
                closes: '18:00',
            },
        },
        serviceType: 'Container Transport',
        areaServed: {
            '@type': 'Country',
            name: 'Egypt',
        },
        hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: isArabic ? 'خدمات نقل الحاويات' : 'Container Transport Services',
            itemListElement: [
                {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: isArabic ? 'حاويات كاملة FCL' : 'Full Container Load (FCL)' },
                },
                {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: isArabic ? 'حمولات مشتركة LCL' : 'Less than Container Load (LCL)' },
                },
                {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: isArabic ? 'النقل البري' : 'Inland Transport' },
                },
                {
                    '@type': 'Offer',
                    itemOffered: { '@type': 'Service', name: isArabic ? 'عمليات الموانئ والتخليص' : 'Port Operations & Customs Clearance' },
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
            { '@type': 'ListItem', position: 3, name: isArabic ? 'نقل الحاويات' : 'Container Transport', item: 'https://samalogistics.com/services/container-transport' },
        ],
    };

    const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [
            {
                '@type': 'Question',
                name: isArabic ? 'كم تكلفة نقل حاوية في مصر؟' : 'How much does it cost to transport a container in Egypt?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'التكلفة تعتمد على حجم الحاوية (20 أو 40 قدم)، المسار، نوع البضاعة، والخدمات الإضافية. نقدم عروض أسعار مفصلة خلال ساعة.'
                        : 'Pricing depends on container size (20ft or 40ft), route, cargo type, and additional services. We provide detailed quotes within 1 hour.',
                },
            },
            {
                '@type': 'Question',
                name: isArabic ? 'كم يستغرق شحن حاوية من بورسعيد؟' : 'How long does it take to ship a container from Port Said?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'النقل البري: 12-48 ساعة حسب الوجهة. إفراج الميناء: 24-48 ساعة. الشحن الدولي يعتمد على ميناء الوصول.'
                        : 'Inland transport: 12-48 hours. Port clearance: 24-48 hours. International shipping depends on destination port.',
                },
            },
            {
                '@type': 'Question',
                name: isArabic ? 'هل يوجد تأمين على البضاعة؟' : 'Is there insurance on my cargo?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'نعم، كل شحنة مغطاة بتأمين شامل. للبضائع عالية القيمة مثل الرخام نوفر تغطية معززة.'
                        : 'Yes, every shipment is covered by comprehensive insurance. Enhanced coverage is available for high-value goods like marble.',
                },
            },
            {
                '@type': 'Question',
                name: isArabic ? 'هل تتعاملون مع الرخام والبضائع الثقيلة؟' : 'Do you handle marble and heavy cargo?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'هذا تخصصنا. ننقل الرخام من شق الثعبان باستخدام فلات راك مع تثبيت مقاوم للاهتزاز.'
                        : 'This is our specialty. We transport marble from Shaq El-Thoaban using flat-rack containers with anti-vibration securing.',
                },
            },
            {
                '@type': 'Question',
                name: isArabic ? 'أي موانئ مصرية تغطونها؟' : 'Which Egyptian ports do you cover?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'عندنا فرق تشغيلية في ميناء بورسعيد وشرق بورسعيد (SCCT) وميناء دمياط.'
                        : 'We have operational teams at Port Said, East Port Said (SCCT), and Damietta Port.',
                },
            },
            {
                '@type': 'Question',
                name: isArabic ? 'كيف أطلب عرض سعر؟' : 'How do I request a quote?',
                acceptedAnswer: {
                    '@type': 'Answer',
                    text: isArabic
                        ? 'راسلنا على واتساب، اتصل بفريق العمليات، أو املأ نموذج عرض السعر. عرض سعر مفصل خلال ساعة.'
                        : 'WhatsApp us, call our operations team, or fill out the quote form. Detailed quote within 1 hour.',
                },
            },
        ],
    };

    return [serviceSchema, breadcrumbSchema, faqSchema];
}

// ─── Server Component ───
export default async function ContainerTransportPage() {
    // Detect language for Schema.org
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    // Fetch partners (same pattern as app/page.tsx)
    const partnersRaw = await getFeaturedPartners().catch(() => []);
    const clients = (partnersRaw as { name: string; image_128: string | false }[])
        .map(p => ({
            name: p.name,
            logo: p.image_128 ? (p.image_128.startsWith('data:image') ? p.image_128 : `data:image/png;base64,${p.image_128}`) : '',
        }))
        .filter(p => p.logo !== '');

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
            <ContainerTransportClient clients={clients} />
        </>
    );
}
