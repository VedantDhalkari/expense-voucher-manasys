import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  currency?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, currency, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="text-[13px] font-semibold text-brand-slate block">
            {label}
          </label>
        )}
        <div className="relative">
          {currency && (
            <div className="absolute inset-y-0 left-0 w-10 flex items-center justify-center bg-brand-subSurface border-r border-brand-borderAccent rounded-l-[6px] text-brand-slate font-semibold pointer-events-none">
              ₹
            </div>
          )}
          <input
            type={type}
            className={cn(
              "flex h-10 w-full rounded-[6px] border border-brand-borderAccent bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-action/20 focus-visible:border-brand-action disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
              currency && "pl-13",
              error && "border-status-rejected-solid focus-visible:ring-status-rejected-solid/20 focus-visible:border-status-rejected-solid",
              className
            )}
            style={currency ? { paddingLeft: '3.25rem' } : undefined}
            ref={ref}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-status-rejected-solid mt-1.5">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';
