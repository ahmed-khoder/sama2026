/**
 * Admin: Empty Trash — Permanently delete everything in public/.trash/
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-middleware';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Count files recursively inside a directory.
 */
async function countFiles(dir: string): Promise<number> {
    let count = 0;
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                count += await countFiles(fullPath);
            } else if (entry.isFile()) {
                count++;
            }
        }
    } catch {
        // Directory doesn't exist
    }
    return count;
}

// GET — Check trash status (file count)
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trashDir = path.join(process.cwd(), 'public', '.trash');
        const fileCount = await countFiles(trashDir);

        return NextResponse.json({
            success: true,
            trashDir: 'public/.trash/',
            fileCount,
        });
    } catch (error) {
        console.error('Trash status error:', error);
        return NextResponse.json(
            { error: 'Failed to check trash status' },
            { status: 500 }
        );
    }
}

// POST — Permanently empty the trash
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trashDir = path.join(process.cwd(), 'public', '.trash');

        // Count files before deletion
        const fileCount = await countFiles(trashDir);

        if (fileCount === 0) {
            return NextResponse.json({
                success: true,
                message: 'Trash is already empty',
                deletedCount: 0,
            });
        }

        // Permanently delete the entire .trash directory and recreate it empty
        await fs.rm(trashDir, { recursive: true, force: true });

        return NextResponse.json({
            success: true,
            message: `Permanently deleted ${fileCount} files from trash`,
            deletedCount: fileCount,
        });
    } catch (error) {
        console.error('Empty trash error:', error);
        return NextResponse.json(
            { error: 'Failed to empty trash: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}
