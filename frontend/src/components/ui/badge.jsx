import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive/15 text-destructive border border-destructive/30',
        outline: 'text-foreground border border-border/80',
        success:
          'border-transparent bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        warning:
          'border-transparent bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        info: 'border-transparent bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30',
        ai: 'border-transparent bg-gradient-to-r from-primary/15 to-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30 font-medium',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, dot = false, children, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', {
            'bg-primary-foreground': variant === 'default',
            'bg-secondary-foreground': variant === 'secondary',
            'bg-destructive': variant === 'destructive',
            'bg-emerald-500 animate-pulse': variant === 'success',
            'bg-amber-500': variant === 'warning',
            'bg-blue-500': variant === 'info',
            'bg-cyan-400 animate-pulse': variant === 'ai',
            'bg-foreground': variant === 'outline',
          })}
        />
      )}
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
