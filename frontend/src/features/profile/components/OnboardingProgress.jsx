import { Check } from 'lucide-react';

export const ONBOARDING_STEPS = [
  { id: 1, title: 'Personal Info', label: 'Basic Details' },
  { id: 2, title: 'Education', label: 'Academic History' },
  { id: 3, title: 'Skills', label: 'Core Proficiencies' },
  { id: 4, title: 'Experience', label: 'Work History' },
  { id: 5, title: 'Projects', label: 'Key Portfolios' },
  { id: 6, title: 'Certifications', label: 'Credentials' },
  { id: 7, title: 'Preferences', label: 'Career Goals' },
  { id: 8, title: 'Review', label: 'Verification' },
];

export function OnboardingProgress({ currentStep, onStepClick }) {
  const progressPercent = Math.round(((currentStep - 1) / (ONBOARDING_STEPS.length - 1)) * 100);

  return (
    <div className="w-full space-y-4">
      {/* Top Header Row with Percentage */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary uppercase tracking-wider">
            Step {currentStep} of {ONBOARDING_STEPS.length}
          </span>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium text-foreground">
            {ONBOARDING_STEPS[currentStep - 1]?.title}
          </span>
        </div>
        <span className="font-mono text-xs font-semibold text-muted-foreground">
          {progressPercent}% Complete
        </span>
      </div>

      {/* Visual Progress Bar */}
      <div className="h-2 w-full rounded-full bg-muted/60 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary via-indigo-600 to-cyan-400 transition-all duration-300 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Step Pills on Desktop */}
      <div className="hidden lg:grid grid-cols-8 gap-2 pt-2">
        {ONBOARDING_STEPS.map((step) => {
          const isDone = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepClick(step.id)}
              className={`flex flex-col items-start p-2 rounded-xl text-left border transition-all text-xs ${
                isCurrent
                  ? 'border-primary bg-primary/10 shadow-sm'
                  : isDone
                  ? 'border-border/60 bg-muted/30 text-foreground hover:bg-muted/60'
                  : 'border-transparent text-muted-foreground/60 hover:text-muted-foreground'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                {isDone ? (
                  <Check className="h-3 w-3 text-emerald-500 shrink-0" />
                ) : (
                  <span className={`h-3 w-3 text-[10px] flex items-center justify-center font-mono ${isCurrent ? 'text-primary' : ''}`}>
                    {step.id}
                  </span>
                )}
                <span className={isCurrent ? 'text-primary font-bold' : ''}>
                  {step.title}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
