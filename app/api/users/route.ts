import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';
import { DEFAULT_EMPLOYEE_PERMISSIONS } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const users = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
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
                // Never return password
            }
        });

        return NextResponse.json(users);
    } catch (error: unknown) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

// POST - Create new user (admin only)
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        // Validate required fields
        if (!body.email || !body.password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        // Validate role — only CLIENT and EMPLOYEE may be assigned via the API.
        // ADMIN accounts must be seeded directly in the database to prevent privilege escalation.
        const allowedRoles = ['CLIENT', 'EMPLOYEE'];
        const requestedRole: string = body.role || 'CLIENT';
        if (!allowedRoles.includes(requestedRole)) {
            return NextResponse.json(
                { error: `Invalid role. Allowed values: ${allowedRoles.join(', ')}` },
                { status: 400 }
            );
        }

        // Check if email exists
        const existing = await prisma.user.findUnique({ where: { email: body.email } });
        if (existing) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(body.password, 10);

        const newUser = await prisma.user.create({
            data: {
                email: body.email,
                password: hashedPassword,
                name: body.name || null,
                phone: body.phone || null,
                role: body.role || 'CLIENT',
                isActive: body.isActive !== false,
                avatar: body.avatar || null,
                preferredLanguage: body.preferredLanguage || 'ar',
                theme: body.theme || 'system',
                permissions: body.permissions ? JSON.stringify(body.permissions) : JSON.stringify(DEFAULT_EMPLOYEE_PERMISSIONS),
            },
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
            }
        });

        return NextResponse.json(newUser, { status: 201 });
    } catch (error: unknown) {
        console.error('Error creating user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}
