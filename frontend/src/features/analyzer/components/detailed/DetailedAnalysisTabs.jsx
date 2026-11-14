import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Languages,
  ShieldCheck,
} from 'lucide-react';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DetailedAnalysisTabs() {
  const { currentAnalysis } = useAnalyzer();
  const [activeTab, setActiveTab] = useState('strengths');

  if (!currentAnalysis) return null;

  const { strengths, weaknesses, missingInformation, languageAndClarity } = currentAnalysis;

  return (
    <Card className="border-border/80 bg-card/75 backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Qualitative Resume Critique &amp; Structural Evidence
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Detailed, evidence-backed evaluation across positive anchors, improvement vectors, and clarity checks.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-10 w-full max-w-2xl">
            <TabsTrigger value="strengths" className="gap-1.5 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              <span>Strengths ({strengths?.length || 0})</span>
            </TabsTrigger>

            <TabsTrigger value="weaknesses" className="gap-1.5 text-xs font-semibold">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Weaknesses ({weaknesses?.length || 0})</span>
            </TabsTrigger>

            <TabsTrigger value="missing" className="gap-1.5 text-xs font-semibold">
              <HelpCircle className="h-3.5 w-3.5 text-cyan-400" />
              <span>Missing Info ({missingInformation?.length || 0})</span>
            </TabsTrigger>

            <TabsTrigger value="language" className="gap-1.5 text-xs font-semibold">
              <Languages className="h-3.5 w-3.5 text-primary" />
              <span>Language &amp; Tone</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: STRENGTHS */}
          <TabsContent value="strengths" className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {strengths?.map((str) => (
                <div
                  key={str.id}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span>{str.title}</span>
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {str.section}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed pl-5">
                    {str.description}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 2: WEAKNESSES */}
          <TabsContent value="weaknesses" className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {weaknesses?.map((weak) => (
                <div
                  key={weak.id}
                  className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-1.5 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={weak.severity === 'critical' ? 'destructive' : 'warning'}
                        className="text-[10px] uppercase font-mono px-1.5 py-0"
                      >
                        {weak.severity}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground font-mono">
                        {weak.section}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-foreground">{weak.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {weak.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 3: MISSING INFORMATION */}
          <TabsContent value="missing" className="space-y-3 pt-2">
            <div className="rounded-xl border border-border/60 bg-muted/20 p-3 text-xs text-muted-foreground flex items-start gap-2 mb-3">
              <ShieldCheck className="h-4 w-4 text-cyan-400 shrink-0 mt-0.5" />
              <p>
                <strong className="text-foreground font-semibold">Honesty Guardrail: </strong>
                JobAchiever AI strictly identifies missing or unclear evidence rather than presuming
                you lack the qualification. Review these suggestions to provide verifiable proof.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {missingInformation?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-border/70 bg-card p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] text-cyan-400">
                      {item.status}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {item.section}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* TAB 4: LANGUAGE AND CLARITY */}
          <TabsContent value="language" className="space-y-3 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {languageAndClarity?.map((lang) => (
                <div
                  key={lang.id}
                  className="rounded-xl border border-border/70 bg-card p-4 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">{lang.title}</span>
                    {lang.count > 0 ? (
                      <Badge variant="warning" className="text-[10px] font-mono">
                        {lang.count} flagged
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-[10px]">
                        Clean
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {lang.description}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
