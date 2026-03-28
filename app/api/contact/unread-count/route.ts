import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { NextRequest } from 'next/server';

/**
 * GET /api/contact/unread-count
 * يُرجع عدد الرسائل غير المقروءة فقط — بدلاً من جلب كل الرسائل
 * يقلل حجم البيانات المنقولة من ~500KB إلى ~20 bytes
 */
export async function GET(req: NextRequest) {
    try {
        const user = await getUserFromRequest(req);
        if (!user || !['ADMIN', 'EMPLOYEE'].includes(user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const count = await prisma.contactMessage.count({
            where: {
                isRead: false,
                isArchived: false,
            },
        });

        return NextResponse.json({ count });
    } catch (error) {
        console.error('Error counting unread messages:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
