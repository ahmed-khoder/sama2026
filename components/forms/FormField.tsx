'use client';

import React, { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

// ====================================
// Input Field Component
// ====================================
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      success,
      hint,
      leftIcon,
      rightIcon,
      containerClassName,
      className,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = !!success && !error;

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 mr-1" aria-label="مطلوب">*</span>}
        </label>

        {/* Input Container */}
        <div className="relative">
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              {leftIcon}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error ? `${props.id || props.name}-error` :
              hint ? `${props.id || props.name}-hint` :
              undefined
            }
            className={cn(
              'w-full px-4 py-3 rounded-xl border transition-all duration-200',
              'bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-4',
              leftIcon && 'pr-11',
              rightIcon && 'pl-11',
              hasError && 'border-red-500 focus:ring-red-500/30',
              hasSuccess && 'border-green-500 focus:ring-green-500/30',
              !hasError && !hasSuccess && 'border-gray-300 dark:border-slate-600 focus:ring-marine-500/30 focus:border-marine-500',
              disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900',
              className
            )}
            {...props}
          />

          {/* Right Icon / Status Icon */}
          {(rightIcon || hasError || hasSuccess) && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              {hasError && <AlertCircle className="w-5 h-5 text-red-500" aria-hidden="true" />}
              {hasSuccess && <CheckCircle2 className="w-5 h-5 text-green-500" aria-hidden="true" />}
              {!hasError && !hasSuccess && rightIcon && (
                <span className="text-gray-400 dark:text-gray-500">{rightIcon}</span>
              )}
            </div>
          )}
        </div>

        {/* Error Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${props.id || props.name}-error`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.p>
          )}

          {/* Success Message */}
          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </motion.p>
          )}

          {/* Hint */}
          {hint && !error && !success && (
            <motion.p
              id={`${props.id || props.name}-hint`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"
            >
              <Info className="w-4 h-4 flex-shrink-0" />
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

InputField.displayName = 'InputField';

// ====================================
// Textarea Field Component
// ====================================
interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  success?: string;
  hint?: string;
  containerClassName?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(
  (
    {
      label,
      error,
      success,
      hint,
      containerClassName,
      className,
      required,
      disabled,
      showCharCount,
      maxLength,
      value,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;
    const hasSuccess = !!success && !error;
    const charCount = typeof value === 'string' ? value.length : 0;

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor={props.id || props.name}
            className="block text-sm font-bold text-gray-700 dark:text-gray-300"
          >
            {label}
            {required && <span className="text-red-500 mr-1" aria-label="مطلوب">*</span>}
          </label>

          {/* Character Count */}
          {showCharCount && maxLength && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {charCount} / {maxLength}
            </span>
          )}
        </div>

        {/* Textarea */}
        <textarea
          ref={ref}
          disabled={disabled}
          maxLength={maxLength}
          value={value}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id || props.name}-error` :
            hint ? `${props.id || props.name}-hint` :
            undefined
          }
          className={cn(
            'w-full px-4 py-3 rounded-xl border transition-all duration-200 resize-none',
            'bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
            'placeholder:text-gray-400 dark:placeholder:text-gray-500',
            'focus:outline-none focus:ring-4',
            hasError && 'border-red-500 focus:ring-red-500/30',
            hasSuccess && 'border-green-500 focus:ring-green-500/30',
            !hasError && !hasSuccess && 'border-gray-300 dark:border-slate-600 focus:ring-marine-500/30 focus:border-marine-500',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900',
            className
          )}
          {...props}
        />

        {/* Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${props.id || props.name}-error`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.p>
          )}

          {success && !error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-sm text-green-600 dark:text-green-400 flex items-center gap-1"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              {success}
            </motion.p>
          )}

          {hint && !error && !success && (
            <motion.p
              id={`${props.id || props.name}-hint`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"
            >
              <Info className="w-4 h-4 flex-shrink-0" />
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

TextareaField.displayName = 'TextareaField';

// ====================================
// Select Field Component
// ====================================
interface SelectFieldProps extends InputHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  containerClassName?: string;
}

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(
  (
    {
      label,
      error,
      hint,
      options,
      containerClassName,
      className,
      required,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = !!error;

    return (
      <div className={cn('w-full', containerClassName)}>
        {/* Label */}
        <label
          htmlFor={props.id || props.name}
          className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 mr-1" aria-label="مطلوب">*</span>}
        </label>

        {/* Select */}
        <select
          ref={ref as any}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={
            error ? `${props.id || props.name}-error` :
            hint ? `${props.id || props.name}-hint` :
            undefined
          }
          className={cn(
            'w-full px-4 py-3 rounded-xl border transition-all duration-200',
            'bg-white dark:bg-slate-800 text-gray-900 dark:text-white',
            'focus:outline-none focus:ring-4',
            hasError && 'border-red-500 focus:ring-red-500/30',
            !hasError && 'border-gray-300 dark:border-slate-600 focus:ring-marine-500/30 focus:border-marine-500',
            disabled && 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-slate-900',
            className
          )}
          {...props as any}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Messages */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.p
              id={`${props.id || props.name}-error`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.p>
          )}

          {hint && !error && (
            <motion.p
              id={`${props.id || props.name}-hint`}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"
            >
              <Info className="w-4 h-4 flex-shrink-0" />
              {hint}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
