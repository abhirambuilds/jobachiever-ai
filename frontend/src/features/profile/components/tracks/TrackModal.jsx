import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Layers, Plus, Check } from 'lucide-react';
import { careerTrackSchema } from '../../schemas/profileSchemas';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

export function TrackModal({ isOpen, onClose, trackToEdit = null }) {
  const { profile, addCareerTrack, updateCareerTrack } = useProfile();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(careerTrackSchema),
    defaultValues: {
      id: '',
      name: '',
      targetRole: '',
      description: '',
      relevantSkills: [],
      targetIndustries: '',
      careerObjectives: '',
      preferredOpportunities: '',
      isPrimary: false,
    },
    mode: 'onTouched',
  });

  const selectedSkills = watch('relevantSkills') || [];

  useEffect(() => {
    if (trackToEdit) {
      reset(trackToEdit);
    } else {
      reset({
        id: '',
        name: '',
        targetRole: '',
        description: '',
        relevantSkills: [],
        targetIndustries: '',
        careerObjectives: '',
        preferredOpportunities: '',
        isPrimary: profile.careerTracks.length === 0,
      });
    }
  }, [trackToEdit, reset, profile.careerTracks.length]);

  const toggleSkill = (skillName) => {
    if (selectedSkills.includes(skillName)) {
      setValue(
        'relevantSkills',
        selectedSkills.filter((s) => s !== skillName),
        { shouldValidate: true }
      );
    } else {
      setValue('relevantSkills', [...selectedSkills, skillName], { shouldValidate: true });
    }
  };

  const onSubmit = (data) => {
    if (trackToEdit) {
      updateCareerTrack(trackToEdit.id, data);
    } else {
      addCareerTrack(data);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary font-semibold text-xs uppercase tracking-wider">
            <Layers className="h-4 w-4" />
            <span>Multi-Track Persona Engine</span>
          </div>
          <DialogTitle>
            {trackToEdit ? 'Edit Career Track' : 'Create Specialized Career Track'}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Connect a customized role track to your Master Profile. Select which verified skills
            anchor this persona without re-entering your master experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2" noValidate>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Track Name *"
              placeholder="e.g. Backend Systems Engineer"
              error={errors.name?.message}
              {...register('name')}
            />

            <Input
              label="Target Role Title *"
              placeholder="e.g. Senior Backend Engineer"
              error={errors.targetRole?.message}
              {...register('targetRole')}
            />

            <div className="md:col-span-2">
              <Textarea
                label="Track Description *"
                placeholder="Describe the focus of this track (e.g. High-throughput distributed microservices, APIs, database architectures)..."
                rows={2}
                error={errors.description?.message}
                {...register('description')}
              />
            </div>

            {/* Relevant Skills Multi-Select from Master Profile */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
                Map Skills from Master Profile *
              </label>
              <p className="text-[11px] text-muted-foreground">
                Select the proficiencies that power this specific persona:
              </p>

              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 rounded-xl border border-border/70 bg-muted/30">
                {profile.skills.map((skill) => {
                  const isChecked = selectedSkills.includes(skill.name);
                  return (
                    <button
                      key={skill.id}
                      type="button"
                      onClick={() => toggleSkill(skill.name)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs transition-all ${
                        isChecked
                          ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                          : 'bg-card border border-border/70 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3" />}
                      <span>{skill.name}</span>
                    </button>
                  );
                })}
              </div>

              {errors.relevantSkills && (
                <p className="text-xs font-medium text-destructive">
                  {errors.relevantSkills.message}
                </p>
              )}
            </div>

            <Input
              label="Target Industries"
              placeholder="e.g. Cloud Infrastructure, Fintech, SaaS"
              error={errors.targetIndustries?.message}
              {...register('targetIndustries')}
            />

            <Input
              label="Preferred Opportunities"
              placeholder="e.g. Mid-to-Senior Individual Contributor"
              error={errors.preferredOpportunities?.message}
              {...register('preferredOpportunities')}
            />

            <div className="md:col-span-2">
              <Textarea
                label="Track Objectives"
                placeholder="e.g. Lead system latency reduction and resilient API development..."
                rows={2}
                error={errors.careerObjectives?.message}
                {...register('careerObjectives')}
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                  {...register('isPrimary')}
                />
                <span>Set as my primary active career track</span>
              </label>
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="ai" size="sm" className="gap-1.5">
              <Plus className="h-4 w-4" />
              <span>{trackToEdit ? 'Save Changes' : 'Create Track'}</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
