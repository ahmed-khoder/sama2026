import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { unlinkMedia } from '@/lib/media-library';

// ═══ DELETE — Remove accreditation + unlink from Media Library ═══
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await getUserFromRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const record = await prisma.accreditation.findUnique({ where: { id: params.id } });
        if (!record) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        // Delete DB record first
        await prisma.accreditation.delete({ where: { id: params.id } });

        // Unlink from Media Library (handles physical file deletion if no other usages)
        try {
            const result = await unlinkMedia(record.logo, 'accreditation', params.id);
            if (result?.deleted) {
                console.log(`🗑️ Media orphaned & trashed: ${record.logo}`);
            } else {
                console.log(`🔗 Media unlinked (still used elsewhere): ${record.logo}`);
            }
        } catch (unlinkErr) {
            console.warn(`⚠️ Media unlink failed (non-fatal): ${record.logo}`, unlinkErr);
        }

        // Purge cached pages so public site reflects the deletion immediately
        revalidatePath('/');
        revalidatePath('/about');

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to delete accreditation:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}

// ═══ PUT — Toggle isActive (show/hide) ═══
export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const auth = await getUserFromRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { isActive } = body;

        const updated = await prisma.accreditation.update({
            where: { id: params.id },
            data: { isActive },
        });

        // Purge cached pages so public site reflects the toggle immediately
        revalidatePath('/');
        revalidatePath('/about');

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Failed to update accreditation:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
