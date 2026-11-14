import {
  FileSearch,
  FileText,
  Layers,
  FolderGit2,
  Briefcase,
  GraduationCap,
  Layout,
  Languages,
  Lightbulb,
} from 'lucide-react';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const iconMap = {
  ats_readability: FileSearch,
  content_quality: FileText,
  skills_relevance: Layers,
  project_quality: FolderGit2,
  experience_presentation: Briefcase,
  education_certifications: GraduationCap,
  structure_formatting: Layout,
  language_clarity: Languages,
};

export function CategoryScoreGrid() {
  const { currentAnalysis } = useAnalyzer();

  if (!currentAnalysis?.categories) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">
            Multi-Dimensional Category Audit
          </h3>
          <p className="text-xs text-muted-foreground">
            Granular breakdown across the 8 core dimensions of modern resume engineering.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {currentAnalysis.categories.map((cat) => {
          const Icon = iconMap[cat.id] || FileText;
          const isHigh = cat.score >= 90;

          return (
            <Card
              key={cat.id}
              className="border-border/80 bg-card/75 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs flex flex-col justify-between"
            >
              <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-2.5">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 border border-border/60 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={isHigh ? 'success' : 'outline'}
                        className="text-[10px] font-mono px-1.5 py-0"
                      >
                        {cat.score}%
                      </Badge>
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        {cat.rating}
                      </Badge>
                    </div>
                  </div>

                  {/* Title and Progress Bar */}
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{cat.name}</h4>
                    <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted/60">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isHigh ? 'bg-primary' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${cat.score}%` }}
                      />
                    </div>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                    {cat.explanation}
                  </p>
                </div>

                {/* Improvement Opportunity */}
                <div className="pt-2.5 border-t border-border/40 space-y-1">
                  <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-primary tracking-wide">
                    <Lightbulb className="h-3 w-3" />
                    <span>Improvement Opportunity</span>
                  </span>
                  <p className="text-[11px] text-foreground/80 leading-snug">
                    {cat.opportunity}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
