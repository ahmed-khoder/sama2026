import { connectToOdoo, executeKw } from '../odooClient';

/**
 * Sale Order Statistics Interface
 */
export interface SalesStats {
    total: number;
    confirmed: number;
    fullyInvoiced: number;
    notInvoiced: number;
    confirmedWithoutInvoices: number; // Confirmed orders with invoice_count = 0
}

/**
 * Get comprehensive sales statistics from Odoo
 * 
 * Sale Order States in Odoo:
 * - 'draft': Quotation
 * - 'sent': Quotation Sent
 * - 'sale': Sales Order (confirmed)
 * - 'done': Locked
 * - 'cancel': Cancelled
 * 
 * Invoice Status:
 * - 'to invoice': Not invoiced
 * - 'invoiced': Fully invoiced
 * - 'no': Nothing to invoice
 */
export const getSalesStats = async (): Promise<SalesStats> => {
    try {
        const uid = await connectToOdoo();

        // 1. Total sale orders (excluding cancelled)
        const totalDomain = [['state', '!=', 'cancel']];
        const total = await executeKw(
            uid,
            'sale.order',
            'search_count',
            [totalDomain],
            {}
        ) as number;

        // 2. Confirmed sale orders (state = 'sale' or 'done')
        const confirmedDomain = [['state', 'in', ['sale', 'done']]];
        const confirmed = await executeKw(
            uid,
            'sale.order',
            'search_count',
            [confirmedDomain],
            {}
        ) as number;

        // 3. Fully invoiced orders
        const fullyInvoicedDomain = [
            ['state', '!=', 'cancel'],
            ['invoice_status', '=', 'invoiced']
        ];
        const fullyInvoiced = await executeKw(
            uid,
            'sale.order',
            'search_count',
            [fullyInvoicedDomain],
            {}
        ) as number;

        // 4. Not invoiced orders (to invoice)
        const notInvoicedDomain = [
            ['state', '!=', 'cancel'],
            ['invoice_status', '=', 'to invoice']
        ];
        const notInvoiced = await executeKw(
            uid,
            'sale.order',
            'search_count',
            [notInvoicedDomain],
            {}
        ) as number;

        // 5. Confirmed orders without any invoices
        // We need to check invoice_ids field (Many2many relationship) instead of invoice_count
        // Get confirmed orders and check if invoice_ids is empty
        const confirmedOrdersData = await executeKw(
            uid,
            'sale.order',
            'search_read',
            [[['state', 'in', ['sale', 'done']]]],
            {
                fields: ['id', 'invoice_ids'],
            }
        ) as any[];

        // Count orders where invoice_ids array is empty
        const confirmedWithoutInvoices = confirmedOrdersData.filter(
            (order: any) => !order.invoice_ids || order.invoice_ids.length === 0
        ).length;

        return {
            total,
            confirmed,
            fullyInvoiced,
            notInvoiced,
            confirmedWithoutInvoices,
        };
    } catch (error) {
        console.error('Error fetching sales stats from Odoo:', error);
        throw new Error('Failed to fetch sales statistics from Odoo');
    }
};

/**
 * Get recent sale orders with details
 * @param limit Number of orders to fetch
 */
export const getRecentSaleOrders = async (limit: number = 10) => {
    try {
        const uid = await connectToOdoo();

        const domain = [['state', '!=', 'cancel']];
        const fields = [
            'name',
            'partner_id',
            'date_order',
            'amount_total',
            'state',
            'invoice_status',
            'user_id',
        ];

        const orders = await executeKw(
            uid,
            'sale.order',
            'search_read',
            [domain],
            {
                fields: fields,
                limit: limit,
                order: 'date_order desc',
            }
        );

        return orders;
    } catch (error) {
        console.error('Error fetching recent sale orders from Odoo:', error);
        throw new Error('Failed to fetch recent sale orders from Odoo');
    }
};
