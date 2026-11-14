import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User, Mail, Phone, Globe, Linkedin, Github, MapPin, ArrowRight } from 'lucide-react';
import { personalInfoSchema } from '../../schemas/profileSchemas';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export function PersonalInfoForm({ onNext }) {
  const { profile, updatePersonalInfo } = useProfile();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: profile.personalInfo,
    mode: 'onTouched',
  });

  const onSubmit = (data) => {
    updatePersonalInfo(data);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <div className="border-b border-border/60 pb-3">
        <h3 className="text-xl font-bold tracking-tight text-foreground">
          Step 1: Personal & Contact Information
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Your master identity. This verified data will anchor all generated resumes and portfolios.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Full Legal / Professional Name *"
          placeholder="e.g. Jane Doe"
          leftIcon={User}
          error={errors.fullName?.message}
          {...register('fullName')}
        />

        <Input
          label="Professional Headline *"
          placeholder="e.g. Senior Backend Engineer"
          error={errors.headline?.message}
          {...register('headline')}
        />

        <Input
          label="Email Address *"
          type="email"
          placeholder="name@example.com"
          leftIcon={Mail}
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Phone Number *"
          placeholder="+1 (555) 000-0000"
          leftIcon={Phone}
          error={errors.phone?.message}
          {...register('phone')}
        />

        <Input
          label="Country *"
          placeholder="e.g. United States"
          leftIcon={MapPin}
          error={errors.country?.message}
          {...register('country')}
        />

        <Input
          label="City / Region *"
          placeholder="e.g. San Francisco, CA"
          leftIcon={MapPin}
          error={errors.city?.message}
          {...register('city')}
        />

        <Input
          label="LinkedIn Profile URL"
          placeholder="https://linkedin.com/in/..."
          leftIcon={Linkedin}
          error={errors.linkedinUrl?.message}
          {...register('linkedinUrl')}
        />

        <Input
          label="GitHub Profile URL"
          placeholder="https://github.com/..."
          leftIcon={Github}
          error={errors.githubUrl?.message}
          {...register('githubUrl')}
        />

        <div className="md:col-span-2">
          <Input
            label="Personal Website / Portfolio URL"
            placeholder="https://yourportfolio.com"
            leftIcon={Globe}
            error={errors.websiteUrl?.message}
            {...register('websiteUrl')}
          />
        </div>

        <div className="md:col-span-2">
          <Textarea
            label="Professional Summary / Bio *"
            placeholder="Describe your core technical strengths, high-impact achievements, and engineering philosophy..."
            rows={4}
            error={errors.summary?.message}
            helperText="Minimum 20 characters. Grounded summaries improve resume match accuracy."
            {...register('summary')}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-border/50">
        <Button type="submit" variant="ai" size="lg" className="gap-2">
          <span>Save & Continue</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
