'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface BlogGalleryProps {
    images: {
        id: string;
        url: string;
        caption?: string | null;
    }[];
    isRTL?: boolean;
}

export default function BlogGallery({ images, isRTL = false }: BlogGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!images || images.length === 0) return null;

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') setIsLightboxOpen(false);
    };

    return (
        <div className="my-10 space-y-4">
            {/* Main Image View */}
            <div
                className="relative aspect-video w-full overflow-hidden rounded-2xl group cursor-pointer shadow-xl border border-gray-100 dark:border-slate-800 bg-gray-100 dark:bg-slate-900"
                onClick={() => setIsLightboxOpen(true)}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={images[currentIndex].url}
                        alt={images[currentIndex].caption || `Gallery image ${currentIndex + 1}`}
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="h-full w-full object-cover"
                    />
                </AnimatePresence>

                {/* Overlay with Caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    {images[currentIndex].caption && (
                        <p className="text-white text-lg font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            {images[currentIndex].caption}
                        </p>
                    )}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md p-2 rounded-lg text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Maximize2 className="w-5 h-5" />
                    </div>
                </div>

                {/* Navigation Arrows (Desktop) */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <button
                        onClick={isRTL ? nextImage : prevImage}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white pointer-events-auto transition-all transform hover:scale-110 active:scale-95"
                    >
                        {isRTL ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
                    </button>
                    <button
                        onClick={isRTL ? prevImage : nextImage}
                        className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white pointer-events-auto transition-all transform hover:scale-110 active:scale-95"
                    >
                        {isRTL ? <ChevronLeft className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                {images.map((image, idx) => (
                    <button
                        key={image.id}
                        onClick={() => setCurrentIndex(idx)}
                        className={cn(
                            "relative flex-shrink-0 w-24 h-16 rounded-lg overflow-hidden transition-all duration-300 snap-start border-2",
                            currentIndex === idx
                                ? "ring-2 ring-brand-orange ring-offset-2 dark:ring-offset-slate-950 border-transparent scale-105"
                                : "border-transparent opacity-60 hover:opacity-100"
                        )}
                    >
                        <img
                            src={image.url}
                            alt={`Thumbnail ${idx}`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <div
                        className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-4"
                        onClick={() => setIsLightboxOpen(false)}
                        onKeyDown={handleKeyDown}
                        tabIndex={0}
                    >
                        {/* Close Button */}
                        <button
                            className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
                            onClick={() => setIsLightboxOpen(false)}
                        >
                            <X className="w-8 h-8" />
                        </button>

                        {/* Arrows */}
                        <button
                            onClick={isRTL ? nextImage : prevImage}
                            className="absolute left-4 md:left-10 p-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
                        >
                            {isRTL ? <ChevronRight className="w-8 h-8" /> : <ChevronLeft className="w-8 h-8" />}
                        </button>

                        <button
                            onClick={isRTL ? prevImage : nextImage}
                            className="absolute right-4 md:right-10 p-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all z-50"
                        >
                            {isRTL ? <ChevronLeft className="w-8 h-8" /> : <ChevronRight className="w-8 h-8" />}
                        </button>

                        {/* Main Lightbox Image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="relative max-w-7xl max-h-[90vh] w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={images[currentIndex].url}
                                alt={images[currentIndex].caption || ''}
                                className="max-w-full max-h-full object-contain rounded-md shadow-2xl"
                            />
                            {images[currentIndex].caption && (
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md px-6 py-3 rounded-full text-white text-center">
                                    {images[currentIndex].caption}
                                </div>
                            )}
                        </motion.div>

                        {/* Counter */}
                        <div className="absolute top-6 left-6 text-white/80 font-mono text-sm tracking-widest">
                            {currentIndex + 1} / {images.length}
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
