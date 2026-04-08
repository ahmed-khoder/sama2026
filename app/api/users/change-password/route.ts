import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/change-password
 * 
 * Admin-only: Force-reset a user's password (no current password required).
 * Self-service: User changes their own password (current password required).
 */
export async function POST(request: NextRequest) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { userId, newPassword, currentPassword } = body;

        if (!userId || !newPassword) {
            return NextResponse.json(
                { error: 'userId and newPassword are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Find the target user
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, password: true },
        });

        if (!targetUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isAdmin = authUser.role === 'ADMIN';
        const isSelf = authUser.id === userId;

        // Non-admin users can only change their own password
        if (!isAdmin && !isSelf) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Self-service: verify current password
        if (isSelf && !isAdmin) {
            if (!currentPassword) {
                return NextResponse.json(
                    { error: 'Current password is required' },
                    { status: 400 }
                );
            }
            const isValid = await bcrypt.compare(currentPassword, targetUser.password);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'Current password is incorrect' },
                    { status: 400 }
                );
            }
        }

        // Hash and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[change-password] Error:', error);
        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 500 }
        );
    }
}
