import {
  FileText,
  UserCheck,
  Layers,
} from 'lucide-react';
import { useJobMatcher } from '@/hooks/useJobMatcher';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ProfileResumeSelector() {
  const {
    selectionSource,
    setSelectionSource,
    selectedResume,
    setSelectedResume,
    availableResumes,
    selectedTrackId,
    setSelectedTrackId,
    availableTracks,
  } = useJobMatcher();

  const isMasterProfile = selectionSource === 'profile';

  return (
    <Card className="border-border/80 bg-card/75 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Source Toggle (Resume vs Master Profile) */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                Candidate Evidence Source
              </span>
              <Badge variant="outline" className="text-[9px]">
                Ground Truth
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-border/80 p-0.5 bg-muted/30">
                <Button
                  type="button"
                  variant={!isMasterProfile ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectionSource('resume')}
                  className="h-7 text-xs gap-1.5"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Resume from Library</span>
                </Button>
                <Button
                  type="button"
                  variant={isMasterProfile ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setSelectionSource('profile')}
                  className="h-7 text-xs gap-1.5"
                >
                  <UserCheck className="h-3.5 w-3.5 text-primary" />
                  <span>Master Career Profile</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Center: Selected Evidence Details */}
          <div className="flex-1 max-w-xl rounded-xl border border-border/60 bg-muted/20 p-3 flex items-center justify-between gap-3">
            {!isMasterProfile ? (
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground truncate">
                    {selectedResume?.name || 'No resume selected'}
                  </span>
                  {selectedResume?.version && (
                    <Badge variant="outline" className="text-[9px] font-mono px-1 py-0">
                      v{selectedResume.version}.0
                    </Badge>
                  )}
                  {selectedResume?.isPrimary && (
                    <Badge variant="ai" className="text-[9px] px-1 py-0">
                      Primary
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="font-mono truncate">{selectedResume?.originalFilename}</span>
                  <span>•</span>
                  <span className="text-primary font-medium">{selectedResume?.careerTrackName}</span>
                </div>
              </div>
            ) : (
              <div className="space-y-0.5 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground truncate">
                    Verified Master Profile Graph
                  </span>
                  <Badge variant="success" className="text-[9px] px-1 py-0">
                    Comprehensive
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Evaluates all verified skills, projects, certifications, and work milestones.
                </p>
              </div>
            )}

            {/* Quick Switch Dropdown */}
            {!isMasterProfile && availableResumes.length > 1 && (
              <select
                value={selectedResume?.id || ''}
                onChange={(e) => {
                  const res = availableResumes.find((r) => r.id === e.target.value);
                  if (res) setSelectedResume(res);
                }}
                className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:ring-1 focus:ring-primary max-w-[180px]"
                aria-label="Switch active resume"
              >
                {availableResumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right: Career Persona Alignment */}
          <div className="space-y-1 sm:text-right shrink-0">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Aligned Persona
            </span>
            {isMasterProfile && availableTracks.length > 1 ? (
              <select
                value={selectedTrackId}
                onChange={(e) => setSelectedTrackId(e.target.value)}
                className="rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground focus:ring-1 focus:ring-primary"
              >
                {availableTracks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-foreground justify-start sm:justify-end">
                <Layers className="h-3.5 w-3.5 text-primary" />
                <span>
                  {availableTracks.find((t) => t.id === selectedTrackId)?.name || 'Full-Stack Engineer'}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
