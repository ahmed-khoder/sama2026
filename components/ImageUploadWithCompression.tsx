'use client';

import React, { useState, useRef, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImageIcon, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';
import Image from 'next/image';

interface ImageUploadProps {
  onUpload: (file: File, preview: string) => void;
  maxSize?: number; // in MB
  accept?: string;
  label?: string;
  hint?: string;
  preview?: string;
  compressionQuality?: number; // 0-1
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Image Upload Component with:
 * - Client-side compression
 * - Preview
 * - Drag & Drop
 * - Validation
 * - Progress indication
 */
export default function ImageUploadWithCompression({
  onUpload,
  maxSize = 5, // 5MB default
  accept = 'image/jpeg,image/png,image/webp',
  label = 'رفع صورة',
  hint = 'اسحب الصورة وأفلتها هنا أو انقر للاختيار',
  preview: initialPreview,
  compressionQuality = 0.8,
  maxWidth = 1920,
  maxHeight = 1080,
}: ImageUploadProps) {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Compress image using Canvas API
   */
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target?.result as string;

        img.onload = () => {
          const canvas = document.createElement('canvas');
          let { width, height } = img;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });

              resolve(compressedFile);
            },
            file.type,
            compressionQuality
          );
        };

        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
    });
  };

  /**
   * Validate file
   */
  const validateFile = (file: File): boolean => {
    // Check file type
    const acceptedTypes = accept.split(',').map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setError('نوع الملف غير مدعوم. يرجى اختيار صورة بصيغة JPG, PNG, أو WebP');
      toast.error('نوع الملف غير مدعوم');
      return false;
    }

    // Check file size
    const maxSizeInBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setError(`حجم الملف كبير جداً. الحد الأقصى ${maxSize}MB`);
      toast.error(`حجم الملف يجب أن يكون أقل من ${maxSize}MB`);
      return false;
    }

    setError(null);
    return true;
  };

  /**
   * Handle file selection
   */
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) return;

    setIsCompressing(true);

    try {
      // Compress image
      const compressedFile = await compressImage(file);

      // Create preview
      const previewUrl = URL.createObjectURL(compressedFile);
      setPreview(previewUrl);

      // Calculate compression ratio
      const compressionRatio = ((1 - compressedFile.size / file.size) * 100).toFixed(0);

      toast.success(
        `تم ضغط الصورة بنجاح (تم توفير ${compressionRatio}% من الحجم)`,
        'نجح الرفع'
      );

      // Call onUpload callback
      onUpload(compressedFile, previewUrl);
    } catch (error) {
      console.error('Image compression error:', error);
      toast.error('فشل ضغط الصورة');
      setError('فشل معالجة الصورة');
    } finally {
      setIsCompressing(false);
    }
  };

  /**
   * Handle drag events
   */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Simulate file input change
    const dt = new DataTransfer();
    dt.items.add(file);
    if (fileInputRef.current) {
      fileInputRef.current.files = dt.files;
      handleFileChange({ target: fileInputRef.current } as any);
    }
  };

  /**
   * Handle remove image
   */
  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Label */}
      {label && (
        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragging
            ? 'border-brand-orange bg-brand-orange/10 scale-105'
            : error
            ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
            : 'border-gray-300 dark:border-slate-600 hover:border-marine-500 dark:hover:border-marine-400 bg-white dark:bg-slate-800'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={isCompressing}
        />

        {/* Preview or Upload Prompt */}
        <AnimatePresence mode="wait">
          {preview && !isCompressing ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative aspect-video"
            >
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-contain"
              />

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-2 left-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors z-10"
                aria-label="حذف الصورة"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Success Indicator */}
              <div className="absolute bottom-2 right-2 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>تم الرفع</span>
              </div>
            </motion.div>
          ) : isCompressing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader2 className="w-12 h-12 text-brand-orange animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                جاري ضغط الصورة...
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 px-6"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-marine-500 to-brand-orange rounded-2xl flex items-center justify-center mb-4">
                {error ? (
                  <AlertCircle className="w-8 h-8 text-white" />
                ) : (
                  <Upload className="w-8 h-8 text-white" />
                )}
              </div>

              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2 text-center">
                {hint}
              </p>

              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                {accept.split(',').map(t => t.split('/')[1].toUpperCase()).join(', ')} • حتى {maxSize}MB
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}

      {/* Info */}
      {!error && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          💡 سيتم ضغط الصورة تلقائياً للحصول على أفضل أداء
        </p>
      )}
    </div>
  );
}
