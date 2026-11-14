import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, GraduationCap, ArrowRight, ArrowLeft } from 'lucide-react';
import { educationItemSchema } from '../../schemas/profileSchemas';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function EducationForm({ onNext, onBack }) {
  const { profile, addEducation, removeEducation } = useProfile();
  const [isAdding, setIsAdding] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(educationItemSchema),
    defaultValues: {
      id: '',
      institution: '',
      degree: '',
      fieldOfStudy: '',
      startDate: '',
      graduationDate: '',
      isCurrent: false,
      gpa: '',
      coursework: '',
    },
    mode: 'onTouched',
  });

  const isCurrent = watch('isCurrent');

  const onAddSubmit = (data) => {
    addEducation(data);
    reset();
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            Step 2: Academic History & Education
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Add undergraduate, postgraduate, or diploma programs.
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
            <span>Add Education</span>
          </Button>
        )}
      </div>

      {/* Existing Education Records List */}
      <div className="space-y-3">
        {profile.education.map((item) => (
          <Card key={item.id} className="border-border/70 bg-card/60 backdrop-blur-sm">
            <CardContent className="p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0 mt-0.5">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-foreground">{item.institution}</h4>
                    {item.isCurrent && (
                      <Badge variant="success" className="text-[10px]">
                        Currently Enrolled
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground/90">
                    {item.degree} in {item.fieldOfStudy}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {item.startDate} — {item.isCurrent ? 'Present' : item.graduationDate || 'N/A'}
                    {item.gpa && ` • GPA: ${item.gpa}`}
                  </p>
                  {item.coursework && (
                    <p className="text-[11px] text-muted-foreground/80 pt-1">
                      <span className="font-semibold text-foreground/80">Coursework:</span>{' '}
                      {item.coursework}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeEducation(item.id)}
                className="text-destructive hover:bg-destructive/10 h-8 w-8"
                aria-label="Remove education record"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}

        {profile.education.length === 0 && !isAdding && (
          <div className="rounded-xl border border-dashed border-border/80 p-8 text-center space-y-3 bg-muted/20">
            <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">No education records added yet.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Your First Degree</span>
            </Button>
          </div>
        )}
      </div>

      {/* Add New Education Form Card */}
      {isAdding && (
        <Card className="border-primary/40 bg-card shadow-md animate-in fade-in-50 duration-200">
          <CardContent className="p-5 space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              <span>New Academic Record</span>
            </h4>

            <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Institution / University *"
                  placeholder="e.g. Stanford University"
                  error={errors.institution?.message}
                  {...register('institution')}
                />

                <Input
                  label="Degree *"
                  placeholder="e.g. Bachelor of Science (B.S.)"
                  error={errors.degree?.message}
                  {...register('degree')}
                />

                <Input
                  label="Field of Study / Major *"
                  placeholder="e.g. Computer Science"
                  error={errors.fieldOfStudy?.message}
                  {...register('fieldOfStudy')}
                />

                <Input
                  label="CGPA / GPA (Optional)"
                  placeholder="e.g. 3.8 / 4.0"
                  error={errors.gpa?.message}
                  {...register('gpa')}
                />

                <Input
                  label="Start Date *"
                  type="month"
                  error={errors.startDate?.message}
                  {...register('startDate')}
                />

                {!isCurrent && (
                  <Input
                    label="Graduation Date"
                    type="month"
                    error={errors.graduationDate?.message}
                    {...register('graduationDate')}
                  />
                )}

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                      {...register('isCurrent')}
                    />
                    <span>I am currently enrolled / pursuing this degree</span>
                  </label>
                </div>

                <div className="md:col-span-2">
                  <Textarea
                    label="Relevant Coursework (Optional)"
                    placeholder="e.g. Algorithms, Distributed Systems, Database Management, Operating Systems"
                    rows={2}
                    {...register('coursework')}
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
                  Save Record
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
          <span>Continue to Skills</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
