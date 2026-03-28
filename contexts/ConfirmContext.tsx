'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import ConfirmModal from '@/components/ui/ConfirmModal';

export type ConfirmType = 'danger' | 'warning' | 'info';

export interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: ConfirmType;
}

interface ConfirmState extends ConfirmOptions {
    isOpen: boolean;
    resolve: ((value: boolean) => void) | null;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export function ConfirmProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmState>({
        isOpen: false,
        title: '',
        message: '',
        confirmText: undefined,
        cancelText: undefined,
        type: 'danger',
        resolve: null,
    });

    const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setState({
                isOpen: true,
                title: options.title,
                message: options.message,
                confirmText: options.confirmText,
                cancelText: options.cancelText,
                type: options.type || 'danger',
                resolve,
            });
        });
    }, []);

    const handleConfirm = useCallback(() => {
        state.resolve?.(true);
        setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    }, [state.resolve]);

    const handleCancel = useCallback(() => {
        state.resolve?.(false);
        setState((prev) => ({ ...prev, isOpen: false, resolve: null }));
    }, [state.resolve]);

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            <ConfirmModal
                isOpen={state.isOpen}
                title={state.title}
                message={state.message}
                confirmText={state.confirmText}
                cancelText={state.cancelText}
                type={state.type}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
}

export function useConfirm() {
    const context = useContext(ConfirmContext);
    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }
    return context;
}
