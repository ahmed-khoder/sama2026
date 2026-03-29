import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { handleAPIError, Errors } from '@/lib/api-error-handler';
import { testOdooConnection } from '@/lib/odooClient';

export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            throw Errors.Unauthorized('غير مصرح لك');
        }

        const body = await request.json();
        let passwordToTest = body.password;

        // If password is masked, fetch the real one from DB to test
        if (!passwordToTest || passwordToTest === '********') {
            const existing = await prisma.odooSettings.findUnique({ where: { id: 'default' } });
            passwordToTest = existing?.password || '';
        }

        if (!body.url || !body.database || !body.username) {
            return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });
        }

        const result = await testOdooConnection(
            body.url,
            body.database,
            body.username,
            passwordToTest
        );

        if (!result.success) {
            return NextResponse.json({ error: result.message }, { status: 400 });
        }

        return NextResponse.json({ success: true, message: result.message });
    } catch (error) {
        return handleAPIError(error);
    }
}
