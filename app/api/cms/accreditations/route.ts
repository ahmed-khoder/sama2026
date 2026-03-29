import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { registerMedia, linkMedia } from '@/lib/media-library';

// Force Node.js runtime (required for sharp)
export const runtime = 'nodejs';
export const maxDuration = 30;

// ═══ GET — List active accreditations (public, no-cache for instant sync) ═══
export async function GET() {
    try {
        const items = await prisma.accreditation.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' },
            select: { id: true, logo: true, order: true },
        });

        return NextResponse.json(items, {
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            },
        });
    } catch (error) {
        console.error('Failed to fetch accreditations:', error);
        return NextResponse.json([], { status: 200 });
    }
}

// ═══ POST — Upload + optimize + register in Media Library + create Accreditation ═══
export async function POST(req: NextRequest) {
    const auth = await getUserFromRequest(req);
    if (!auth || auth.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // ── Step 1: Read file bytes ──
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const folder = 'accreditations';

        // ── Step 2: Create directory ──
        const uploadDir = path.join(process.cwd(), 'public', 'images', folder);
        await mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);

        // ── Step 3: Process file ──
        const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');

        let filename: string;
        let filepath: string;
        let publicPath: string;
        let finalBuffer: Buffer;
        let mimeType: string;
        let width: number | null = null;
        let height: number | null = null;

        if (isSvg) {
            // SVG: save as-is
            filename = `${timestamp}-${randomSuffix}.svg`;
            filepath = path.join(uploadDir, filename);
            finalBuffer = buffer;
            mimeType = 'image/svg+xml';
            await writeFile(filepath, finalBuffer);
        } else {
            // Raster image → WebP via sharp (same logic as /api/upload)
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                return NextResponse.json({ error: 'Invalid file type. Use PNG, JPG, WebP, GIF, or SVG.' }, { status: 400 });
            }

            filename = `${timestamp}-${randomSuffix}.webp`;
            filepath = path.join(uploadDir, filename);
            finalBuffer = await sharp(buffer).webp({ quality: 85 }).toBuffer();
            mimeType = 'image/webp';

            const metadata = await sharp(finalBuffer).metadata();
            width = metadata.width ?? null;
            height = metadata.height ?? null;

            await writeFile(filepath, finalBuffer);

            const savings = Math.round((1 - finalBuffer.length / buffer.length) * 100);
            console.log(`📸 Accreditation optimized: ${file.name} → ${(finalBuffer.length / 1024).toFixed(1)}KB (${savings}% savings)`);
        }

        publicPath = `/images/${folder}/${filename}`;

        // ── Step 4: Register in Media Library ──
        let mediaRecord = null;
        try {
            mediaRecord = await registerMedia({
                url: publicPath,
                fileName: file.name,
                mimeType,
                size: finalBuffer.length,
                width,
                height,
            });
            console.log(`📚 Media registered: ${mediaRecord.id}`);
        } catch (regErr) {
            console.error('⚠️ Media registration failed (non-fatal):', regErr);
        }

        // ── Step 5: Create Accreditation DB record ──
        const maxOrder = await prisma.accreditation.aggregate({ _max: { order: true } });
        const nextOrder = (maxOrder._max.order ?? -1) + 1;

        const record = await prisma.accreditation.create({
            data: {
                logo: publicPath,
                order: nextOrder,
                isActive: true,
            },
        });

        // ── Step 6: Link Media ↔ Accreditation ──
        try {
            await linkMedia(publicPath, 'accreditation', record.id);
            console.log(`🔗 Media linked: ${publicPath} → accreditation:${record.id}`);
        } catch (linkErr) {
            console.warn('⚠️ Media link failed (non-fatal):', linkErr);
        }

        console.log(`🏛️ Accreditation created: ${record.id} → ${publicPath}`);

        // Purge cached pages so public site shows the new accreditation immediately
        revalidatePath('/');
        revalidatePath('/about');

        return NextResponse.json(record, { status: 201 });
    } catch (error) {
        console.error('Failed to create accreditation:', error);
        return NextResponse.json({ error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
    }
}
