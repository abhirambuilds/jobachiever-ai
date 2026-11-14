import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { experienceItemSchema, EMPLOYMENT_TYPES } from '../../schemas/profileSchemas';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function ExperienceForm({ onNext, onBack }) {
  const { profile, addExperience, removeExperience } = useProfile();
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(experienceItemSchema),
    defaultValues: {
      id: '',
      company: '',
      jobTitle: '',
      employmentType: 'Full-time',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      responsibilities: '',
      achievements: '',
      technologies: '',
    },
    mode: 'onTouched',
  });

  const isCurrent = watch('isCurrent');

  const onAddSubmit = (data) => {
    addExperience(data);
    reset();
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Step 4: Professional Work Experience
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Capture previous full-time roles, internships, contracts, and freelance experience.
          </p>
        </div>
        {!isAdding && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            className="gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>Add Experience</span>
          </Button>
        )}
      </div>

      {/* Existing Experience Records */}
      <div className="space-y-3">
        {profile.experience.map((item) => (
          <Card key={item.id} className="border-border/70 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <Briefcase className="h-5 w-5" />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{item.jobTitle}</h4>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs font-semibold text-primary">{item.company}</span>
                    {item.isCurrent && (
                      <Badge variant="success" className="text-[10px]">
                        Current Role
                      </Badge>
                    )}
                  </div>

                  <p className="text-[11px] text-muted-foreground">
                    {item.employmentType} • {item.location} • {item.startDate} —{' '}
                    {item.isCurrent ? 'Present' : item.endDate || 'N/A'}
                  </p>

                  <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                    {item.responsibilities}
                  </p>

                  {item.achievements && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Key Impact: {item.achievements}
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
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeExperience(item.id)}
                className="text-destructive hover:bg-destructive/10 h-8 w-8"
                aria-label="Remove experience record"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {profile.experience.length === 0 && !isAdding && (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-3 bg-muted/20">
            <Briefcase className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">
              No work experience records added yet (optional for freshers &amp; students).
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Work History</span>
            </Button>
          </div>
        )}
      </div>

      {/* Add New Experience Form */}
      {isAdding && (
        <Card className="border-primary/40 bg-card shadow-md animate-in fade-in-50 duration-200">
          <CardContent className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span>New Work Experience Record</span>
            </h4>

            <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company / Organization *"
                  placeholder="e.g. Acme Corp"
                  error={errors.company?.message}
                  {...register('company')}
                />

                <Input
                  label="Job Title *"
                  placeholder="e.g. Software Engineer"
                  error={errors.jobTitle?.message}
                  {...register('jobTitle')}
                />

                <div>
                  <label className="block text-xs font-medium text-foreground/90 uppercase tracking-wider mb-1.5">
                    Employment Type *
                  </label>
                  <select
                    className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    {...register('employmentType')}
                  >
                    {EMPLOYMENT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Location *"
                  placeholder="e.g. New York, NY (Remote)"
                  error={errors.location?.message}
                  {...register('location')}
                />

                <Input
                  label="Start Date *"
                  type="month"
                  error={errors.startDate?.message}
                  {...register('startDate')}
                />

                {!isCurrent && (
                  <Input
                    label="End Date"
                    type="month"
                    error={errors.endDate?.message}
                    {...register('endDate')}
                  />
                )}

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                      {...register('isCurrent')}
                    />
                    <span>I currently work here</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Core Responsibilities *"
                    placeholder="Describe your primary role, system architecture, leadership, and responsibilities..."
                    rows={3}
                    error={errors.responsibilities?.message}
                    {...register('responsibilities')}
                  />
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Measurable Key Achievements"
                    placeholder="e.g. Reduced server response times by 35% through query caching..."
                    rows={2}
                    helperText="Truthful metrics improve explainable match scores without fabrication."
                    {...register('achievements')}
                  />
                </div>

                <div className="md:col-span-2">
                  <Input
                    label="Technologies Used"
                    placeholder="e.g. Java, Spring Boot, React, PostgreSQL, Docker"
                    {...register('technologies')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAdding(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm">
                  Save Experience
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <Button type="button" variant="ai" onClick={onNext} className="gap-2">
          <span>Continue to Projects</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
