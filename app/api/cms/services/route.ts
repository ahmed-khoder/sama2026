import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { handleAPIError, Errors } from '@/lib/api-error-handler';
import { createServiceSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { linkMedia } from '@/lib/media-library';


// الخدمات الافتراضية
const defaultServices = [
    {
        slug: 'sea-freight',
        iconName: 'Ship',
        titleAr: 'الشحن البحري',
        titleEn: 'Sea Freight',
        shortDescAr: 'نقل بضائعك بأمان عبر أكبر شبكة من الموانئ العالمية',
        shortDescEn: 'Transport your goods safely through the largest network of global ports',
        descriptionAr: 'نقدم خدمات الشحن البحري الشاملة للحاويات الكاملة (FCL) والحاويات المشتركة (LCL) من وإلى جميع موانئ العالم. نتميز بعلاقات قوية مع أكبر خطوط الملاحة العالمية لضمان أفضل الأسعار والمواعيد.',
        descriptionEn: 'We offer comprehensive sea freight services for Full Container Load (FCL) and Less than Container Load (LCL) to and from all ports worldwide. We have strong relationships with major shipping lines to ensure the best rates and schedules.',
        featuresJson: JSON.stringify([
            { ar: 'حاويات كاملة ومشتركة', en: 'FCL & LCL Containers' },
            { ar: 'تتبع مباشر للشحنات', en: 'Real-time Tracking' },
            { ar: 'أسعار تنافسية', en: 'Competitive Rates' },
            { ar: 'تغطية عالمية', en: 'Global Coverage' }
        ]),
        color: '#0369a1',
        order: 0
    },
    {
        slug: 'air-freight',
        iconName: 'Plane',
        titleAr: 'الشحن الجوي',
        titleEn: 'Air Freight',
        shortDescAr: 'حلول سريعة وموثوقة لشحناتك العاجلة حول العالم',
        shortDescEn: 'Fast and reliable solutions for your urgent shipments worldwide',
        descriptionAr: 'خدمات الشحن الجوي السريعة للبضائع العاجلة والحساسة. نوفر رحلات مباشرة وعبور من خلال شراكاتنا مع كبرى شركات الطيران وخدمات الشحن السريع.',
        descriptionEn: 'Fast air freight services for urgent and sensitive cargo. We provide direct flights and transit through our partnerships with major airlines and express shipping services.',
        featuresJson: JSON.stringify([
            { ar: 'شحن سريع خلال 24-48 ساعة', en: 'Express 24-48 Hours' },
            { ar: 'باب لباب', en: 'Door to Door' },
            { ar: 'بضائع خاصة وخطرة', en: 'Special & Hazardous Cargo' },
            { ar: 'تأمين شامل', en: 'Full Insurance' }
        ]),
        color: '#0ea5e9',
        order: 1
    },
    {
        slug: 'land-transport',
        iconName: 'Truck',
        titleAr: 'النقل البري',
        titleEn: 'Land Transport',
        shortDescAr: 'شبكة نقل بري متكاملة تغطي مصر والدول العربية',
        shortDescEn: 'Integrated land transport network covering Egypt and Arab countries',
        descriptionAr: 'أسطول حديث من الشاحنات والمقطورات لنقل البضائع براً داخل مصر وإلى الدول العربية. نوفر حلول النقل للبضائع العادية والمبردة والمواد الخطرة.',
        descriptionEn: 'Modern fleet of trucks and trailers for land freight within Egypt and to Arab countries. We provide transport solutions for regular, refrigerated, and hazardous goods.',
        featuresJson: JSON.stringify([
            { ar: 'أسطول حديث ومتنوع', en: 'Modern Diverse Fleet' },
            { ar: 'شاحنات مبردة', en: 'Refrigerated Trucks' },
            { ar: 'نقل المواد الخطرة', en: 'Hazmat Transport' },
            { ar: 'تغطية عربية كاملة', en: 'Full Arab Coverage' }
        ]),
        color: '#f97316',
        order: 2
    },
    {
        slug: 'customs-clearance',
        iconName: 'FileCheck',
        titleAr: 'التخليص الجمركي',
        titleEn: 'Customs Clearance',
        shortDescAr: 'إنجاز سريع لجميع الإجراءات الجمركية بأعلى كفاءة',
        shortDescEn: 'Fast completion of all customs procedures with highest efficiency',
        descriptionAr: 'فريق متخصص من المخلصين الجمركيين المعتمدين لإنهاء جميع إجراءات الاستيراد والتصدير. نتعامل مع جميع أنواع البضائع والمستندات المطلوبة.',
        descriptionEn: 'Specialized team of licensed customs brokers to complete all import and export procedures. We handle all types of goods and required documentation.',
        featuresJson: JSON.stringify([
            { ar: 'مخلصين معتمدين', en: 'Licensed Brokers' },
            { ar: 'إنجاز خلال 24 ساعة', en: '24-Hour Clearance' },
            { ar: 'جميع أنواع البضائع', en: 'All Cargo Types' },
            { ar: 'استشارات جمركية', en: 'Customs Consulting' }
        ]),
        color: '#22c55e',
        order: 3
    },
    {
        slug: 'warehousing',
        iconName: 'Warehouse',
        titleAr: 'التخزين والتوزيع',
        titleEn: 'Warehousing & Distribution',
        shortDescAr: 'مستودعات حديثة ومؤمنة مع حلول توزيع متكاملة',
        shortDescEn: 'Modern secured warehouses with integrated distribution solutions',
        descriptionAr: 'مستودعات مجهزة بأحدث أنظمة الأمان والتخزين. نوفر خدمات التخزين قصير وطويل المدى مع حلول التوزيع المحلي والإقليمي.',
        descriptionEn: 'Warehouses equipped with the latest security and storage systems. We provide short and long-term storage services with local and regional distribution solutions.',
        featuresJson: JSON.stringify([
            { ar: 'تخزين مكيف ومبرد', en: 'Climate Controlled' },
            { ar: 'نظام إدارة مخزون', en: 'Inventory Management' },
            { ar: 'خدمات التوزيع', en: 'Distribution Services' },
            { ar: 'تأمين شامل', en: 'Full Insurance' }
        ]),
        color: '#8b5cf6',
        order: 4
    },
    {
        slug: 'marine-insurance',
        iconName: 'Shield',
        titleAr: 'التأمين البحري',
        titleEn: 'Marine Insurance',
        shortDescAr: 'حماية شاملة لبضائعك ضد جميع المخاطر',
        shortDescEn: 'Comprehensive protection for your cargo against all risks',
        descriptionAr: 'نوفر وثائق تأمين بحري شاملة بالتعاون مع كبرى شركات التأمين المحلية والعالمية. تغطية كاملة ضد جميع مخاطر النقل البحري والجوي والبري.',
        descriptionEn: 'We provide comprehensive marine insurance policies in cooperation with major local and international insurance companies. Full coverage against all risks of sea, air, and land transport.',
        featuresJson: JSON.stringify([
            { ar: 'تغطية شاملة', en: 'All-Risk Coverage' },
            { ar: 'تسوية سريعة للمطالبات', en: 'Fast Claims Settlement' },
            { ar: 'شركات تأمين عالمية', en: 'Global Insurers' },
            { ar: 'أسعار تنافسية', en: 'Competitive Premiums' }
        ]),
        color: '#14b8a6',
        order: 5
    }
];

// GET - List all services
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const showAll = searchParams.get('all') === 'true';

        let services = await prisma.service.findMany({
            where: showAll ? {} : { isActive: true },
            orderBy: { order: 'asc' },
            include: {
                images: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        // Seed if empty
        if (services.length === 0) {
            // SQLite doesn't support createMany, use individual creates
            for (const serviceData of defaultServices) {
                await prisma.service.create({ data: serviceData });
            }
            services = await prisma.service.findMany({
                where: { isActive: true },
                orderBy: { order: 'asc' },
                include: {
                    images: {
                        orderBy: { order: 'asc' }
                    }
                }
            });
        }

        // Parse features JSON
        const parsed = services.map(s => ({
            ...s,
            features: JSON.parse(s.featuresJson || '[]')
        }));

        return NextResponse.json(parsed);
    } catch (error: unknown) {
        console.error('Error fetching services:', error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
    }
}


// POST - Create new service (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            throw Errors.Unauthorized('يجب تسجيل الدخول كمسؤول');
        }

        const body = await request.json();

        const result = createServiceSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.issues },
                { status: 400 }
            );
        }

        if (body.features && Array.isArray(body.features)) {
            body.featuresJson = JSON.stringify(body.features);
            delete body.features;
        }

        // Generate slug if not provided
        if (!body.slug && body.titleEn) {
            body.slug = body.titleEn
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
        }

        // Ensure required fields have default values
        body.titleAr = body.titleAr || 'خدمة جديدة';
        body.titleEn = body.titleEn || 'New Service';
        body.shortDescAr = body.shortDescAr || body.titleAr;
        body.shortDescEn = body.shortDescEn || body.titleEn;

        // Ensure isActive is true by default for new services
        if (body.isActive === undefined || body.isActive === null) {
            body.isActive = true;
        }

        // CRITICAL: Explicitly preserve image fields
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- dynamic service data for Prisma
        const serviceData: Record<string, string | number | boolean | null> = {
            slug: body.slug,
            iconName: body.iconName || 'Ship',
            titleAr: body.titleAr,
            titleEn: body.titleEn,
            shortDescAr: body.shortDescAr,
            shortDescEn: body.shortDescEn,
            descriptionAr: body.descriptionAr || '',
            descriptionEn: body.descriptionEn || '',
            featuresJson: body.featuresJson || '[]',
            color: body.color || '#F97316',
            order: body.order || 0,
            isActive: body.isActive
        };

        // Add desktop image if provided
        if (body.image && body.image !== '') {
            serviceData.image = body.image;
        }

        // Add mobile image if provided
        if (body.imageMobile && body.imageMobile !== '') {
            serviceData.imageMobile = body.imageMobile;
        }

        const service = await prisma.service.create({ data: serviceData as unknown as Parameters<typeof prisma.service.create>[0]['data'] });

        // ── Media Library: link images on creation ──
        if (serviceData.image && typeof serviceData.image === 'string') {
            await linkMedia(serviceData.image, 'service', service.id);
        }
        if (serviceData.imageMobile && typeof serviceData.imageMobile === 'string') {
            await linkMedia(serviceData.imageMobile, 'service', service.id);
        }

        revalidatePath('/', 'layout');
        revalidatePath('/services', 'layout');
        return NextResponse.json({
            ...service,
            features: JSON.parse(service.featuresJson || '[]')
        }, { status: 201 });
    } catch (error) {
        return handleAPIError(error);
    }
}

