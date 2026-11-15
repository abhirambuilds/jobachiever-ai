import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PersonalInfoEditor } from '../components/editors/PersonalInfoEditor';
import { ExperienceEditor } from '../components/editors/ExperienceEditor';
import { EducationEditor } from '../components/editors/EducationEditor';
import { ProjectEditor } from '../components/editors/ProjectEditor';
import { CertificationEditor } from '../components/editors/CertificationEditor';
import { SectionEntryEditorModal } from '../components/editors/SectionEntryEditorModal';
import { ResumeStudioProvider, useResumeStudio } from '../context/ResumeStudioContext';
import { ProfileProvider } from '../../profile/context/ProfileContext';

function TestModalTrigger({ sectionToEdit }) {
  const { setEditingSection, resume } = useResumeStudio();
  return (
    <div>
      <button onClick={() => setEditingSection(sectionToEdit)}>Open Editor</button>
      <span data-testid="resume-title">{resume?.title}</span>
    </div>
  );
}

describe('Section Editors & SectionEntryEditorModal', () => {
  describe('Subcomponent Editors', () => {
    it('PersonalInfoEditor updates fields via onChange', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      const data = { fullName: 'John Doe', email: 'john@example.com' };

      render(<PersonalInfoEditor formData={data} onChange={handleChange} />);

      const nameInput = screen.getByDisplayValue('John Doe');
      await user.clear(nameInput);
      await user.type(nameInput, 'Jane Doe');

      expect(handleChange).toHaveBeenCalled();
    });

    it('ExperienceEditor handles adding a position and updating fields', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      const data = {
        items: [
          {
            id: 'exp-1',
            title: 'Frontend Engineer',
            company: 'Tech Corp',
            bullets: ['Built features'],
          },
        ],
      };

      render(<ExperienceEditor formData={data} onChange={handleChange} />);

      expect(screen.getByDisplayValue('Frontend Engineer')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Tech Corp')).toBeInTheDocument();

      const addBtn = screen.getByRole('button', { name: /add position/i });
      await user.click(addBtn);

      expect(handleChange).toHaveBeenCalled();
      const lastCallArg = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(lastCallArg.items.length).toBe(2);
      expect(lastCallArg.entries.length).toBe(2);
    });

    it('EducationEditor handles adding and modifying education entries', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      const data = {
        items: [
          {
            id: 'edu-1',
            degree: 'B.S.',
            fieldOfStudy: 'Computer Science',
            institution: 'Stanford',
            graduationYear: '2022',
          },
        ],
      };

      render(<EducationEditor formData={data} onChange={handleChange} />);

      expect(screen.getByDisplayValue('Stanford')).toBeInTheDocument();
      const addBtn = screen.getByRole('button', { name: /add institution/i });
      await user.click(addBtn);

      expect(handleChange).toHaveBeenCalled();
      const updated = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
      expect(updated.items.length).toBe(2);
    });

    it('ProjectEditor handles technologies and impact bullets', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      const data = {
        items: [
          {
            id: 'proj-1',
            title: 'AI Pipeline',
            role: 'Lead',
            technologies: ['Python', 'FastAPI'],
            bullets: ['Processed 1M documents'],
          },
        ],
      };

      render(<ProjectEditor formData={data} onChange={handleChange} />);

      expect(screen.getByDisplayValue('AI Pipeline')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Python, FastAPI')).toBeInTheDocument();

      const addProjBtn = screen.getByRole('button', { name: /add project/i });
      await user.click(addProjBtn);

      expect(handleChange).toHaveBeenCalled();
    });

    it('CertificationEditor handles credentials', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();
      const data = {
        items: [
          {
            id: 'cert-1',
            name: 'AWS Solutions Architect',
            issuer: 'AWS',
            issueDate: '2024',
          },
        ],
      };

      render(<CertificationEditor formData={data} onChange={handleChange} />);

      expect(screen.getByDisplayValue('AWS Solutions Architect')).toBeInTheDocument();
      const addCertBtn = screen.getByRole('button', { name: /add certification/i });
      await user.click(addCertBtn);

      expect(handleChange).toHaveBeenCalled();
    });
  });

  describe('SectionEntryEditorModal Integration', () => {
    it('opens modal on trigger, displays section title and handles Escape key closing', async () => {
      const user = userEvent.setup();
      const sectionToEdit = {
        id: 'sec-exp',
        type: 'experience',
        title: 'Work Experience',
        data: {
          items: [{ id: '1', title: 'Senior Developer', company: 'Linear' }],
        },
      };

      render(
        <ProfileProvider>
          <ResumeStudioProvider>
            <TestModalTrigger sectionToEdit={sectionToEdit} />
            <SectionEntryEditorModal />
          </ResumeStudioProvider>
        </ProfileProvider>
      );

      // Initially not in document
      expect(screen.queryByText('Edit Section: Work Experience')).not.toBeInTheDocument();

      // Click trigger
      await user.click(screen.getByText('Open Editor'));

      // Modal is now open
      expect(screen.getByText('Edit Section: Work Experience')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Linear')).toBeInTheDocument();

      // Press Escape to dismiss
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });

      // Modal closed
      expect(screen.queryByText('Edit Section: Work Experience')).not.toBeInTheDocument();
    });
  });
});
