import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';

// ─── Dynamic bilingual SEO metadata for Blog index page ───
export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const title = isArabic
        ? 'نصائح الشحن ودليل التخليص الجمركي في مصر'
        : 'Shipping Tips & Freight Guides in Egypt';
    const description = isArabic
        ? 'نصائح الشحن، أدلة التخليص الجمركي، وأحدث أخبار اللوجستيات من مصر. مقالات متخصصة من خبراء سما لوجيستك.'
        : 'Shipping tips, freight guides, and customs advice in Egypt. Learn how to ship smarter with expert insights from SAMA Logistics.';

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

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
