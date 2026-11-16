import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Layers, CheckCircle2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { AnimatedCounter } from '@/components/common/AnimatedCounter';
import { SimulatedResultBadge } from '@/components/demo';
import { isDemoMode } from '@/demo/demoConfig';

export function WelcomeBanner() {
  const { profile, calculateCompleteness } = useProfile();
  const { percentage } = calculateCompleteness();

  const firstName = profile.personalInfo.fullName
    ? profile.personalInfo.fullName.split(' ')[0]
    : 'Candidate';

  const primaryTrack =
    profile.careerTracks.find((t) => t.isPrimary) || profile.careerTracks[0];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Card className="relative overflow-hidden border-border/80 bg-gradient-to-r from-card via-card/85 to-primary/10 shadow-lg backdrop-blur-md">
      {/* Decorative ambient blurred glow */}
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-cyan-400/15 blur-3xl pointer-events-none" />

      <CardContent className="p-6 sm:p-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="ai" dot className="text-xs">
                Active Career Workspace
              </Badge>
              {primaryTrack && (
                <Badge variant="outline" className="text-xs gap-1">
                  <Layers className="h-3 w-3 text-primary" />
                  <span>Focus: {primaryTrack.name}</span>
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                Database Synced
              </Badge>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {getGreeting()}, <span className="gradient-text-primary">{firstName}</span>.
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Ready to move closer to your next opportunity? Your Master Career Profile is currently
              at <span className="font-semibold text-foreground"><AnimatedCounter value={percentage} suffix="%" /> completeness</span>,
              anchoring all tailored resumes and matching pipelines.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link to="/job-match">
              <Button variant="ai" size="sm" className="gap-2 shadow-glow-sm">
                <Sparkles className="h-4 w-4" />
                <span>Match Job Description</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Inspect Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
