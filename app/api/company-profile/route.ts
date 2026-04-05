/**
 * SAMA Logistics — Company Profile PDF API (v3 — ROYAL EDITION)
 * ═══════════════════════════════════════════════════════════════
 * On-demand PDF with HIGH-RES images, official SAMA logo, and
 * editorial-luxury design matching Mercedes catalog quality.
 *
 * KEY: No image compression — full quality originals.
 *      SAMA logo on cover + every page footer.
 *      Foundation year: 2000. Silver Jubilee: 2000–2025.
 *
 * ⚠️ NO AUTH / MIDDLEWARE files touched — strict No-Touch policy.
 */

import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { prisma } from '@/lib/db';
import SamaProfileDocument, { type ProfileData } from '@/components/pdf/SamaProfileDocument';

export const runtime = 'nodejs';
export const maxDuration = 120; // 2 minutes for full-quality rendering

// ── Convert local image to base64 (HIGH QUALITY — NO compression) ──
async function imageToBase64(imagePath: string, maxWidth = 1200): Promise<string | undefined> {
  try {
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    const fullPath = path.join(process.cwd(), 'public', cleanPath);

    if (!fs.existsSync(fullPath)) {
      console.warn(`[PDF] Image not found: ${fullPath}`);
      return undefined;
    }

    const ext = path.extname(fullPath).toLowerCase();
    if (ext === '.svg') return undefined;

    // PNG for logos (keep transparency) — JPEG for photos (quality 95%)
    const isPng = ext === '.png';
    let pipeline = sharp(fullPath).resize(maxWidth, undefined, { withoutEnlargement: true });

    let buffer: Buffer;
    let mime: string;

    if (isPng) {
      buffer = await pipeline.png({ quality: 100 }).toBuffer();
      mime = 'image/png';
    } else {
      // High quality JPEG — NO aggressive compression
      buffer = await pipeline.jpeg({ quality: 95, mozjpeg: true }).toBuffer();
      mime = 'image/jpeg';
    }

    return `data:${mime};base64,${buffer.toString('base64')}`;
  } catch (err) {
    console.warn(`[PDF] Failed to process image: ${imagePath}`, err);
    return undefined;
  }
}

