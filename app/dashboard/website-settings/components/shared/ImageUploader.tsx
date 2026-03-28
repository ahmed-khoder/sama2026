'use client';

import { Upload, RefreshCw, Monitor, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ImageUploaderProps {
    folder: string;
    currentImage?: string;
    onUpload: (path: string) => void;
    aspectRatio?: 'video' | 'square' | 'portrait';
    dimensions?: { label: string; size: string };
    deviceIcon?: 'desktop' | 'mobile';
    isRTL?: boolean;
}

export function ImageUploader({
    folder,
    currentImage,
    onUpload,
    aspectRatio = 'video',
    dimensions,
    deviceIcon,
    isRTL = false
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);

    const aspectClasses = {
        video: 'aspect-video',
        square: 'aspect-square',
        portrait: 'aspect-[9/16]'
    };

    const handleUpload = async (file: File) => {
        console.log('📤 Starting image upload:', {
            fileName: file.name,
            fileSize: `${(file.size / 1024).toFixed(1)}KB`,
            folder
        });

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', folder);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            });

            if (res.ok) {
                const data = await res.json();
                console.log('✅ Image uploaded successfully:', {
                    path: data.path,
                    savings: data.savings
                });
                onUpload(data.path);
            } else {
                console.error('❌ Upload failed with status:', res.status);
            }
        } catch (err) {
            console.error('❌ Upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const DeviceIcon = deviceIcon === 'mobile' ? Smartphone : Monitor;

    // Debug: Track when currentImage changes
    useEffect(() => {
        console.log('🖼️ ImageUploader currentImage updated:', {
            hasImage: !!currentImage,
            imagePath: currentImage,
            folder
        });
    }, [currentImage, folder]);

    return (
        <div className="space-y-2">
            {dimensions && (
                <label className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <DeviceIcon className="w-3 h-3" />
                    {dimensions.label} ({dimensions.size})
                </label>
            )}
            <div className={`relative group rounded-xl overflow-hidden border border-gray-200 dark:border-slate-600 ${aspectClasses[aspectRatio]} bg-gray-100 dark:bg-slate-700`}>
                {uploading ? (
                    <div className="w-full h-full flex items-center justify-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-brand-orange" />
                    </div>
                ) : currentImage ? (
                    <img src={currentImage} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 flex-col gap-1">
                        {deviceIcon === 'mobile' ? (
                            <>
                                <Smartphone className="w-6 h-6" />
                                <span className="text-xs">{isRTL ? 'اختياري' : 'Optional'}</span>
                            </>
                        ) : (
                            <Upload className="w-8 h-8" />
                        )}
                    </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <label className="cursor-pointer px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm font-medium flex items-center gap-1">
                        <Upload className="w-4 h-4" />
                        {currentImage ? (isRTL ? 'تغيير' : 'Change') : (isRTL ? 'رفع' : 'Upload')}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    handleUpload(e.target.files[0]);
                                }
                            }}
                        />
                    </label>
                </div>
            </div>
        </div>
    );
}
