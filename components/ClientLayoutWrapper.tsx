'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');
  const isAuthPage = pathname?.startsWith('/auth');

  // Hide Header/Footer on Dashboard and Auth pages
  const shouldHideLayout = isDashboard || isAuthPage;

  return (
    <>
      {!shouldHideLayout && <Navbar />}
      <main className={shouldHideLayout ? '' : 'min-h-screen pt-16'}>
        {children}
      </main>
      {!shouldHideLayout && <Footer />}
    </>
  );
}

