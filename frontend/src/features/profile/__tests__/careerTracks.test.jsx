import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProfileProvider, useProfile } from '../context/ProfileContext';
import { CareerTrackManager } from '../components/tracks/CareerTrackManager';

function TrackConsumer() {
  const { profile, setPrimaryCareerTrack, addCareerTrack, removeCareerTrack } = useProfile();
  return (
    <div>
      <span data-testid="tracks-count">{profile.careerTracks.length}</span>
      <span data-testid="primary-track">
        {profile.careerTracks.find((t) => t.isPrimary)?.name || 'None'}
      </span>
      {profile.careerTracks.map((t) => (
        <div key={t.id} data-testid={`track-${t.id}`}>
          <span>{t.name}</span>
          <button onClick={() => setPrimaryCareerTrack(t.id)}>Set Primary {t.name}</button>
          <button onClick={() => removeCareerTrack(t.id)}>Delete {t.name}</button>
        </div>
      ))}
      <button
        onClick={() =>
          addCareerTrack({
            name: 'Cloud DevOps Architect',
            targetRole: 'DevOps Engineer',
            description: 'Kubernetes, Terraform, AWS',
            relevantSkills: ['Docker & Compose'],
            isPrimary: false,
          })
        }
      >
        Add DevOps Track
      </button>
    </div>
  );
}

describe('Career Track Management & Profile Reference Integrity', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default multi-track personas with exactly one primary track', () => {
    render(
      <ProfileProvider>
        <TrackConsumer />
      </ProfileProvider>
    );

    expect(Number(screen.getByTestId('tracks-count').textContent)).toBeGreaterThanOrEqual(3);
    expect(screen.getByTestId('primary-track').textContent).toBe('Backend Systems Engineer');
  });

  it('updates primary track atomically when user chooses another track', async () => {
    const user = userEvent.setup();

    render(
      <ProfileProvider>
        <TrackConsumer />
      </ProfileProvider>
    );

    const setFullStackPrimary = screen.getByText('Set Primary Full-Stack Product Engineer');
    await user.click(setFullStackPrimary);

    expect(screen.getByTestId('primary-track').textContent).toBe('Full-Stack Product Engineer');
  });

  it('adds a new career track without altering existing profile master credentials', async () => {
    const user = userEvent.setup();

    render(
      <ProfileProvider>
        <TrackConsumer />
      </ProfileProvider>
    );

    const initialCount = Number(screen.getByTestId('tracks-count').textContent);
    await user.click(screen.getByText('Add DevOps Track'));

    expect(Number(screen.getByTestId('tracks-count').textContent)).toBe(initialCount + 1);
    expect(screen.getByText('Cloud DevOps Architect')).toBeInTheDocument();
  });

  it('renders CareerTrackManager component with title and active tracks', () => {
    render(
      <ProfileProvider>
        <CareerTrackManager />
      </ProfileProvider>
    );

    expect(screen.getByText('Manage Your Active Career Tracks')).toBeInTheDocument();
    expect(screen.getByText('Create Career Track')).toBeInTheDocument();
    expect(screen.getByText('Backend Systems Engineer')).toBeInTheDocument();
  });
});
