import Image, { ImageProps } from 'next/image';
import { getOptimizedImageProps, generateSimpleBlurDataURL } from '@/lib/imageOptimization';

interface OptimizedImageProps extends Omit<ImageProps, 'src' | 'quality' | 'loading' | 'sizes'> {
    src: string;
    alt: string;
    priority?: boolean;
    context?: 'hero' | 'card' | 'thumbnail' | 'full';
    blurColor?: string;
}

/**
 * Optimized Image Component
 * Automatically applies best practices for image loading
 */
export function OptimizedImage({
    src,
    alt,
    priority = false,
    context = 'full',
    blurColor,
    placeholder = 'blur',
    ...props
}: OptimizedImageProps) {
    const optimizedProps = getOptimizedImageProps(src, priority, context);
    const blurDataURL = blurColor ? generateSimpleBlurDataURL(blurColor) : generateSimpleBlurDataURL();

    return (
        <Image
            {...props}
            {...optimizedProps}
            src={src}
            alt={alt}
            placeholder={placeholder}
            blurDataURL={placeholder === 'blur' ? blurDataURL : undefined}
        />
    );
}
