import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { validateImagePath } from '@/lib/validate-image';
import { linkMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// GET - List all team members
export async function GET() {
    try {
        const teamMembers = await prisma.teamMember.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(teamMembers);
    } catch (error: unknown) {
        console.error('Error fetching team members:', error);
        return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
    }
}

// POST - Create new team member (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.nameAr || !body.nameEn || !body.roleAr || !body.roleEn) {
            return NextResponse.json(
                { error: 'nameAr, nameEn, roleAr, and roleEn are required' },
                { status: 400 }
            );
        }

        // Validate image file exists on disk before saving reference
        const imageCheck = await validateImagePath(body.image);
        if (!imageCheck.valid) {
            return NextResponse.json(
                { error: imageCheck.error || 'Invalid image' },
                { status: 400 }
            );
        }

        const teamMember = await prisma.teamMember.create({
            data: {
                nameAr: body.nameAr,
                nameEn: body.nameEn,
                roleAr: body.roleAr,
                roleEn: body.roleEn,
                image: body.image,
                linkedin: body.linkedin || null,
                twitter: body.twitter || null,
                order: body.order || 0
            }
        });

        // ── Media Library: link image to new team member ──
        if (body.image) {
            await linkMedia(body.image, 'team', teamMember.id);
        }

        revalidatePath('/', 'layout');
        revalidatePath('/about', 'layout');
        return NextResponse.json(teamMember, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating team member:', error);
        return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
    }
}
