import { Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, Layers, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export function FeaturePlaceholderPage({
  title = 'Feature Module',
  description = 'This capability integrates directly with your active career tracks and verified credentials.',
  milestone = 'Enterprise Release',
  icon: Icon = Sparkles,
}) {
  return (
    <div className="max-w-3xl mx-auto py-12 space-y-6">
      <Card className="border-border/80 bg-card/75 shadow-xl backdrop-blur-md">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/15 via-indigo-600/10 to-cyan-400/20 text-primary border border-primary/20">
            <Icon className="h-7 w-7 text-primary" />
          </div>

          <div className="flex items-center justify-center gap-2">
            <Badge variant="ai" dot>
              {milestone}
            </Badge>
          </div>

          <CardTitle className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            {title}
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Architectural Continuity</span>
            </div>
            <p className="leading-relaxed">
              Consumes verified data directly from your Master Career Profile without requiring
              re-entry. Zero fabrication guardrails are preserved across all generation and matching
              pipelines.
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-border/50">
          <Link to="/dashboard">
            <Button variant="default" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Career Command Center</span>
            </Button>
          </Link>
          <Link to="/profile">
            <Button variant="outline" size="sm" className="gap-2">
              <Layers className="h-4 w-4" />
              <span>Inspect Master Profile</span>
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
