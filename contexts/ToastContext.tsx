'use client';

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    message: string;
    type: ToastType;
    title?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
    success: (message: string, title?: string) => void;
    error: (message: string, title?: string) => void;
    warning: (message: string, title?: string) => void;
    info: (message: string, title?: string) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const showToast = useCallback((
        message: string,
        type: ToastType = 'info',
        title?: string,
        duration: number = 5000
    ) => {
        const id = `toast-${Date.now()}-${Math.random()}`;
        const newToast: Toast = { id, message, type, title, duration };

        setToasts((prev) => [...prev, newToast]);

        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, [removeToast]);

    const success = useCallback((message: string, title?: string) => {
        showToast(message, 'success', title);
    }, [showToast]);

    const error = useCallback((message: string, title?: string) => {
        showToast(message, 'error', title, 7000); // Errors stay longer
    }, [showToast]);

    const warning = useCallback((message: string, title?: string) => {
        showToast(message, 'warning', title, 6000);
    }, [showToast]);

    const info = useCallback((message: string, title?: string) => {
        showToast(message, 'info', title);
    }, [showToast]);

    return (
        <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}
