import { useState } from 'react';
import {
  Building2,
  MapPin,
  CheckCircle2,
  Star,
  ListChecks,
  Key,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';
import { useJobMatcher } from '@/hooks/useJobMatcher';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function JobDecompositionView() {
  const { currentMatch } = useJobMatcher();
  const [activeTab, setActiveTab] = useState('required');

  if (!currentMatch?.decomposition) return null;

  const { jobOverview, decomposition } = currentMatch;
  const { requiredQualifications, preferredQualifications, responsibilities, keywords, eligibilityConstraints } = decomposition;

  return (
    <Card className="border-border/80 bg-card/75 backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6 space-y-5">
        {/* Role & Company Header Overview */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-border/50 pb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-primary flex items-center gap-1">
                <Building2 className="h-3.5 w-3.5" />
                <span>{jobOverview.company}</span>
              </span>
              <Badge variant="outline" className="text-[10px]">
                {jobOverview.workMode}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {jobOverview.employmentType}
              </Badge>
            </div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight">
              {jobOverview.title}
            </h2>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{jobOverview.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{jobOverview.experienceLevel}</span>
              </span>
              {jobOverview.url && (
                <>
                  <span>•</span>
                  <a
                    href={jobOverview.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-primary hover:underline"
                  >
                    <span>View Listing</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </>
              )}
            </div>
          </div>

          <Badge variant="ai" className="text-xs font-semibold px-2 py-0.5 shrink-0">
            Decomposed JD
          </Badge>
        </div>

        {/* Intelligence Tabs: Required, Preferred, Responsibilities, Keywords, Eligibility */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-5 h-10 w-full">
            <TabsTrigger value="required" className="text-xs font-semibold gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-rose-500" />
              <span>Required ({requiredQualifications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="preferred" className="text-xs font-semibold gap-1">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span>Preferred ({preferredQualifications.length})</span>
            </TabsTrigger>
            <TabsTrigger value="responsibilities" className="text-xs font-semibold gap-1">
              <ListChecks className="h-3.5 w-3.5 text-cyan-400" />
              <span>Responsibilities</span>
            </TabsTrigger>
            <TabsTrigger value="keywords" className="text-xs font-semibold gap-1">
              <Key className="h-3.5 w-3.5 text-primary" />
              <span>Keywords</span>
            </TabsTrigger>
            <TabsTrigger value="eligibility" className="text-xs font-semibold gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Eligibility</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: REQUIRED QUALIFICATIONS */}
          <TabsContent value="required" className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {requiredQualifications.map((req) => (
                <div
                  key={req.id}
                  className="rounded-xl border border-border/70 bg-card p-3.5 space-y-1.5 flex items-start gap-2.5"
                >
                  <CheckCircle2 className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      {req.category}
                    </span>
                    <p className="text-foreground leading-relaxed font-medium">{req.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: PREFERRED QUALIFICATIONS */}
          <TabsContent value="preferred" className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {preferredQualifications.map((pref) => (
                <div
                  key={pref.id}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-1.5 flex items-start gap-2.5"
                >
                  <Star className="h-4 w-4 text-amber-400 shrink-0 mt-0.5 fill-amber-400/20" />
                  <div className="space-y-0.5 text-xs">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">
                      {pref.category} • Bonus
                    </span>
                    <p className="text-foreground leading-relaxed">{pref.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: RESPONSIBILITIES */}
          <TabsContent value="responsibilities" className="space-y-2.5 pt-1">
            <div className="space-y-2">
              {responsibilities.map((resp, idx) => (
                <div
                  key={resp.id}
                  className="rounded-xl border border-border/70 bg-card p-3 flex items-start gap-3 text-xs"
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold">
                    {idx + 1}
                  </span>
                  <p className="text-foreground leading-relaxed">{resp.text}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: KEYWORDS */}
          <TabsContent value="keywords" className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-primary block">
                  Technical Core
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.technical.map((k) => (
                    <Badge key={k} variant="secondary" className="text-[10px]">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">
                  Frameworks &amp; Tools
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.tools.map((k) => (
                    <Badge key={k} variant="outline" className="text-[10px]">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-amber-400 block">
                  Architecture &amp; Domain
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.industry.map((k) => (
                    <Badge key={k} variant="outline" className="text-[10px]">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border/70 bg-card p-3.5 space-y-2">
                <span className="text-[10px] uppercase font-bold text-emerald-500 block">
                  Soft Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {keywords.softSkills.map((k) => (
                    <Badge key={k} variant="outline" className="text-[10px]">
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* TAB 5: ELIGIBILITY CONSTRAINTS */}
          <TabsContent value="eligibility" className="space-y-3 pt-1">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground flex items-start gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
              <p>
                <strong className="text-foreground font-semibold">Strict Fact Guardrail: </strong>
                Only explicitly stated constraints are extracted. Unstated restrictions (such as unspoken graduation limits) are never assumed.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {eligibilityConstraints.map((el) => (
                <div
                  key={el.id}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3.5 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground">
                      {el.label}
                    </span>
                    <Badge variant="success" className="text-[9px] px-1 py-0">
                      Met
                    </Badge>
                  </div>
                  <p className="font-semibold text-foreground pt-0.5">{el.value}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
