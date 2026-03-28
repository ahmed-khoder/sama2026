import { cn } from '@/lib/utils';
import { HTMLAttributes, forwardRef } from 'react';

export interface SectionProps extends HTMLAttributes<HTMLElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    background?: 'default' | 'muted' | 'accent' | 'dark';
    centered?: boolean;
}

const Section = forwardRef<HTMLElement, SectionProps>(
    ({ className, size = 'lg', background = 'default', centered = false, children, ...props }, ref) => {
        const sizes = {
            sm: 'py-12',
            md: 'py-16',
            lg: 'py-20',
            xl: 'py-24',
        };

        const backgrounds = {
            default: 'bg-white dark:bg-slate-950',
            muted: 'bg-gray-50 dark:bg-slate-900',
            accent: 'bg-marine-50 dark:bg-marine-950/20',
            dark: 'bg-marine-900 dark:bg-marine-950',
        };

        const centeredStyles = centered ? 'text-center' : '';

        return (
            <section
                ref={ref}
                className={cn(sizes[size], backgrounds[background], centeredStyles, className)}
                {...props}
            >
                {children}
            </section>
        );
    }
);

Section.displayName = 'Section';

// Section Header for consistent section titles
interface SectionHeaderProps extends HTMLAttributes<HTMLDivElement> {
    title: string;
    description?: string;
    centered?: boolean;
}

const SectionHeader = forwardRef<HTMLDivElement, SectionHeaderProps>(
    ({ className, title, description, centered = true, ...props }, ref) => (
        <div ref={ref} className={cn('mb-12', centered && 'text-center', className)} {...props}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
            </h2>
            {description && (
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto font-medium leading-relaxed">
                    {description}
                </p>
            )}
            <div className="w-20 h-1 bg-marine-500 mx-auto mt-6 rounded-full" />
        </div>
    )
);

SectionHeader.displayName = 'SectionHeader';

export { Section, SectionHeader };
