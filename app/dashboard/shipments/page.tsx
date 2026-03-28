import { prisma } from '@/lib/db';
import ShipmentsClient from './ShipmentsClient';

export default async function ShipmentsPage() {
  // Fetch all shipments sorted by creation date
  const shipments = await prisma.shipment.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      client: true, // Include client details
    },
  });

  return <ShipmentsClient shipments={shipments} />;
}

