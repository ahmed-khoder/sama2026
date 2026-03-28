import { NextResponse } from 'next/server';
import { getCustomers } from '@/lib/odooClient';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        const customers = await getCustomers(limit);

        // Process images to be frontend-ready (optional, but good for debugging)
        // Odoo returns False for empty images, we might want null
        const processedCustomers = (customers as any[]).map(c => ({
            ...c,
            image_128: c.image_128 ? `data:image/png;base64,${c.image_128}` : null
        }));

        return NextResponse.json({ customers: processedCustomers }, { status: 200 });
    } catch (error: unknown) {
        console.error('Odoo customers fetch error:', error);
        return NextResponse.json(
            { status: 'error', message: error instanceof Error ? error.message : 'Failed to fetch customers' },
            { status: 500 }
        );
    }
}
