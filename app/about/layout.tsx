import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';

// ─── Dynamic bilingual SEO metadata for About page ───
export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const title = isArabic
        ? 'من نحن — شحن وتخليص جمركي منذ 2000'
        : 'About — Freight & Customs Experts Since 2000';
    const description = isArabic
        ? 'تعرف على سما لوجيستك — شركة شحن وتخليص جمركي في بورسعيد بخبرة أكثر من 25 عامًا. نقل حاويات، شحن بحري وبري، وتغطية عالمية.'
        : 'Learn about SAMA Logistics — a Port Said-based freight forwarding and customs clearance company with 25+ years of experience in global trade.';

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

export default function AboutLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
