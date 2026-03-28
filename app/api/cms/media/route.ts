import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth-middleware';
import { registerMedia } from '@/lib/media-library';

export const dynamic = 'force-dynamic';

// GET - Browse all media (paginated, filterable) with resolved entity titles
export async function GET(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50');
        const entity = searchParams.get('entity');
        const skip = (page - 1) * limit;

        const where = entity
            ? { usages: { some: { entity: entity as any } } }
            : {};

        const [items, total] = await Promise.all([
            prisma.media.findMany({
                where,
                include: {
                    _count: { select: { usages: true } },
                    usages: {
                        select: { entity: true, entityId: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.media.count({ where }),
        ]);

        // ── Bulk-resolve entity titles ─────────────────────────────
        // Collect unique entityIds grouped by entity type
        const entityIdsByType: Record<string, Set<string>> = {};
        for (const item of items) {
            for (const usage of item.usages) {
                if (!entityIdsByType[usage.entity]) {
                    entityIdsByType[usage.entity] = new Set();
                }
                entityIdsByType[usage.entity].add(usage.entityId);
            }
        }

        // Bulk fetch titles per entity type → Map<entityId, { titleAr, titleEn }>
        const titleMap: Record<string, { titleAr: string; titleEn: string }> = {};

        const resolvers: Promise<void>[] = [];

        if (entityIdsByType['hero']) {
            const heroIds = [...entityIdsByType['hero']];
            resolvers.push(
                prisma.heroSlide.findMany({
                    where: { id: { in: heroIds } },
                    select: { id: true, titleAr: true, titleEn: true, order: true },
                }).then(heroSlides => {
                    for (const r of heroSlides) {
                        titleMap[r.id] = {
                            titleAr: r.titleAr || `سلايد هيرو #${r.order + 1}`,
                            titleEn: r.titleEn || `Hero Slide #${r.order + 1}`,
                        };
                    }
                })
            );
        }

        if (entityIdsByType['about']) {
            const aboutIds = [...entityIdsByType['about']];
            resolvers.push(
                Promise.all([
                    prisma.aboutHeroSlide.findMany({
                        where: { id: { in: aboutIds } },
                        select: { id: true, order: true },
                    }),
                    prisma.aboutWhyImage.findMany({
                        where: { id: { in: aboutIds } },
                        select: { id: true, order: true },
                    }),
                ]).then(([aboutSlides, aboutWhyImages]) => {
                    for (const r of aboutSlides) {
                        titleMap[r.id] = {
                            titleAr: `صورة من نحن #${r.order + 1}`,
                            titleEn: `About Slide #${r.order + 1}`,
                        };
                    }
                    for (const r of aboutWhyImages) {
                        titleMap[r.id] = {
                            titleAr: `صورة لماذا نحن #${r.order + 1}`,
                            titleEn: `Why Us Image #${r.order + 1}`,
                        };
                    }
                    // Fallback for HeroSettings.aboutSectionImages (entityId='default')
                    if (!titleMap['default'] && aboutIds.includes('default')) {
                        titleMap['default'] = {
                            titleAr: 'صور قسم من نحن',
                            titleEn: 'About Section Images',
                        };
                    }
                })
            );
        }

        if (entityIdsByType['blog']) {
            const blogIds = [...entityIdsByType['blog']];
            // Handle special blog-hero-default ID
            if (blogIds.includes('blog-hero-default')) {
                titleMap['blog-hero-default'] = {
                    titleAr: 'خلفية هيرو المدونة',
                    titleEn: 'Blog Hero Background',
                };
            }
            resolvers.push(
                prisma.blogPost.findMany({
                    where: { id: { in: blogIds } },
                    select: { id: true, titleAr: true, titleEn: true },
                }).then(rows => {
                    for (const r of rows) {
                        titleMap[r.id] = { titleAr: r.titleAr, titleEn: r.titleEn };
                    }
                })
            );
        }

        if (entityIdsByType['milestone']) {
            resolvers.push(
                prisma.milestone.findMany({
                    where: { id: { in: [...entityIdsByType['milestone']] } },
                    select: { id: true, titleAr: true, titleEn: true, year: true },
                }).then(rows => {
                    for (const r of rows) {
                        titleMap[r.id] = {
                            titleAr: `${r.year} - ${r.titleAr}`,
                            titleEn: `${r.year} - ${r.titleEn}`,
                        };
                    }
                })
            );
        }

        if (entityIdsByType['service']) {
            // Service entity covers: Service, ServicesHeroSlide, FleetTruck, PortOperation, ServiceImage
            const serviceIds = [...entityIdsByType['service']];
            resolvers.push(
                Promise.all([
                    prisma.service.findMany({
                        where: { id: { in: serviceIds } },
                        select: { id: true, titleAr: true, titleEn: true },
                    }),
                    prisma.servicesHeroSlide.findMany({
                        where: { id: { in: serviceIds } },
                        select: { id: true, order: true },
                    }),
                    prisma.fleetTruck.findMany({
                        where: { id: { in: serviceIds } },
                        select: { id: true, nameAr: true, nameEn: true },
                    }),
                    prisma.portOperation.findMany({
                        where: { id: { in: serviceIds } },
                        select: { id: true, nameAr: true, nameEn: true },
                    }),
                    prisma.serviceImage.findMany({
                        where: { id: { in: serviceIds } },
                        select: { id: true, caption: true, captionEn: true, service: { select: { titleAr: true, titleEn: true } } },
                    }),
                ]).then(([services, slides, trucks, ports, svcImages]) => {
                    for (const r of services) {
                        titleMap[r.id] = {
                            titleAr: `إدارة الخدمات: ${r.titleAr}`,
                            titleEn: `Service Management: ${r.titleEn}`,
                        };
                    }
                    for (const s of slides) {
                        titleMap[s.id] = {
                            titleAr: `هيرو الخدمات: سلايد #${s.order + 1}`,
                            titleEn: `Services Hero: Slide #${s.order + 1}`,
                        };
                    }
                    for (const t of trucks) {
                        titleMap[t.id] = {
                            titleAr: `أسطول الشاحنات: ${t.nameAr}`,
                            titleEn: `Fleet Trucks: ${t.nameEn}`,
                        };
                    }
                    for (const p of ports) {
                        titleMap[p.id] = {
                            titleAr: `عمليات الموانئ: ${p.nameAr}`,
                            titleEn: `Port Operations: ${p.nameEn}`,
                        };
                    }
                    for (const img of svcImages) {
                        titleMap[img.id] = {
                            titleAr: img.caption || `صور الخدمات: ${img.service.titleAr}`,
                            titleEn: img.captionEn || `Service Gallery: ${img.service.titleEn}`,
                        };
                    }
                })
            );
        }

        if (entityIdsByType['team']) {
            resolvers.push(
                prisma.teamMember.findMany({
                    where: { id: { in: [...entityIdsByType['team']] } },
                    select: { id: true, nameAr: true, nameEn: true },
                }).then(rows => {
                    for (const r of rows) {
                        titleMap[r.id] = { titleAr: r.nameAr, titleEn: r.nameEn };
                    }
                })
            );
        }

        if (entityIdsByType['career']) {
            // Career usages could be CareersHeroSlide or JobListing — try both
            const careerIds = [...entityIdsByType['career']];
            resolvers.push(
                Promise.all([
                    prisma.careersHeroSlide.findMany({
                        where: { id: { in: careerIds } },
                        select: { id: true, order: true },
                    }),
                    prisma.jobListing.findMany({
                        where: { id: { in: careerIds } },
                        select: { id: true, titleAr: true, titleEn: true },
                    }),
                ]).then(([slides, jobs]) => {
                    for (const s of slides) {
                        titleMap[s.id] = {
                            titleAr: `سلايد توظيف #${s.order + 1}`,
                            titleEn: `Career Slide #${s.order + 1}`,
                        };
                    }
                    for (const j of jobs) {
                        titleMap[j.id] = { titleAr: j.titleAr, titleEn: j.titleEn };
                    }
                })
            );
        }

        await Promise.all(resolvers);

        // Attach resolvedTitle to each usage
        const enrichedItems = items.map(item => ({
            ...item,
            usages: item.usages.map(u => ({
                ...u,
                resolvedTitleAr: titleMap[u.entityId]?.titleAr || null,
                resolvedTitleEn: titleMap[u.entityId]?.titleEn || null,
            })),
        }));

        return NextResponse.json({
            items: enrichedItems,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching media:', error);
        return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
    }
}

// POST - Manually register a media item
export async function POST(request: NextRequest) {
    try {
        const user = await getUserFromRequest(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();

        if (!body.url) {
            return NextResponse.json({ error: 'url is required' }, { status: 400 });
        }

        const media = await registerMedia({
            url: body.url,
            fileName: body.fileName,
            mimeType: body.mimeType,
            size: body.size,
            width: body.width,
            height: body.height,
        });

        return NextResponse.json(media, { status: 201 });
    } catch (error) {
        console.error('Error registering media:', error);
        return NextResponse.json({ error: 'Failed to register media' }, { status: 500 });
    }
}
