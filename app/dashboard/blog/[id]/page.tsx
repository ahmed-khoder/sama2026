'use client';

import React, { useEffect, useState } from 'react';
import BlogEditor from '@/components/BlogEditor';
import { getPosts } from '@/app/actions/blog';
import { Loader2 } from 'lucide-react';

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [userId, setUserId] = useState<string>('');
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    }

    // Fetch post data
    // Note: We use getPosts(false) to find the post among all posts, 
    // but ideally we should have a direct getPostById action. 
    // For simplicity in this iteration, we fetch all and find.
    const loadPost = async () => {
      const res = await getPosts(false);
      if (res.success) {
        const foundPost = res.posts.find((p: { id: string }) => p.id === params.id);
        if (foundPost) {
          setPost(foundPost);
        }
      }
      setLoading(false);
    };
    loadPost();
  }, [params.id]);

  if (!userId || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-900">
        <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
      </div>
    );
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <BlogEditor userId={userId} isEditing initialData={post} />
    </div>
  );
}

