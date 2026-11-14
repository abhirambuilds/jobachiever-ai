import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There are no records to display at this moment.',
  actionLabel,
  onAction,
  actionButton,
  className,
  children,
}) {
  return (
    <div
      className={cn(
        'flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-card/40 p-8 text-center backdrop-blur-sm',
        className
      )}
    >
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted/60 text-muted-foreground ring-1 ring-border/80">
        <Icon className="h-7 w-7 text-primary/80" />
      </div>
      <h4 className="text-base font-semibold text-foreground">{title}</h4>
      <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      {actionButton ? (
        <div className="mt-5">{actionButton}</div>
      ) : actionLabel && onAction ? (
        <div className="mt-5">
          <Button onClick={onAction} size="sm">
            {actionLabel}
          </Button>
        </div>
      ) : null}
      {children}
    </div>
  );
}
