import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

// PUT - Change password (authenticated — users can only change their own password)
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getUserFromRequest(request);
        if (!authUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Users can only change their own password (admins can change anyone's)
        if (authUser.role !== 'ADMIN' && authUser.id !== params.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'Password must be at least 6 characters' },
                { status: 400 }
            );
        }

        // Get user
        const user = await prisma.user.findUnique({ where: { id: params.id } });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update
        await prisma.user.update({
            where: { id: params.id },
            data: { password: hashedPassword }
        });

        return NextResponse.json({ success: true });
    } catch (error: unknown) {
        console.error('Error changing password:', error);
        return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
    }
}
