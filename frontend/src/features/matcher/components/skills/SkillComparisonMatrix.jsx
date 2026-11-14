import { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FolderGit2,
} from 'lucide-react';
import { useJobMatcher } from '@/hooks/useJobMatcher';
import { EVIDENCE_LEVELS } from '@/services/jobMatchingService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function SkillComparisonMatrix({ sectionRef }) {
  const { currentMatch } = useJobMatcher();
  const [expandedSkillId, setExpandedSkillId] = useState(null);

  if (!currentMatch?.skillComparisons) return null;

  const skills = currentMatch.skillComparisons;

  const toggleExpand = (id) => {
    setExpandedSkillId((prev) => (prev === id ? null : id));
  };

  const getStatusBadge = (level) => {
    switch (level) {
      case EVIDENCE_LEVELS.STRONG:
        return (
          <Badge variant="success" className="text-[10px] gap-1 px-1.5 py-0">
            <CheckCircle2 className="h-2.5 w-2.5" />
            <span>Strong Evidence</span>
          </Badge>
        );
      case EVIDENCE_LEVELS.PARTIAL:
        return (
          <Badge variant="warning" className="text-[10px] gap-1 px-1.5 py-0">
            <AlertTriangle className="h-2.5 w-2.5" />
            <span>Partial Evidence</span>
          </Badge>
        );
      case EVIDENCE_LEVELS.NO_RECORDED:
        return (
          <Badge variant="secondary" className="text-[10px] gap-1 px-1.5 py-0 text-muted-foreground">
            <HelpCircle className="h-2.5 w-2.5" />
            <span>No Recorded Evidence</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Not Applicable
          </Badge>
        );
    }
  };

  return (
    <Card ref={sectionRef} className="border-border/80 bg-card/75 backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6 space-y-5">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Granular Skill Evidence Matrix
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Transparent mapping between extracted job requirements and verified profile evidence.
          </p>
        </div>

        {/* Honesty Guardrail Callout */}
        <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-start gap-2.5 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong className="text-foreground font-semibold">Strict Evidentiary Boundary: </strong>
            &ldquo;No recorded evidence&rdquo; means this specific skill or keyword is not yet logged in your
            current profile or resume. It does NOT assert that you do not possess the skill. The system
            never invents or assumes missing technical proficiencies.
          </p>
        </div>

        {/* Skills Table / List */}
        <div className="rounded-xl border border-border/70 overflow-hidden divide-y divide-border/50 text-xs">
          {skills.map((item) => {
            const isExpanded = expandedSkillId === item.id;

            return (
              <div
                key={item.id}
                className="p-4 transition-colors hover:bg-muted/30 bg-card/60 space-y-2.5"
              >
                <div
                  onClick={() => toggleExpand(item.id)}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 cursor-pointer"
                >
                  {/* Left: Skill Requirement & Category */}
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-foreground">{item.requirement}</span>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {item.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
                      {item.profileEvidence}
                    </p>
                  </div>

                  {/* Right: Evidence Badge & Expand Chevron */}
                  <div className="flex items-center gap-2 shrink-0 justify-between sm:justify-end">
                    {getStatusBadge(item.evidenceLevel)}
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground p-1"
                      aria-label="Toggle details"
                    >
                      {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Expandable Supporting Evidence Drawer */}
                {isExpanded && (
                  <div className="pt-2.5 border-t border-border/40 space-y-2 animate-in fade-in">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                      Supporting Profile Evidence
                    </span>
                    <p className="text-xs text-foreground font-medium leading-relaxed">
                      {item.profileEvidence}
                    </p>
                    {item.supportingItem && (
                      <div className="flex items-center gap-2 pt-1 text-[11px] text-muted-foreground">
                        <FolderGit2 className="h-3.5 w-3.5 text-primary" />
                        <span>Source: {item.supportingItem}</span>
                        <span>•</span>
                        <span>Section: {item.supportingSection}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
