import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { handleAPIError, Errors } from '@/lib/api-error-handler';
import { heroSettingsSchema } from '@/lib/validations';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia } from '@/lib/media-library';

// GET Hero Settings (public)
export async function GET() {
    try {
        let settings = await prisma.heroSettings.findUnique({
            where: { id: 'default' }
        });

        if (!settings) {
            settings = await prisma.heroSettings.create({
                data: {
                    id: 'default',
                    blurAmount: 0,
                    overlayOpacity: 30,
                    overlayColor: 'marine',
                    showGrid: true
                }
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        return handleAPIError(error);
    }
}

// POST Update Settings (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            throw Errors.Unauthorized('يجب تسجيل الدخول كمسؤول');
        }

        const body = await request.json();

        // Validate with Zod
        const result = heroSettingsSchema.safeParse(body);
        if (!result.success) {
            throw Errors.BadRequest(result.error.issues[0]?.message || 'بيانات غير صالحة');
        }

        // ── Fetch existing to diff aboutSectionImages ──
        const existing = await prisma.heroSettings.findUnique({
            where: { id: 'default' },
            select: { aboutSectionImages: true },
        });
        const oldUrls = existing?.aboutSectionImages
            ? existing.aboutSectionImages.split(',').filter(Boolean).map(u => u.trim())
            : [];
        const newUrls = typeof result.data.aboutSectionImages === 'string' && result.data.aboutSectionImages
            ? result.data.aboutSectionImages.split(',').filter(Boolean).map((u: string) => u.trim())
            : oldUrls;

        const settings = await prisma.heroSettings.upsert({
            where: { id: 'default' },
            create: {
                id: 'default',
                ...result.data
            },
            update: result.data
        });

        // ── Media Library: sync aboutSectionImages ──
        const removed = oldUrls.filter((u: string) => !newUrls.includes(u));
        const added = newUrls.filter((u: string) => !oldUrls.includes(u));
        for (const url of removed) await unlinkMedia(url, 'about', 'default');
        for (const url of added) await linkMedia(url, 'about', 'default');

        revalidatePath('/', 'layout');
        return NextResponse.json(settings);
    } catch (error) {
        return handleAPIError(error);
    }
}

