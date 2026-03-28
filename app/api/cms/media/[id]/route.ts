import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { deletePhysicalFile } from '@/lib/delete-file';
import { cleanupEntityReferences } from '@/lib/media-library';

// GET - Single media item with usages
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const media = await prisma.media.findUnique({
            where: { id: params.id },
            include: {
                _count: { select: { usages: true } },
                usages: true,
            },
        });

        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }

        return NextResponse.json(media);
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

// DELETE - Delete a media item (supports ?force=true for linked media)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const force = searchParams.get('force') === 'true';

        const media = await prisma.media.findUnique({
            where: { id: params.id },
            include: {
                usages: { select: { entity: true, entityId: true } },
                _count: { select: { usages: true } },
            },
        });

        if (!media) {
            return NextResponse.json({ error: 'Media not found' }, { status: 404 });
        }

        // Block deletion if media has active usages and force is not set
        if (media._count.usages > 0 && !force) {
            return NextResponse.json(
                { error: `Cannot delete — media is used in ${media._count.usages} place(s). Use force=true to override.` },
                { status: 409 }
            );
        }

        // ── Clean up entity references BEFORE deleting ──────────
        // This removes/nullifies the actual entity records (HeroSlide.image,
        // Service.image, AboutWhyImage, etc.) that still hold the dead URL.
        if (media.usages.length > 0) {
            const cleanup = await cleanupEntityReferences(media.url, media.usages);
            console.log(`🔗 Entity cleanup: ${cleanup.cleaned} reference(s) cleaned`);
        }

        // Trash the physical file
        await deletePhysicalFile(media.url);

        // Delete the Media record (onDelete: Cascade handles MediaUsage cleanup)
        await prisma.media.delete({ where: { id: params.id } });

        return NextResponse.json({
            success: true,
            url: media.url,
            forceDeleted: media._count.usages > 0,
            entitiesCleaned: media.usages.length,
        });
    } catch (error) {
        console.error('Error deleting media:', error);
        return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
    }
}
