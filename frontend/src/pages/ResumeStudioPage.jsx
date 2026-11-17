import {
  FileText,
  Layout,
  Palette,
} from 'lucide-react';
import { ResumeStudioProvider, useResumeStudio } from '../features/studio/context/ResumeStudioContext';
import { LeftContentPanel } from '../features/studio/components/panels/LeftContentPanel';
import { CenterPreviewPanel } from '../features/studio/components/panels/CenterPreviewPanel';
import { RightDesignPanel } from '../features/studio/components/panels/RightDesignPanel';
import { SectionEntryEditorModal } from '../features/studio/components/editors/SectionEntryEditorModal';
import { AiWritingAssistantModal } from '../features/studio/components/assistant/AiWritingAssistantModal';
import { JobTailorModal } from '../features/studio/components/job/JobTailorModal';
import { StudioVersionModal } from '../features/studio/components/versions/StudioVersionModal';

function ResumeStudioContent() {
  const { activeMobileTab, setActiveMobileTab, showDesignPanel } = useResumeStudio();

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background">
      {/* Mobile / Tablet Tab Switcher (Visible only below lg) */}
      <div className="lg:hidden flex items-center justify-around border-b border-border bg-card p-2 shrink-0">
        <button
          onClick={() => setActiveMobileTab('left')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeMobileTab === 'left'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Sections</span>
        </button>

        <button
          onClick={() => setActiveMobileTab('center')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeMobileTab === 'center'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Layout className="w-3.5 h-3.5" />
          <span>Live Preview</span>
        </button>

        <button
          onClick={() => setActiveMobileTab('right')}
          className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors ${
            activeMobileTab === 'right'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-muted'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Design</span>
        </button>
      </div>

      {/* 3-Panel Desktop Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Content & Sections */}
        <div
          className={`${
            activeMobileTab === 'left' ? 'flex' : 'hidden'
          } lg:flex h-full shrink-0`}
        >
          <LeftContentPanel />
        </div>

        {/* Center Panel: Live A4 Canvas Preview */}
        <div
          className={`${
            activeMobileTab === 'center' ? 'flex' : 'hidden'
          } lg:flex flex-1 h-full min-w-0`}
        >
          <CenterPreviewPanel />
        </div>

        {/* Right Panel: Design & Templates (Collapsible on Desktop) */}
        <div
          className={`${
            activeMobileTab === 'right' ? 'flex' : 'hidden'
          } ${showDesignPanel ? 'lg:flex' : 'lg:hidden'} h-full shrink-0 transition-all border-l border-border z-10 shadow-lg`}
        >
          <RightDesignPanel />
        </div>
      </div>

      {/* Interactive Modals */}
      <SectionEntryEditorModal />
      <AiWritingAssistantModal />
      <JobTailorModal />
      <StudioVersionModal />

      {/* Print CSS Injected for vector PDF export */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0mm;
          }
          html, body, #root {
            background: #ffffff !important;
            color: #000000 !important;
            height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          body * {
            visibility: hidden !important;
          }
          #resume-preview-sheet,
          #resume-preview-sheet * {
            visibility: visible !important;
          }
          #resume-preview-sheet {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 12mm 15mm !important;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function ResumeStudioPage() {
  return (
    <ResumeStudioProvider>
      <ResumeStudioContent />
    </ResumeStudioProvider>
  );
}
