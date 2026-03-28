// Blog types
export interface BlogPostAuthor {
    name: string | null;
    email?: string | null;
}

export interface BlogPostImage {
    id: string;
    url: string;
    caption?: string | null;
}

export interface BlogPost {
    id: string;
    titleAr: string;
    titleEn: string;
    contentAr: string;
    contentEn: string;
    slug: string;
    image?: string | null;
    published: boolean;
    authorId: string;
    author: BlogPostAuthor;
    gallery?: BlogPostImage[];
    createdAt: Date;
    updatedAt: Date;
}

export type BlogPostListItem = Pick<
    BlogPost,
    'id' | 'titleAr' | 'titleEn' | 'contentAr' | 'contentEn' | 'slug' | 'image' | 'createdAt' | 'author'
>;
