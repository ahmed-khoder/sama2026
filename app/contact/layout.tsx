import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';

// ─── Dynamic bilingual SEO metadata for Contact page ───
export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerStore = await headers();
    const langCookie = cookieStore.get('language')?.value;
    const acceptLang = headerStore.get('accept-language') || '';
    const isArabic = langCookie === 'ar' || (!langCookie && acceptLang.startsWith('ar'));

    const title = isArabic
        ? 'اطلب عرض سعر — شحن وتخليص جمركي من بورسعيد'
        : 'Request a Freight Quote — Shipping & Customs in Port Said';
    const description = isArabic
        ? 'اطلب عرض سعر مجاني لخدمات الشحن والتخليص الجمركي من بورسعيد. تواصل مع سما لوجيستك عبر الهاتف أو واتساب أو النموذج.'
        : 'Request a free freight quote in Port Said. Sea freight, customs clearance, and container transport by SAMA Logistics. Call, WhatsApp, or fill our form.';

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

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
