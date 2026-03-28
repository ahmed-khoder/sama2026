'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useConfirm } from '@/contexts/ConfirmContext';
import { Save, X, Image as ImageIcon, Globe, Type, Upload, Trash2, Plus } from 'lucide-react';
import { createPost, updatePost, deleteGalleryImage, BlogPostInput } from '@/app/actions/blog';
import { uploadImage } from '@/app/actions/upload';

type BlogEditorProps = {
  initialData?: BlogPostInput & { id?: string, gallery?: { id: string, url: string }[] };
  isEditing?: boolean;
  userId: string;
};

export default function BlogEditor({ initialData, isEditing = false, userId }: BlogEditorProps) {
  const { t, language } = useLanguage();
  const { confirm } = useConfirm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ar' | 'en'>('ar');

  const [formData, setFormData] = useState<BlogPostInput>(initialData || {
    titleAr: '',
    titleEn: '',
    contentAr: '',
    contentEn: '',
    slug: '',
    image: '',
    published: false,
    authorId: userId,
    galleryImages: [],
  });

  // Local state for gallery previews (including existing ones from initialData)
  const [gallery, setGallery] = useState<{ id?: string, url: string }[]>(initialData?.gallery || []);

  // Auto-generate slug from English title if empty
  const handleTitleEnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    if (!isEditing && !formData.slug) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-');
      setFormData(prev => ({ ...prev, titleEn: title, slug }));
    } else {
      setFormData(prev => ({ ...prev, titleEn: title }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover: boolean) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploading(true);
    const file = e.target.files[0];
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);

    const res = await uploadImage(uploadFormData);

    if (res.success && res.url) {
      if (isCover) {
        setFormData(prev => ({ ...prev, image: res.url }));
      } else {
        // Add to gallery
        setGallery(prev => [...prev, { url: res.url! }]);
        // Also update formData.galleryImages for submission
        setFormData(prev => ({
          ...prev,
          galleryImages: [...(prev.galleryImages || []), res.url!]
        }));
      }
    } else {
      alert('Upload failed');
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Extract new images for update (in a real app, we'd handle deletions too)
    // For create, we just send all URLs in galleryImages

    const dataToSubmit = {
      ...formData,
      authorId: userId, // Ensure authorId is set
      // If editing, we might want to filter out existing images if the API only accepts NEW ones,
      // but our API action simple implementation accepts a list to add.
      // Let's ensure we pass the URLs of NEW images or all images depending on backend logic.
      // The backend currently `createMany` for the passed array.
      // So for Update, we should only pass NEW images.
      galleryImages: isEditing
        ? gallery.filter(img => !img.id).map(img => img.url) // Only images without ID are new
        : gallery.map(img => img.url)
    };

    try {
      let res;
      if (isEditing && initialData?.id) {
        res = await updatePost(initialData.id, dataToSubmit);
      } else {
        res = await createPost(dataToSubmit);
      }

      if (res.success) {
        router.push('/dashboard/blog');
        router.refresh();
      } else {
        alert('Error saving post: ' + res.error);
      }
    } catch (error) {
      console.error(error);
      alert('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Header Actions */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 sticky top-4 z-30">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditing ? t('blog_edit') : t('blog_create')}
          </h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span>{t('blog_cancel')}</span>
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="px-6 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-darkOrange transition-colors shadow-lg shadow-brand-orange/20 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{t('blog_save')}</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">

            {/* Language Tabs */}
            <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-slate-800 rounded-lg w-fit">
              <button
                type="button"
                onClick={() => setActiveTab('ar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'ar'
                  ? 'bg-white dark:bg-slate-700 text-brand-orange shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                العربية
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'en'
                  ? 'bg-white dark:bg-slate-700 text-brand-orange shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
              >
                English
              </button>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 space-y-6">

              {activeTab === 'ar' ? (
                /* Arabic Fields */
                <div className="space-y-4" dir="rtl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('blog_title_ar')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titleAr}
                      onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-orange/50 outline-none text-lg font-bold"
                      placeholder="عنوان المقال بالعربية"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('blog_content_ar')}
                    </label>
                    <textarea
                      required
                      rows={12}
                      value={formData.contentAr}
                      onChange={(e) => setFormData({ ...formData, contentAr: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-orange/50 outline-none leading-relaxed"
                      placeholder="اكتب محتوى المقال هنا... (يمكنك إضافة روابط صور)"
                    />
                  </div>
                </div>
              ) : (
                /* English Fields */
                <div className="space-y-4" dir="ltr">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('blog_title_en')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.titleEn}
                      onChange={handleTitleEnChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-orange/50 outline-none text-lg font-bold"
                      placeholder="Post Title in English"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('blog_content_en')}
                    </label>
                    <textarea
                      required
                      rows={12}
                      value={formData.contentEn}
                      onChange={(e) => setFormData({ ...formData, contentEn: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-orange/50 outline-none leading-relaxed"
                      placeholder="Write your post content here..."
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Gallery Section */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 space-y-4">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-orange" />
                {language === 'ar' ? 'معرض الصور' : 'Gallery Images'}
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {gallery.map((img, idx) => (
                  <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 group">
                    <img src={img.url} alt="Gallery" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={async () => {
                        const confirmed = await confirm({
                          title: language === 'ar' ? 'حذف الصورة' : 'Delete Image',
                          message: language === 'ar' ? 'هل تريد حذف هذه الصورة من المعرض؟' : 'Remove this image from the gallery?',
                          confirmText: language === 'ar' ? 'حذف' : 'Delete',
                          cancelText: language === 'ar' ? 'إلغاء' : 'Cancel',
                          type: 'danger'
                        });
                        if (!confirmed) return;
                        if (img.id && initialData?.id) {
                          // Existing image — delete from DB
                          await deleteGalleryImage(img.id, initialData.id);
                        }
                        setGallery(prev => prev.filter((_, i) => i !== idx));
                        setFormData(prev => ({
                          ...prev,
                          galleryImages: prev.galleryImages?.filter(u => u !== img.url)
                        }));
                      }}
                      className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                <label className="flex flex-col items-center justify-center aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 cursor-pointer hover:border-brand-orange transition-colors">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-8 h-8 text-gray-400" />
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, false)} disabled={uploading} />
                </label>
              </div>
            </div>

          </div>

          {/* Sidebar Settings Column */}
          <div className="space-y-6">

            {/* Status Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-brand-orange" />
                {t('blog_status')}
              </h3>

              <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-900 rounded-lg cursor-pointer border border-gray-200 dark:border-slate-700 hover:border-brand-orange/50 transition-colors">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {formData.published ? t('blog_published') : t('blog_draft')}
                </span>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-orange/30 dark:peer-focus:ring-brand-orange/80 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-500"></div>
                </div>
              </label>
            </div>

            {/* Cover Image Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-brand-orange" />
                {t('blog_image')}
              </h3>

              <div className="space-y-3">
                {/* URL Input Fallback */}
                <input
                  type="text"
                  value={formData.image || ''}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="URL or Upload"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-brand-orange/50 outline-none"
                />

                {/* Upload Button */}
                <label className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Upload Cover'}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, true)} disabled={uploading} />
                </label>

                {formData.image && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 group">
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                      className="absolute top-2 right-2 p-1.5 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SEO Card */}
            <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Type className="w-4 h-4 text-brand-orange" />
                SEO Settings
              </h3>

              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-500 uppercase">
                  {t('blog_slug')}
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2 text-sm font-mono text-gray-600 dark:text-gray-400 rounded-lg border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 focus:ring-2 focus:ring-brand-orange/50 outline-none"
                />
              </div>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}
