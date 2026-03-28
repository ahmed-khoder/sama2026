'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, Toast as ToastType } from '@/contexts/ToastContext';

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'from-green-500 to-emerald-600',
  error: 'from-red-500 to-rose-600',
  warning: 'from-orange-500 to-amber-600',
  info: 'from-blue-500 to-cyan-600',
};

const bgColors = {
  success: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  error: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  warning: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
  info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
};

const textColors = {
  success: 'text-green-800 dark:text-green-300',
  error: 'text-red-800 dark:text-red-300',
  warning: 'text-orange-800 dark:text-orange-300',
  info: 'text-blue-800 dark:text-blue-300',
};

function ToastItem({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast();
  const Icon = icons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.9 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`relative flex items-start gap-3 p-4 rounded-2xl shadow-lg border backdrop-blur-sm ${bgColors[toast.type]} min-w-[320px] max-w-md`}
    >
      {/* Icon with Gradient Background */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${colors[toast.type]} flex items-center justify-center`}>
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <h4 className={`font-bold text-sm mb-1 ${textColors[toast.type]}`}>
            {toast.title}
          </h4>
        )}
        <p className={`text-sm ${textColors[toast.type]} opacity-90`}>
          {toast.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        onClick={() => removeToast(toast.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center justify-center ${textColors[toast.type]} opacity-50 hover:opacity-100`}
      >
        <X className="w-4 h-4" />
      </button>

      {/* Progress Bar */}
      {toast.duration && (
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: toast.duration / 1000, ease: 'linear' }}
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${colors[toast.type]} rounded-bl-2xl`}
        />
      )}
    </motion.div>
  );
}

export default function ToastContainer() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
