import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Sparkles, FolderGit2, Briefcase } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';

export function TrackOverviewModal({ isOpen, onClose, track }) {
  const { profile, getTrackSkillMatch } = useProfile();

  if (!track) return null;

  const matchData = getTrackSkillMatch ? getTrackSkillMatch(track.id) : null;
  const matchedRequired = matchData?.matchedRequired || [];
  const missingRequired = matchData?.missingRequired || [];
  const matchedPreferred = matchData?.matchedPreferred || [];
  const missingPreferred = matchData?.missingPreferred || [];
  const additional = matchData?.additionalProfileSkills || [];
  const matchPct = matchData?.matchPercentage ?? 100;

  // Relevant projects & experiences
  const trackKeywords = [
    ...(track.relevantSkills || track.requiredSkills || []),
    ...(track.preferredSkills || []),
    track.targetRole,
  ]
    .filter(Boolean)
    .map((s) => s.toLowerCase());

  const relevantProjects = profile.projects.filter((p) => {
    const tech = (p.technologies || '').toLowerCase();
    const desc = (p.description || '').toLowerCase();
    return trackKeywords.some((k) => tech.includes(k) || desc.includes(k));
  });

  const relevantExperiences = profile.experience.filter((e) => {
    const title = (e.jobTitle || '').toLowerCase();
    const tech = (e.technologies || '').toLowerCase();
    const desc = (e.responsibilities || e.description || '').toLowerCase();
    return trackKeywords.some((k) => title.includes(k) || tech.includes(k) || desc.includes(k));
  });

  const readinessStatus =
    matchPct >= 80 ? 'Ready to Apply' : matchPct >= 50 ? 'Needs Development' : 'Foundational';

  const readinessVariant = matchPct >= 80 ? 'success' : matchPct >= 50 ? 'warning' : 'outline';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <DialogTitle className="text-base font-bold text-foreground">
                Track Overview: {track.name}
              </DialogTitle>
            </div>
            <Badge variant={readinessVariant} className="text-xs">
              {readinessStatus} ({matchPct}% Match)
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Target Role: <span className="font-semibold text-foreground">{track.targetRole}</span> • Priority #{track.priority || 1}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Skill Matching Section */}
          <div className="rounded-xl border border-border/70 bg-card/60 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Required Skills Alignment ({matchedRequired.length} / {(track.relevantSkills || track.requiredSkills || []).length})
            </h4>

            {matchedRequired.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-emerald-500 flex items-center gap-1 mb-1.5">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Verified in Master Profile:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {matchedRequired.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {missingRequired.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1 mb-1.5">
                  <AlertCircle className="h-3 w-3" />
                  <span>Missing Requirements (Gaps):</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {missingRequired.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {matchedPreferred.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-primary flex items-center gap-1 mb-1.5">
                  <Sparkles className="h-3 w-3" />
                  <span>Matched Preferred Skills:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {matchedPreferred.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {missingPreferred.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                  <Sparkles className="h-3 w-3" />
                  <span>Missing Preferred Skills (Growth Opportunities):</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {missingPreferred.map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-secondary/80 text-muted-foreground border border-border px-2 py-0.5 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {additional.length > 0 && (
              <div>
                <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1 mb-1.5">
                  <span>Additional Profile Skills:</span>
                </span>
                <div className="flex flex-wrap gap-1">
                  {additional.slice(0, 8).map((s) => (
                    <span
                      key={s}
                      className="rounded-md bg-secondary text-muted-foreground px-2 py-0.5 text-[10px] font-medium"
                    >
                      {s}
                    </span>
                  ))}
                  {additional.length > 8 && (
                    <span className="text-[10px] text-muted-foreground self-center">
                      +{additional.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Master Profile Alignment: Projects & Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <FolderGit2 className="h-3.5 w-3.5 text-primary" />
                <span>Relevant Master Projects ({relevantProjects.length})</span>
              </div>
              {relevantProjects.length > 0 ? (
                <div className="space-y-1.5">
                  {relevantProjects.slice(0, 2).map((p) => (
                    <div key={p.id} className="text-xs bg-muted/40 p-2 rounded-lg">
                      <p className="font-semibold text-foreground text-[11px]">{p.name || p.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{p.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">No directly aligned projects found.</p>
              )}
            </div>

            <div className="rounded-xl border border-border/70 bg-card/60 p-3.5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                <span>Relevant Experience ({relevantExperiences.length})</span>
              </div>
              {relevantExperiences.length > 0 ? (
                <div className="space-y-1.5">
                  {relevantExperiences.slice(0, 2).map((e) => (
                    <div key={e.id} className="text-xs bg-muted/40 p-2 rounded-lg">
                      <p className="font-semibold text-foreground text-[11px]">{e.jobTitle} • {e.company || e.companyName}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1">{e.responsibilities || e.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-muted-foreground">No directly aligned experiences found.</p>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
