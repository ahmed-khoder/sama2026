import type { Metadata, Viewport } from 'next';
import { Inter, Cairo, Tajawal, Outfit, Rubik } from 'next/font/google';
import './globals.css';
import { Providers } from '@/providers';
import ClientLayoutWrapper from '@/components/ClientLayoutWrapper';
import JsonLd from '@/components/JsonLd';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const cairo = Cairo({
  subsets: ['arabic'],
  variable: '--font-cairo',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700'],
  variable: '--font-tajawal',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const rubik = Rubik({
  subsets: ['arabic', 'latin'],
  variable: '--font-rubik',
  display: 'swap',
});

// Viewport configuration
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0369a1' },
    { media: '(prefers-color-scheme: dark)', color: '#0c4a6e' },
  ],
};

// Comprehensive SEO Metadata
export const metadata: Metadata = {
  // Basic Metadata
  title: {
    default: 'SAMA Logistics',
    template: '%s | SAMA Logistics',
  },
  description: 'شركة سما لوجستيك - خدمات الشحن البحري والجوي والبري والتخليص الجمركي. نوصل أعمالك للعالم بأمان وسرعة. خدمة على مدار الساعة في مصر والشرق الأوسط. Sama Logistics - Premium shipping and customs clearance solutions.',
  keywords: [
    // Arabic Keywords
    'شحن بحري', 'شحن جوي', 'نقل بري', 'تخليص جمركي', 'شركة شحن مصر',
    'خدمات لوجستية', 'تتبع شحنات', 'نقل بضائع', 'استيراد وتصدير',
    // English Keywords
    'logistics Egypt', 'shipping company', 'cargo services', 'customs clearance',
    'freight forwarding', 'sea freight', 'air cargo', 'land transport',
    'supply chain', 'warehousing', 'Middle East logistics'
  ],
  authors: [{ name: 'Sama Logistics', url: 'https://samalogistics.com' }],
  creator: 'Sama Logistics',
  publisher: 'Sama Logistics',

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    alternateLocale: ['en_US', 'en_GB'],
    url: 'https://samalogistics.com',
    siteName: 'سما لوجستيك | Sama Logistics',
    title: 'سما لوجستيك - حلول الشحن والتخليص الجمركي المتكاملة',
    description: 'شريكك الموثوق في الشحن البحري والجوي والبري. خدمات تخليص جمركي سريعة ودقيقة. تغطية عالمية لأكثر من 50 دولة.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sama Logistics - Premium Shipping Solutions',
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    site: '@SamaLogistics',
    creator: '@SamaLogistics',
    title: 'سما لوجستيك | Sama Logistics',
    description: 'حلول الشحن والتخليص الجمركي المتكاملة - نوصل أعمالك للعالم',
    images: ['/twitter-image.jpg'],
  },

  // Icons — ?v=4 forces the browser to bypass its cache
  icons: {
    icon: [
      { url: '/icons/icon.png?v=5', sizes: 'any', type: 'image/png' },
      { url: '/icons/icon.png?v=5', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon.png?v=5', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon.png?v=5', sizes: '180x180', type: 'image/png' },
    ],
  },

  // Manifest
  manifest: '/site.webmanifest',

  // Alternates (for multilingual SEO)
  alternates: {
    canonical: 'https://samalogistics.com',
    languages: {
      'ar-EG': 'https://samalogistics.com/ar',
      'en-US': 'https://samalogistics.com/en',
    },
  },

  // Verification
  verification: {
    google: 'google-site-verification-code',
  },

  // Category
  category: 'Logistics & Transportation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        {/* Preconnect to external origins for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />

        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${inter.variable} ${cairo.variable} ${tajawal.variable} ${outfit.variable} ${rubik.variable} font-sans antialiased`}>
        {/* Structured Data (JSON-LD) */}
        <JsonLd />

        <Providers>
          <ClientLayoutWrapper>
            {children}
          </ClientLayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
