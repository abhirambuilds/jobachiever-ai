import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  User,
  GraduationCap,
  Cpu,
  Briefcase,
  FolderGit2,
  Target,
  Edit2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

export function ProfileReview({ onBack, onJumpToStep }) {
  const { profile, calculateCompleteness } = useProfile();
  const navigate = useNavigate();

  const { percentage, missingSections } = calculateCompleteness();

  const handleComplete = () => {
    toast.success('Master Career Profile initialized! Entering Career Command Center.');
    navigate('/dashboard');
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Step 8: Review &amp; Confirm Master Profile
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Inspect your verified graph before completing onboarding. You can update any section anytime.
        </p>
      </div>

      {/* Completeness Card */}
      <Card className="border-primary/40 bg-gradient-to-r from-card via-card/80 to-primary/5 shadow-md">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="ai" dot>
                  Master Graph Status
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">
                  {percentage}% Field Coverage
                </span>
              </div>
              <h4 className="text-lg font-bold text-foreground">
                Profile Completeness Overview
              </h4>
              <p className="text-xs text-muted-foreground">
                Note: Profile completeness measures data field coverage, not candidate competency.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-3xl font-extrabold text-foreground">{percentage}%</span>
                <p className="text-[10px] text-muted-foreground">Ready for AI Matching</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center">
                <Sparkles className="h-7 w-7 text-cyan-400" />
              </div>
            </div>
          </div>

          {/* Missing Check items if any */}
          {missingSections.length > 0 && (
            <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>Recommended additions: {missingSections.join(', ')}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Sections Grid */}
      <div className="space-y-4">
        {/* 1. Personal Info */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              <span>Personal Details</span>
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onJumpToStep(1)}
              className="gap-1 text-xs h-7"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs space-y-1 text-muted-foreground">
            <div className="font-semibold text-foreground text-sm">
              {profile.personalInfo.fullName || 'Not provided'}
            </div>
            <div>{profile.personalInfo.headline}</div>
            <div>
              {profile.personalInfo.email} • {profile.personalInfo.phone} •{' '}
              {profile.personalInfo.city}, {profile.personalInfo.country}
            </div>
            <p className="text-[11px] leading-relaxed pt-1 text-foreground/85">
              {profile.personalInfo.summary}
            </p>
          </CardContent>
        </Card>

        {/* 2. Education */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Education ({profile.education.length} records)</span>
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onJumpToStep(2)}
              className="gap-1 text-xs h-7"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {profile.education.map((item) => (
              <div key={item.id} className="text-xs border-b border-border/40 pb-2 last:border-none">
                <span className="font-bold text-foreground">{item.institution}</span> —{' '}
                <span className="text-muted-foreground">{item.degree} in {item.fieldOfStudy}</span>
                <div className="text-[11px] text-muted-foreground">
                  {item.startDate} to {item.isCurrent ? 'Present' : item.graduationDate}
                  {item.gpa && ` • GPA: ${item.gpa}`}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 3. Skills */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" />
              <span>Skills ({profile.skills.length} competencies)</span>
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onJumpToStep(3)}
              className="gap-1 text-xs h-7"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="flex flex-wrap gap-1.5">
              {profile.skills.map((s) => (
                <Badge key={s.id} variant="secondary" className="text-xs">
                  {s.name} ({s.proficiency})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 4. Experience */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-primary" />
              <span>Experience ({profile.experience.length} positions)</span>
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onJumpToStep(4)}
              className="gap-1 text-xs h-7"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {profile.experience.map((item) => (
              <div key={item.id} className="text-xs border-b border-border/40 pb-2 last:border-none">
                <span className="font-bold text-foreground">{item.jobTitle}</span> at{' '}
                <span className="text-primary font-semibold">{item.company}</span>
                <div className="text-[11px] text-muted-foreground">
                  {item.startDate} — {item.isCurrent ? 'Present' : item.endDate}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 5. Projects */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-primary" />
              <span>Projects ({profile.projects.length} portfolios)</span>
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onJumpToStep(5)}
              className="gap-1 text-xs h-7"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0 space-y-2">
            {profile.projects.map((proj) => (
              <div key={proj.id} className="text-xs border-b border-border/40 pb-2 last:border-none">
                <span className="font-bold text-foreground">{proj.name}</span>
                <p className="text-muted-foreground text-[11px]">{proj.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 6. Career Preferences */}
        <Card className="border-border/60 bg-card/60">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span>Career Preferences</span>
            </CardTitle>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onJumpToStep(7)}
              className="gap-1 text-xs h-7"
            >
              <Edit2 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </CardHeader>
          <CardContent className="p-4 pt-0 text-xs space-y-1.5 text-muted-foreground">
            <div>
              <span className="font-semibold text-foreground">Target Roles:</span>{' '}
              {profile.careerPreferences.targetRoles?.join(', ') || 'None selected'}
            </div>
            <div>
              <span className="font-semibold text-foreground">Arrangement &amp; Locations:</span>{' '}
              {profile.careerPreferences.workArrangement} • {profile.careerPreferences.preferredLocations}
            </div>
            <p className="text-[11px] pt-1 text-foreground/80">
              <span className="font-semibold">Goal:</span> {profile.careerPreferences.careerGoals}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Complete Button */}
      <div className="flex justify-between pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <Button type="button" variant="ai" size="lg" onClick={handleComplete} className="gap-2 shadow-glow-sm">
          <CheckCircle2 className="h-4 w-4" />
          <span>Complete Onboarding &amp; Enter Profile</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
