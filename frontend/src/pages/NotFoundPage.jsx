import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function NotFoundPage() {
  return (
    <div className="container flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6">
        <div className="absolute -inset-4 rounded-full bg-primary/20 blur-xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-border/80 bg-card p-4 text-primary shadow-2xl">
          <Compass className="h-12 w-12 animate-pulse text-cyan-400" />
        </div>
      </div>

      <span className="font-mono text-sm font-semibold uppercase tracking-widest text-primary">
        Error 404
      </span>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
        Page Not Found
      </h1>
      <p className="mt-3 max-w-md text-base text-muted-foreground">
        The route you requested does not exist or has been migrated in this milestone.
      </p>

      <div className="mt-8 flex gap-3">
        <Link to="/">
          <Button variant="default" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Design System</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
