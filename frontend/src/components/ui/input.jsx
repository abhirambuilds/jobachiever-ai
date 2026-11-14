import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef(
  (
    {
      className,
      type = 'text',
      label,
      error,
      helperText,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-foreground/90 uppercase tracking-wider"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {LeftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-muted-foreground">
              <LeftIcon className="h-4 w-4" />
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              'flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-150',
              LeftIcon && 'pl-9',
              RightIcon && 'pr-9',
              error && 'border-destructive focus-visible:ring-destructive',
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            {...props}
          />
          {RightIcon && (
            <div className="pointer-events-none absolute right-3 flex items-center text-muted-foreground">
              <RightIcon className="h-4 w-4" />
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-destructive animate-in fade-in-50 duration-150">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = 'Input';

export { Input };
