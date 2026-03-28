import { connectToOdoo, executeKw } from '@/lib/odooClient';

/**
 * Get detailed list of confirmed orders without any invoices
 */
export const getConfirmedOrdersWithoutInvoices = async () => {
    try {
        const uid = await connectToOdoo();

        // Get confirmed orders with invoice_ids field
        const domain = [['state', 'in', ['sale', 'done']]];
        const fields = [
            'name',              // Order number
            'partner_id',        // Customer
            'date_order',        // Order date
            'amount_total',      // Total amount
            'user_id',           // Salesperson
            'invoice_ids',       // Invoice IDs to check if empty
            'state',             // Order state
        ];

        const orders = await executeKw(
            uid,
            'sale.order',
            'search_read',
            [domain],
            {
                fields: fields,
                order: 'date_order desc',
            }
        ) as any[];

        // Filter orders with no invoices
        const ordersWithoutInvoices = orders.filter(
            (order: any) => !order.invoice_ids || order.invoice_ids.length === 0
        );

        // Format the data for frontend
        return ordersWithoutInvoices.map((order: any) => ({
            id: order.id,
            name: order.name,
            customerName: order.partner_id ? order.partner_id[1] : 'غير محدد',
            customerId: order.partner_id ? order.partner_id[0] : null,
            date: order.date_order,
            amount: order.amount_total,
            salesperson: order.user_id ? order.user_id[1] : 'غير محدد',
            salespersonId: order.user_id ? order.user_id[0] : null,
            state: order.state,
        }));
    } catch (error) {
        console.error('Error fetching confirmed orders without invoices:', error);
        throw new Error('Failed to fetch order details from Odoo');
    }
};
