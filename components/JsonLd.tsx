'use client';

import React from 'react';
import Script from 'next/script';

// Organization Schema
const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'سما لوجستيك | Sama Logistics',
    alternateName: 'Sama Logistics',
    url: 'https://samalogistics.com',
    logo: 'https://samalogistics.com/logo.png',
    description: 'شركة سما لوجستيك - خدمات الشحن البحري والجوي والبري والتخليص الجمركي المتكاملة.',
    foundingDate: '2000',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'شارع التحرير',
        addressLocality: 'القاهرة',
        addressRegion: 'القاهرة',
        postalCode: '11511',
        addressCountry: 'EG',
    },
    contactPoint: [
        {
            '@type': 'ContactPoint',
            telephone: '+20-2-12345678',
            contactType: 'customer service',
            availableLanguage: ['Arabic', 'English'],
            areaServed: ['EG', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
        },
        {
            '@type': 'ContactPoint',
            telephone: '+20-2-12345679',
            contactType: 'sales',
            availableLanguage: ['Arabic', 'English'],
        },
    ],
    sameAs: [
        'https://www.facebook.com/Samallogseg/',
        'https://www.linkedin.com/company/sama-logistic',
        'https://twitter.com/samalogistics',
        'https://www.instagram.com/samalogistics',
    ],
    areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 30.0444,
            longitude: 31.2357,
        },
        geoRadius: '5000 km',
    },
};

// LocalBusiness Schema
const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': 'https://samalogistics.com/#localbusiness',
    name: 'سما لوجستيك | Sama Logistics',
    image: 'https://samalogistics.com/og-image.jpg',
    priceRange: '$$',
    address: {
        '@type': 'PostalAddress',
        streetAddress: 'شارع التحرير',
        addressLocality: 'القاهرة',
        addressRegion: 'القاهرة',
        postalCode: '11511',
        addressCountry: 'EG',
    },
    geo: {
        '@type': 'GeoCoordinates',
        latitude: 30.0444,
        longitude: 31.2357,
    },
    url: 'https://samalogistics.com',
    telephone: '+20-2-12345678',
    openingHoursSpecification: [
        {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
            opens: '08:00',
            closes: '18:00',
        },
    ],
};

// Service Schema
const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'خدمات الشحن واللوجستيات',
    alternateName: 'Shipping and Logistics Services',
    provider: {
        '@type': 'Organization',
        name: 'Sama Logistics',
    },
    serviceType: 'Logistics and Freight Services',
    areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: {
            '@type': 'GeoCoordinates',
            latitude: 30.0444,
            longitude: 31.2357,
        },
        geoRadius: '5000 km',
    },
    hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'خدماتنا اللوجستية',
        itemListElement: [
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'الشحن البحري',
                    alternateName: 'Sea Freight',
                    description: 'نقل البضائع والحاويات عبر البحار',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'الشحن الجوي',
                    alternateName: 'Air Freight',
                    description: 'شحن سريع للبضائع العاجلة',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'النقل البري',
                    alternateName: 'Land Transport',
                    description: 'أسطول حديث للنقل الداخلي والإقليمي',
                },
            },
            {
                '@type': 'Offer',
                itemOffered: {
                    '@type': 'Service',
                    name: 'التخليص الجمركي',
                    alternateName: 'Customs Clearance',
                    description: 'إنهاء جميع الإجراءات الجمركية بسرعة ودقة',
                },
            },
        ],
    },
};

// FAQ Schema
const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
        {
            '@type': 'Question',
            name: 'ما هي أنواع الشحن المتوفرة؟',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'نوفر خدمات الشحن البحري والجوي والبري، بالإضافة إلى خدمات التخليص الجمركي والتخزين.',
            },
        },
        {
            '@type': 'Question',
            name: 'كيف يمكنني تتبع شحنتي؟',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'يمكنك تتبع شحنتك من خلال إدخال رقم التتبع في صفحة التتبع على موقعنا أو التواصل مع فريق خدمة العملاء.',
            },
        },
        {
            '@type': 'Question',
            name: 'ما هي مناطق التغطية؟',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'نغطي أكثر من 50 دولة حول العالم، مع تركيز خاص على منطقة الشرق الأوسط وشمال أفريقيا وآسيا وأوروبا.',
            },
        },
        {
            '@type': 'Question',
            name: 'كم تستغرق عملية التخليص الجمركي؟',
            acceptedAnswer: {
                '@type': 'Answer',
                text: 'عادةً ما تستغرق عملية التخليص الجمركي من 24 إلى 72 ساعة حسب نوع البضائع والإجراءات المطلوبة.',
            },
        },
    ],
};

// WebSite Schema for Search
const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://samalogistics.com',
    name: 'سما لوجستيك',
    alternateName: 'Sama Logistics',
    potentialAction: {
        '@type': 'SearchAction',
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://samalogistics.com/search?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
    },
};

// BreadcrumbList Schema
const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
        {
            '@type': 'ListItem',
            position: 1,
            name: 'الرئيسية',
            item: 'https://samalogistics.com',
        },
    ],
};

export default function JsonLd() {
    return (
        <>
            {/* Organization Schema */}
            <Script
                id="organization-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(organizationSchema),
                }}
                strategy="afterInteractive"
            />

            {/* LocalBusiness Schema */}
            <Script
                id="local-business-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(localBusinessSchema),
                }}
                strategy="afterInteractive"
            />

            {/* Service Schema */}
            <Script
                id="service-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(serviceSchema),
                }}
                strategy="afterInteractive"
            />

            {/* FAQ Schema */}
            <Script
                id="faq-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(faqSchema),
                }}
                strategy="afterInteractive"
            />

            {/* WebSite Schema */}
            <Script
                id="website-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(websiteSchema),
                }}
                strategy="afterInteractive"
            />

            {/* Breadcrumb Schema */}
            <Script
                id="breadcrumb-schema"
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema),
                }}
                strategy="afterInteractive"
            />
        </>
    );
}

// Export individual schemas for use in specific pages
export {
    organizationSchema,
    localBusinessSchema,
    serviceSchema,
    faqSchema,
    websiteSchema,
    breadcrumbSchema,
};
