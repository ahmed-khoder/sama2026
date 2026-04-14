import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';

// ─── Dynamic bilingual SEO metadata for Careers page ───
export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const title = isArabic
        ? 'وظائف في الشحن واللوجستيات — بورسعيد'
        : 'Logistics & Shipping Jobs in Port Said';
    const description = isArabic
        ? 'انضم لفريق سما لوجيستك في بورسعيد. فرص عمل في الشحن البحري والبري والتخليص الجمركي. خبرة أكثر من 25 عامًا.'
        : 'Logistics and shipping jobs in Port Said. Join SAMA Logistics — 25+ years in freight forwarding, customs clearance, and container transport.';

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: 'website',
        },
    };
}

export default function CareersLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
