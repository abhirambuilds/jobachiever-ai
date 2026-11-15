import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiWritingAssistantModal } from '../components/assistant/AiWritingAssistantModal';
import { ResumeStudioContext } from '../context/ResumeStudioContext';
import {
  generateWritingAssistance,
  aiWritingService,
  STUDIO_ACTIONS,
  WRITING_MODES,
} from '@/services/resumeStudioService';

describe('Resume Studio AI Writing Assistant', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Service: generateWritingAssistance & aiWritingService', () => {
    it('provides all 8 defined studio actions and 6 writing modes', () => {
      expect(STUDIO_ACTIONS).toHaveLength(8);
      const actionIds = STUDIO_ACTIONS.map((a) => a.id);
      expect(actionIds).toContain('IMPROVE_BULLET');
      expect(actionIds).toContain('IMPROVE_SUMMARY');
      expect(actionIds).toContain('IMPROVE_PROJECT');
      expect(actionIds).toContain('IMPROVE_EXPERIENCE');
      expect(actionIds).toContain('FIX_GRAMMAR');
      expect(actionIds).toContain('MAKE_CONCISE');
      expect(actionIds).toContain('TAILOR_TO_JOB');
      expect(actionIds).toContain('GENERATE_ALTERNATIVES');

      expect(WRITING_MODES).toHaveLength(6);
      const modeIds = WRITING_MODES.map((m) => m.id);
      expect(modeIds).toContain('PROFESSIONAL');
      expect(modeIds).toContain('CONCISE');
      expect(modeIds).toContain('TECHNICAL');
      expect(modeIds).toContain('ACHIEVEMENT_FOCUSED');
      expect(modeIds).toContain('ACTION_ORIENTED');
      expect(modeIds).toContain('ATS_FRIENDLY');
    });

    it('generates fact-preserving fallback enhancement when offline or in unit tests', async () => {
      const res = await generateWritingAssistance({
        action: 'IMPROVE_BULLET',
        sourceText: 'Worked on Java microservices and PostgreSQL database.',
        writingMode: 'PROFESSIONAL',
      });

      expect(res.success).toBe(true);
      expect(res.suggestions).toHaveLength(1);
      const sug = res.suggestions[0];
      expect(sug.suggestedText.toLowerCase()).toContain('engineered');
      expect(sug.confidence).toBe('HIGH');
      expect(sug.preservedFacts).toContain('Java');
      expect(sug.preservedFacts).toContain('PostgreSQL');
    });

    it('generates 3 alternative suggestions when GENERATE_ALTERNATIVES is specified', async () => {
      const res = await generateWritingAssistance({
        action: 'GENERATE_ALTERNATIVES',
        sourceText: 'Managed development team for web app.',
        writingMode: 'ACTION_ORIENTED',
        numAlternatives: 3,
      });

      expect(res.success).toBe(true);
      expect(res.suggestions.length).toBeGreaterThanOrEqual(3);
    });

    it('aiWritingService.rewriteSentence maintains backwards compatibility', async () => {
      const res = await aiWritingService.rewriteSentence(
        'responsible for database maintenance',
        'action_verbs'
      );

      expect(res.original).toBe('responsible for database maintenance');
      expect(res.rewritten).toBeDefined();
      expect(res.explanation).toBeDefined();
      expect(res.atsScore).toBe(94);
    });
  });

  describe('Component: AiWritingAssistantModal', () => {
    const mockContextValue = {
      aiAssistantState: {
        isOpen: true,
        text: 'worked on backend services with Java',
        context: 'experience',
        onApply: vi.fn(),
      },
      closeAiAssistant: vi.fn(),
    };

    it('does not render modal when isOpen is false', () => {
      const closedContext = {
        ...mockContextValue,
        aiAssistantState: { ...mockContextValue.aiAssistantState, isOpen: false },
      };

      const { container } = render(
        <ResumeStudioContext.Provider value={closedContext}>
          <AiWritingAssistantModal />
        </ResumeStudioContext.Provider>
      );

      expect(container.firstChild).toBeNull();
    });

    it('renders modal with section context badge and original text', () => {
      render(
        <ResumeStudioContext.Provider value={mockContextValue}>
          <AiWritingAssistantModal />
        </ResumeStudioContext.Provider>
      );

      expect(screen.getByText('AI Writing Assistant')).toBeInTheDocument();
      expect(screen.getByText('experience')).toBeInTheDocument();
      expect(screen.getByDisplayValue('worked on backend services with Java')).toBeInTheDocument();
    });

    it('allows generating suggestions and applying them to the resume draft', async () => {
      const onApplyMock = vi.fn();
      const testContext = {
        ...mockContextValue,
        aiAssistantState: {
          ...mockContextValue.aiAssistantState,
          onApply: onApplyMock,
        },
      };

      render(
        <ResumeStudioContext.Provider value={testContext}>
          <AiWritingAssistantModal />
        </ResumeStudioContext.Provider>
      );

      const generateBtn = screen.getByText('Generate AI Enhancement');
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getByText('AI Recommended Revision')).toBeInTheDocument();
      });

      const applyBtn = screen.getByText('Apply to Resume');
      expect(applyBtn).not.toBeDisabled();
      fireEvent.click(applyBtn);

      expect(onApplyMock).toHaveBeenCalled();
      expect(testContext.closeAiAssistant).toHaveBeenCalled();
    });

    it('allows switching action and stylistic mode', async () => {
      render(
        <ResumeStudioContext.Provider value={mockContextValue}>
          <AiWritingAssistantModal />
        </ResumeStudioContext.Provider>
      );

      const conciseModeBtn = screen.getByText('Concise');
      fireEvent.click(conciseModeBtn);
      expect(conciseModeBtn).toBeInTheDocument();

      const grammarActionBtn = screen.getByText('Grammar & Polish');
      fireEvent.click(grammarActionBtn);
      expect(grammarActionBtn).toBeInTheDocument();
    });
  });
});
