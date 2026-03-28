import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

/**
 * GET  /api/cms/media/audit         → dry-run (report only)
 * POST /api/cms/media/audit?fix=true → fix broken references
 *
 * Scans ALL entity tables for image URLs that:
 *   1. Have no matching Media record in the database, OR
 *   2. Have no physical file on disk
 *
 * When fix=true, nullifies/deletes those broken references.
 */

interface BrokenRef {
    table: string;
    recordId: string;
    field: string;
    url: string;
    reason: string;
}

async function checkUrlExists(url: string): Promise<boolean> {
    // Check if Image has a Media record
    const media = await prisma.media.findFirst({ where: { url } });
    if (!media) return false;

    // Check if physical file exists
    const publicPath = path.join(process.cwd(), 'public', url);
    return fs.existsSync(publicPath);
}

// Helper to scan a model for broken image references
async function scanModel(
    modelName: string,
    records: any[],
    imageFields: string[]
): Promise<BrokenRef[]> {
    const broken: BrokenRef[] = [];

    for (const record of records) {
        for (const field of imageFields) {
            const url = record[field];
            if (!url) continue; // skip null/empty fields

            const exists = await checkUrlExists(url);
            if (!exists) {
                // Determine reason
                const hasMedia = await prisma.media.findFirst({ where: { url } });
                broken.push({
                    table: modelName,
                    recordId: record.id,
                    field,
                    url,
                    reason: hasMedia ? 'file_missing' : 'no_media_record',
                });
            }
        }
    }

    return broken;
}

