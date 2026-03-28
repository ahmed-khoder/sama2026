import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// GET - Get single user (authenticated users only)
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Non-admins can only view their own profile
        if (authUser.role !== 'ADMIN' && authUser.id !== params.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const user = await prisma.user.findUnique({
            where: { id: params.id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                avatar: true,
                preferredLanguage: true,
                theme: true,
                permissions: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(user);
    } catch (error: unknown) {
        console.error('Error fetching user:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

// PUT - Update user (authenticated — users can update themselves, admins can update anyone)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Non-admins can only update their own profile
        if (authUser.role !== 'ADMIN' && authUser.id !== params.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();

        // Prepare update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.phone !== undefined) updateData.phone = body.phone;
        if (body.avatar !== undefined) updateData.avatar = body.avatar;
        if (body.preferredLanguage !== undefined) updateData.preferredLanguage = body.preferredLanguage;
        if (body.theme !== undefined) updateData.theme = body.theme;

        // Only admins can change role, email, active status, and permissions
        if (authUser.role === 'ADMIN') {
            if (body.role !== undefined) updateData.role = body.role;
            if (body.isActive !== undefined) updateData.isActive = body.isActive;
            if (body.email !== undefined) updateData.email = body.email;
            if (body.permissions !== undefined) updateData.permissions = JSON.stringify(body.permissions);
        }

        // Handle password change
        if (body.password) {
            updateData.password = await bcrypt.hash(body.password, 10);
        }

        const user = await prisma.user.update({
            where: { id: params.id },
            data: updateData,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                avatar: true,
                preferredLanguage: true,
                theme: true,
                permissions: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return NextResponse.json(user);
    } catch (error: unknown) {
        console.error('Error updating user:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}

// DELETE - Delete user (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser || authUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.user.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error deleting user:', error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
