import { Loader2 } from 'lucide-react';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const spinnerVariants = cva('animate-spin text-primary', {
  variants: {
    size: {
      xs: 'h-3.5 w-3.5',
      sm: 'h-4 w-4',
      default: 'h-6 w-6',
      lg: 'h-8 w-8',
      xl: 'h-12 w-12',
    },
    variant: {
      default: 'text-primary',
      muted: 'text-muted-foreground',
      ai: 'text-ai',
      white: 'text-white',
    },
  },
  defaultVariants: {
    size: 'default',
    variant: 'default',
  },
});

export function Spinner({ className, size, variant, ...props }) {
  return (
    <Loader2
      className={cn(spinnerVariants({ size, variant, className }))}
      aria-label="Loading..."
      {...props}
    />
  );
}

export function LoadingPage({ message = 'Loading JobAchiever AI...' }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4 text-center">
      <div className="relative">
        <div className="absolute -inset-2 rounded-full bg-primary/20 blur-lg animate-pulse" />
        <Spinner size="xl" variant="ai" className="relative" />
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {message}
      </p>
    </div>
  );
}
