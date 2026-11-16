import { useState, useEffect } from 'react';
import {
  User,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

import { ProfileHeader } from '@/features/profile/components/sections/ProfileHeader';
import { PersonalInfoCard } from '@/features/profile/components/sections/PersonalInfoCard';
import { EducationListCard } from '@/features/profile/components/sections/EducationListCard';
import { SkillsListCard } from '@/features/profile/components/sections/SkillsListCard';
import { ExperienceListCard } from '@/features/profile/components/sections/ExperienceListCard';
import { ProjectsListCard } from '@/features/profile/components/sections/ProjectsListCard';
import { CertificationsAchievementsCard } from '@/features/profile/components/sections/CertificationsAchievementsCard';
import { CareerPreferencesCard } from '@/features/profile/components/sections/CareerPreferencesCard';
import { CareerTrackManager } from '@/features/profile/components/tracks/CareerTrackManager';
import { useProfile } from '@/hooks/useProfile';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

export function ProfilePage({ initialTab = 'master' }) {
  const { profile, calculateCompleteness, resetToDemo } = useProfile();
  const { percentage, checks, missingSections } = calculateCompleteness();
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleReset = () => {
    resetToDemo();
    toast.success('Master profile synchronized.');
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-8 space-y-8">
      {/* Profile Master Header */}
      <ProfileHeader />

      {/* Main Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-3">
          <TabsList className="grid w-full sm:w-auto grid-cols-3 h-11">
            <TabsTrigger value="master" className="gap-2 text-xs sm:text-sm font-semibold">
              <User className="h-4 w-4" />
              <span>Master Profile</span>
            </TabsTrigger>
            <TabsTrigger value="tracks" className="gap-2 text-xs sm:text-sm font-semibold">
              <Layers className="h-4 w-4 text-cyan-400" />
              <span>Career Tracks ({profile.careerTracks.length})</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="gap-2 text-xs sm:text-sm font-semibold">
              <Activity className="h-4 w-4 text-emerald-500" />
              <span>Profile Health</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 text-xs h-9"
              title="Reset profile data to demo values"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset to Sample Profile</span>
            </Button>
          </div>
        </div>

        {/* TAB 1: MASTER PROFILE SECTIONS */}
        <TabsContent value="master" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Columns: Summary, Skills, Experience, Projects */}
            <div className="space-y-6 lg:col-span-8">
              <PersonalInfoCard />
              <SkillsListCard />
              <ExperienceListCard />
              <ProjectsListCard />
            </div>

            {/* Right 4 Columns: Education, Certs, Career Preferences */}
            <div className="space-y-6 lg:col-span-4">
              <EducationListCard />
              <CertificationsAchievementsCard />
              <CareerPreferencesCard />
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: MULTI-TRACK CAREER MANAGER */}
        <TabsContent value="tracks" className="space-y-6">
          <CareerTrackManager />
        </TabsContent>

        {/* TAB 3: PROFILE HEALTH & COMPLETENESS */}
        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2 border-border/70 bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-emerald-500" />
                    <span>Profile Graph Audit</span>
                  </CardTitle>
                  <Badge variant="success" dot>
                    {percentage}% Health Score
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Completeness evaluates field presence across all seven core sections. A complete
                  master profile enables our FastAPI engine to compute explainable compatibility
                  scores and extract truthful achievements without guessing.
                </p>

                <div className="space-y-3 pt-2">
                  {checks.map((c) => (
                    <div
                      key={c.name}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/20 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {c.completed ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                        )}
                        <span className={`font-semibold ${c.completed ? 'text-foreground' : 'text-amber-500'}`}>
                          {c.name}
                        </span>
                      </div>
                      <Badge variant={c.completed ? 'outline' : 'warning'} className="text-[10px]">
                        {c.completed ? `+${c.weight}% Verified` : 'Pending Entry'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/70 bg-card">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  <span>AI Readiness Guarantee</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs text-muted-foreground">
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 space-y-1">
                  <span className="font-semibold text-emerald-500 block">
                    Zero-Fabrication Anchor
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Every resume generated for your career tracks will cite solely from the verified
                    items in this master profile.
                  </p>
                </div>

                <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 space-y-1">
                  <span className="font-semibold text-primary block">
                    Single Point of Update
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    Update a project or job milestone once, and it instantly syncs across all your
                    targeted tracks, cover letters, and web portfolios.
                  </p>
                </div>

                {missingSections.length > 0 && (
                  <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-1">
                    <span className="font-semibold text-foreground block">
                      Next Recommended Steps
                    </span>
                    <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                      {missingSections.map((sec) => (
                        <li key={sec}>Add details to {sec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
