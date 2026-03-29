/**
 * Media Library Service — Enterprise Unlink Architecture
 *
 * Central service for the Media/MediaUsage system.
 * Every uploaded image is registered as a Media record.
 * Every time an entity (hero, blog, team, etc.) references that image
 * a MediaUsage "link" is created. Removing the link = "unlink".
 * Physical file deletion only happens when the last link is removed.
 */

import { prisma } from '@/lib/db';
import { deletePhysicalFile } from '@/lib/delete-file';

type MediaEntity = 'hero' | 'about' | 'blog' | 'milestone' | 'service' | 'team' | 'career' | 'accreditation';

// ─── Register / Upsert ──────────────────────────────────────────────

interface RegisterMediaInput {
  url: string;
  fileName?: string | null;
  mimeType?: string | null;
  size?: number | null;
  width?: number | null;
  height?: number | null;
}

/**
 * Register an uploaded file as a Media record (idempotent by URL).
 * If the URL already exists, the existing record is returned.
 */
export async function registerMedia(input: RegisterMediaInput) {
  const existing = await prisma.media.findFirst({
    where: { url: input.url },
  });

  if (existing) return existing;

  return prisma.media.create({
    data: {
      url: input.url,
      fileName: input.fileName ?? null,
      mimeType: input.mimeType ?? null,
      size: input.size ?? null,
      width: input.width ?? null,
      height: input.height ?? null,
    },
  });
}

// ─── Link / Unlink ──────────────────────────────────────────────────

/**
 * Link a Media item to an entity (idempotent via composite unique).
 * If the media URL is not yet registered, it will be auto-registered first.
 */
export async function linkMedia(
  url: string,
  entity: MediaEntity,
  entityId: string
) {
  let media = await prisma.media.findFirst({ where: { url } });
  if (!media) {
    media = await registerMedia({ url });
  }

  return prisma.mediaUsage.upsert({
    where: {
      mediaId_entity_entityId: {
        mediaId: media.id,
        entity,
        entityId,
      },
    },
    create: {
      mediaId: media.id,
      entity,
      entityId,
    },
    update: {},
  });
}

/**
 * Unlink a Media item from an entity.
 * If the media has no remaining usages, the physical file is trashed.
 */
export async function unlinkMedia(
  url: string,
  entity: MediaEntity,
  entityId: string
) {
  const media = await prisma.media.findFirst({ where: { url } });
  if (!media) return null;

  try {
    await prisma.mediaUsage.delete({
      where: {
        mediaId_entity_entityId: {
          mediaId: media.id,
          entity,
          entityId,
        },
      },
    });
  } catch {
    return null;
  }

  const remainingCount = await prisma.mediaUsage.count({
    where: { mediaId: media.id },
  });

  if (remainingCount === 0) {
    await deletePhysicalFile(media.url);
    await prisma.media.delete({ where: { id: media.id } });
    console.log(`🗑️ Media orphaned & trashed: ${media.url}`);
    return { deleted: true, url: media.url };
  }

  return { deleted: false, remainingUsages: remainingCount };
}

/**
 * Unlink ALL media usages for a given entity record.
 * Useful when deleting an entity (e.g., deleting a team member).
 */
export async function unlinkAllForEntity(
  entity: MediaEntity,
  entityId: string
) {
  const usages = await prisma.mediaUsage.findMany({
    where: { entity, entityId },
    include: { media: true },
  });

  const results = [];
  for (const usage of usages) {
    const result = await unlinkMedia(usage.media.url, entity, entityId);
    results.push(result);
  }
  return results;
}

// ─── Query Helpers ──────────────────────────────────────────────────

/** Get all usages for a given media item. */
export async function getMediaUsages(mediaId: string) {
  return prisma.mediaUsage.findMany({
    where: { mediaId },
    orderBy: { entity: 'asc' },
  });
}

/** Find all Media records with zero usages (orphans). */
export async function getOrphanedMedia() {
  return prisma.media.findMany({
    where: { usages: { none: {} } },
    orderBy: { createdAt: 'desc' },
  });
}

