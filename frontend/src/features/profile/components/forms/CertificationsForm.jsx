import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2, Award, Trophy, ArrowRight, ArrowLeft } from 'lucide-react';
import {
  certificationItemSchema,
  achievementItemSchema,
} from '../../schemas/profileSchemas';
import { useProfile } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function CertificationsForm({ onNext, onBack }) {
  const {
    profile,
    addCertification,
    removeCertification,
    addAchievement,
    removeAchievement,
  } = useProfile();

  const [isAddingCert, setIsAddingCert] = useState(false);
  const [isAddingAch, setIsAddingAch] = useState(false);

  // Cert Form
  const {
    register: registerCert,
    handleSubmit: handleSubmitCert,
    reset: resetCert,
    formState: { errors: certErrors },
  } = useForm({
    resolver: zodResolver(certificationItemSchema),
    defaultValues: {
      id: '',
      name: '',
      issuingOrg: '',
      issueDate: '',
      expirationDate: '',
      credentialUrl: '',
    },
    mode: 'onTouched',
  });

  // Achievement Form
  const {
    register: registerAch,
    handleSubmit: handleSubmitAch,
    reset: resetAch,
    formState: { errors: achErrors },
  } = useForm({
    resolver: zodResolver(achievementItemSchema),
    defaultValues: {
      id: '',
      title: '',
      description: '',
      issuingOrg: '',
      date: '',
    },
    mode: 'onTouched',
  });

  const onAddCertSubmit = (data) => {
    addCertification(data);
    resetCert();
    setIsAddingCert(false);
  };

  const onAddAchSubmit = (data) => {
    addAchievement(data);
    resetAch();
    setIsAddingAch(false);
  };

  return (
    <div className="space-y-8">
      {/* Section 1: Certifications */}
      <div className="space-y-4">
        <div className="border-b border-border/60 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              <span>Step 6A: Industry Certifications</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified certifications from cloud providers, technology vendors, or accredited bodies.
            </p>
          </div>
          {!isAddingCert && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingCert(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Certification</span>
            </Button>
          )}
        </div>

        {/* Existing Certifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profile.certifications.map((item) => (
            <Card key={item.id} className="border-border/60 bg-card/60">
              <CardContent className="p-3.5 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">{item.name}</h4>
                  <p className="text-xs font-semibold text-primary">{item.issuingOrg}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Issued: {item.issueDate}{item.expirationDate ? ` • Expires: ${item.expirationDate}` : ''}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCertification(item.id)}
                  className="text-destructive hover:bg-destructive/10 h-7 w-7"
                  aria-label="Remove certification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Certification Card */}
        {isAddingCert && (
          <Card className="border-primary/40 bg-card p-4 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-primary">New Certification</h5>
            <form onSubmit={handleSubmitCert(onAddCertSubmit)} className="space-y-3" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Certification Name *"
                  placeholder="e.g. AWS Solutions Architect Associate"
                  error={certErrors.name?.message}
                  {...registerCert('name')}
                />
                <Input
                  label="Issuing Organization *"
                  placeholder="e.g. Amazon Web Services"
                  error={certErrors.issuingOrg?.message}
                  {...registerCert('issuingOrg')}
                />
                <Input
                  label="Issue Date *"
                  type="month"
                  error={certErrors.issueDate?.message}
                  {...registerCert('issueDate')}
                />
                <Input
                  label="Expiration Date (Optional)"
                  type="month"
                  error={certErrors.expirationDate?.message}
                  {...registerCert('expirationDate')}
                />
                <div className="md:col-span-2">
                  <Input
                    label="Credential URL / Verification Link"
                    placeholder="https://..."
                    error={certErrors.credentialUrl?.message}
                    {...registerCert('credentialUrl')}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingCert(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm">
                  Save Certification
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {/* Section 2: Honors & Achievements */}
      <div className="space-y-4 pt-2">
        <div className="border-b border-border/60 pb-3 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span>Step 6B: Honors & Achievements</span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Hackathons, academic distinctions, open-source milestones, or internal awards.
            </p>
          </div>
          {!isAddingAch && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddingAch(true)}
              className="gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Achievement</span>
            </Button>
          )}
        </div>

        {/* Existing Achievements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {profile.achievements.map((item) => (
            <Card key={item.id} className="border-border/60 bg-card/60">
              <CardContent className="p-3.5 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">{item.title}</h4>
                  {item.issuingOrg && (
                    <p className="text-xs font-semibold text-amber-500">{item.issuingOrg}</p>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  {item.date && (
                    <p className="text-[10px] text-muted-foreground font-mono">Date: {item.date}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAchievement(item.id)}
                  className="text-destructive hover:bg-destructive/10 h-7 w-7"
                  aria-label="Remove achievement"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Add Achievement Card */}
        {isAddingAch && (
          <Card className="border-amber-500/40 bg-card p-4 space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-amber-500">New Achievement</h5>
            <form onSubmit={handleSubmitAch(onAddAchSubmit)} className="space-y-3" noValidate>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Achievement Title *"
                  placeholder="e.g. 1st Place at CalHacks"
                  error={achErrors.title?.message}
                  {...registerAch('title')}
                />
                <Input
                  label="Issuing Organization"
                  placeholder="e.g. UC Berkeley"
                  error={achErrors.issuingOrg?.message}
                  {...registerAch('issuingOrg')}
                />
                <Input
                  label="Date Achieved"
                  type="month"
                  error={achErrors.date?.message}
                  {...registerAch('date')}
                />
                <div className="md:col-span-2">
                  <Textarea
                    label="Description *"
                    placeholder="Briefly describe what you achieved and its significance..."
                    rows={2}
                    error={achErrors.description?.message}
                    {...registerAch('description')}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingAch(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="default" size="sm">
                  Save Achievement
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between pt-4 border-t border-border/50">
        <Button type="button" variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
        <Button type="button" variant="ai" onClick={onNext} className="gap-2">
          <span>Continue to Preferences</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
