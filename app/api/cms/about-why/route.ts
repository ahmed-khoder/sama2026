import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

/**
 * GET /api/cms/about-why
 * Fetch "Why Choose Us" section settings
 */
export async function GET() {
    try {
        let settings = await prisma.aboutWhySection.findUnique({
            where: { id: 'default' }
        });

        // If settings don't exist, create with defaults
        if (!settings) {
            settings = await prisma.aboutWhySection.create({
                data: {
                    id: 'default',
                    badgeAr: 'لماذا نحن؟',
                    badgeEn: 'Why Us?',
                    titleAr: 'لماذا تختار سما للخدمات اللوجستية؟',
                    titleEn: 'Why Choose SAMA Logistics?',
                    descriptionAr: 'نحن لسنا مجرد شركة شحن، بل شريكك الاستراتيجي الذي يفهم احتياجات عملك ويعمل على تلبيتها بأعلى معايير الجودة والكفاءة.',
                    descriptionEn: 'We are not just a shipping company, but your strategic partner who understands your business needs and works to meet them with the highest standards of quality and efficiency.',
                    reasonsJson: JSON.stringify([
                        { ar: 'خبرة تمتد لأكثر من 25 عاماً', en: 'Over 25 years of experience' },
                        { ar: 'شبكة شركاء عالمية موثوقة', en: 'Trusted global partner network' },
                        { ar: 'أسعار تنافسية وشفافة', en: 'Competitive and transparent pricing' },
                        { ar: 'دعم فني على مدار الساعة', en: '24/7 technical support' },
                        { ar: 'حلول مخصصة لكل عميل', en: 'Customized solutions for every client' },
                        { ar: 'تتبع الشحنات في الوقت الفعلي', en: 'Real-time shipment tracking' }
                    ]),
                    statsValue: '25+',
                    statsLabelAr: 'سنة من التميز',
                    statsLabelEn: 'Years of Excellence'
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error fetching about-why settings:', error);
        return NextResponse.json(
            { error: 'Failed to fetch settings' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/cms/about-why
 * Update "Why Choose Us" section settings (Admin only)
 */
export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        const updated = await prisma.aboutWhySection.upsert({
            where: { id: 'default' },
            update: body,
            create: { id: 'default', ...body }
        });

        revalidatePath('/about', 'layout');

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating about-why settings:', error);
        return NextResponse.json(
            { error: 'Failed to update settings' },
            { status: 500 }
        );
    }
}
