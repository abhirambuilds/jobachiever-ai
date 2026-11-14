import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Target, MapPin, DollarSign, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  careerPreferencesSchema,
  CAREER_ROLE_OPTIONS,
  EMPLOYMENT_TYPES,
  WORK_ARRANGEMENTS,
} from '../../schemas/profileSchemas';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function CareerPreferencesForm({ onNext, onBack }) {
  const { profile, updateCareerPreferences } = useProfile();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(careerPreferencesSchema),
    defaultValues: profile.careerPreferences,
    mode: 'onTouched',
  });

  const selectedRoles = watch('targetRoles') || [];
  const selectedEmpTypes = watch('employmentTypes') || [];

  const toggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      setValue(
        'targetRoles',
        selectedRoles.filter((r) => r !== role),
        { shouldValidate: true }
      );
    } else {
      setValue('targetRoles', [...selectedRoles, role], { shouldValidate: true });
    }
  };

  const toggleEmpType = (type) => {
    if (selectedEmpTypes.includes(type)) {
      setValue(
        'employmentTypes',
        selectedEmpTypes.filter((t) => t !== type),
        { shouldValidate: true }
      );
    } else {
      setValue('employmentTypes', [...selectedEmpTypes, type], { shouldValidate: true });
    }
  };

  const onSubmit = (data) => {
    updateCareerPreferences(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <span>Step 7: Career Interests & Preferences</span>
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Tell us about the roles, arrangements, and environments that best align with your aspirations.
        </p>
      </div>

      {/* Career Interests Pills */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
          Target Career Interests / Roles *
        </label>
        <div className="flex flex-wrap gap-2">
          {CAREER_ROLE_OPTIONS.map((role) => {
            const isSelected = selectedRoles.includes(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() => toggleRole(role)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-medium border transition-all ${
                  isSelected
                    ? 'border-primary bg-primary text-primary-foreground shadow-sm font-semibold'
                    : 'border-border/80 bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
        {errors.targetRoles && (
          <p className="text-xs font-medium text-destructive">{errors.targetRoles.message}</p>
        )}
      </div>

      {/* Employment Types */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-foreground">
          Preferred Employment Types *
        </label>
        <div className="flex flex-wrap gap-4">
          {EMPLOYMENT_TYPES.map((type) => {
            const isChecked = selectedEmpTypes.includes(type);
            return (
              <label key={type} className="flex items-center gap-2 text-xs text-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleEmpType(type)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary/30"
                />
                <span>{type}</span>
              </label>
            );
          })}
        </div>
        {errors.employmentTypes && (
          <p className="text-xs font-medium text-destructive">{errors.employmentTypes.message}</p>
        )}
      </div>

      {/* Work Arrangement Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground/90 uppercase tracking-wider mb-1.5">
            Work Arrangement Preference *
          </label>
          <select
            className="flex h-10 w-full rounded-lg border border-input bg-background/60 px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            {...register('workArrangement')}
          >
            {WORK_ARRANGEMENTS.map((arr) => (
              <option key={arr} value={arr}>
                {arr}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Preferred Target Cities / Regions *"
          placeholder="e.g. San Francisco, Seattle, Remote"
          leftIcon={MapPin}
          error={errors.preferredLocations?.message}
          {...register('preferredLocations')}
        />

        <Input
          label="Preferred Countries"
          placeholder="e.g. United States, Canada, Germany"
          error={errors.preferredCountries?.message}
          {...register('preferredCountries')}
        />

        <Input
          label="Expected Compensation Range (Optional)"
          placeholder="e.g. $130,000 - $160,000"
          leftIcon={DollarSign}
          error={errors.expectedSalary?.message}
          {...register('expectedSalary')}
        />

        <div className="md:col-span-2">
          <Textarea
            label="Near-Term Career Objectives & Goals *"
            placeholder="What technical challenges, domains, or leadership goals excite you over the next 1-3 years?"
            rows={3}
            error={errors.careerGoals?.message}
            {...register('careerGoals')}
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <Button type="submit" variant="ai" className="gap-2">
          <span>Review Master Profile</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
