'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Package, Ship, Plane, Truck } from 'lucide-react';
import DynamicLogo from './DynamicLogo';

// ====================================
// Full Page Loading
// ====================================
export function PageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-marine-950 via-marine-900 to-slate-950 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <DynamicLogo className="h-16 w-64 mx-auto" />
        </motion.div>

        {/* Loading Spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-brand-orange/30 border-t-brand-orange rounded-full mx-auto mb-4"
        />

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-white text-lg font-medium"
        >
          جاري التحميل...
        </motion.p>
      </div>
    </div>
  );
}

// ====================================
// Section Loading (For page sections)
// ====================================
export function SectionLoading({ message = 'جاري التحميل...' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-12 h-12 border-3 border-marine-200 dark:border-marine-700 border-t-brand-orange rounded-full mb-4"
      />
      <p className="text-gray-600 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
}

// ====================================
// Card Skeleton Loading
// ====================================
export function CardSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 space-y-4 shadow-lg"
        >
          {/* Header Skeleton */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
              <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-5/6" />
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-4/6" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ====================================
// Table Skeleton Loading
// ====================================
export function TableSkeleton({ rows = 5, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-lg">
      {/* Table Header */}
      <div className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
          ))}
        </div>
      </div>

      {/* Table Rows */}
      <div className="divide-y divide-gray-200 dark:divide-slate-700">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: rowIndex * 0.05 }}
            className="p-4"
          >
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
              {Array.from({ length: cols }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-3 bg-gray-200 dark:bg-slate-700 rounded animate-pulse"
                  style={{ width: `${60 + Math.random() * 40}%` }}
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ====================================
// Button Loading
// ====================================
export function ButtonLoading({ children, loading, ...props }: any) {
  return (
    <button {...props} disabled={loading || props.disabled} className={props.className}>
      {loading ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>جاري المعالجة...</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

// ====================================
// Shipment Tracking Loading
// ====================================
export function ShipmentLoading() {
  const icons = [Ship, Plane, Truck, Package];
  const [activeIcon, setActiveIcon] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setActiveIcon((prev) => (prev + 1) % icons.length);
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const Icon = icons[activeIcon];

  return (
    <div className="flex flex-col items-center justify-center py-16">
      <motion.div
        key={activeIcon}
        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 bg-gradient-to-br from-marine-500 to-brand-orange rounded-2xl flex items-center justify-center mb-4 shadow-lg"
      >
        <Icon className="w-10 h-10 text-white" />
      </motion.div>
      <p className="text-gray-600 dark:text-gray-400 font-medium">جاري تحميل بيانات الشحنة...</p>
    </div>
  );
}

// ====================================
// Dashboard Stats Loading
// ====================================
export function StatsLoading({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-slate-700 rounded-xl animate-pulse" />
            <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded animate-pulse w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ====================================
// Blog Post Loading
// ====================================
export function BlogPostSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Featured Image */}
      <div className="w-full h-96 bg-gray-200 dark:bg-slate-800 rounded-3xl animate-pulse" />

      {/* Title */}
      <div className="space-y-3">
        <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-3/4" />
        <div className="h-10 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-1/2" />
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-200 dark:bg-slate-800 rounded-full animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-1/4" />
          <div className="h-3 bg-gray-200 dark:bg-slate-800 rounded animate-pulse w-1/3" />
        </div>
      </div>

      {/* Content */}
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse"
            style={{ width: `${70 + Math.random() * 30}%` }}
          />
        ))}
      </div>
    </div>
  );
}

// ====================================
// Minimal Inline Spinner
// ====================================
export function Spinner({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={className}
    >
      <Loader2 className="w-full h-full text-brand-orange" />
    </motion.div>
  );
}
