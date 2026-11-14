import { Briefcase, Trash2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function ExperienceListCard() {
  const { profile, removeExperience } = useProfile();

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span>Work Experience History ({profile.experience.length})</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {profile.experience.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border/60 bg-card/60 p-4 space-y-2"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-foreground">{item.jobTitle}</h4>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs font-semibold text-primary">{item.company}</span>
                  {item.isCurrent && (
                    <Badge variant="success" className="text-[10px]">
                      Current
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {item.employmentType} • {item.location} • {item.startDate} —{' '}
                  {item.isCurrent ? 'Present' : item.endDate || 'N/A'}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeExperience(item.id)}
                className="text-muted-foreground hover:text-destructive h-8 w-8"
                aria-label="Remove experience"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-foreground/85 leading-relaxed">
              {item.responsibilities}
            </p>

            {item.achievements && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="font-bold">Key Achievement:</span> {item.achievements}
              </p>
            )}

            {item.technologies && (
              <div className="flex flex-wrap gap-1 pt-1">
                {item.technologies.split(',').map((tech) => (
                  <span
                    key={tech.trim()}
                    className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground"
                  >
                    {tech.trim()}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}

        {profile.experience.length === 0 && (
          <div className="text-xs text-muted-foreground py-4 text-center">
            No work experience records added.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
