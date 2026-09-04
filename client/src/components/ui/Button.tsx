import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive' | 'success';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          {
            'bg-brand-navy text-white hover:bg-brand-slate active:bg-slate-950': variant === 'primary',
            'bg-white text-brand-navy border border-brand-border hover:bg-brand-surface hover:border-brand-borderAccent': variant === 'secondary',
            'bg-status-rejected-solid text-white hover:bg-red-600': variant === 'destructive',
            'bg-status-approved-solid text-white hover:bg-emerald-600': variant === 'success',
            'h-8 px-3 text-[13px]': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-5 text-base': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
