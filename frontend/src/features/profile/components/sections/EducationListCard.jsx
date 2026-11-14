import { GraduationCap, Trash2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function EducationListCard() {
  const { profile, removeEducation } = useProfile();

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-primary" />
            <span>Academic Education ({profile.education.length})</span>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        {profile.education.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-border/60 bg-card/60 p-4 flex items-start justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-foreground">{item.institution}</h4>
                {item.isCurrent && (
                  <Badge variant="success" className="text-[10px]">
                    Current
                  </Badge>
                )}
              </div>
              <p className="text-xs font-semibold text-primary">
                {item.degree} in {item.fieldOfStudy}
              </p>
              <p className="text-[11px] text-muted-foreground font-mono">
                {item.startDate} — {item.isCurrent ? 'Present' : item.graduationDate || 'N/A'}
                {item.gpa && ` • GPA: ${item.gpa}`}
              </p>
              {item.coursework && (
                <p className="text-[11px] text-muted-foreground pt-1 leading-relaxed">
                  <span className="font-semibold text-foreground/80">Key Coursework:</span>{' '}
                  {item.coursework}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeEducation(item.id)}
              className="text-muted-foreground hover:text-destructive h-8 w-8"
              aria-label="Remove education"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {profile.education.length === 0 && (
          <div className="text-xs text-muted-foreground py-4 text-center">
            No education records added.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
