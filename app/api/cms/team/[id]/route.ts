import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { validateImagePath } from '@/lib/validate-image';
import { linkMedia, unlinkMedia, unlinkAllForEntity } from '@/lib/media-library';

// GET - Get single team member
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const teamMember = await prisma.teamMember.findUnique({
            where: { id: params.id }
        });

        if (!teamMember) {
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
        }

        return NextResponse.json(teamMember);
    } catch (error: unknown) {
        console.error('Error fetching team member:', error);
        return NextResponse.json({ error: 'Failed to fetch team member' }, { status: 500 });
    }
}

// PUT - Update team member (Admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    console.log('🔵 [TeamAPI] PUT /api/cms/team/' + params.id);
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            console.log('🔴 [TeamAPI] Unauthorized');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('🔵 [TeamAPI] Raw body keys:', Object.keys(body));

        // ── Strict whitelist: only Prisma-safe TeamMember fields ──
        const allowedFields = ['nameAr', 'nameEn', 'roleAr', 'roleEn', 'image', 'linkedin', 'twitter', 'order', 'isActive'];
        const updateData: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (body[key] !== undefined) {
                updateData[key] = body[key];
            }
        }

        console.log('🔵 [TeamAPI] Sanitized updateData:', JSON.stringify(updateData, null, 2));

        // Fetch existing record to detect image changes
        const existing = await prisma.teamMember.findUnique({
            where: { id: params.id },
            select: { image: true }
        });

        if (!existing) {
            console.log('🔴 [TeamAPI] Team member not found:', params.id);
            return NextResponse.json({ error: 'Team member not found' }, { status: 404 });
        }

        // If image hasn't changed from DB value, remove it to skip validation
        if (updateData.image !== undefined && updateData.image === existing.image) {
            console.log('🔵 [TeamAPI] Image unchanged, removing from update');
            delete updateData.image;
        }

        // Validate new image on disk ONLY if image was actually changed
        if (updateData.image !== undefined) {
            const imageCheck = await validateImagePath(updateData.image as string);
            console.log('🔵 [TeamAPI] Image validation:', imageCheck);
            if (!imageCheck.valid) {
                console.log('🔴 [TeamAPI] Image validation failed:', imageCheck.error);
                return NextResponse.json(
                    { error: imageCheck.error || 'Invalid image' },
                    { status: 400 }
                );
            }
        }

        // ── Prisma Update ──
        console.log('🔵 [TeamAPI] Executing Prisma update with keys:', Object.keys(updateData));
        const teamMember = await prisma.teamMember.update({
            where: { id: params.id },
            data: updateData
        });
        console.log('🟢 [TeamAPI] Prisma update successful:', teamMember.id);

        // ── Media Library: sync image link/unlink (only if image changed) ──
        if (updateData.image !== undefined) {
            if (existing.image && existing.image !== updateData.image) {
                await unlinkMedia(existing.image, 'team', params.id);
            }
            if (updateData.image && updateData.image !== existing.image) {
                await linkMedia(updateData.image as string, 'team', params.id);
            }
        }

        revalidatePath('/', 'layout');
        revalidatePath('/about', 'layout');
        return NextResponse.json(teamMember);
    } catch (error: unknown) {
        const errMsg = error instanceof Error ? error.message : String(error);
        console.error('🔴 [TeamAPI] PUT error:', errMsg);
        console.error('🔴 [TeamAPI] Full error:', error);
        return NextResponse.json(
            { error: `Failed to update team member: ${errMsg}` },
            { status: 500 }
        );
    }
}

// DELETE - Delete team member (Admin only, soft delete)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // ── Media Library: unlink all media before soft-delete ──
        await unlinkAllForEntity('team', params.id);

        await prisma.teamMember.update({
            where: { id: params.id },
            data: { isActive: false }
        });

        revalidatePath('/', 'layout');
        revalidatePath('/about', 'layout');
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting team member:', error);
        return NextResponse.json({ error: 'Failed to delete team member' }, { status: 500 });
    }
}
