'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, Loader2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import Link from 'next/link';
import { getPosts, deletePost } from '@/app/actions/blog';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

type BlogPost = {
  id: string;
  titleAr: string;
  titleEn: string;
  published: boolean;
  createdAt: Date;
  author: { name: string | null };
};

export default function BlogDashboard() {
  const { t, language } = useLanguage();
  const { confirm } = useConfirm();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPosts = async () => {
    setLoading(true);
    const res = await getPosts(false); // Fetch all posts (drafts + published)
    if (res.success) {
      // @ts-ignore
      setPosts(res.posts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: language === 'ar' ? 'حذف المقال' : 'Delete Post',
      message: language === 'ar' ? 'هل أنت متأكد من حذف هذا المقال؟' : 'Are you sure you want to delete this post?',
      confirmText: language === 'ar' ? 'حذف' : 'Delete',
      cancelText: language === 'ar' ? 'إلغاء' : 'Cancel',
      type: 'danger'
    });
    if (confirmed) {
      const res = await deletePost(id);
      if (res.success) {
        fetchPosts();
      } else {
        alert('Error deleting post');
      }
    }
  };

  const filteredPosts = posts.filter(post =>
    post.titleEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.titleAr.includes(searchTerm)
  );

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-marine-900 dark:text-white">{t('blog_management')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {language === 'ar' ? 'إدارة جميع مقالات المدونة' : 'Manage all blog posts'}
          </p>
        </div>

        <Link
          href="/dashboard/blog/new"
          className="flex items-center justify-center gap-2 bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-brand-darkOrange transition-colors shadow-lg shadow-brand-orange/20"
        >
          <Plus className="w-4 h-4" />
          <span>{t('blog_create')}</span>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 rtl:right-3 rtl:left-auto" />
          <input
            type="text"
            placeholder={language === 'ar' ? 'بحث عن مقال...' : 'Search posts...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/50 rtl:pr-10 rtl:pl-4"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 text-brand-orange animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-slate-900 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3">{language === 'ar' ? 'العنوان' : 'Title'}</th>
                  <th className="px-6 py-3">{t('blog_status')}</th>
                  <th className="px-6 py-3">{language === 'ar' ? 'تاريخ النشر' : 'Date'}</th>
                  <th className="px-6 py-3">{language === 'ar' ? 'الكاتب' : 'Author'}</th>
                  <th className="px-6 py-3 text-center">{language === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.length > 0 ? filteredPosts.map((post) => (
                  <tr key={post.id} className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex flex-col">
                        <span>{language === 'ar' ? post.titleAr : post.titleEn}</span>
                        <span className="text-xs text-gray-500">{language === 'ar' ? post.titleEn : post.titleAr}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${post.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                        {post.published ? t('blog_published') : t('blog_draft')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {format(new Date(post.createdAt), 'PPP', { locale: language === 'ar' ? ar : enUS })}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      {post.author.name || 'Unknown'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/dashboard/blog/${post.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:hover:bg-blue-900/20 transition-colors"
                          title={t('blog_edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:hover:bg-red-900/20 transition-colors"
                          title={t('blog_delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {language === 'ar' ? 'لا توجد مقالات حتى الآن' : 'No posts found yet'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

