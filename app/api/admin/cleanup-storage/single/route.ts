/**
 * Admin: Delete a SINGLE orphan file
 *
 * Safety: Re-verifies the file is truly orphaned (not in any DB record)
 * before moving it to .trash. Rejects deletion of any in-use file.
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getUserFromRequest } from "@/lib/auth-middleware";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ── Reuse the same comprehensive DB scan from the parent route ──────
async function getAllDatabaseImagePaths(): Promise<Set<string>> {
  const paths = new Set<string>();

  const addIfValid = (url: string | null | undefined) => {
    if (url && url.startsWith("/") && url.trim().length > 0) {
      paths.add(url);
    }
  };

  const heroSlides = await prisma.heroSlide.findMany({
    select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true },
  });
  for (const s of heroSlides) {
    addIfValid(s.imageDesktopAr);
    addIfValid(s.imageDesktopEn);
    addIfValid(s.imageMobile);
  }

  const svcHeroSlides = await prisma.servicesHeroSlide.findMany({
    select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true },
  });
  for (const s of svcHeroSlides) {
    addIfValid(s.imageDesktopAr);
    addIfValid(s.imageDesktopEn);
    addIfValid(s.imageMobile);
  }

  const aboutHeroSlides = await prisma.aboutHeroSlide.findMany({
    select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true },
  });
  for (const s of aboutHeroSlides) {
    addIfValid(s.imageDesktopAr);
    addIfValid(s.imageDesktopEn);
    addIfValid(s.imageMobile);
  }

  const careersHeroSlides = await prisma.careersHeroSlide.findMany({
    select: { imageDesktopAr: true, imageDesktopEn: true, imageMobile: true },
  });
  for (const s of careersHeroSlides) {
    addIfValid(s.imageDesktopAr);
    addIfValid(s.imageDesktopEn);
    addIfValid(s.imageMobile);
  }

  const services = await prisma.service.findMany({
    select: { image: true, imageMobile: true },
  });
  for (const s of services) {
    addIfValid(s.image);
    addIfValid(s.imageMobile);
  }

  const serviceImages = await prisma.serviceImage.findMany({
    select: { url: true },
  });
  for (const img of serviceImages) {
    addIfValid(img.url);
  }

  const teamMembers = await prisma.teamMember.findMany({
    select: { image: true },
  });
  for (const t of teamMembers) {
    addIfValid(t.image);
  }

  const milestones = await prisma.milestone.findMany({
    select: { image: true },
  });
  for (const m of milestones) {
    addIfValid(m.image);
  }

  const trucks = await prisma.fleetTruck.findMany({
    select: { image: true },
  });
  for (const t of trucks) {
    addIfValid(t.image);
  }

  const ports = await prisma.portOperation.findMany({
    select: { image: true },
  });
  for (const p of ports) {
    addIfValid(p.image);
  }

  const aboutWhyImages = await prisma.aboutWhyImage.findMany({
    select: { url: true },
  });
  for (const img of aboutWhyImages) {
    addIfValid(img.url);
  }

  const blogPosts = await prisma.blogPost.findMany({
    select: { image: true, contentAr: true, contentEn: true },
  });
  const imgRegex = /<img[^>]+src="([^">]+)"/g;
  for (const p of blogPosts) {
    addIfValid(p.image);
    const arMatches = [...(p.contentAr || "").matchAll(imgRegex)];
    arMatches.forEach((m) => addIfValid(m[1]));
    const enMatches = [...(p.contentEn || "").matchAll(imgRegex)];
    enMatches.forEach((m) => addIfValid(m[1]));
  }

  const blogImages = await prisma.blogPostImage.findMany({
    select: { url: true },
  });
  for (const img of blogImages) {
    addIfValid(img.url);
  }

  const blogHero = await prisma.blogHeroSettings.findUnique({
    where: { id: "default" },
    select: { image: true },
  });
  if (blogHero) {
    addIfValid(blogHero.image);
  }

  const users = await prisma.user.findMany({
    select: { avatar: true },
  });
  for (const u of users) {
    addIfValid(u.avatar);
  }

  const applications = await prisma.jobApplication.findMany({
    select: { cvUrl: true },
  });
  for (const a of applications) {
    addIfValid(a.cvUrl);
  }

  const accreditations = await prisma.accreditation.findMany({
    select: { logo: true },
  });
  for (const acc of accreditations) {
    addIfValid(acc.logo);
  }

  return paths;
}

// DELETE — Delete a single orphan file (Admin only)
export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const filePath: string | undefined = body?.filePath;

    if (!filePath || typeof filePath !== "string") {
      return NextResponse.json(
        { error: "filePath is required" },
        { status: 400 },
      );
    }

    // Security: Only allow paths under /images/
    if (!filePath.startsWith("/images/")) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 },
      );
    }

    // Prevent path traversal
    if (filePath.includes("..")) {
      return NextResponse.json(
        { error: "Invalid file path" },
        { status: 400 },
      );
    }

    // WHITELIST check
    const WHITELISTED_PREFIXES = ["/images/container/"];
    if (WHITELISTED_PREFIXES.some((prefix) => filePath.startsWith(prefix))) {
      return NextResponse.json(
        { error: "This file is whitelisted and cannot be deleted" },
        { status: 403 },
      );
    }

    // ── SAFETY CHECK: Re-verify file is NOT in any DB record ──────
    const dbPaths = await getAllDatabaseImagePaths();

    if (dbPaths.has(filePath)) {
      return NextResponse.json(
        {
          error: "BLOCKED",
          message:
            "This file is currently used in the system and cannot be deleted.",
          messageAr:
            "لا يمكن حذف هذه الصورة لأنها مستخدمة في النظام",
        },
        { status: 409 },
      );
    }

    // ── Verify file exists ────────────────────────────────────────
    const publicDir = path.join(process.cwd(), "public");
    const absolutePath = path.join(publicDir, filePath);

    try {
      await fs.access(absolutePath);
    } catch {
      return NextResponse.json(
        { error: "File not found" },
        { status: 404 },
      );
    }

    // ── Move to .trash ────────────────────────────────────────────
    const trashDir = path.join(publicDir, ".trash");
    const trashPath = path.join(trashDir, filePath);
    const trashFolder = path.dirname(trashPath);

    await fs.mkdir(trashFolder, { recursive: true });
    await fs.rename(absolutePath, trashPath);

    return NextResponse.json({
      success: true,
      deletedFile: filePath,
    });
  } catch (error) {
    console.error("Single orphan delete error:", error);
    return NextResponse.json(
      {
        error:
          "Delete failed: " +
          (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    );
  }
}
