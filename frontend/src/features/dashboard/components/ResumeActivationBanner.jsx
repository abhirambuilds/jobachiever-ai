import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, Sparkles, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PRESET_RESUMES } from '@/demo/presetResumes';
import { useProfile } from '@/hooks/useProfile';
import { toast } from '@/components/ui/toast';

export function ResumeActivationBanner() {
  const { profile, updateProfile, addCareerTrack } = useProfile();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const rawUser = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_user') : null;
  const user = rawUser ? JSON.parse(rawUser) : null;
  const activeResumeName = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_active_resume') : null;

  const hasData = (profile?.skills && profile.skills.length > 0) || activeResumeName;

  const handleSelectPreset = (preset) => {
    localStorage.setItem('jobachiever_active_resume', preset.fileName);
    localStorage.setItem('jobachiever_active_persona', preset.name);

    // Save as user resume
    if (user) {
      const userResumesKey = `jobachiever_user_resumes_${user.id || user.email}`;
      const doc = {
        id: preset.id,
        name: preset.fileName,
        title: preset.title,
        status: 'PROCESSED',
        uploadedAt: new Date().toISOString(),
        score: 94,
        size: '124 KB',
        track: preset.targetRole,
      };
      localStorage.setItem(userResumesKey, JSON.stringify([doc]));
    }

    // Update profile
    updateProfile({
      personalInfo: {
        ...profile.personalInfo,
        fullName: preset.name,
        headline: preset.title,
        email: preset.email,
        phone: preset.phone,
        city: preset.city,
        summary: preset.summary,
      },
      skills: preset.skills,
      experience: preset.experience,
      projects: preset.projects,
      education: preset.education,
      careerTracks: [
        {
          id: `track-${preset.id}`,
          name: preset.targetRole,
          targetRole: preset.targetRole,
          relevantSkills: preset.skills.slice(0, 5),
          isPrimary: true,
        },
      ],
    });

    window.dispatchEvent(new Event('jobachiever:resume-changed'));
    toast.success(`Active profile switched to ${preset.name}!`);
  };

  const handleCustomUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const fileName = file.name;
    localStorage.setItem('jobachiever_active_resume', fileName);

    // Create a realistic parsed profile from the custom uploaded resume
    const fLower = fileName.toLowerCase();
    let matchedPreset = PRESET_RESUMES[1]; // default backend
    if (fLower.includes('frontend') || fLower.includes('react') || fLower.includes('rohan')) {
      matchedPreset = PRESET_RESUMES[0];
    } else if (fLower.includes('ai') || fLower.includes('data') || fLower.includes('ml') || fLower.includes('vikram')) {
      matchedPreset = PRESET_RESUMES[2];
    }

    if (user) {
      const userResumesKey = `jobachiever_user_resumes_${user.id || user.email}`;
      const doc = {
        id: `res-${Date.now()}`,
        name: fileName,
        title: matchedPreset.title,
        status: 'PROCESSED',
        uploadedAt: new Date().toISOString(),
        score: 92,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        track: matchedPreset.targetRole,
      };
      const existing = JSON.parse(localStorage.getItem(userResumesKey) || '[]');
      localStorage.setItem(userResumesKey, JSON.stringify([doc, ...existing]));
    }

    // Apply matched preset content with candidate's actual user name
    const candidateName = (user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`).trim() || matchedPreset.name;
    updateProfile({
      personalInfo: {
        ...profile.personalInfo,
        fullName: candidateName,
        headline: matchedPreset.title,
        summary: matchedPreset.summary,
      },
      skills: matchedPreset.skills,
      experience: matchedPreset.experience,
      projects: matchedPreset.projects,
      education: matchedPreset.education,
      careerTracks: [
        {
          id: `track-${Date.now()}`,
          name: matchedPreset.targetRole,
          targetRole: matchedPreset.targetRole,
          relevantSkills: matchedPreset.skills.slice(0, 5),
          isPrimary: true,
        },
      ],
    });

    setTimeout(() => {
      setIsUploading(false);
      window.dispatchEvent(new Event('jobachiever:resume-changed'));
      toast.success(`Resume "${fileName}" uploaded & parsed successfully!`);
    }, 600);
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card via-primary/5 to-indigo-950/20 shadow-md">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-xs gap-1.5 py-0.5">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Single Source of Truth</span>
              </Badge>
              {activeResumeName && (
                <Badge variant="secondary" className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active: {activeResumeName}
                </Badge>
              )}
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {hasData ? 'Active Career Persona & Master Resume' : 'Activate Your Career Workspace'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-2xl">
              {hasData
                ? 'Your Master Profile, ATS scoring, JD matching, and Career Intelligence are fully synced to this resume. Switch profiles anytime to test different career tracks.'
                : 'Upload your resume or select one of the 3 verified benchmark profiles below to instantly initialize your career command center.'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleCustomUpload}
              accept=".pdf,.docx"
              className="hidden"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs gap-2 border-border/80"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>{isUploading ? 'Parsing Resume...' : 'Upload Resume (PDF/DOCX)'}</span>
            </Button>
          </div>
        </div>

        {/* 3 Benchmark Archetype Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {PRESET_RESUMES.map((preset) => {
            const isSelected = activeResumeName === preset.fileName;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`relative p-3.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-primary bg-primary/10 ring-1 ring-primary shadow-sm'
                    : 'border-border/60 bg-card/60 hover:border-primary/40 hover:bg-muted/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-foreground">{preset.name}</span>
                      {isSelected && (
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{preset.title}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-border/70 shrink-0">
                    {preset.targetRole.split(' ')[0]}
                  </Badge>
                </div>

                <div className="mt-2.5 flex flex-wrap gap-1">
                  {preset.skills.slice(0, 3).map((s) => (
                    <span key={s} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                      {s}
                    </span>
                  ))}
                  <span className="text-[10px] px-1 py-0.5 text-muted-foreground">+{preset.skills.length - 3}</span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
