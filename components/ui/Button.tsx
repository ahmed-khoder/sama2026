import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
        const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold rounded-xl transition-all duration-300 transform active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none';

        const variants = {
            primary: 'bg-marine-600 hover:bg-marine-700 text-white shadow-lg shadow-marine-600/20 hover:shadow-marine-600/30',
            secondary: 'bg-brand-orange hover:bg-brand-darkOrange text-white shadow-lg shadow-brand-orange/20 hover:shadow-brand-orange/40',
            ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300',
            outline: 'bg-transparent border-2 border-gray-200 dark:border-slate-700 hover:border-marine-500 dark:hover:border-marine-500 text-gray-700 dark:text-gray-300 hover:text-marine-600',
            danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20',
        };

        const sizes = {
            sm: 'px-4 py-2 text-sm',
            md: 'px-6 py-3 text-base',
            lg: 'px-8 py-4 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                )}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

export { Button };
