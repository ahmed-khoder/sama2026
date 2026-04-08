import { NextRequest, NextResponse } from 'next/server';
import { readFile, stat } from 'fs/promises';
import { createHash } from 'crypto';
import path from 'path';

// Force Node.js runtime for file system access
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TARGET_PATH = path.join(process.cwd(), 'public', 'uploads', 'sama-profile.pdf');

export async function GET(_request: NextRequest) {
    try {
        // Check if file exists
        let fileStat;
        try {
            fileStat = await stat(TARGET_PATH);
        } catch {
            return NextResponse.json(
                { error: 'Company profile PDF has not been uploaded yet.' },
                { status: 404 }
            );
        }

        // Read the file
        const fileBuffer = await readFile(TARGET_PATH);

        // Generate ETag from file content for conditional requests
        const etag = `"${createHash('md5').update(fileBuffer).digest('hex')}"`;

        // Check If-None-Match header for 304 optimization
        const ifNoneMatch = _request.headers.get('if-none-match');
        if (ifNoneMatch === etag) {
            return new NextResponse(null, {
                status: 304,
                headers: {
                    'ETag': etag,
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                },
            });
        }

        // Stream the PDF directly from the server
        return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Length': String(fileStat.size),
                'Content-Disposition': 'inline; filename="SAMA-Logistics-Profile.pdf"',
                // ── Anti-cache headers (as specified) ──
                'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0',
                // ── ETag for conditional 304 ──
                'ETag': etag,
                // ── Security ──
                'X-Content-Type-Options': 'nosniff',
            },
        });
    } catch (error: unknown) {
        console.error('PDF serve error:', error);
        return NextResponse.json(
            { error: 'Failed to serve PDF' },
            { status: 500 }
        );
    }
}
