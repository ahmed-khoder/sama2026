/**
 * Centralized File Deletion Utility — SAFE MODE
 * 
 * Instead of permanently deleting files (fs.unlink), this utility MOVES
 * them to a local `.trash/` directory inside `public/`. Files can be
 * recovered by simply moving them back from `.trash/`.
 * 
 * The `.trash/` directory mirrors the original folder structure,
 * e.g. `/images/hero/abc.webp` → `/.trash/images/hero/abc.webp`
 */

import fs from 'fs/promises';
import path from 'path';

const TRASH_DIR = path.join(process.cwd(), 'public', '.trash');

/**
 * Safely move a physical file from `public/` to `public/.trash/`.
 * 
 * @param imagePath - The public URL path stored in the database,
 *                    e.g. `/images/hero/1234-abc.webp`
 * @returns `true` if the file was moved to trash, `false` otherwise
 */
export async function deletePhysicalFile(imagePath: string | null | undefined): Promise<boolean> {
    // Guard: skip empty, null, undefined, or external URLs
    if (!imagePath || !imagePath.startsWith('/')) {
        return false;
    }

    // Skip external URLs that somehow got stored
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return false;
    }

    try {
        const publicDir = path.join(process.cwd(), 'public');
        const absolutePath = path.join(publicDir, imagePath);

        // Check if file exists before attempting move
        await fs.access(absolutePath);

        // Build the trash destination (mirrors original structure)
        const trashPath = path.join(TRASH_DIR, imagePath);
        const trashFolder = path.dirname(trashPath);

        // Ensure the trash subfolder exists
        await fs.mkdir(trashFolder, { recursive: true });

        // Move the file to trash
        await fs.rename(absolutePath, trashPath);
        console.log(`♻️ Moved to trash: ${imagePath}`);
        return true;
    } catch {
        // File doesn't exist or can't be moved — that's OK, fail silently
        return false;
    }
}

/**
 * Move multiple physical files to trash in parallel.
 * Useful when a record has multiple image fields (e.g. hero slides).
 * 
 * @param imagePaths - Array of public URL paths
 * @returns Number of files successfully moved to trash
 */
export async function deletePhysicalFiles(imagePaths: (string | null | undefined)[]): Promise<number> {
    const results = await Promise.allSettled(
        imagePaths.map((p) => deletePhysicalFile(p))
    );

    return results.filter(
        (r) => r.status === 'fulfilled' && r.value === true
    ).length;
}
