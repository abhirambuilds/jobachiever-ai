import { useState } from 'react';
import { Layers, Plus, Star, Edit2, Trash2, CheckCircle2, TrendingUp } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { TrackModal } from './TrackModal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { EmptyState } from '@/components/common/EmptyState';
import { toast } from '@/components/ui/toast';

export function CareerTrackManager() {
  const { profile, setPrimaryCareerTrack, removeCareerTrack } = useProfile();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrack, setEditingTrack] = useState(null);

  const handleOpenCreate = () => {
    setEditingTrack(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (track) => {
    setEditingTrack(track);
    setModalOpen(true);
  };

  const handleDelete = (id, name) => {
    removeCareerTrack(id);
    toast.info(`Career track "${name}" removed`);
  };

  const handleSetPrimary = (id, name) => {
    setPrimaryCareerTrack(id);
    toast.success(`"${name}" is now your primary career track`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner explaining Multi-Track Architecture */}
      <Card className="border-border/80 bg-gradient-to-r from-card via-card/80 to-primary/5 shadow-sm">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="ai" dot>
                  Multi-Track Personas
                </Badge>
                <span className="text-xs text-muted-foreground">
                  One Master Profile • Zero Duplication
                </span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-foreground">
                Manage Your Active Career Tracks
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Connect distinct career targets to your Master Career Profile. When tailoring resumes
                or discovering jobs, JobAchiever AI optimizes positioning for the selected track
                without altering your master credentials.
              </p>
            </div>

            <Button
              type="button"
              variant="ai"
              onClick={handleOpenCreate}
              className="gap-2 shrink-0 self-start md:self-auto shadow-glow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Create Career Track</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tracks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {profile.careerTracks.map((track) => {
          // Calculate track specific insight: how many mapped skills exist in master profile
          const masterSkillNames = profile.skills.map((s) => s.name.toLowerCase());
          const mappedCount = track.relevantSkills.filter((s) =>
            masterSkillNames.includes(s.toLowerCase())
          ).length;

          return (
            <Card
              key={track.id}
              className={`h-full border transition-all duration-200 flex flex-col justify-between ${
                track.isPrimary
                  ? 'border-primary shadow-glow-sm bg-gradient-to-b from-card via-card to-primary/5'
                  : 'border-border/70 bg-card hover:border-primary/40'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Layers className="h-4 w-4" />
                    </div>
                    {track.isPrimary && (
                      <Badge variant="success" dot className="text-[10px]">
                        Primary Active Track
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenEdit(track)}
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      aria-label="Edit track"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    {profile.careerTracks.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(track.id, track.name)}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        aria-label="Delete track"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>

                <CardTitle className="text-base font-bold text-foreground">
                  {track.name}
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-primary">
                  Target: {track.targetRole}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3.5 pt-0">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {track.description}
                </p>

                {/* Track Insights Bar */}
                <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 text-muted-foreground font-medium">
                      <TrendingUp className="h-3 w-3 text-emerald-500" />
                      <span>Master Skills Aligned</span>
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {mappedCount} Skills
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {track.relevantSkills.map((skillName) => (
                      <span
                        key={skillName}
                        className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground"
                      >
                        {skillName}
                      </span>
                    ))}
                  </div>
                </div>

                {track.targetIndustries && (
                  <div className="text-[11px] text-muted-foreground">
                    <span className="font-semibold text-foreground/80">Industries:</span>{' '}
                    {track.targetIndustries}
                  </div>
                )}

                {/* Footer Action: Set Primary */}
                <div className="pt-2 border-t border-border/40 flex items-center justify-between">
                  {!track.isPrimary ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetPrimary(track.id, track.name)}
                      className="w-full text-xs h-8 gap-1.5"
                    >
                      <Star className="h-3 w-3" />
                      <span>Set as Primary Track</span>
                    </Button>
                  ) : (
                    <span className="text-[11px] text-emerald-500 flex items-center gap-1 font-semibold mx-auto">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Default for AI Matching</span>
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {profile.careerTracks.length === 0 && (
        <EmptyState
          icon={Layers}
          title="No Career Tracks Configured"
          description="Create your first career track to map your master profile skills to specific target job categories."
          actionLabel="Create First Track"
          onAction={handleOpenCreate}
        />
      )}

      {/* Modal Dialog for Create/Edit */}
      <TrackModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        trackToEdit={editingTrack}
      />
    </div>
  );
}
