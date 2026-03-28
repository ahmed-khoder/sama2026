/**
 * Server-side Image Path Validation Utility
 * 
 * Validates that an image path points to a file that actually exists
 * on disk under public/. Prevents storing references to non-existent files.
 */

import fs from 'fs/promises';
import path from 'path';

export interface ImageValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Validate that an image path is a legitimate local file that exists on disk.
 * 
 * @param imagePath - The public URL path, e.g. `/images/team/1234-abc.webp`
 * @returns Validation result with optional error message
 */
export async function validateImagePath(imagePath: string | null | undefined): Promise<ImageValidationResult> {
    // Must be a non-empty string
    if (!imagePath || typeof imagePath !== 'string' || !imagePath.trim()) {
        return { valid: false, error: 'Image path is required' };
    }

    // Must be a local path starting with /images/
    if (!imagePath.startsWith('/images/')) {
        return { valid: false, error: 'Image path must start with /images/' };
    }

    // Reject path traversal attempts
    if (imagePath.includes('..') || imagePath.includes('\\')) {
        return { valid: false, error: 'Invalid image path' };
    }

    // Verify the file actually exists on disk
    try {
        const absolutePath = path.join(process.cwd(), 'public', imagePath);
        await fs.access(absolutePath);
        return { valid: true };
    } catch {
        return { valid: false, error: `Image file does not exist: ${imagePath}` };
    }
}
