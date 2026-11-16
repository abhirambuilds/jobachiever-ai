import { Link } from 'react-router-dom';
import { Layers, Star, Plus, ArrowRight, ShieldCheck, Target } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function CareerTrackSummary() {
  const { profile, setPrimaryTrack } = useProfile();
  const tracks = profile.careerTracks || [];

  return (
    <Card className="border-border/80 bg-card/75 backdrop-blur-sm">
      <CardHeader className="p-5 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <span>Career Tracks &amp; Personas</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage distinct career personas under your unified master profile.
          </p>
        </div>

        <Link to="/profile">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Persona</span>
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-5 space-y-3.5">
        {tracks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-3 bg-muted/10">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-foreground">No Career Tracks Configured Yet</h4>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Define your target role (e.g. Full-Stack Engineer, Backend Developer) to anchor AI matching, gap analysis, and tailored resumes.
              </p>
            </div>
            <Link to="/career-tracks">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5 text-primary" />
                <span>Create Your First Career Track</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {tracks.map((track) => {
            const isPrimary = track.isPrimary;
            const mappedSkills = track.skills || track.relevantSkills || [];

            return (
              <div
                key={track.id}
                className={`relative rounded-xl border p-4 transition-all ${
                  isPrimary
                    ? 'border-primary/50 bg-primary/5 shadow-xs'
                    : 'border-border/70 bg-card hover:border-border'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground">{track.name}</h4>
                      {isPrimary && (
                        <Badge variant="ai" className="text-[10px] gap-1 px-1.5 py-0">
                          <Star className="h-2.5 w-2.5 fill-current" />
                          <span>Primary Track</span>
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Target className="h-3 w-3 text-cyan-400" />
                      <span>{track.targetRole || 'Target Role Defined'}</span>
                      <span>•</span>
                      <span className="capitalize">{track.level || 'Mid-Senior'}</span>
                    </div>
                  </div>

                  {!isPrimary && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPrimaryTrack(track.id)}
                      className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                    >
                      Make Primary
                    </Button>
                  )}
                </div>

                {track.description && (
                  <p className="text-xs text-muted-foreground/90 mt-2 line-clamp-2 leading-relaxed">
                    {track.description}
                  </p>
                )}

                <div className="mt-3 pt-3 border-t border-border/40 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-muted-foreground font-medium">
                      {mappedSkills.length} Mapped Skill{mappedSkills.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <Link
                    to="/profile"
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-[11px]"
                  >
                    <span>Configure Track</span>
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
