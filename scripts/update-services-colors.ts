/**
 * Update Services Colors to Unified Orange
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// اللون البرتقالي الموحد للموقع
const UNIFIED_ORANGE = '#F97316';

async function main() {
  console.log('🎨 Updating services colors to unified orange...\n');

  try {
    const services = await prisma.service.findMany();
    
    for (const service of services) {
      await prisma.service.update({
        where: { id: service.id },
        data: { color: UNIFIED_ORANGE },
      });
      console.log(`✅ Updated ${service.titleAr} - Color: ${UNIFIED_ORANGE}`);
    }

    console.log('\n✨ All services colors updated successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
