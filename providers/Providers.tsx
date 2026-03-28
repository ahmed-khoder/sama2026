'use client';

import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/contexts/ToastContext';
import ErrorBoundary from '@/components/ErrorBoundary';
import ToastContainer from '@/components/Toast';

interface ProvidersProps {
    children: React.ReactNode;
}

/**
 * Combined Providers wrapper
 * Wraps all context providers in correct order for clean root layout
 * Now includes ErrorBoundary and Toast notifications
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <LanguageProvider>
                    <ToastProvider>
                        <AuthProvider>
                            {children}
                            <ToastContainer />
                        </AuthProvider>
                    </ToastProvider>
                </LanguageProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}
