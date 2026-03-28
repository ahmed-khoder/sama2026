/**
 * SEED CONTAINER IMAGES — Register in Media + MediaUsage tables
 *
 * These are static infrastructure images in public/images/container/.
 * They MUST be registered in the database so the dashboard sees them as "used"
 * and NOT as orphaned files.
 *
 * Run: npx tsx scripts/seed-container-media.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

/** Fixed entity for all container images */
const CONTAINER_ENTITY = 'container';
const CONTAINER_ENTITY_ID = 'static-infrastructure';
const CONTAINER_DIR = path.join(process.cwd(), 'public', 'images', 'container');

function getMimeType(ext: string): string {
    switch (ext.toLowerCase()) {
        case '.png': return 'image/png';
        case '.jpg':
        case '.jpeg': return 'image/jpeg';
        case '.webp': return 'image/webp';
        case '.svg': return 'image/svg+xml';
        default: return 'application/octet-stream';
    }
}

async function main() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  📦 SEEDING CONTAINER IMAGES INTO MEDIA DATABASE');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 1. Read all files from the container directory
    if (!fs.existsSync(CONTAINER_DIR)) {
        console.error(`❌ Container directory not found: ${CONTAINER_DIR}`);
        process.exit(1);
    }

    const files = fs.readdirSync(CONTAINER_DIR).filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.png', '.jpg', '.jpeg', '.webp', '.svg'].includes(ext);
    });

    console.log(`Found ${files.length} container images:\n`);

    let registered = 0;
    let linked = 0;
    let skipped = 0;

    for (const fileName of files) {
        const url = `/images/container/${fileName}`;
        const ext = path.extname(fileName);
        const fullPath = path.join(CONTAINER_DIR, fileName);
        const stats = fs.statSync(fullPath);

        console.log(`  Processing: ${fileName}`);

        // Register media (idempotent — skip if already exists)
        let media = await prisma.media.findFirst({ where: { url } });
        if (!media) {
            media = await prisma.media.create({
                data: {
                    url,
                    fileName,
                    mimeType: getMimeType(ext),
                    size: stats.size,
                },
            });
            registered++;
            console.log(`    ✅ Registered in Media table`);
        } else {
            console.log(`    ⏭️  Already registered`);
            skipped++;
        }

        // Create permanent usage link (idempotent)
        try {
            await prisma.mediaUsage.upsert({
                where: {
                    mediaId_entity_entityId: {
                        mediaId: media.id,
                        entity: CONTAINER_ENTITY,
                        entityId: CONTAINER_ENTITY_ID,
                    },
                },
                create: {
                    mediaId: media.id,
                    entity: CONTAINER_ENTITY,
                    entityId: CONTAINER_ENTITY_ID,
                },
                update: {},
            });
            linked++;
            console.log(`    🔗 Linked to entity "${CONTAINER_ENTITY}:${CONTAINER_ENTITY_ID}"`);
        } catch (err: any) {
            if (err.code !== 'P2002') throw err;
            console.log(`    🔗 Link already exists`);
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`  ✅ Done! Registered: ${registered} | Linked: ${linked} | Skipped: ${skipped}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    await prisma.$disconnect();
}

main().catch(async (err) => {
    console.error('💥 Fatal error:', err);
    await prisma.$disconnect();
    process.exit(1);
});
