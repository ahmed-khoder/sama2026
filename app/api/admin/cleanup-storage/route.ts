/**
 * Admin: Storage Garbage Collector
 *
 * Scans all physical files in public/images/ and compares against ALL
 * image paths stored in the database. Deletes only true orphans.
 *
 * CRITICAL: Does NOT filter by isActive/published — disabled/hidden
 * records still own their images and are NOT deleted.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-middleware";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recursively collect all file paths under a directory.
 * Returns paths relative to `public/`, e.g. `/images/hero/abc.webp`
 */
async function collectFiles(dir: string, base: string): Promise<string[]> {
  const results: string[] = [];

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = await collectFiles(fullPath, base);
        results.push(...nested);
      } else if (entry.isFile()) {
        // Convert absolute path to public-relative URL
        const relativePath =
          "/" + path.relative(base, fullPath).replace(/\\/g, "/");
        results.push(relativePath);
      }
    }
  } catch {
    // Directory might not exist — that's fine
  }

  return results;
}

/**
 * Gather ALL image paths from every table in the database.
 * NO filtering by isActive, published, or any status flag.
 * Disabled/hidden records still own their images.
 */
async function getAllDatabaseImagePaths(): Promise<Set<string>> {
  const paths = new Set<string>();

  const addIfValid = (url: string | null | undefined) => {
    if (url && url.startsWith("/") && url.trim().length > 0) {
      paths.add(url);
    }
  };

  // 1. HeroSlide — 3 image fields, no isActive filter
  const heroSlides = await prisma.heroSlide.findMany({
    select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true },
  });
  for (const s of heroSlides) {
    addIfValid(s.imageDesktopAr);
    addIfValid(s.imageDesktopEn);
    addIfValid(s.imageMobile);
  }

  // 2. ServicesHeroSlide — 3 image fields
  const svcHeroSlides = await prisma.servicesHeroSlide.findMany({
    select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true },
  });
  for (const s of svcHeroSlides) {
    addIfValid(s.imageDesktopAr);
    addIfValid(s.imageDesktopEn);
    addIfValid(s.imageMobile);
  }

  // 3. AboutHeroSlide — 3 image fields
  const aboutHeroSlides = await prisma.aboutHeroSlide.findMany({
    select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true },
  });
  for (const s of aboutHeroSlides) {
    addIfValid(s.imageDesktopAr);
    addIfValid(s.imageDesktopEn);
    addIfValid(s.imageMobile);
  }

  // 4. CareersHeroSlide — 3 image fields
  const careersHeroSlides = await prisma.careersHeroSlide.findMany({
    select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true },
  });
  for (const s of careersHeroSlides) {
    addIfValid(s.imageDesktopAr);
    addIfValid(s.imageDesktopEn);
    addIfValid(s.imageMobile);
  }

  // 5. Service — image + imageMobile
  const services = await prisma.service.findMany({
    select: { image: true, imageMobile: true },
  });
  for (const s of services) {
    addIfValid(s.image);
    addIfValid(s.imageMobile);
  }

  // 6. ServiceImage — url
  const serviceImages = await prisma.serviceImage.findMany({
    select: { url: true },
  });
  for (const img of serviceImages) {
    addIfValid(img.url);
  }

  // 7. TeamMember — image
  const teamMembers = await prisma.teamMember.findMany({
    select: { image: true },
  });
  for (const t of teamMembers) {
    addIfValid(t.image);
  }

  // 8. Milestone — image
  const milestones = await prisma.milestone.findMany({
    select: { image: true },
  });
  for (const m of milestones) {
    addIfValid(m.image);
  }

  // 9. FleetTruck — image
  const trucks = await prisma.fleetTruck.findMany({
    select: { image: true },
  });
  for (const t of trucks) {
    addIfValid(t.image);
  }

  // 10. PortOperation — image
  const ports = await prisma.portOperation.findMany({
    select: { image: true },
  });
  for (const p of ports) {
    addIfValid(p.image);
  }

  // 11. AboutWhyImage — url
  const aboutWhyImages = await prisma.aboutWhyImage.findMany({
    select: { url: true },
  });
  for (const img of aboutWhyImages) {
    addIfValid(img.url);
  }

  // 12. BlogPost — image + Content parsing (HTML regex)
  const blogPosts = await prisma.blogPost.findMany({
    select: { image: true, contentAr: true, contentEn: true },
  });
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  for (const p of blogPosts) {
    addIfValid(p.image);
    // Deep scan content blocks
    const arMatches = [...(p.contentAr || "").matchAll(imgRegex)];
    arMatches.forEach((m) => addIfValid(m[1]));
    const enMatches = [...(p.contentEn || "").matchAll(imgRegex)];
    enMatches.forEach((m) => addIfValid(m[1]));
  }

  // 13. BlogPostImage — url
  const blogImages = await prisma.blogPostImage.findMany({
    select: { url: true },
  });
  for (const img of blogImages) {
    addIfValid(img.url);
  }

  // BlogHeroSettings — default hero background
  const blogHero = await prisma.blogHeroSettings.findUnique({
    where: { id: "default" },
    select: { image: true },
  });
  if (blogHero) {
    addIfValid(blogHero.image);
  }

  // 14. User — avatar
  const users = await prisma.user.findMany({
    select: { avatar: true },
  });
  for (const u of users) {
    addIfValid(u.avatar);
  }

  // 15. JobApplication — cvUrl
  const applications = await prisma.jobApplication.findMany({
    select: { cvUrl: true },
  });
  for (const a of applications) {
    addIfValid(a.cvUrl);
  }

  // 16. Accreditation — logo
  const accreditations = await prisma.accreditation.findMany({
    select: { logo: true },
  });
  for (const acc of accreditations) {
    addIfValid(acc.logo);
  }

  return paths;
}

