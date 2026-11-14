import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw } from 'lucide-react';

import { OnboardingProgress } from '@/features/profile/components/OnboardingProgress';
import { PersonalInfoForm } from '@/features/profile/components/forms/PersonalInfoForm';
import { EducationForm } from '@/features/profile/components/forms/EducationForm';
import { SkillsForm } from '@/features/profile/components/forms/SkillsForm';
import { ExperienceForm } from '@/features/profile/components/forms/ExperienceForm';
import { ProjectsForm } from '@/features/profile/components/forms/ProjectsForm';
import { CertificationsForm } from '@/features/profile/components/forms/CertificationsForm';
import { CareerPreferencesForm } from '@/features/profile/components/forms/CareerPreferencesForm';
import { ProfileReview } from '@/features/profile/components/forms/ProfileReview';
import { useProfile } from '@/hooks/useProfile';

import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const { resetToDemo } = useProfile();
  const navigate = useNavigate();

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 8));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToStep = (stepNumber) => {
    setCurrentStep(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoadDemo = () => {
    resetToDemo();
    toast.success('Loaded realistic demo master profile!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Top Wizard Navigation Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-cyan-400 text-white shadow-glow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-foreground hidden sm:inline-block">
                JobAchiever<span className="text-primary font-extrabold">.AI</span>
              </span>
            </Link>
            <span className="text-muted-foreground hidden sm:inline-block">•</span>
            <span className="text-xs font-semibold text-muted-foreground">
              Master Career Onboarding
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLoadDemo}
              className="gap-1.5 text-xs h-8"
              title="Prepopulate with realistic profile data"
            >
              <RefreshCw className="h-3 w-3" />
              <span className="hidden sm:inline">Load Sample Data</span>
            </Button>

            <ThemeToggle className="h-8 w-8" />

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => navigate('/profile')}
              className="gap-1 text-xs text-muted-foreground hover:text-foreground h-8"
            >
              <span>Skip to Profile</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Form Body */}
      <main className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
        {/* Step Progress Bar */}
        <div className="mb-8">
          <OnboardingProgress currentStep={currentStep} onStepClick={handleJumpToStep} />
        </div>

        {/* Dynamic Form Step Card with Animated Transitions */}
        <Card className="border-border/80 bg-card/80 shadow-2xl backdrop-blur-xl">
          <CardContent className="p-6 sm:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
              >
                {currentStep === 1 && <PersonalInfoForm onNext={handleNext} />}
                {currentStep === 2 && <EducationForm onNext={handleNext} onBack={handleBack} />}
                {currentStep === 3 && <SkillsForm onNext={handleNext} onBack={handleBack} />}
                {currentStep === 4 && <ExperienceForm onNext={handleNext} onBack={handleBack} />}
                {currentStep === 5 && <ProjectsForm onNext={handleNext} onBack={handleBack} />}
                {currentStep === 6 && (
                  <CertificationsForm onNext={handleNext} onBack={handleBack} />
                )}
                {currentStep === 7 && (
                  <CareerPreferencesForm onNext={handleNext} onBack={handleBack} />
                )}
                {currentStep === 8 && (
                  <ProfileReview onBack={handleBack} onJumpToStep={handleJumpToStep} />
                )}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>

        {/* Development Persistence Notice */}
        <div className="mt-8 text-center text-xs text-muted-foreground">
          <span>Draft data persists locally in browser. </span>
          <span className="text-primary font-medium">Spring Boot PostgreSQL sync will be enabled in subsequent milestones.</span>
        </div>
      </main>
    </div>
  );
}
