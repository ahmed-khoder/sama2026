import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { revalidatePath } from 'next/cache';
import { linkMedia } from '@/lib/media-library';

// GET all milestones
export async function GET() {
    try {
        const milestones = await prisma.milestone.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(milestones);
    } catch (error: unknown) {
        console.error('Error fetching milestones:', error);
        return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
    }
}

// POST - Create new milestone (Admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.year || !body.titleAr || !body.titleEn) {
            return NextResponse.json(
                { error: 'year, titleAr, and titleEn are required' },
                { status: 400 }
            );
        }

        const milestone = await prisma.milestone.create({
            data: {
                year: body.year,
                titleAr: body.titleAr,
                titleEn: body.titleEn,
                descriptionAr: body.descriptionAr || '',
                descriptionEn: body.descriptionEn || '',
                image: body.image || null,
                order: body.order ?? 0,
                isActive: body.isActive ?? true,
            }
        });

        // ── Media Library: link image on creation ──
        if (body.image) await linkMedia(body.image, 'milestone', milestone.id);

        revalidatePath('/about', 'layout');
        return NextResponse.json(milestone, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating milestone:', error);
        return NextResponse.json({ error: 'Failed to create milestone' }, { status: 500 });
    }
}
