import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Cpu, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  skillItemSchema,
  SKILL_CATEGORIES,
  PROFICIENCY_LEVELS,
} from '../../schemas/profileSchemas';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

export function SkillsForm({ onNext, onBack }) {
  const { profile, addSkill, removeSkill } = useProfile();
  const [selectedCategory, setSelectedCategory] = useState(SKILL_CATEGORIES[0]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(skillItemSchema),
    defaultValues: {
      id: '',
      name: '',
      category: SKILL_CATEGORIES[0],
      proficiency: 'Advanced',
      yearsOfExperience: '',
      evidence: '',
    },
    mode: 'onTouched',
  });

  const onAddSubmit = (data) => {
    try {
      addSkill(data);
      reset({
        id: '',
        name: '',
        category: selectedCategory,
        proficiency: 'Advanced',
        yearsOfExperience: '',
        evidence: '',
      });
      toast.success(`Added ${data.name}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Group existing skills by category
  const skillsByCategory = SKILL_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = profile.skills.filter((s) => s.category === cat);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Step 3: Technical Skills & Core Competencies
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Specify your validated proficiencies. The AI matching engine cross-references these
          against job description prerequisites.
        </p>
      </div>

      {/* Add Skill Quick Box */}
      <Card className="border-primary/30 bg-card shadow-sm">
        <CardContent className="p-5">
          <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4" noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Skill Name *"
                  placeholder="e.g. Spring Boot, React, PostgreSQL"
                  error={errors.name?.message}
                  {...register('name')}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/90 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  {...register('category')}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {SKILL_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground/90 uppercase tracking-wider mb-1.5">
                  Proficiency *
                </label>
                <select
                  className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  {...register('proficiency')}
                >
                  {PROFICIENCY_LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Years of Experience (Optional)"
                  placeholder="e.g. 3"
                  error={errors.yearsOfExperience?.message}
                  {...register('yearsOfExperience')}
                />
              </div>

              <div className="sm:col-span-2">
                <Input
                  label="Evidence / Project / Context (Optional)"
                  placeholder="e.g. Used to build REST APIs in production"
                  error={errors.evidence?.message}
                  {...register('evidence')}
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <Button type="submit" variant="default" size="sm" className="gap-1.5">
                <Plus className="h-4 w-4" />
                <span>Add Skill</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Rendered Grouped Skills Display */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Master Profile Skills ({profile.skills.length} total)</span>
          <span>Click trash icon to remove</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SKILL_CATEGORIES.map((category) => {
            const list = skillsByCategory[category] || [];
            if (list.length === 0) return null;

            return (
              <Card key={category} className="border-border/60 bg-card/60">
                <CardContent className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-border/40 pb-1.5">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-primary" />
                      <span>{category}</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {list.length}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {list.map((skill) => (
                      <div
                        key={skill.id}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border/70 bg-secondary/80 px-2.5 py-1 text-xs"
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        {profile.skills.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center text-xs text-muted-foreground">
            No skills entered yet. Add at least 3 skills to achieve optimal compatibility scoring.
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <Button type="button" variant="ai" onClick={onNext} className="gap-2">
          <span>Continue to Experience</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
