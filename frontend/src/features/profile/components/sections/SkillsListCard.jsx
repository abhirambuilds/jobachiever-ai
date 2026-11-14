import { Cpu, Trash2 } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SKILL_CATEGORIES } from '../../schemas/profileSchemas';

export function SkillsListCard() {
  const { profile, removeSkill } = useProfile();

  const skillsByCategory = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = profile.skills.filter((s) => s.category === cat);
    return acc;
  }, {});

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Cpu className="h-4 w-4 text-primary" />
            <span>Master Skill Graph ({profile.skills.length} Competencies)</span>
          </CardTitle>
          <span className="text-xs text-muted-foreground">Categorized</span>
        </div>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKILL_CATEGORIES.map((category) => {
            const list = skillsByCategory[category] || [];
            if (list.length === 0) return null;

            return (
              <div
                key={category}
                className="rounded-xl border border-border/60 bg-muted/20 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground">{category}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {list.length}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {list.map((skill) => (
                    <div
                      key={skill.id}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-card px-2.5 py-1 text-xs shadow-xs"
                    >
                      <span className="font-medium text-foreground">{skill.name}</span>
                      <Badge
                        variant={
                          skill.proficiency === 'Expert'
                            ? 'success'
                            : skill.proficiency === 'Advanced'
                            ? 'ai'
                            : 'outline'
                        }
                        className="text-[9px] px-1 py-0"
                      >
                        {skill.proficiency}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => removeSkill(skill.id)}
                        className="text-muted-foreground hover:text-destructive ml-1"
                        aria-label={`Remove ${skill.name}`}
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {profile.skills.length === 0 && (
          <div className="text-xs text-muted-foreground py-4 text-center">
            No technical skills entered.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
