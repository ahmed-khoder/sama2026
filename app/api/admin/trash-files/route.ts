/**
 * Admin: List Trash Files — Returns metadata for all files in public/.trash/
 * READ-ONLY endpoint. Does not modify any data.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth-middleware';
import fs from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TrashFileInfo {
    name: string;
    /** Relative path inside .trash/ (e.g. "images/hero/photo.webp") */
    relativePath: string;
    /** Size in bytes */
    size: number;
    /** ISO string of last-modified time — used as a proxy for deletion date */
    modifiedAt: string;
    /** MIME-inferred type based on extension */
    fileType: string;
    /** Whether the file is a previewable image */
    isImage: boolean;
}

/** Map common extensions to human-readable types */
function getFileType(ext: string): string {
    const map: Record<string, string> = {
        '.webp': 'WebP Image',
        '.png': 'PNG Image',
        '.jpg': 'JPEG Image',
        '.jpeg': 'JPEG Image',
        '.gif': 'GIF Image',
        '.svg': 'SVG Image',
        '.avif': 'AVIF Image',
        '.bmp': 'BMP Image',
        '.ico': 'Icon',
        '.mp4': 'MP4 Video',
        '.webm': 'WebM Video',
        '.pdf': 'PDF Document',
    };
    return map[ext.toLowerCase()] || `${ext.replace('.', '').toUpperCase()} File`;
}

function isImageExt(ext: string): boolean {
    return /^\.(webp|png|jpg|jpeg|gif|svg|avif|bmp|ico)$/i.test(ext);
}

/** Recursively collect all file metadata under a directory */
async function collectTrashFiles(dir: string, baseDir: string): Promise<TrashFileInfo[]> {
    const results: TrashFileInfo[] = [];

    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                const subFiles = await collectTrashFiles(fullPath, baseDir);
                results.push(...subFiles);
            } else if (entry.isFile()) {
                try {
                    const stat = await fs.stat(fullPath);
                    const ext = path.extname(entry.name);
                    const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');

                    results.push({
                        name: entry.name,
                        relativePath,
                        size: stat.size,
                        modifiedAt: stat.mtime.toISOString(),
                        fileType: getFileType(ext),
                        isImage: isImageExt(ext),
                    });
                } catch {
                    // Skip files we can't stat
                }
            }
        }
    } catch {
        // Directory doesn't exist or not readable
    }

    return results;
}

// GET — List all files in trash with metadata (read-only)
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const trashDir = path.join(process.cwd(), 'public', '.trash');
        const files = await collectTrashFiles(trashDir, trashDir);

        // Sort by most recently modified first (newest deletions on top)
        files.sort((a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime());

        return NextResponse.json({
            success: true,
            files,
            totalCount: files.length,
            totalSize: files.reduce((sum, f) => sum + f.size, 0),
        });
    } catch (error) {
        console.error('List trash files error:', error);
        return NextResponse.json(
            { error: 'Failed to list trash files' },
            { status: 500 }
        );
    }
}
