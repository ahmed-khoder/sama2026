import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, rename, stat, unlink } from 'fs/promises';
import path from 'path';
import { getUserFromRequest } from '@/lib/auth-middleware';

// Force Node.js runtime
export const runtime = 'nodejs';
export const maxDuration = 30;
export const dynamic = 'force-dynamic';

// ── Constants ──────────────────────────────────────────────────
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const TARGET_FILE = 'sama-profile.pdf';
const TARGET_PATH = path.join(UPLOAD_DIR, TARGET_FILE);
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const PDF_MAGIC = '25504446'; // %PDF in hex

// ── POST: Upload / Replace PDF ─────────────────────────────────
export async function POST(request: NextRequest) {
    try {
        // Auth check — ADMIN only
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // ── Validation 1: MIME Type ──
        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'Invalid file type. Only PDF files are accepted.' },
                { status: 400 }
            );
        }

        // ── Validation 2: File Size ≤ 10MB ──
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        if (buffer.length > MAX_SIZE) {
            return NextResponse.json(
                { error: `File too large. Maximum size is 10MB. Your file is ${(buffer.length / 1024 / 1024).toFixed(1)}MB.` },
                { status: 400 }
            );
        }

        // ── Validation 3: PDF Signature (%PDF-) ──
        const header = buffer.subarray(0, 4).toString('hex');
        if (header !== PDF_MAGIC) {
            return NextResponse.json(
                { error: 'Invalid file content. The file does not have a valid PDF signature.' },
                { status: 400 }
            );
        }

        // ── Atomic Write: temp file → rename ──
        await mkdir(UPLOAD_DIR, { recursive: true });

        const tempPath = path.join(UPLOAD_DIR, `.sama-profile-${Date.now()}.tmp`);

        try {
            // Write to temporary file first
            await writeFile(tempPath, buffer);

            // Atomically replace the target file
            await rename(tempPath, TARGET_PATH);

            console.log(`📄 PDF uploaded: ${file.name} → ${TARGET_FILE} (${(buffer.length / 1024).toFixed(1)}KB)`);
        } catch (writeErr) {
            // Clean up temp file if rename failed
            try { await unlink(tempPath); } catch { /* ignore */ }
            throw writeErr;
        }

        return NextResponse.json({
            success: true,
            path: `/uploads/${TARGET_FILE}`,
            size: buffer.length,
            uploadedAt: new Date().toISOString(),
        });
    } catch (error: unknown) {
        console.error('PDF Upload error:', error);
        return NextResponse.json(
            { error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
            { status: 500 }
        );
    }
}

// ── GET: File Status ────────────────────────────────────────────
export async function GET(request: NextRequest) {
    try {
        // Auth check — ADMIN only
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        try {
            const fileStat = await stat(TARGET_PATH);
            return NextResponse.json({
                exists: true,
                size: fileStat.size,
                lastModified: fileStat.mtime.toISOString(),
            });
        } catch {
            return NextResponse.json({
                exists: false,
                size: 0,
                lastModified: null,
            });
        }
    } catch (error: unknown) {
        console.error('PDF status check error:', error);
        return NextResponse.json(
            { error: 'Status check failed' },
            { status: 500 }
        );
    }
}