export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const allBroken: BrokenRef[] = [];

        // ── HeroSlide ─────────────────────────────────────────────
        const heroSlides = await prisma.heroSlide.findMany();
        allBroken.push(...await scanModel('HeroSlide', heroSlides,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']));

        // ── AboutHeroSlide ────────────────────────────────────────
        const aboutSlides = await prisma.aboutHeroSlide.findMany();
        allBroken.push(...await scanModel('AboutHeroSlide', aboutSlides,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']));

        // ── AboutWhyImage ─────────────────────────────────────────
        const aboutWhyImages = await prisma.aboutWhyImage.findMany();
        allBroken.push(...await scanModel('AboutWhyImage', aboutWhyImages, ['url']));

        // ── Service ───────────────────────────────────────────────
        const services = await prisma.service.findMany();
        allBroken.push(...await scanModel('Service', services, ['image', 'imageMobile']));

        // ── ServicesHeroSlide ─────────────────────────────────────
        const svcSlides = await prisma.servicesHeroSlide.findMany();
        allBroken.push(...await scanModel('ServicesHeroSlide', svcSlides,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']));

        // ── FleetTruck ────────────────────────────────────────────
        const trucks = await prisma.fleetTruck.findMany();
        allBroken.push(...await scanModel('FleetTruck', trucks, ['image']));

        // ── PortOperation ─────────────────────────────────────────
        const ports = await prisma.portOperation.findMany();
        allBroken.push(...await scanModel('PortOperation', ports, ['image']));

        // ── TeamMember ────────────────────────────────────────────
        const team = await prisma.teamMember.findMany();
        allBroken.push(...await scanModel('TeamMember', team, ['image']));

        // ── Milestone ─────────────────────────────────────────────
        const milestones = await prisma.milestone.findMany();
        allBroken.push(...await scanModel('Milestone', milestones, ['image']));

        // ── BlogPost ──────────────────────────────────────────────
        const blogs = await prisma.blogPost.findMany();
        allBroken.push(...await scanModel('BlogPost', blogs, ['image']));

        // ── CareersHeroSlide ──────────────────────────────────────
        const careerSlides = await prisma.careersHeroSlide.findMany();
        allBroken.push(...await scanModel('CareersHeroSlide', careerSlides,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']));

        return NextResponse.json({
            totalBroken: allBroken.length,
            broken: allBroken,
            summary: {
                byTable: allBroken.reduce((acc, b) => {
                    acc[b.table] = (acc[b.table] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
                byReason: allBroken.reduce((acc, b) => {
                    acc[b.reason] = (acc[b.reason] || 0) + 1;
                    return acc;
                }, {} as Record<string, number>),
            },
        });
    } catch (error) {
        console.error('Error auditing media:', error);
        return NextResponse.json({ error: 'Audit failed' }, { status: 500 });
    }
}

// POST - Fix broken references
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        if (searchParams.get('fix') !== 'true') {
            return NextResponse.json({ error: 'Pass ?fix=true to apply fixes' }, { status: 400 });
        }

        // First, run the audit
        const auditRes = await fetch(new URL('/api/cms/media/audit', request.url), {
            headers: { cookie: request.headers.get('cookie') || '' },
        });
        // Instead, scan inline:

        const allBroken: BrokenRef[] = [];
        let fixed = 0;

        // ── HeroSlide ─────────────────────────────────────────────
        const heroSlides = await prisma.heroSlide.findMany();
        allBroken.push(...await scanModel('HeroSlide', heroSlides,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']));

        const aboutSlides = await prisma.aboutHeroSlide.findMany();
        allBroken.push(...await scanModel('AboutHeroSlide', aboutSlides,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']));

        const aboutWhyImages = await prisma.aboutWhyImage.findMany();
        allBroken.push(...await scanModel('AboutWhyImage', aboutWhyImages, ['url']));

        const services = await prisma.service.findMany();
        allBroken.push(...await scanModel('Service', services, ['image', 'imageMobile']));

        const svcSlides = await prisma.servicesHeroSlide.findMany();
        allBroken.push(...await scanModel('ServicesHeroSlide', svcSlides,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']));

        const trucks = await prisma.fleetTruck.findMany();
        allBroken.push(...await scanModel('FleetTruck', trucks, ['image']));

        const ports = await prisma.portOperation.findMany();
        allBroken.push(...await scanModel('PortOperation', ports, ['image']));

        const team = await prisma.teamMember.findMany();
        allBroken.push(...await scanModel('TeamMember', team, ['image']));

        const milestones = await prisma.milestone.findMany();
        allBroken.push(...await scanModel('Milestone', milestones, ['image']));

        const blogs = await prisma.blogPost.findMany();
        allBroken.push(...await scanModel('BlogPost', blogs, ['image']));

        const careerSlides2 = await prisma.careersHeroSlide.findMany();
        allBroken.push(...await scanModel('CareersHeroSlide', careerSlides2,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']));

        // Fix each broken reference
        for (const b of allBroken) {
            try {
                if (b.table === 'AboutWhyImage' && b.field === 'url') {
                    // Delete the entire record
                    await prisma.aboutWhyImage.delete({ where: { id: b.recordId } });
                    fixed++;
                } else {
                    // Nullify the field
                    const model = getModel(b.table);
                    if (model) {
                        await model.update({
                            where: { id: b.recordId },
                            data: { [b.field]: null },
                        });
                        fixed++;
                    }
                }

                // Also clean up orphaned MediaUsage records
                const media = await prisma.media.findFirst({ where: { url: b.url } });
                if (media) {
                    await prisma.mediaUsage.deleteMany({
                        where: { mediaId: media.id },
                    });
                    await prisma.media.delete({ where: { id: media.id } });
                }
            } catch (err) {
                console.error(`Failed to fix ${b.table}.${b.field} on ${b.recordId}:`, err);
            }
        }

        return NextResponse.json({
            totalBroken: allBroken.length,
            fixed,
            broken: allBroken,
        });
    } catch (error) {
        console.error('Error fixing media:', error);
        return NextResponse.json({ error: 'Fix failed' }, { status: 500 });
    }
}

function getModel(tableName: string): any {
    const map: Record<string, any> = {
        HeroSlide: prisma.heroSlide,
        AboutHeroSlide: prisma.aboutHeroSlide,
        AboutWhyImage: prisma.aboutWhyImage,
        Service: prisma.service,
        ServicesHeroSlide: prisma.servicesHeroSlide,
        FleetTruck: prisma.fleetTruck,
        PortOperation: prisma.portOperation,
        TeamMember: prisma.teamMember,
        Milestone: prisma.milestone,
        BlogPost: prisma.blogPost,
        CareersHeroSlide: prisma.careersHeroSlide,
    };
    return map[tableName] || null;
}
