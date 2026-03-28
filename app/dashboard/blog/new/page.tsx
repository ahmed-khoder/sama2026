'use client';

import React, { useEffect, useState } from 'react';
import BlogEditor from '@/components/BlogEditor';

export default function NewPostPage() {
  const [userId, setUserId] = useState<string>('');
  
  useEffect(() => {
    // In a real auth setup, this comes from session. 
    // Here we simulate getting the current user ID from localStorage/context
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserId(user.id);
    }
  }, []);

  if (!userId) return null; // Or loading spinner

  return (
    <div className="p-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      <BlogEditor userId={userId} />
    </div>
  );
}

