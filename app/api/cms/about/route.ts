import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { aboutSettingsSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';

// Default about settings
const defaultAboutSettings = {
    id: 'default',
    badgeAr: 'من نحن',
    badgeEn: 'About Us',
    titleAr: 'شريكك الاستراتيجي للحلول اللوجستية المتكاملة',
    titleEn: 'Your Strategic Partner for Integrated Logistics Solutions',
    descriptionAr: 'منذ عام 2000، نقدم خدمات لوجستية متميزة للسوق المصري والعربي. نفخر بخدمة أكثر من 1000 عميل في مختلف القطاعات، ونسعى دائماً لتقديم أفضل الحلول التي تلبي احتياجاتكم.',
    descriptionEn: 'Since 2000, we have been providing outstanding logistics services to the Egyptian and Arab markets. We are proud to serve over 1,000 clients across various sectors.',
    ctaTextAr: 'اعرف المزيد عنا',
    ctaTextEn: 'Learn More About Us',
    ctaLink: '/profile',
    featuresJson: JSON.stringify([
        { ar: 'شحن بحري وجوي وبري', en: 'Sea, Air & Land Freight' },
        { ar: 'تخليص جمركي سريع', en: 'Fast Customs Clearance' },
        { ar: 'تخزين وتوزيع', en: 'Warehousing & Distribution' },
        { ar: 'تأمين شامل للبضائع', en: 'Comprehensive Cargo Insurance' },
    ]),
    statsValue: '25+',
    statsLabelAr: 'سنة من التميز',
    statsLabelEn: 'Years of Excellence',
};

// GET About Settings
export async function GET() {
    try {
        let settings = await prisma.aboutSettings.findUnique({
            where: { id: 'default' }
        });

        // Initialize if not exists
        if (!settings) {
            settings = await prisma.aboutSettings.create({
                data: defaultAboutSettings
            });
        }

        // Parse features JSON
        const response = {
            ...settings,
            features: JSON.parse(settings.featuresJson || '[]')
        };

        return NextResponse.json(response);
    } catch (error: unknown) {
        console.error('Error fetching about settings:', error);
        return NextResponse.json({ error: 'Failed to fetch about settings' }, { status: 500 });
    }
}

// POST Update About Settings (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const result = aboutSettingsSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.issues },
                { status: 400 }
            );
        }

        // If features array is provided, convert to JSON
        if (body.features && Array.isArray(body.features)) {
            body.featuresJson = JSON.stringify(body.features);
            delete body.features;
        }

        const settings = await prisma.aboutSettings.upsert({
            where: { id: 'default' },
            create: {
                id: 'default',
                ...body
            },
            update: body
        });

        // Return with parsed features
        const response = {
            ...settings,
            features: JSON.parse(settings.featuresJson || '[]')
        };

        revalidatePath('/', 'layout');
        revalidatePath('/about', 'layout');
        return NextResponse.json(response);
    } catch (error: any) {
        console.error('Error updating about settings:', error);
        return NextResponse.json({ error: 'Failed to update about settings' }, { status: 500 });
    }
}
