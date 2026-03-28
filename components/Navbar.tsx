'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Ship, Info, Phone, Menu, X, Moon, Sun, Newspaper, LogOut, LayoutDashboard, User, Building2, Briefcase } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import DynamicLogo from './DynamicLogo';
import { SaudiFlag, UKFlag } from '@/components/icons/Flags';

interface NavItem {
  key: string;
  icon: React.ReactNode;
  href: string;
}

const navItems: NavItem[] = [
  { key: 'home', icon: <Home className="w-4 h-4" />, href: '/' },
  { key: 'services', icon: <Ship className="w-4 h-4" />, href: '/services' },
  { key: 'careers', icon: <Briefcase className="w-4 h-4" />, href: '/careers' },
  { key: 'blog', icon: <Newspaper className="w-4 h-4" />, href: '/blog' },
  { key: 'about', icon: <Info className="w-4 h-4" />, href: '/about' },
  { key: 'contact', icon: <Phone className="w-4 h-4" />, href: '/contact' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const pathname = usePathname();

  // Smart scroll for show/hide navbar (throttled with rAF)
  useEffect(() => {
    let ticking = false;
    let lastY = lastScrollY;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      requestAnimationFrame(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY < 50) {
          setIsVisible(true);
        } else if (currentScrollY < lastY) {
          setIsVisible(true);
        } else if (currentScrollY > lastY && currentScrollY > 100) {
          setIsVisible(false);
          setIsUserMenuOpen(false);
        }

        lastY = currentScrollY;
        setLastScrollY(currentScrollY);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <motion.nav
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 
          backdrop-blur-xl backdrop-saturate-150 shadow-sm border-b
          bg-gradient-to-r from-white/40 via-marine-50/30 to-brand-orange/5
          dark:from-slate-900/60 dark:via-marine-900/40 dark:to-brand-orange/10
          border-white/20 dark:border-slate-700/30
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo - SAMA Logistics */}
            <Link href="/" className="flex-shrink-0 flex items-center group cursor-pointer">
              <DynamicLogo className="h-14 w-60" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 rtl:space-x-reverse">
              {navItems.map((item) => (
                <NavLink key={item.key} item={item} t={t} pathname={pathname} />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">

              {/* Desktop User Menu / Login */}
              <div className="hidden md:block relative">
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white hover:shadow-md transition-all"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full border border-gray-200 dark:border-slate-600"
                      />
                      <span className="text-sm font-bold text-marine-900 dark:text-white max-w-[100px] truncate">
                        {user.name}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isUserMenuOpen && (
                        <>
                          <div
                            className="fixed inset-0 z-40 bg-transparent"
                            onClick={() => setIsUserMenuOpen(false)}
                          />
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className={`absolute top-full mt-2 ${language === 'ar' ? 'left-0' : 'right-0'} w-56 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-gray-100 dark:border-slate-800 z-50 overflow-hidden`}
                          >
                            <div className="p-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50">
                              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{language === 'ar' ? 'مسجل الدخول باسم' : 'Signed in as'}</p>
                              <p className="text-sm font-bold text-marine-900 dark:text-white truncate">{user.email}</p>
                            </div>
                            <div className="p-2">
                              <Link
                                href="/dashboard"
                                onClick={() => setIsUserMenuOpen(false)}
                                className="flex items-center gap-3 w-full p-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-marine-50 dark:hover:bg-slate-800 hover:text-marine-700 dark:hover:text-marine-400 rounded-lg transition-colors"
                              >
                                <LayoutDashboard className="w-4 h-4" />
                                {t('dashboard') || (language === 'ar' ? 'لوحة التحكم' : 'Dashboard')}
                              </Link>
                              <button
                                onClick={() => {
                                  logout();
                                  setIsUserMenuOpen(false);
                                }}
                                className="flex items-center gap-3 w-full p-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <LogOut className="w-4 h-4" />
                                {t('logout') || (language === 'ar' ? 'تسجيل الخروج' : 'Logout')}
                              </button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-marine-600 hover:bg-marine-700 text-white text-sm font-bold shadow-md hover:shadow-marine-500/20 transition-all"
                  >
                    <User className="w-4 h-4" />
                    {language === 'ar' ? 'دخول' : 'Login'}
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button - at the edge */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden flex items-center justify-center w-11 h-11 bg-marine-600 dark:bg-brand-orange text-white rounded-xl shadow-lg active:scale-95 transition-transform"
                aria-label="Toggle Menu"
                type="button"
              >
                {isOpen ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>

              <div className="hidden md:flex h-6 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

              {/* Language Toggle - hidden on very small screens */}
              <button
                onClick={toggleLanguage}
                className="hidden sm:flex items-center gap-1.5 px-2 sm:px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-md transition-colors"
                aria-label="Toggle Language"
              >
                <span className="flex items-center justify-center w-6 h-4 overflow-hidden rounded-sm">
                  {language === 'ar' ? (
                    <UKFlag className="w-full h-full object-cover" />
                  ) : (
                    <SaudiFlag className="w-full h-full object-cover" />
                  )}
                </span>
                <span className="uppercase font-bold text-marine-700 dark:text-marine-400">{language === 'ar' ? 'EN' : 'AR'}</span>
              </button>

              {/* Theme Toggle - Desktop only */}
              <button
                onClick={toggleTheme}
                className="hidden md:flex p-2 text-marine-700 dark:text-brand-orange hover:bg-white/50 dark:hover:bg-slate-800/50 rounded-md transition-colors"
                aria-label="Toggle Theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: language === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: language === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`fixed top-0 ${language === 'ar' ? 'right-0' : 'left-0'
                } h-full w-72 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl z-50 md:hidden border-r border-l border-white/20 dark:border-slate-700/50 overflow-y-auto`}
            >
              <div className="flex flex-col min-h-full">
                <div className="p-6 border-b border-gray-100 dark:border-slate-800/50 flex justify-between items-center">
                  <Image
                    src="/icons/icon.png"
                    alt="SAMA Logistics"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain"
                  />
                  <div className="flex items-center gap-1">
                    {/* Theme Toggle in mobile menu */}
                    <button
                      onClick={toggleTheme}
                      className="p-2 text-marine-700 dark:text-brand-orange hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md"
                      aria-label="Toggle Theme"
                    >
                      {theme === 'light' ? (
                        <Moon className="w-5 h-5" />
                      ) : (
                        <Sun className="w-5 h-5" />
                      )}
                    </button>
                    {/* Language Toggle in mobile menu */}
                    <button
                      onClick={toggleLanguage}
                      className="p-2 text-marine-700 dark:text-marine-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md font-bold text-sm"
                      aria-label="Toggle Language"
                    >
                      {language === 'ar' ? (
                        <div className="flex items-center gap-2">
                          <UKFlag className="w-5 h-3.5" />
                          <span>EN</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <SaudiFlag className="w-5 h-3.5" />
                          <span>AR</span>
                        </div>
                      )}
                    </button>
                    {/* Close button */}
                    <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md">
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                {/* Mobile User Profile Section */}
                {user && (
                  <div className="p-4 bg-marine-50/50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800/50">
                    <div className="flex items-center gap-3 mb-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border border-white dark:border-slate-700 shadow-sm" />
                      <div>
                        <p className="font-bold text-marine-900 dark:text-white text-sm">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[160px]">{user.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold text-marine-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <LayoutDashboard className="w-3 h-3" />
                      {t('dashboard') || (language === 'ar' ? 'لوحة التحكم' : 'Dashboard')}
                    </Link>
                  </div>
                )}

                <div className="flex-1 py-6 px-4 space-y-2">
                  {navItems.map((item) => {
                    const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

                    return (
                      <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                          isActive
                            ? "bg-marine-50 dark:bg-marine-900/40 text-marine-700 dark:text-brand-orange"
                            : "text-gray-700 dark:text-gray-300 hover:bg-marine-50 dark:hover:bg-slate-800/50 hover:text-marine-700 dark:hover:text-marine-400"
                        )}
                      >
                        <span className={isActive ? "text-marine-700 dark:text-brand-orange" : "text-brand-orange dark:text-brand-orange/80"}>
                          {item.icon}
                        </span>
                        <span className="font-medium">{t(item.key)}</span>
                      </Link>
                    );
                  })}

                  {!user && (
                    <>
                      <hr className="my-4 border-gray-100 dark:border-slate-800" />
                      <Link
                        href="/auth/login"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 bg-marine-600 text-white rounded-lg shadow-md hover:bg-marine-700 transition-colors mx-4 justify-center mt-4"
                      >
                        <span className="font-bold">{language === 'ar' ? 'تسجيل الدخول' : 'Login'}</span>
                      </Link>
                    </>
                  )}

                  {user && (
                    <>
                      <hr className="my-4 border-gray-100 dark:border-slate-800" />
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors w-full"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">{t('logout') || (language === 'ar' ? 'تسجيل الخروج' : 'Logout')}</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function NavLink({ item, t, pathname }: { item: NavItem; t: (key: string) => string; pathname: string | null }) {
  const [isHovered, setIsHovered] = useState(false);
  const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);

  return (
    <Link
      href={item.href}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative px-4 py-2 rounded-md group transition-colors"
    >
      <span className={`text-sm font-medium transition-colors duration-200 ${isActive
        ? 'text-marine-700 dark:text-brand-orange font-bold'
        : isHovered
          ? 'text-marine-700 dark:text-brand-orange'
          : 'text-gray-600 dark:text-gray-300'
        }`}>
        {t(item.key)}
      </span>

      {/* Gradient Underline */}
      <span
        className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-marine-600 to-brand-orange transform transition-transform duration-300 origin-center ${isActive ? 'scale-x-100' : (isHovered ? 'scale-x-100' : 'scale-x-0')
          }`}
      />
    </Link>
  );
}
