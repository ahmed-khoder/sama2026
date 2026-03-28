import { useState, useRef, useEffect } from 'react';
import { Upload, RefreshCw, Trash2, Image as ImageIcon, Monitor, Smartphone, Info } from 'lucide-react';

interface SlideImageUploaderProps {
    imageUrl: string | null | undefined;
    type: 'desktop-ar' | 'desktop-en' | 'mobile';
    isRTL: boolean;
    uploading: boolean;
    onImageChange: (file: File) => void;
    onImageDelete: () => void;
}

export function SlideImageUploader({
    imageUrl,
    type,
    isRTL,
    uploading,
    onImageChange,
    onImageDelete
}: SlideImageUploaderProps) {
    const [metadata, setMetadata] = useState<{ width: number; height: number; ratio: string; format: string } | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Check if image is a placeholder
    const isPlaceholder = imageUrl?.includes('placeholder');
    // Treat placeholder as no image for UI purposes
    const hasRealImage = imageUrl && !isPlaceholder;

    // Reset metadata when imageUrl changes
    useEffect(() => {
        if (!hasRealImage) {
            setMetadata(null);
        }
    }, [hasRealImage]);

    const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
        const img = e.currentTarget;
        const width = img.naturalWidth;
        const height = img.naturalHeight;

        // Calculate Ratio (simplified)
        const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(width, height);
        const ratio = `${width / divisor}:${height / divisor}`;

        // Infer format from URL extension
        const format = imageUrl?.split('.').pop()?.toUpperCase().split('?')[0] || 'IMG';

        setMetadata({ width, height, ratio, format });
    };

    // Get label and color based on type
    const getTypeConfig = () => {
        switch (type) {
            case 'desktop-ar':
                return {
                    label: isRTL ? 'ديسكتوب عربي' : 'Desktop AR',
                    icon: <Monitor className="w-3.5 h-3.5" />,
                    color: 'text-green-600 dark:text-green-400',
                    dimensions: '1920×1080',
                    ratio: '16:9'
                };
            case 'desktop-en':
                return {
                    label: isRTL ? 'ديسكتوب إنجليزي' : 'Desktop EN',
                    icon: <Monitor className="w-3.5 h-3.5" />,
                    color: 'text-blue-600 dark:text-blue-400',
                    dimensions: '1920×1080',
                    ratio: '16:9'
                };
            case 'mobile':
                return {
                    label: isRTL ? 'موبايل' : 'Mobile',
                    icon: <Smartphone className="w-3.5 h-3.5" />,
                    color: 'text-brand-orange',
                    dimensions: '1080×1920',
                    ratio: '9:16'
                };
        }
    };

    const config = getTypeConfig();

    return (
        <div className="flex-1 space-y-2">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-xs font-medium ${config.color}`}>
                    {config.icon}
                    {config.label}
                </div>
                {/* Metadata Badge */}
                {metadata && (
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-gray-200 dark:border-slate-700">
                        <span>{metadata.format}</span>
                        <span className="w-px h-2 bg-gray-300 dark:bg-slate-600"></span>
                        <span>{metadata.width}×{metadata.height}</span>
                        <span className="w-px h-2 bg-gray-300 dark:bg-slate-600"></span>
                        <span>{metadata.ratio}</span>
                    </div>
                )}
            </div>

            {/* Upload Area */}
            <div className="relative group">
                <label className={`relative block aspect-video bg-gray-200 dark:bg-slate-800 rounded-lg overflow-hidden cursor-pointer transition-all border-2 ${!hasRealImage ? 'border-dashed border-gray-300 dark:border-slate-700 hover:border-brand-orange/50' : 'border-transparent'
                    }`}>
                    {hasRealImage ? (
                        <img
                            ref={imgRef}
                            src={imageUrl}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            alt={type}
                            onLoad={handleImageLoad}
                        />
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-400 p-4">
                            <div className="flex flex-col items-center gap-1">
                                <ImageIcon className="w-8 h-8 opacity-50" />
                                <span className="text-xs font-medium opacity-70">
                                    {isRTL ? 'اضغط للرفع' : 'Click to upload'}
                                </span>
                            </div>

                            {/* Guidelines */}
                            <div className="text-[10px] text-center space-y-1 bg-gray-100 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-700">
                                <div className="flex items-center justify-center gap-1.5 font-medium text-gray-500 dark:text-gray-400">
                                    <Info className="w-3 h-3" />
                                    <span>{isRTL ? 'مواصفات مفضلة' : 'Recommended'}</span>
                                </div>
                                <div className="space-y-0.5 text-gray-400">
                                    <p>
                                        <span className="opacity-75">{isRTL ? 'الأبعاد' : 'Dim'}:</span>{' '}
                                        <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                                            {config.dimensions}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="opacity-75">{isRTL ? 'النسبة' : 'Ratio'}:</span>{' '}
                                        <span className="font-mono text-xs text-gray-600 dark:text-gray-300">
                                            {config.ratio}
                                        </span>
                                    </p>
                                    <p className="pt-1 border-t border-gray-200 dark:border-slate-600 mt-1">
                                        <span className="opacity-75">{isRTL ? 'الحجم' : 'Size'}:</span>{' '}
                                        <span className="text-brand-orange text-[10px] font-bold">{'< 2MB'}</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Overlay for Upload */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10 backdrop-blur-[2px]">
                        {uploading ? (
                            <RefreshCw className="w-6 h-6 text-white animate-spin" />
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-white">
                                <Upload className="w-6 h-6" />
                                <span className="text-xs font-medium">{isRTL ? 'تغيير الصورة' : 'Change Image'}</span>
                            </div>
                        )}
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onImageChange(file);
                        }}
                    />
                </label>

                {/* Independent Delete Button */}
                {hasRealImage && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onImageDelete();
                        }}
                        title={isRTL ? 'حذف هذه الصورة فقط' : 'Delete this image only'}
                        className="absolute -top-2 -right-2 z-20 p-1.5 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition-transform hover:scale-110 opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                )}
            </div>
        </div>
    );
}
