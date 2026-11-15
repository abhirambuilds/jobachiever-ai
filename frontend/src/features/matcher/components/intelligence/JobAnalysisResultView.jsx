import { useState } from 'react';
import {
  Building2,
  MapPin,
  Clock,
  Briefcase,
  Layers,
  Cpu,
  Star,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
  FileText,
  Key,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

export function JobAnalysisResultView({ analysis, rawText }) {
  const navigate = useNavigate();
  const [copiedKeywords, setCopiedKeywords] = useState(false);
  const [activeTab, setActiveTab] = useState('skills');

  if (!analysis) return null;

  const {
    jobOverview,
    technicalSkills,
    softSkills,
    responsibilities,
    qualifications,
    toolsAndTechnologies,
    keywords,
    requirements,
    ambiguities,
    summary,
    provider,
    model,
    createdAt,
  } = analysis;

  const handleCopyKeywords = () => {
    const allKeywords = [
      ...(keywords?.coreTechnical || []),
      ...(keywords?.frameworksAndTools || []),
      ...(keywords?.domain || []),
      ...(keywords?.softSkills || []),
      ...(keywords?.roleAndResponsibility || []),
    ];
    navigator.clipboard?.writeText(allKeywords.join(', '));
    setCopiedKeywords(true);
    setTimeout(() => setCopiedKeywords(false), 2000);
  };

  const handleContinueToMatching = () => {
    navigate('/job-match', {
      state: {
        preloadedJobText: rawText,
        preloadedJobOverview: jobOverview,
      },
    });
  };

  const getImportanceBadge = (importance) => {
    switch (importance) {
      case 'CRITICAL':
        return <Badge variant="destructive" className="text-[10px] uppercase font-bold">Critical</Badge>;
      case 'HIGH':
        return <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] uppercase font-bold">High</Badge>;
      case 'MEDIUM':
        return <Badge className="bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[10px] uppercase font-bold">Medium</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px] uppercase font-bold">Low</Badge>;
    }
  };

  const getSeniorityBadge = (seniority) => {
    const formatted = seniority?.replace('_', ' ') || 'UNKNOWN';
    return (
      <Badge variant="outline" className="text-xs uppercase font-medium">
        {formatted}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Overview Card */}
      <Card className="border-border/80 bg-card/75 backdrop-blur-sm">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-border/50 pb-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" />
                  <span>{jobOverview.companyName}</span>
                </span>
                <Badge variant="secondary" className="text-xs font-medium">
                  {jobOverview.workArrangement}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium">
                  {jobOverview.employmentType}
                </Badge>
                {getSeniorityBadge(jobOverview.seniority)}
              </div>

              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">
                {jobOverview.jobTitle}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>{jobOverview.location}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Experience: {jobOverview.experienceRange?.rawRequirement || 'Not specified'}</span>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>Category: {jobOverview.roleCategory?.replace('_', ' ')}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2.5 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKeywords}
                className="text-xs gap-1.5"
              >
                {copiedKeywords ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedKeywords ? 'Keywords Copied!' : 'Copy Keywords'}</span>
              </Button>

              <Button
                size="sm"
                onClick={handleContinueToMatching}
                className="text-xs gap-1.5 bg-primary text-primary-foreground font-semibold shadow-sm"
              >
                <span>Resume Matcher</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Role Summary Callout */}
          {summary && (
            <div className="p-3.5 bg-muted/40 rounded-lg border border-border/50 text-xs text-muted-foreground leading-relaxed flex items-start gap-2.5">
              <FileText className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-foreground">AI Role Synthesis: </span>
                <span>{summary}</span>
              </div>
            </div>
          )}

          {/* Model & Metadata Strip */}
          <div className="flex flex-wrap items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border/40">
            <span className="flex items-center gap-1">
              <span>Analyzed by:</span>
              <strong className="text-foreground">{provider}</strong> ({model})
            </span>
            <span>Created: {new Date(createdAt).toLocaleString()}</span>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Breakdown */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-6 h-auto p-1 bg-muted/50 border border-border/60">
          <TabsTrigger value="skills" className="text-xs font-semibold gap-1.5 py-2">
            <Cpu className="h-3.5 w-3.5 text-cyan-400" />
            <span>Technical Skills</span>
          </TabsTrigger>
          <TabsTrigger value="qualifications" className="text-xs font-semibold gap-1.5 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Qualifications</span>
          </TabsTrigger>
          <TabsTrigger value="responsibilities" className="text-xs font-semibold gap-1.5 py-2">
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Responsibilities</span>
          </TabsTrigger>
          <TabsTrigger value="requirements" className="text-xs font-semibold gap-1.5 py-2">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            <span>Requirements ({requirements?.length || 0})</span>
          </TabsTrigger>
          <TabsTrigger value="keywords" className="text-xs font-semibold gap-1.5 py-2">
            <Key className="h-3.5 w-3.5 text-primary" />
            <span>Keywords</span>
          </TabsTrigger>
          <TabsTrigger value="ambiguities" className="text-xs font-semibold gap-1.5 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-rose-400" />
            <span>Ambiguities ({ambiguities?.length || 0})</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Technical Skills */}
        <TabsContent value="skills" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Required Skills */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="text-[10px] font-bold">REQUIRED</Badge>
                  <h3 className="text-sm font-semibold text-foreground">Must-Have Technical Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {technicalSkills?.required?.length > 0 ? (
                    technicalSkills.required.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-rose-500/10 text-rose-300 border border-rose-500/20"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No explicit required skills listed.</span>
                  )}
                </div>
              </div>

              {/* Preferred Skills */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <Badge className="bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-bold">PREFERRED</Badge>
                  <h3 className="text-sm font-semibold text-foreground">Nice-to-Have &amp; Bonus Skills</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {technicalSkills?.preferred?.length > 0 ? (
                    technicalSkills.preferred.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-500/10 text-amber-300 border border-amber-500/20"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">No preferred skills specifically stated.</span>
                  )}
                </div>
              </div>

              {/* Tools & Platforms */}
              {toolsAndTechnologies?.length > 0 && (
                <div className="space-y-2.5 border-t border-border/50 pt-5">
                  <h3 className="text-sm font-semibold text-foreground">Tools, Platforms &amp; Databases</h3>
                  <div className="flex flex-wrap gap-2">
                    {toolsAndTechnologies.map((tool, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Soft Skills */}
              {softSkills?.length > 0 && (
                <div className="space-y-2.5 border-t border-border/50 pt-5">
                  <h3 className="text-sm font-semibold text-foreground">Soft Skills &amp; Collaborative Behaviors</h3>
                  <div className="flex flex-wrap gap-2">
                    {softSkills.map((skill, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground border border-border"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Qualifications */}
        <TabsContent value="qualifications" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  <span>Educational Requirements</span>
                </h3>
                {qualifications?.education?.length > 0 ? (
                  <ul className="space-y-2">
                    {qualifications.education.map((edu, i) => (
                      <li key={i} className="text-xs text-foreground/90 flex items-start gap-2 bg-muted/30 p-2.5 rounded border border-border/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No specific educational degrees required.</p>
                )}
              </div>

              <div className="space-y-3 border-t border-border/50 pt-5">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400" />
                  <span>Certifications &amp; Professional Credentials</span>
                </h3>
                {qualifications?.certifications?.length > 0 ? (
                  <ul className="space-y-2">
                    {qualifications.certifications.map((cert, i) => (
                      <li key={i} className="text-xs text-foreground/90 flex items-start gap-2 bg-muted/30 p-2.5 rounded border border-border/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                        <span>{cert}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground italic">No specific certifications requested.</p>
                )}
              </div>

              {qualifications?.otherRequirements?.length > 0 && (
                <div className="space-y-3 border-t border-border/50 pt-5">
                  <h3 className="text-sm font-semibold text-foreground">Other Prerequisites</h3>
                  <ul className="space-y-2">
                    {qualifications.otherRequirements.map((req, i) => (
                      <li key={i} className="text-xs text-foreground/90 flex items-start gap-2 bg-muted/30 p-2.5 rounded border border-border/40">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Responsibilities */}
        <TabsContent value="responsibilities" className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-sm font-semibold text-foreground mb-4">Core Responsibilities &amp; Role Expectations</h3>
              {responsibilities?.length > 0 ? (
                <div className="space-y-2.5">
                  {responsibilities.map((resp, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/50 text-xs text-foreground/90 leading-relaxed">
                      <span className="flex items-center justify-center h-5 w-5 rounded-full bg-primary/10 text-primary font-bold text-[10px] shrink-0">
                        {i + 1}
                      </span>
                      <span>{resp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">No explicit responsibilities section identified.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Atomic Requirements & Evidence */}
        <TabsContent value="requirements" className="space-y-4">
          <div className="space-y-3">
            {requirements?.length > 0 ? (
              requirements.map((req, i) => (
                <Card key={i} className="border-border/60">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {getImportanceBadge(req.importance)}
                        <span className="text-xs font-semibold text-foreground">{req.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Badge variant="outline" className="text-[10px]">{req.category}</Badge>
                        <Badge variant="secondary" className="text-[10px]">{req.requirementType}</Badge>
                      </div>
                    </div>
                    {req.evidenceExcerpt && (
                      <div className="text-xs bg-muted/40 p-2.5 rounded border border-border/40 font-mono text-muted-foreground italic">
                        &quot;{req.evidenceExcerpt}&quot;
                      </div>
                    )}
                    <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>Source Section: <strong>{req.section}</strong></span>
                      <span>Confidence: {Math.round(req.confidence * 100)}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-xs text-muted-foreground">
                  No individual requirement items extracted.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab 5: Keywords */}
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Core Technical Keywords</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(keywords?.coreTechnical || []).map((k, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-mono">{k}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 border-t border-border/50 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Frameworks &amp; Tools</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(keywords?.frameworksAndTools || []).map((k, i) => (
                    <Badge key={i} variant="secondary" className="text-xs font-mono">{k}</Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2.5 border-t border-border/50 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Domain &amp; Industry Concepts</h4>
                <div className="flex flex-wrap gap-1.5">
                  {(keywords?.domain || []).map((k, i) => (
                    <Badge key={i} className="bg-primary/10 text-primary border-primary/20 text-xs font-mono">{k}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 6: Ambiguities & Red Flags */}
        <TabsContent value="ambiguities" className="space-y-4">
          <div className="space-y-3">
            {ambiguities?.length > 0 ? (
              ambiguities.map((item, i) => (
                <Card key={i} className="border-border/60">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-4 w-4 text-amber-400" />
                        <h4 className="text-xs font-semibold text-foreground">{item.topic}</h4>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-amber-400 border-amber-500/30">
                        {item.classification}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.observation}</p>
                    {item.recommendation && (
                      <p className="text-xs text-foreground/80 bg-muted/30 p-2 rounded border border-border/40">
                        <strong>Candidate Advisory:</strong> {item.recommendation}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-6 text-center text-xs text-muted-foreground">
                  Zero critical ambiguities or missing baseline information detected in this job description.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
