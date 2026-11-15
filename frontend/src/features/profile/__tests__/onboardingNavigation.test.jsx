import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { OnboardingProgress, ONBOARDING_STEPS } from '../components/OnboardingProgress';

describe('Onboarding Navigation & Progress', () => {
  it('defines exactly 8 onboarding steps ending with Review & Verification', () => {
    expect(ONBOARDING_STEPS.length).toBe(8);
    expect(ONBOARDING_STEPS[0].title).toBe('Personal Info');
    expect(ONBOARDING_STEPS[7].title).toBe('Review');
  });

  it('renders initial step 1 with 0% completion and correct title', () => {
    render(<OnboardingProgress currentStep={1} onStepClick={() => {}} />);

    expect(screen.getByText('Step 1 of 8')).toBeInTheDocument();
    expect(screen.getByText('0% Complete')).toBeInTheDocument();
  });

  it('calculates mid-point progression correctly (step 4 should be 43%)', () => {
    render(<OnboardingProgress currentStep={4} onStepClick={() => {}} />);

    expect(screen.getByText('Step 4 of 8')).toBeInTheDocument();
    expect(screen.getAllByText('Experience').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('43% Complete')).toBeInTheDocument();
  });

  it('calculates final step 8 as 100% Complete', () => {
    render(<OnboardingProgress currentStep={8} onStepClick={() => {}} />);

    expect(screen.getByText('Step 8 of 8')).toBeInTheDocument();
    expect(screen.getAllByText('Review').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('100% Complete')).toBeInTheDocument();
  });

  it('invokes onStepClick when user clicks on a step pill', async () => {
    const handleStepClick = vi.fn();
    const user = userEvent.setup();

    render(<OnboardingProgress currentStep={2} onStepClick={handleStepClick} />);

    const skillsButton = screen.getByRole('button', { name: /skills/i });
    await user.click(skillsButton);

    expect(handleStepClick).toHaveBeenCalledWith(3);
  });
});
