'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Omit event handlers that conflict with framer-motion's types
type SafeButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onAnimationStart' | 'onDrag' | 'onDragStart' | 'onDragEnd'>;

interface AccessibleButtonProps extends SafeButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  ariaLabel?: string;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-gradient-to-r from-brand-orange to-brand-darkOrange text-white hover:shadow-lg hover:scale-105',
  secondary: 'bg-marine-600 hover:bg-marine-700 text-white',
  ghost: 'bg-white/10 hover:bg-white/20 border border-white/20 text-gray-900 dark:text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
};

const sizes = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-8 py-4 text-lg',
};

/**
 * Accessible Button Component with:
 * - ARIA attributes
 * - Keyboard navigation
 * - Loading states
 * - Focus management
 */
export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText = 'جاري المعالجة...',
      leftIcon,
      rightIcon,
      ariaLabel,
      disabled,
      fullWidth,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
        whileTap={!disabled && !loading ? { scale: 0.98 } : {}}
        disabled={disabled || loading}
        aria-label={ariaLabel || (typeof children === 'string' ? children : undefined)}
        aria-busy={loading}
        aria-disabled={disabled || loading}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300',
          'focus:outline-none focus:ring-4 focus:ring-brand-orange/30',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {/* Loading Spinner */}
        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            {loadingText && <span className="mr-2">{loadingText}</span>}
          </motion.div>
        )}

        {/* Content */}
        <span className={cn('flex items-center gap-2', loading && 'invisible')}>
          {leftIcon && <span aria-hidden="true">{leftIcon}</span>}
          {children}
          {rightIcon && <span aria-hidden="true">{rightIcon}</span>}
        </span>
      </motion.button>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';

export default AccessibleButton;
