/**
 * Media Backfill Script
 * Scans public image folders and registers existing files into the Media table.
 *
 * SAFETY:
 * - No file deletion
 * - No MediaUsage writes
 * - No schema changes
 * - SQLite-safe sequential writes
 * - Skips files already registered (by URL)
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const prisma = new PrismaClient();

// ── Config ─────────────────────────────────────────────────────────

const PUBLIC_DIR = path.join(process.cwd(), 'public');

const TARGET_FOLDERS = [
    'uploads',
    'images',
    'hero',
    'blog',
    'team',
    'services',
];

const VALID_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.webp', '.avif', '.svg',
]);

const IGNORE_DIRS = new Set([
    '.next', 'node_modules', '.git', '.trash', '.cache',
]);

// ── Helpers ────────────────────────────────────────────────────────

function isHiddenFolder(name: string): boolean {
    return name.startsWith('.');
}

function isImageFile(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return VALID_EXTENSIONS.has(ext);
}

/**
 * Convert an absolute filesystem path to a web-safe URL path.
 * Example: D:\project\public\images\hero\photo.webp → /images/hero/photo.webp
 */
function toWebUrl(absolutePath: string): string {
    const relative = path.relative(PUBLIC_DIR, absolutePath);
    // Convert Windows backslashes → forward slashes
    return '/' + relative.split(path.sep).join('/');
}

/**
 * Recursively collect all image files from a directory.
 */
function collectImages(dir: string): string[] {
    const results: string[] = [];

    if (!fs.existsSync(dir)) return results;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            // Skip ignored and hidden directories
            if (IGNORE_DIRS.has(entry.name) || isHiddenFolder(entry.name)) continue;
            results.push(...collectImages(fullPath));
        } else if (entry.isFile() && isImageFile(entry.name)) {
            results.push(fullPath);
        }
    }

    return results;
}

/**
 * Extract image metadata safely. Returns null on failure.
 */
async function getMetadata(filePath: string): Promise<{
    width: number | null;
    height: number | null;
    size: number;
    mimeType: string;
} | null> {
    try {
        const stat = fs.statSync(filePath);
        const ext = path.extname(filePath).toLowerCase();

        // SVGs can't be parsed by sharp
        if (ext === '.svg') {
            return {
                width: null,
                height: null,
                size: stat.size,
                mimeType: 'image/svg+xml',
            };
        }

        const meta = await sharp(filePath).metadata();

        const mimeMap: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.webp': 'image/webp',
            '.avif': 'image/avif',
        };

        return {
            width: meta.width ?? null,
            height: meta.height ?? null,
            size: stat.size,
            mimeType: mimeMap[ext] || 'image/unknown',
        };
    } catch {
        // Graceful fallback — still register without metadata
        try {
            const stat = fs.statSync(filePath);
            return { width: null, height: null, size: stat.size, mimeType: 'image/unknown' };
        } catch {
            return null;
        }
    }
}

// ── Main ───────────────────────────────────────────────────────────

async function main() {
    console.log('═══════════════════════════════════════════════════');
    console.log('  📚 MEDIA BACKFILL — Registering Existing Images');
    console.log('═══════════════════════════════════════════════════');
    console.log();

    // Step 1: Collect all image files
    console.log('🔍 Scanning folders...');
    const allFiles: string[] = [];

    for (const folder of TARGET_FOLDERS) {
        const dirPath = path.join(PUBLIC_DIR, folder);
        if (!fs.existsSync(dirPath)) {
            console.log(`   ⏭️  Skipping ${folder}/ (not found)`);
            continue;
        }
        const files = collectImages(dirPath);
        console.log(`   📁 ${folder}/ — ${files.length} images found`);
        allFiles.push(...files);
    }

    console.log();
    console.log(`📊 Total images found: ${allFiles.length}`);
    console.log();

    if (allFiles.length === 0) {
        console.log('✅ No images to register. Done!');
        await prisma.$disconnect();
        return;
    }

    // Step 2: Get existing URLs to skip duplicates
    console.log('📋 Checking existing Media records...');
    const existingMedia = await prisma.media.findMany({ select: { url: true } });
    const existingUrls = new Set(existingMedia.map((m) => m.url));
    console.log(`   Already registered: ${existingUrls.size}`);
    console.log();

    // Step 3: Register new files (sequential for SQLite safety)
    let registered = 0;
    let skipped = 0;
    let failed = 0;

    console.log('📝 Registering new media records...');

    for (const filePath of allFiles) {
        const url = toWebUrl(filePath);

        // Skip if already exists
        if (existingUrls.has(url)) {
            skipped++;
            continue;
        }

        const metadata = await getMetadata(filePath);
        if (!metadata) {
            console.log(`   ⚠️  Failed to read: ${url}`);
            failed++;
            continue;
        }

        try {
            await prisma.media.create({
                data: {
                    url,
                    fileName: path.basename(filePath),
                    mimeType: metadata.mimeType,
                    size: metadata.size,
                    width: metadata.width,
                    height: metadata.height,
                },
            });
            registered++;

            // Progress log every 10 files
            if (registered % 10 === 0) {
                console.log(`   ✅ Registered ${registered} so far...`);
            }
        } catch (err: any) {
            // Handle unique constraint (race condition safety)
            if (err.code === 'P2002') {
                skipped++;
            } else {
                console.log(`   ❌ Error registering ${url}: ${err.message}`);
                failed++;
            }
        }
    }

    // Step 4: Summary
    console.log();
    console.log('═══════════════════════════════════════════════════');
    console.log(`  ✅ Registered: ${registered}`);
    console.log(`  ⏭️  Skipped:    ${skipped}`);
    if (failed > 0) console.log(`  ❌ Failed:     ${failed}`);
    console.log('═══════════════════════════════════════════════════');
    console.log();
    console.log('🎉 Done! Refresh your storage dashboard to see the results.');

    await prisma.$disconnect();
}

main().catch((err) => {
    console.error('💥 Fatal error:', err);
    prisma.$disconnect();
    process.exit(1);
});
