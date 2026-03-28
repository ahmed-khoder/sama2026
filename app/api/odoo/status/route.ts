import { NextResponse } from 'next/server';
import { connectToOdoo } from '@/lib/odooClient';

export async function GET() {
    try {
        const uid = await connectToOdoo();
        return NextResponse.json({ status: 'connected', uid }, { status: 200 });
    } catch (error: unknown) {
        console.error('Odoo connection error:', error);
        return NextResponse.json(
            { status: 'error', message: error instanceof Error ? error.message : 'Failed to connect' },
            { status: 500 }
        );
    }
}
