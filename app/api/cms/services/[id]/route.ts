import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia, unlinkAllForEntity } from '@/lib/media-library';

// GET - Get single service by ID
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const service = await prisma.service.findUnique({
            where: { id: params.id }
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        return NextResponse.json({
            ...service,
            features: JSON.parse(service.featuresJson || '[]')
        });
    } catch (error: unknown) {
        console.error('Error fetching service:', error);
        return NextResponse.json({ error: 'Failed to fetch service' }, { status: 500 });
    }
}

// Helper: sync a single image field for service entity
async function syncServiceImage(oldUrl: string | null | undefined, newUrl: string | null | undefined, entityId: string) {
    if (oldUrl && oldUrl !== newUrl) {
        await unlinkMedia(oldUrl, 'service', entityId);
    }
    if (newUrl && newUrl !== oldUrl) {
        await linkMedia(newUrl, 'service', entityId);
    }
}

// PUT - Update service (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (body.features && Array.isArray(body.features)) {
            body.featuresJson = JSON.stringify(body.features);
            delete body.features;
        }

        // Fetch existing record to detect replaced images
        const existing = await prisma.service.findUnique({
            where: { id: params.id },
            select: { image: true, imageMobile: true }
        });

        // Build update data explicitly
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};

        if (body.slug !== undefined) updateData.slug = body.slug;
        if (body.iconName !== undefined) updateData.iconName = body.iconName;
        if (body.titleAr !== undefined) updateData.titleAr = body.titleAr;
        if (body.titleEn !== undefined) updateData.titleEn = body.titleEn;
        if (body.shortDescAr !== undefined) updateData.shortDescAr = body.shortDescAr;
        if (body.shortDescEn !== undefined) updateData.shortDescEn = body.shortDescEn;
        if (body.descriptionAr !== undefined) updateData.descriptionAr = body.descriptionAr;
        if (body.descriptionEn !== undefined) updateData.descriptionEn = body.descriptionEn;
        if (body.featuresJson !== undefined) updateData.featuresJson = body.featuresJson;
        if (body.color !== undefined) updateData.color = body.color;
        if (body.order !== undefined) updateData.order = body.order;
        if (body.isActive !== undefined) updateData.isActive = body.isActive;

        if (body.image !== undefined) updateData.image = body.image || null;
        if (body.imageMobile !== undefined) updateData.imageMobile = body.imageMobile || null;

        const service = await prisma.service.update({
            where: { id: params.id },
            data: updateData
        });

        // ── Media Library: sync image links ──
        if (existing) {
            if (body.image !== undefined) {
                await syncServiceImage(existing.image, body.image, params.id);
            }
            if (body.imageMobile !== undefined) {
                await syncServiceImage(existing.imageMobile, body.imageMobile, params.id);
            }
        }

        revalidatePath('/', 'layout');
        revalidatePath('/services', 'layout');
        return NextResponse.json({
            ...service,
            features: JSON.parse(service.featuresJson || '[]')
        });
    } catch (error: unknown) {
        console.error('Error updating service:', error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }
}

// DELETE - Delete service (Admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ── Media Library: unlink all media for this service ──
        await unlinkAllForEntity('service', params.id);

        await prisma.service.delete({
            where: { id: params.id }
        });

        revalidatePath('/', 'layout');
        revalidatePath('/services', 'layout');
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting service:', error);
        return NextResponse.json({ error: 'Failed to delete service' }, { status: 500 });
    }
}
