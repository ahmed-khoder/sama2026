'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Package,
  Ship,
  TrendingUp,
  ExternalLink,
  X,
  Mail,
  Briefcase,
  Globe,
  HardDrive
} from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import DynamicLogo from './DynamicLogo';



// Nav items for EMPLOYEE and above (Settings rendered separately, ADMIN-only)
const employeeItems = [
  { key: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/dashboard', permission: 'view_dashboard' },
  { key: 'messages', icon: <Mail className="w-5 h-5" />, href: '/dashboard/messages', permission: 'view_messages' },
  { key: 'shipments', icon: <Ship className="w-5 h-5" />, href: '/dashboard/shipments', permission: 'view_shipments' },
  { key: 'recruitment', icon: <Briefcase className="w-5 h-5" />, href: '/dashboard/careers', permission: 'manage_careers' },
  { key: 'quotes', icon: <FileText className="w-5 h-5" />, href: '/dashboard/quotes', permission: 'view_quotes' },
  { key: 'customers', icon: <Users className="w-5 h-5" />, href: '/dashboard/customers', permission: 'view_customers' },
  { key: 'analytics', icon: <TrendingUp className="w-5 h-5" />, href: '/dashboard/analytics', permission: 'view_analytics' },
  { key: 'inventory', icon: <Package className="w-5 h-5" />, href: '/dashboard/inventory', permission: 'view_inventory' },
  { key: 'blog_management', icon: <FileText className="w-5 h-5" />, href: '/dashboard/blog', permission: 'manage_blog' },
  { key: 'website_settings', icon: <Globe className="w-5 h-5" />, href: '/dashboard/website-settings', permission: 'manage_website' },
];

const clientItems = [
  { key: 'dashboard', icon: <LayoutDashboard className="w-5 h-5" />, href: '/dashboard', permission: 'view_dashboard' },
  { key: 'shipments', icon: <Ship className="w-5 h-5" />, href: '/dashboard/shipments', permission: 'view_shipments' },
  { key: 'quotes', icon: <FileText className="w-5 h-5" />, href: '/dashboard/quotes', permission: 'view_quotes' },
];

interface DashboardSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function DashboardSidebar({ mobileOpen = false, onMobileClose }: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { language, t } = useLanguage();
  const { user: authUser, loading: authLoading, logout, hasPermission } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // ── ترجمة الأدوار ──
  const roleLabels: Record<string, string> = {
    ADMIN: language === 'ar' ? 'مدير النظام' : 'Admin',
    EMPLOYEE: language === 'ar' ? 'موظف' : 'Employee',
    CLIENT: language === 'ar' ? 'عميل' : 'Client',
  };

  useEffect(() => {
    setMounted(true);

    // Auto collapse on small screens (for desktop logic)
    const handleResize = () => {
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    // handleResize(); // Check initial size
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch unread message count — يستخدم endpoint مخصص بدلاً من جلب كل الرسائل
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/contact/unread-count');
        const data = await res.json();
        if (typeof data.count === 'number') {
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };
    fetchUnread();
    // Refresh every 30 seconds
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  // Select items based on role, then filter by permissions
  const userRole = authUser?.role || 'EMPLOYEE';
  const baseItems = userRole === 'CLIENT' ? clientItems : employeeItems;
  const sidebarItems = userRole === 'ADMIN'
    ? baseItems
    : baseItems.filter(item => hasPermission(item.permission));

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-72';
  const isRTL = language === 'ar';

  return (
    <>
      {/* Overlay for Mobile */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <motion.div
        layout
        className={cn(
          "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 flex flex-col transition-all duration-300 ease-in-out shadow-lg z-50",
          // Mobile Styles
          "fixed inset-y-0 h-full w-72 lg:w-auto",
          isRTL ? (mobileOpen ? "right-0" : "-right-full") : (mobileOpen ? "left-0" : "-left-full"),
          // Desktop Styles (Reset mobile styles)
          "lg:static lg:h-screen lg:translate-x-0 lg:inset-auto lg:shadow-none lg:border-r lg:border-l lg:sticky lg:top-0",
          // Collapsed Logic (Desktop only)
          isCollapsed ? "lg:w-20" : "lg:w-72",
          isRTL ? "lg:border-l" : "lg:border-r"
        )}
      >
        {/* Header / Logo Area */}
        <div className="h-20 flex items-center justify-center border-b border-gray-100 dark:border-slate-800 relative shrink-0">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center"
              >
                <DynamicLogo className="h-11 w-48" />
                <span className="text-xs font-bold text-brand-orange tracking-widest mt-1">DASHBOARD</span>
              </motion.div>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <div className="w-10 h-10 bg-marine-600 rounded-lg flex items-center justify-center text-white font-bold">
              SL
            </div>
          )}

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-brand-orange text-white rounded-full items-center justify-center shadow-md hover:bg-brand-darkOrange transition-colors z-50",
              isRTL ? "left-[-12px] right-auto rotate-180" : ""
            )}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={onMobileClose}
            className="lg:hidden absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Snippet (Collapsed vs Expanded) */}
        <div className={cn("p-4 flex items-center gap-3 border-b border-gray-100 dark:border-slate-800 shrink-0", isCollapsed ? "justify-center" : "")}>
          {authLoading || !authUser ? (
            /* ── حالة التحميل: Skeleton بدلاً من "زائر" ── */
            <>
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden space-y-2">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-3 w-16 bg-gray-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              )}
            </>
          ) : (
            /* ── المستخدم الحقيقي ── */
            <>
              <div className="relative">
                <img src={authUser.avatar} alt="User" className="w-10 h-10 rounded-full border-2 border-brand-orange" />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
              </div>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-bold text-sm text-marine-900 dark:text-white truncate">{authUser.name}</h4>
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    {roleLabels[authUser.role] || authUser.role}
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 space-y-2 px-3">
          {sidebarItems.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group",
                "hover:bg-marine-50 dark:hover:bg-slate-800 hover:text-marine-700 dark:hover:text-white",
                "text-gray-600 dark:text-gray-400",
                isCollapsed ? "justify-center" : ""
              )}
              title={t(item.key)}
            >
              <div className={cn("transition-colors", isCollapsed ? "w-6 h-6" : "w-5 h-5")}>
                {item.icon}
              </div>

              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="font-medium flex-1"
                >
                  {t(item.key)}
                </motion.span>
              )}

              {/* Unread Badge for Messages */}
              {item.key === 'messages' && unreadCount > 0 && (
                <span className={cn(
                  "px-1.5 py-0.5 text-xs font-bold rounded-full bg-red-500 text-white min-w-[20px] text-center",
                  isCollapsed && "absolute -top-1 -right-1"
                )}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}

              {/* Hover Tooltip for Collapsed State */}
              {isCollapsed && (
                <div className={cn(
                  "absolute bg-marine-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap",
                  isRTL ? "left-full ml-2" : "left-full ml-2"
                )}>
                  {t(item.key)}
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2 shrink-0">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl text-brand-orange bg-brand-orange/10 hover:bg-brand-orange/20 transition-colors",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <ExternalLink className="w-5 h-5" />
            {!isCollapsed && <span>{t('back_to_site')}</span>}
          </Link>

          <button
            onClick={() => { logout(); }}
            className={cn(
              "flex items-center gap-3 w-full p-3 rounded-xl text-gray-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && <span>{t('logout')}</span>}
          </button>

          {/* Settings — ADMIN only (server also enforces this via middleware) */}
          {authUser?.role === 'ADMIN' && (
            <Link
              href="/dashboard/settings"
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 w-full p-3 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors",
                isCollapsed ? "justify-center" : ""
              )}
            >
              <Settings className="w-5 h-5" />
              {!isCollapsed && <span>{t('settings')}</span>}
            </Link>
          )}
        </div>
      </motion.div>
    </>
  );
}
