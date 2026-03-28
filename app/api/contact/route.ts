import { NextRequest, NextResponse } from 'next/server';
// 1. استخدام النسخة الموحدة من قاعدة البيانات لمنع تسريب الموارد
import { prisma } from '@/lib/db'; 
import { contactMessageSchema } from '@/lib/validations';
// 2. استيراد دالة التحقق من الهوية لتأمين البيانات
import { getUserFromRequest } from '@/lib/auth-middleware'; 
// 3. Rate Limiter لمنع السبام
import { contactLimiter, getClientIP } from '@/lib/rate-limiter';

// POST: إنشاء رسالة جديدة (متاح للجمهور لضمان وصول طلبات العملاء)
export async function POST(req: NextRequest) {
    try {
        // Rate Limiting: 3 رسائل كل 10 دقائق لكل IP
        const ip = getClientIP(req);
        const rateCheck = contactLimiter.check(ip);
        if (!rateCheck.allowed) {
            return NextResponse.json(
                { error: `تجاوزت الحد المسموح. حاول مرة أخرى بعد ${rateCheck.resetInSeconds} ثانية` },
                { 
                    status: 429,
                    headers: { 'Retry-After': String(rateCheck.resetInSeconds) },
                }
            );
        }

        const body = await req.json();
        const result = contactMessageSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Validation failed', details: result.error.issues },
                { status: 400 }
            );
        }

        const {
            type, name, email, phone, countryCode, message,
            origin, destination, containerType, containerQty,
        } = result.data;
        const dialCode = body.dialCode;

        const contactMessage = await prisma.contactMessage.create({
            data: {
                type,
                name,
                email: email || '',
                phone,
                countryCode: countryCode || dialCode,
                message: message || null,
                origin: origin || null,
                destination: destination || null,
                containerType: containerType || null,
                containerQty: containerQty || null,
            },
        });

        // مجهز لك: هنا سيتم إضافة كود إرسال الإيميل مستقبلاً بمجرد ربط الخدمة

        return NextResponse.json(
            { success: true, id: contactMessage.id },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating contact message:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET: جلب الرسائل (مؤمن - للأدمن والموظفين فقط)
export async function GET(req: NextRequest) {
    try {
        // التحقق من الصلاحية قبل عرض أي بيانات
        const user = await getUserFromRequest(req);
        if (!user || !['ADMIN', 'EMPLOYEE'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const status = searchParams.get('status');
        const isArchived = searchParams.get('archived') === 'true';

        const messages = await prisma.contactMessage.findMany({
            where: {
                ...(type && { type }),
                ...(status && { status }),
                isArchived,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: تحديث الحالة (مؤمن)
export async function PATCH(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user || !['ADMIN', 'EMPLOYEE'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { id, isRead, isStarred, isArchived, status } = body;

        if (!id) return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });

        const updateData: any = {};
        if (typeof isRead === 'boolean') updateData.isRead = isRead;
        if (typeof isStarred === 'boolean') updateData.isStarred = isStarred;
        if (typeof isArchived === 'boolean') updateData.isArchived = isArchived;
        if (status) updateData.status = status;

        const updated = await prisma.contactMessage.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: حذف رسالة (مؤمن للأدمن فقط لزيادة الحماية)
export async function DELETE(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });

        await prisma.contactMessage.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
