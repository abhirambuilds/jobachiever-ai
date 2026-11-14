import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[70vh] flex-col items-center justify-center p-6 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/15 text-destructive ring-1 ring-destructive/30">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Something went wrong
          </h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            An unexpected error occurred in the application. Our telemetry has logged the
            incident.
          </p>
          {this.state.error?.message && (
            <div className="mt-4 max-w-lg rounded-lg border border-border/70 bg-muted/40 p-3 text-left font-mono text-xs text-muted-foreground overflow-x-auto">
              {this.state.error.message}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={this.handleReset} variant="default" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              <span>Reload Page</span>
            </Button>
            <Button
              onClick={() => {
                window.location.href = '/';
              }}
              variant="outline"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              <span>Go to Home</span>
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
