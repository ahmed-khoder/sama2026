import { NextResponse } from 'next/server';
import { getConfirmedOrdersWithoutInvoices } from '@/lib/odoo/salesDetails';

export async function GET() {
    try {
        const orders = await getConfirmedOrdersWithoutInvoices();

        return NextResponse.json({
            success: true,
            data: orders,
            count: orders.length,
        });
    } catch (error) {
        console.error('Error in confirmed orders without invoices API:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'فشل في جلب تفاصيل الأوامر',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
