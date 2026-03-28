'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardSidebar from '@/components/DashboardSidebar';
import { Bell, Search, Menu, Sun, Moon, RefreshCw, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider, useToast } from '@/contexts/ToastContext';
import { ConfirmProvider } from '@/contexts/ConfirmContext';

// ─── Inner layout (needs access to ToastContext, so lives inside ToastProvider) ──
function DashboardInner({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [odooStatus, setOdooStatus] = useState<'connected' | 'disconnected' | 'loading'>('loading');

  const { theme, toggleTheme } = useTheme();
  const { language, toggleLanguage } = useLanguage();
  const { success, error: toastError } = useToast();

  /**
   * Check Odoo connectivity and, if connected, trigger a server-side cache
   * revalidation via POST /api/odoo/sync. This replaces the old localStorage
   * workaround — caching is now handled server-side by unstable_cache.
   */
  const handleSync = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setOdooStatus('loading');

    try {
      const res = await fetch('/api/odoo/sync', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setOdooStatus('connected');
        success(
          language === 'ar'
            ? 'تمت مزامنة بيانات Odoo بنجاح. ستُحدَّث الصفحات تلقائياً.'
            : 'Odoo data synced. Pages will refresh with fresh data.',
          language === 'ar' ? '✅ مزامنة ناجحة' : '✅ Sync Complete'
        );
      } else {
        setOdooStatus('disconnected');
        toastError(
          data.error || (language === 'ar' ? 'فشل الاتصال بـ Odoo' : 'Failed to connect to Odoo'),
          language === 'ar' ? '❌ فشل المزامنة' : '❌ Sync Failed'
        );
      }
    } catch (err) {
      setOdooStatus('disconnected');
      toastError(
        language === 'ar' ? 'خطأ في الشبكة أثناء الاتصال بـ Odoo' : 'Network error while connecting to Odoo',
        language === 'ar' ? '❌ خطأ في الشبكة' : '❌ Network Error'
      );
    } finally {
      setIsSyncing(false);
    }
  }, [isSyncing, language, success, toastError]);

  // Check connection status on mount (status only, not a full sync)
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/odoo/status');
        const data = await res.json();
        setOdooStatus(data.status === 'connected' ? 'connected' : 'disconnected');
      } catch {
        setOdooStatus('disconnected');
      }
    };
    checkStatus();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Sidebar */}
      <DashboardSidebar
        mobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center flex-1 gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-600 dark:text-gray-300"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Search Bar */}
            <div className="relative w-full max-w-md hidden md:block">
              <input
                type="text"
                placeholder={language === 'ar' ? 'بحث عن شحنة، عميل، أو عرض سعر...' : 'Search for shipment, client, or quote...'}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-orange/50 dark:text-white transition-all"
              />
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 md:gap-3">

            {/* ── Odoo Status Badge + Sync Button ── */}
            <div className="flex items-center gap-1">
              {/* Connection Status Pill */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-s-xl border ${odooStatus === 'connected'
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                  : odooStatus === 'disconnected'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                }`}>
                {odooStatus === 'loading' || isSyncing ? (
                  <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                ) : odooStatus === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs font-bold hidden sm:inline ${odooStatus === 'connected'
                    ? 'text-green-700 dark:text-green-400'
                    : odooStatus === 'disconnected'
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-gray-500'
                  }`}>
                  Odoo
                </span>
              </div>

              {/* Orange Sync Button — POSTs to /api/odoo/sync */}
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-2 px-3 py-2 rounded-e-xl bg-gradient-to-r from-brand-orange to-brand-darkOrange hover:from-brand-darkOrange hover:to-brand-orange text-white text-sm font-medium transition-all disabled:opacity-70 shadow-md hover:shadow-lg hover:shadow-brand-orange/30"
                title={language === 'ar' ? 'مزامنة مع Odoo' : 'Sync with Odoo'}
                aria-label="Sync Odoo data"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 hidden md:block" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title={language === 'ar'
                ? (theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الداكن')
                : (theme === 'dark' ? 'Light Mode' : 'Dark Mode')
              }
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-5 h-5 text-yellow-500" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-5 h-5 text-slate-600" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              title={language === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
            >
              <span className="text-lg">{language === 'ar' ? '🇺🇸' : '🇪🇬'}</span>
              <span className="text-sm font-bold text-gray-700 dark:text-gray-300 hidden sm:inline">
                {language === 'ar' ? 'EN' : 'ع'}
              </span>
            </button>

            {/* Notification Bell */}
            <button
              className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-800" />
            </button>

            {/* Divider */}
            <div className="w-px h-8 bg-gray-200 dark:bg-slate-700 mx-1 hidden md:block" />

            {/* Admin Label */}
            <div className="text-sm text-end hidden md:block">
              <p className="font-bold text-marine-900 dark:text-white">
                {language === 'ar' ? 'لوحة التحكم' : 'Admin Panel'}
              </p>
              <p className="text-xs text-gray-500">v1.0.0</p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// ─── Root layout (provides contexts, then renders inner) ─────────────────────
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <ToastProvider>
        <DashboardInner>{children}</DashboardInner>
      </ToastProvider>
    </ConfirmProvider>
  );
}