/** Delete all orphaned media records and trash their physical files. */
export async function cleanupOrphanedMedia() {
  const allOrphans = await getOrphanedMedia();

  // WHITELIST: Never delete container infrastructure images
  const orphans = allOrphans.filter(o => !o.url.startsWith('/images/container/'));

  let trashed = 0;
  for (const orphan of orphans) {
    const moved = await deletePhysicalFile(orphan.url);
    if (moved) trashed++;
    await prisma.media.delete({ where: { id: orphan.id } });
  }

  console.log(`🧹 Cleaned up ${orphans.length} orphaned media (${trashed} files trashed)`);
  return { cleaned: orphans.length, trashed };
}

// ─── Entity Reference Cleanup ───────────────────────────────────────

/**
 * Helper: Nullify image fields on a record that match the given URL.
 * Returns true if any field was updated.
 */
async function nullifyImageFields(
  model: any,
  entityId: string,
  mediaUrl: string,
  imageFields: string[]
): Promise<boolean> {
  try {
    const record = await model.findUnique({ where: { id: entityId } });
    if (!record) return false;

    const updates: Record<string, null> = {};
    for (const field of imageFields) {
      if (record[field] === mediaUrl) {
        updates[field] = null;
      }
    }

    if (Object.keys(updates).length > 0) {
      await model.update({ where: { id: entityId }, data: updates });
      console.log(`🔗 Nullified ${Object.keys(updates).join(', ')} on ${entityId}`);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Clean up ALL actual entity records that reference a media URL.
 *
 * When a media item is force-deleted from the Storage Library, the Media +
 * MediaUsage rows are removed, but the ACTUAL entity records (HeroSlide,
 * Service, TeamMember, AboutWhyImage, etc.) still hold the dead URL.
 *
 * This function finds and removes/nullifies every reference so the image
 * disappears from the dashboard AND the public site.
 */
export async function cleanupEntityReferences(
  mediaUrl: string,
  usages: { entity: string; entityId: string }[]
): Promise<{ cleaned: number; details: string[] }> {
  const details: string[] = [];
  let cleaned = 0;

  for (const usage of usages) {
    try {
      switch (usage.entity) {
        // ── HERO ──────────────────────────────────────────────────
        case 'hero': {
          // HeroSlide only
          const heroSlide = await nullifyImageFields(
            prisma.heroSlide, usage.entityId, mediaUrl,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']
          );
          if (heroSlide) { cleaned++; details.push(`HeroSlide ${usage.entityId}`); }
          break;
        }

        // ── ABOUT ─────────────────────────────────────────────────
        case 'about': {
          // Could be: AboutHeroSlide or AboutWhyImage
          const aboutSlide = await nullifyImageFields(
            prisma.aboutHeroSlide, usage.entityId, mediaUrl,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']
          );
          if (aboutSlide) { cleaned++; details.push(`AboutHeroSlide ${usage.entityId}`); break; }

          // AboutWhyImage — delete the entire record (it IS the image)
          const aboutWhyImg = await prisma.aboutWhyImage.findUnique({ where: { id: usage.entityId } });
          if (aboutWhyImg && aboutWhyImg.url === mediaUrl) {
            await prisma.aboutWhyImage.delete({ where: { id: usage.entityId } });
            cleaned++;
            details.push(`AboutWhyImage ${usage.entityId} (deleted)`);
            break;
          }

          // HeroSettings.aboutSectionImages — remove URL from comma-separated list
          if (usage.entityId === 'default') {
            const hs = await prisma.heroSettings.findUnique({ where: { id: 'default' }, select: { aboutSectionImages: true } });
            if (hs?.aboutSectionImages?.includes(mediaUrl)) {
              const urls = hs.aboutSectionImages.split(',').filter(Boolean).map(u => u.trim()).filter(u => u !== mediaUrl);
              await prisma.heroSettings.update({ where: { id: 'default' }, data: { aboutSectionImages: urls.join(',') } });
              cleaned++;
              details.push(`HeroSettings.aboutSectionImages (removed URL)`);
            }
          }

          break;
        }

        // ── SERVICE ───────────────────────────────────────────────
        case 'service': {
          // Could be: Service, ServicesHeroSlide, FleetTruck, PortOperation, ServiceImage
          const service = await nullifyImageFields(
            prisma.service, usage.entityId, mediaUrl,
            ['image', 'imageMobile']
          );
          if (service) { cleaned++; details.push(`Service ${usage.entityId}`); break; }

          const svcSlide = await nullifyImageFields(
            prisma.servicesHeroSlide, usage.entityId, mediaUrl,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']
          );
          if (svcSlide) { cleaned++; details.push(`ServicesHeroSlide ${usage.entityId}`); break; }

          const truck = await nullifyImageFields(
            prisma.fleetTruck, usage.entityId, mediaUrl,
            ['image']
          );
          if (truck) { cleaned++; details.push(`FleetTruck ${usage.entityId}`); break; }

          const port = await nullifyImageFields(
            prisma.portOperation, usage.entityId, mediaUrl,
            ['image']
          );
          if (port) { cleaned++; details.push(`PortOperation ${usage.entityId}`); break; }

          // ServiceImage — delete the entire record (it IS the image)
          const svcImg = await prisma.serviceImage.findUnique({ where: { id: usage.entityId } });
          if (svcImg && svcImg.url === mediaUrl) {
            await prisma.serviceImage.delete({ where: { id: usage.entityId } });
            cleaned++;
            details.push(`ServiceImage ${usage.entityId} (deleted)`);
          }

          break;
        }

        // ── TEAM ──────────────────────────────────────────────────
        case 'team': {
          const team = await nullifyImageFields(
            prisma.teamMember, usage.entityId, mediaUrl,
            ['image']
          );
          if (team) { cleaned++; details.push(`TeamMember ${usage.entityId}`); }
          break;
        }

        // ── MILESTONE ─────────────────────────────────────────────
        case 'milestone': {
          const ms = await nullifyImageFields(
            prisma.milestone, usage.entityId, mediaUrl,
            ['image']
          );
          if (ms) { cleaned++; details.push(`Milestone ${usage.entityId}`); }
          break;
        }

        // ── BLOG ──────────────────────────────────────────────────
        case 'blog': {
          // Could be: BlogPost or BlogHeroSettings (entityId = 'blog-hero-default')
          if (usage.entityId === 'blog-hero-default') {
            const hero = await prisma.blogHeroSettings.findUnique({ where: { id: 'default' } });
            if (hero && hero.image === mediaUrl) {
              await prisma.blogHeroSettings.update({
                where: { id: 'default' },
                data: { image: null },
              });
              cleaned++;
              details.push('BlogHeroSettings (image nullified)');
            }
          } else {
            const blog = await nullifyImageFields(
              prisma.blogPost, usage.entityId, mediaUrl,
              ['image']
            );
            if (blog) { cleaned++; details.push(`BlogPost ${usage.entityId}`); }
          }
          break;
        }

        // ── CAREER ────────────────────────────────────────────────
        case 'career': {
          // Could be: CareersHeroSlide or JobListing (unlikely to have images)
          const careerSlide = await nullifyImageFields(
            prisma.careersHeroSlide, usage.entityId, mediaUrl,
            ['imageDesktopAr', 'imageDesktopEn', 'imageMobile']
          );
          if (careerSlide) { cleaned++; details.push(`CareersHeroSlide ${usage.entityId}`); }
          break;
        }

        default:
          // ── ACCREDITATION ─────────────────────────────────────────
          if (usage.entity === 'accreditation') {
            const accred = await prisma.accreditation.findUnique({ where: { id: usage.entityId } });
            if (accred && accred.logo === mediaUrl) {
              await prisma.accreditation.delete({ where: { id: usage.entityId } });
              cleaned++;
              details.push(`Accreditation ${usage.entityId} (deleted)`);
              break;
            }
          }
          console.warn(`⚠️ Unknown entity type: ${usage.entity}`);
      }
    } catch (err) {
      console.error(`Error cleaning ${usage.entity}:${usage.entityId}`, err);
    }
  }

  console.log(`🧹 Cleaned ${cleaned} entity reference(s): ${details.join(', ')}`);
  return { cleaned, details };
}

