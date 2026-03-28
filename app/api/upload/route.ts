import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { registerMedia } from '@/lib/media-library';

// Force Node.js runtime (required for sharp native module)
export const runtime = 'nodejs';
// Increase timeout for large file processing
export const maxDuration = 30;
// Allow large file uploads (up to 20MB)
export const dynamic = 'force-dynamic';

// Quality settings by folder type (NO resizing - keep original dimensions)
const QUALITY_SETTINGS: Record<string, number> = {
    hero: 85,       // Hero images - high quality
    team: 85,       // Team photos
    blog: 85,       // Blog covers
    uploads: 80     // General uploads
};

export async function POST(request: NextRequest) {
    try {
        // Auth check — only admins can upload
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folder = formData.get('folder') as string || 'uploads';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Get original file bytes
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create upload directory
        const uploadDir = path.join(process.cwd(), 'public', 'images', folder);
        await mkdir(uploadDir, { recursive: true });

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(7);

        // ── SVG / JSON: save as-is (text-based, no sharp processing) ──
        const isSvg = file.type === 'image/svg+xml' || file.name.endsWith('.svg');
        const isJson = file.type === 'application/json' || file.name.endsWith('.json');

        if (isSvg || isJson) {
            const ext = isSvg ? 'svg' : 'json';
            const filename = `${timestamp}-${randomSuffix}.${ext}`;
            const filepath = path.join(uploadDir, filename);
            await writeFile(filepath, buffer);

            const publicPath = `/images/${folder}/${filename}`;
            console.log(`📸 ${ext.toUpperCase()} uploaded: ${file.name} → ${publicPath}`);

            // Register in media library (non-fatal)
            let mediaRecord = null;
            try {
                mediaRecord = await registerMedia({
                    url: publicPath,
                    fileName: file.name,
                    mimeType: isSvg ? 'image/svg+xml' : 'application/json',
                    size: buffer.length,
                    width: null,
                    height: null,
                });
            } catch (regErr) {
                console.error('⚠️ Media registration failed (non-fatal):', regErr);
            }

            return NextResponse.json({
                success: true,
                path: publicPath,
                filename,
                originalSize: buffer.length,
                optimizedSize: buffer.length,
                savings: '0%',
                mediaId: mediaRecord?.id ?? null,
                width: null,
                height: null,
            });
        }

        // ── Regular images: validate + sharp → WebP ──
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Only images (JPEG, PNG, WebP, GIF), SVG, or JSON allowed.' }, { status: 400 });
        }

        // Magic Bytes check for binary images
        const header = buffer.subarray(0, 4).toString('hex');
        const validMagicBytes: Record<string, string> = {
            'ffd8ffe0': 'jpeg', 'ffd8ffe1': 'jpeg', 'ffd8ffe2': 'jpeg', 'ffd8ffdb': 'jpeg',
            '89504e47': 'png',
            '52494646': 'webp',
            '47494638': 'gif',
        };
        if (!Object.keys(validMagicBytes).some(magic => header.startsWith(magic))) {
            return NextResponse.json({ error: 'Invalid file content. File is not a valid image.' }, { status: 400 });
        }

        // Generate WebP filename
        const filename = `${timestamp}-${randomSuffix}.webp`;
        const filepath = path.join(uploadDir, filename);

        // Get quality setting based on folder (default 80)
        const quality = QUALITY_SETTINGS[folder] || 80;

        // Compress and convert to WebP WITHOUT resizing
        const optimizedBuffer = await sharp(buffer)
            .webp({ quality })
            .toBuffer();

        const metadata = await sharp(optimizedBuffer).metadata();
        const originalSize = buffer.length;
        const optimizedSize = optimizedBuffer.length;
        const savings = Math.round((1 - optimizedSize / originalSize) * 100);

        console.log(`📸 Image optimized: ${file.name}`);
        console.log(`   Original: ${(originalSize / 1024).toFixed(1)}KB → Optimized: ${(optimizedSize / 1024).toFixed(1)}KB (${savings}% savings)`);

        await writeFile(filepath, optimizedBuffer);

        const publicPath = `/images/${folder}/${filename}`;

        // Media Library registration
        let mediaRecord = null;
        try {
            mediaRecord = await registerMedia({
                url: publicPath,
                fileName: file.name,
                mimeType: 'image/webp',
                size: optimizedSize,
                width: metadata.width ?? null,
                height: metadata.height ?? null,
            });
            console.log(`📚 Media registered: ${mediaRecord.id}`);
        } catch (regErr) {
            console.error('⚠️ Media registration failed (non-fatal):', regErr);
        }

        return NextResponse.json({
            success: true,
            path: publicPath,
            filename,
            originalSize,
            optimizedSize,
            savings: `${savings}%`,
            mediaId: mediaRecord?.id ?? null,
            width: metadata.width ?? null,
            height: metadata.height ?? null,
        });
    } catch (error: unknown) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed: ' + (error instanceof Error ? error.message : 'Unknown error') }, { status: 500 });
    }
}
