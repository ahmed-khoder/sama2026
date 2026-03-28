import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';

const BRANDING_KEYS = [
    'logo_default',
    'logo_occasion',
    'logo_animated',
    'occasion_mode',
    'animation_enabled',
    'occasion_label_ar',
    'occasion_label_en',
];

// GET — Public (for DynamicLogo on every page)
export async function GET() {
    try {
        const settings = await prisma.siteSetting.findMany({
            where: { section: 'branding' }
        });

        const map: Record<string, string> = {};
        for (const s of settings) {
            map[s.key] = s.valueAr; // Using valueAr as the primary store for branding
        }

        return NextResponse.json({
            logoDefault: map['logo_default'] || null,
            logoOccasion: map['logo_occasion'] || null,
            logoAnimated: map['logo_animated'] || null,
            occasionMode: map['occasion_mode'] === 'true',
            animationEnabled: map['animation_enabled'] === 'true',
            occasionLabelAr: map['occasion_label_ar'] || '',
            occasionLabelEn: map['occasion_label_en'] || '',
        });
    } catch (error) {
        console.error('Error fetching branding:', error);
        return NextResponse.json({
            logoDefault: null,
            logoOccasion: null,
            logoAnimated: null,
            occasionMode: false,
            animationEnabled: false,
            occasionLabelAr: '',
            occasionLabelEn: '',
        });
    }
}

// PUT — Admin only
export async function PUT(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Map incoming JSON to DB key-value pairs
        const updates: { key: string; value: string }[] = [];

        if (body.logoDefault !== undefined) updates.push({ key: 'logo_default', value: body.logoDefault || '' });
        if (body.logoOccasion !== undefined) updates.push({ key: 'logo_occasion', value: body.logoOccasion || '' });
        if (body.logoAnimated !== undefined) updates.push({ key: 'logo_animated', value: body.logoAnimated || '' });
        if (body.occasionMode !== undefined) updates.push({ key: 'occasion_mode', value: String(body.occasionMode) });
        if (body.animationEnabled !== undefined) updates.push({ key: 'animation_enabled', value: String(body.animationEnabled) });
        if (body.occasionLabelAr !== undefined) updates.push({ key: 'occasion_label_ar', value: body.occasionLabelAr || '' });
        if (body.occasionLabelEn !== undefined) updates.push({ key: 'occasion_label_en', value: body.occasionLabelEn || '' });

        // Upsert each setting
        for (const { key, value } of updates) {
            await prisma.siteSetting.upsert({
                where: { section_key: { section: 'branding', key } },
                create: {
                    section: 'branding',
                    key,
                    valueAr: value,
                    valueEn: value,
                },
                update: {
                    valueAr: value,
                    valueEn: value,
                },
            });
        }

        revalidatePath('/', 'layout');
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating branding:', error);
        const errMsg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: `Failed to update branding: ${errMsg}` }, { status: 500 });
    }
}
