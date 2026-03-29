import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { handleAPIError, Errors } from '@/lib/api-error-handler';
import { invalidateUidCache, bumpOdooDataCacheVersion } from '@/lib/odooClient';

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            throw Errors.Unauthorized('غير مصرح لك');
        }

        const settings = await prisma.odooSettings.findUnique({ where: { id: 'default' } });

        return NextResponse.json({
            url: settings?.url || '',
            database: settings?.database || '',
            username: settings?.username || '',
            password: settings?.password ? '********' : '',
        });

    } catch (error) {
        return handleAPIError(error);
    }
}

export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            throw Errors.Unauthorized('غير مصرح لك');
        }

        const body = await request.json();
        
        let passwordToSave = body.password;

        // If password is masked or empty, keep the existing one
        if (!passwordToSave || passwordToSave === '********') {
             const existing = await prisma.odooSettings.findUnique({ where: { id: 'default' } });
             passwordToSave = existing?.password || '';
        }

        const updated = await prisma.odooSettings.upsert({
            where: { id: 'default' },
            create: {
                id: 'default',
                url: body.url || '',
                database: body.database || '',
                username: body.username || '',
                password: passwordToSave,
                isActive: true,
            },
            update: {
                url: body.url !== undefined ? body.url : undefined,
                database: body.database !== undefined ? body.database : undefined,
                username: body.username !== undefined ? body.username : undefined,
                password: passwordToSave,
            }
        });

        // Invalidate the cached UID so next request re-authenticates with new credentials
        invalidateUidCache();

        // Bump data cache version so all Odoo data caches (partners, etc.) are refreshed
        bumpOdooDataCacheVersion();

        // Also purge Next.js tag-based caches (for production)
        revalidateTag('odoo-data');

        return NextResponse.json({
            ...updated,
            password: '********'
        });

    } catch (error) {
         return handleAPIError(error);
    }
}
