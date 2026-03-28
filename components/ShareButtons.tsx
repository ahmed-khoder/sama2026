'use client';

import React from 'react';
import { Facebook, Twitter, Linkedin, MessageCircle, Link as LinkIcon } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type ShareButtonsProps = {
  title: string;
  url: string; // Should be absolute URL in production, or relative if processed
};

export default function ShareButtons({ title, url }: ShareButtonsProps) {
  const { language } = useLanguage();
  
  // Ensure we have a full URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : url;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      color: 'hover:bg-[#1877F2] hover:text-white',
    },
    {
      name: 'Twitter / X',
      icon: <Twitter className="w-5 h-5" />,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'hover:bg-black hover:text-white',
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'hover:bg-[#0A66C2] hover:text-white',
    },
    {
      name: 'WhatsApp',
      icon: <MessageCircle className="w-5 h-5" />,
      url: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
      color: 'hover:bg-[#25D366] hover:text-white',
    },
  ];

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    alert(language === 'ar' ? 'تم نسخ الرابط!' : 'Link copied!');
  };

  return (
    <div className="flex flex-col gap-4 py-6 border-t border-b border-gray-100 dark:border-slate-800 my-8">
      <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {language === 'ar' ? 'شارك هذا المقال' : 'Share this post'}
      </span>
      <div className="flex flex-wrap gap-3">
        {shareLinks.map((link) => (
          <a
            key={link.name}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all duration-300 ${link.color}`}
            title={link.name}
          >
            {link.icon}
          </a>
        ))}
        <button
          onClick={copyToClipboard}
          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-700 hover:text-white dark:hover:bg-gray-600 transition-all duration-300"
          title={language === 'ar' ? 'نسخ الرابط' : 'Copy Link'}
        >
          <LinkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