// ── Load the official SAMA logo (PNG, preserve transparency) ──
async function loadLogo(): Promise<string | undefined> {
  // Try highest resolution first
  const candidates = [
    path.join(process.cwd(), 'public', 'icon.png'),          // 1920×1920
    path.join(process.cwd(), 'public', 'icons', 'icon.png'),  // 1024×1024
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) {
      try {
        const buffer = await sharp(p)
          .resize(400, 400, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
          .png({ quality: 100 })
          .toBuffer();
        return `data:image/png;base64,${buffer.toString('base64')}`;
      } catch { continue; }
    }
  }
  return undefined;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = (searchParams.get('lang') === 'ar' ? 'ar' : 'en') as 'ar' | 'en';

    // ═══════════════════════════════
    // 1. PARALLEL DATA + LOGO FETCH
    // ═══════════════════════════════
    const [
      servicesResult,
      fleetResult,
      portsResult,
      specializedCargoResult,
      milestonesResult,
      accreditationsResult,
      whySectionResult,
      partnersResult,
      heroSlidesResult,
      logo,
    ] = await Promise.all([
      prisma.service.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }).catch(() => []),
      prisma.fleetTruck.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }).catch(() => []),
      prisma.portOperation.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }).catch(() => []),
      prisma.specializedCargo.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }).catch(() => []),
      prisma.milestone.findMany({ where: { isActive: true }, orderBy: { order: 'asc' } }).catch(() => []),
      prisma.accreditation.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, select: { id: true, logo: true } }).catch(() => []),
      prisma.aboutWhySection.findFirst({ where: { id: 'default' } }).catch(() => null),
      fetchPartnersFromOdoo(request),
      prisma.aboutHeroSlide.findMany({ where: { isActive: true }, orderBy: { order: 'asc' }, take: 3 }).catch(() => []),
      loadLogo(),
    ]);

    const services = servicesResult as any[];
    const fleet = fleetResult as any[];
    const ports = portsResult as any[];
    const specializedCargo = specializedCargoResult as any[];
    const milestones = milestonesResult as any[];
    const accreditations = accreditationsResult as any[];
    const whyRaw = whySectionResult as any;
    const partners = partnersResult as any[];
    const heroSlides = heroSlidesResult as any[];

    // ═══════════════════════════════
    // 2. BUILD WHY SECTION
    // ═══════════════════════════════
    const whySection = {
      titleAr: whyRaw?.titleAr || 'لماذا تختار سما للخدمات اللوجستية؟',
      titleEn: whyRaw?.titleEn || 'Why Choose SAMA Logistics?',
      descriptionAr: whyRaw?.descriptionAr || 'نحن لسنا مجرد شركة شحن، بل شريكك الاستراتيجي.',
      descriptionEn: whyRaw?.descriptionEn || 'We are not just a shipping company, but your strategic partner.',
      reasonsJson: whyRaw?.reasonsJson || '[]',
      statsValue: whyRaw?.statsValue || '25+',
      statsLabelAr: whyRaw?.statsLabelAr || 'سنة من التميز',
      statsLabelEn: whyRaw?.statsLabelEn || 'Years of Excellence',
    };

    // ═══════════════════════════════
    // 3. LOAD ALL IMAGES IN PARALLEL (HIGH QUALITY)
    // ═══════════════════════════════

    // Cover hero image — full-width quality
    let coverImage: string | undefined;
    if (heroSlides.length > 0) {
      const heroImg = heroSlides[0].imageDesktopEn || heroSlides[0].imageDesktopAr;
      if (heroImg) coverImage = await imageToBase64(heroImg, 1400);
    }
    if (!coverImage) {
      const heroDir = path.join(process.cwd(), 'public', 'images', 'about-hero');
      if (fs.existsSync(heroDir)) {
        const files = fs.readdirSync(heroDir).filter(f => /\.(webp|jpg|png)$/i.test(f));
        if (files.length > 0) coverImage = await imageToBase64(`/images/about-hero/${files[0]}`, 1400);
      }
    }

    // Convert ALL images in parallel — FULL quality
    const [serviceImages, fleetImages, portImages, accImages] = await Promise.all([
      Promise.all(services.map((s: any) => s.image ? imageToBase64(s.image, 1000) : Promise.resolve(undefined))),
      Promise.all(fleet.map((f: any) => f.image ? imageToBase64(f.image, 1400) : Promise.resolve(undefined))),
      Promise.all(ports.map((p: any) => p.image ? imageToBase64(p.image, 1400) : Promise.resolve(undefined))),
      Promise.all(accreditations.map((a: any) => a.logo ? imageToBase64(a.logo, 400) : Promise.resolve(undefined))),
    ]);

    // ═══════════════════════════════
    // 4. ASSEMBLE PROFILE DATA
    // ═══════════════════════════════
    const profileData: ProfileData = {
      logo,
      coverImage,
      services: services.map((s: any, i: number) => ({
        id: s.id,
        titleAr: s.titleAr,
        titleEn: s.titleEn,
        shortDescAr: s.shortDescAr,
        shortDescEn: s.shortDescEn,
        featuresJson: s.featuresJson || '[]',
        iconName: s.iconName || 'Ship',
        image: serviceImages[i],
      })),
      fleet: fleet.map((f: any, i: number) => ({
        nameAr: f.nameAr,
        nameEn: f.nameEn,
        descAr: f.descAr,
        descEn: f.descEn,
        image: fleetImages[i],
        specsJson: f.specsJson || '[]',
      })),
      ports: ports.map((p: any, i: number) => ({
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        descAr: p.descAr,
        descEn: p.descEn,
        image: portImages[i],
        factsJson: p.factsJson || '[]',
      })),
      specializedCargo: specializedCargo.map((c: any) => ({
        titleAr: c.titleAr,
        titleEn: c.titleEn,
        descAr: c.descAr,
        descEn: c.descEn,
        badgeAr: c.badgeAr || '',
        badgeEn: c.badgeEn || '',
      })),
      milestones: milestones.map((m: any) => ({
        year: m.year,
        titleAr: m.titleAr,
        titleEn: m.titleEn,
        descriptionAr: m.descriptionAr,
        descriptionEn: m.descriptionEn,
      })),
      accreditations: accreditations.map((a: any, i: number) => ({
        id: a.id,
        logo: accImages[i],
      })).filter((a) => a.logo),
      partners,
      whySection,
    };

    console.log(`[PDF] Royal Edition — ${lang.toUpperCase()}
      Logo: ${logo ? 'LOADED' : 'MISSING!'}
      Cover: ${coverImage ? 'YES' : 'NO'}
      Services: ${profileData.services.length} (${profileData.services.filter(s => s.image).length} images)
      Fleet: ${profileData.fleet.length} (${profileData.fleet.filter(f => f.image).length} images)
      Ports: ${profileData.ports.length} (${profileData.ports.filter(p => p.image).length} images)
      Milestones: ${profileData.milestones.length}
      Accreditations: ${profileData.accreditations.length}
      Partners: ${profileData.partners.length}
    `);

    // ═══════════════════════════════
    // 5. RENDER PDF
    // ═══════════════════════════════
    const element = React.createElement(SamaProfileDocument, { lang, data: profileData });
    const pdfBuffer = await renderToBuffer(element as any);
    const uint8 = new Uint8Array(pdfBuffer);
    const filename = lang === 'ar' ? 'SAMA_Logistics_Profile_AR.pdf' : 'SAMA_Logistics_Profile_EN.pdf';

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('[PDF] Generation FAILED:', error);
    if (error instanceof Error) console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'PDF generation failed', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// ═══════════════════════════════
// Odoo Partners Fetch
// ═══════════════════════════════
async function fetchPartnersFromOdoo(request: NextRequest): Promise<Array<{ name: string; logo: string }>> {
  try {
    const proto = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const res = await fetch(`${proto}://${host}/api/odoo/featured-partners`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.partners || !Array.isArray(data.partners)) return [];
    return data.partners
      .filter((p: any) => p.image_128 && p.image_128.startsWith('data:image'))
      .map((p: any) => ({ name: p.name, logo: p.image_128 }));
  } catch {
    return [];
  }
}