// POST — Run garbage collector (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse dry-run flag (default: dry run for safety)
    const { searchParams } = new URL(request.url);
    const dryRun = searchParams.get("dry") !== "false";

    const publicDir = path.join(process.cwd(), "public");
    const imagesDir = path.join(publicDir, "images");

    // 1. Collect all physical files
    const physicalFiles = await collectFiles(imagesDir, publicDir);

    // 2. Collect all DB-referenced image paths
    const dbPaths = await getAllDatabaseImagePaths();

    // 3. Find orphans (physical files not in any DB record)
    // WHITELIST: Static infrastructure images that must NEVER be deleted
    const WHITELISTED_PREFIXES = ["/images/container/"];
    const orphans = physicalFiles.filter((file) => {
      if (WHITELISTED_PREFIXES.some((prefix) => file.startsWith(prefix)))
        return false;
      return !dbPaths.has(file);
    });

    // 4. Move orphans to .trash (unless dry run)
    let deletedCount = 0;
    const deletedFiles: string[] = [];
    const failedFiles: string[] = [];
    const trashDir = path.join(publicDir, ".trash");

    if (!dryRun) {
      for (const orphan of orphans) {
        try {
          const absolutePath = path.join(publicDir, orphan);
          const trashPath = path.join(trashDir, orphan);
          const trashFolder = path.dirname(trashPath);

          // Ensure the trash subfolder exists
          await fs.mkdir(trashFolder, { recursive: true });

          // Move file to trash instead of permanent delete
          await fs.rename(absolutePath, trashPath);
          deletedCount++;
          deletedFiles.push(orphan);
        } catch {
          failedFiles.push(orphan);
        }
      }
    }

    return NextResponse.json({
      success: true,
      dryRun,
      summary: {
        totalPhysicalFiles: physicalFiles.length,
        totalDbReferences: dbPaths.size,
        orphansFound: orphans.length,
        deletedCount: dryRun ? 0 : deletedCount,
        failedCount: failedFiles.length,
      },
      orphans: dryRun ? orphans : deletedFiles,
      failed: failedFiles,
    });
  } catch (error) {
    console.error("Cleanup storage error:", error);
    return NextResponse.json(
      {
        error:
          "Cleanup failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    );
  }
}

// GET — Preview what would be cleaned up (always dry run)
export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const publicDir = path.join(process.cwd(), "public");
    const imagesDir = path.join(publicDir, "images");

    const physicalFiles = await collectFiles(imagesDir, publicDir);
    const dbPaths = await getAllDatabaseImagePaths();
    // WHITELIST: Static infrastructure images that must NEVER be deleted
    const WHITELISTED_PREFIXES = ["/images/container/"];
    const orphans = physicalFiles.filter((file) => {
      if (WHITELISTED_PREFIXES.some((prefix) => file.startsWith(prefix)))
        return false;
      return !dbPaths.has(file);
    });

    return NextResponse.json({
      success: true,
      dryRun: true,
      summary: {
        totalPhysicalFiles: physicalFiles.length,
        totalDbReferences: dbPaths.size,
        orphansFound: orphans.length,
      },
      orphans,
    });
  } catch (error) {
    console.error("Cleanup preview error:", error);
    return NextResponse.json(
      {
        error:
          "Preview failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    );
  }
}
