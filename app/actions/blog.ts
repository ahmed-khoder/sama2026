'use server';

import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { linkMedia, unlinkMedia, unlinkAllForEntity } from '@/lib/media-library';

export type BlogPostInput = {
  titleAr: string;
  titleEn: string;
  contentAr: string;
  contentEn: string;
  slug: string;
  image?: string; // Cover Image
  published: boolean;
  authorId: string;
  galleryImages?: string[]; // Array of URLs for gallery
};

export async function createPost(data: BlogPostInput) {
  try {
    // Create Post
    const post = await prisma.blogPost.create({
      data: {
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        contentAr: data.contentAr,
        contentEn: data.contentEn,
        slug: data.slug,
        image: data.image,
        published: data.published,
        authorId: data.authorId,
        gallery: {
          create: data.galleryImages?.map(url => ({ url })) || [],
        }
      },
    });

    // ── Media Library: link cover image ──
    if (data.image) {
      await linkMedia(data.image, 'blog', post.id);
    }

    // ── Media Library: link gallery images ──
    if (data.galleryImages && data.galleryImages.length > 0) {
      for (const url of data.galleryImages) {
        await linkMedia(url, 'blog', post.id);
      }
    }

    revalidatePath('/blog');
    revalidatePath('/dashboard/blog');
    return { success: true, post };
  } catch (error: unknown) {
    console.error('Error creating post:', error);
    return {
      success: false,
      error: `Failed to create post. Error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export async function updatePost(id: string, data: Partial<BlogPostInput>) {
  try {
    // Fetch existing to detect image changes
    const existing = await prisma.blogPost.findUnique({
      where: { id },
      select: { image: true }
    });

    // Update Post fields
    const post = await prisma.blogPost.update({
      where: { id },
      data: {
        titleAr: data.titleAr,
        titleEn: data.titleEn,
        contentAr: data.contentAr,
        contentEn: data.contentEn,
        slug: data.slug,
        image: data.image,
        published: data.published,
      },
    });

    // ── Media Library: sync cover image link/unlink ──
    if (data.image !== undefined && existing) {
      const oldImage = existing.image ?? null;
      if (oldImage && oldImage !== data.image) {
        await unlinkMedia(oldImage, 'blog', id);
      }
      if (data.image && data.image !== oldImage) {
        await linkMedia(data.image, 'blog', id);
      }
    }

    // Handle Gallery Images (Add new ones)
    if (data.galleryImages && data.galleryImages.length > 0) {
      await Promise.all(
        data.galleryImages.map(async (url) => {
          await prisma.blogPostImage.create({
            data: { postId: id, url }
          });
          // ── Media Library: link each new gallery image ──
          await linkMedia(url, 'blog', id);
        })
      );
    }

    revalidatePath('/blog');
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath('/dashboard/blog');
    return { success: true, post };
  } catch (error) {
    console.error('Error updating post:', error);
    return { success: false, error: 'Failed to update post' };
  }
}

export async function deletePost(id: string) {
  try {
    // ── Media Library: unlink all media for this blog post ──
    await unlinkAllForEntity('blog', id);

    await prisma.blogPost.delete({
      where: { id },
    });
    revalidatePath('/blog');
    revalidatePath('/dashboard/blog');
    return { success: true };
  } catch (error) {
    console.error('Error deleting post:', error);
    return { success: false, error: 'Failed to delete post' };
  }
}

export async function deleteGalleryImage(imageId: string, postId: string) {
  try {
    // Fetch the image URL before deleting
    const image = await prisma.blogPostImage.findUnique({
      where: { id: imageId },
      select: { url: true }
    });

    await prisma.blogPostImage.delete({
      where: { id: imageId },
    });

    // ── Media Library: unlink the deleted gallery image ──
    if (image?.url) {
      await unlinkMedia(image.url, 'blog', postId);
    }

    revalidatePath('/blog');
    revalidatePath('/dashboard/blog');
    return { success: true };
  } catch (error) {
    console.error('Error deleting gallery image:', error);
    return { success: false, error: 'Failed to delete image' };
  }
}

export async function getPosts(publishedOnly = true) {
  try {
    const whereClause = publishedOnly ? { published: true } : {};
    const posts = await prisma.blogPost.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { name: true, email: true },
        },
        gallery: true, // Include gallery images
      },
    });
    return { success: true, posts };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return { success: false, posts: [] };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: { name: true },
        },
        gallery: true, // Include gallery images
      },
    });
    return { success: true, post };
  } catch (error) {
    console.error('Error fetching post:', error);
    return { success: false, post: null };
  }
}
