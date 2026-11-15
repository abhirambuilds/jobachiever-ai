import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';
import { PersonalInfoEditor } from './PersonalInfoEditor';
import { SummaryEditor } from './SummaryEditor';
import { SkillsEditor } from './SkillsEditor';
import { ExperienceEditor } from './ExperienceEditor';
import { EducationEditor } from './EducationEditor';
import { ProjectEditor } from './ProjectEditor';
import { CertificationEditor } from './CertificationEditor';

export function SectionEntryEditorModal() {
  const {
    editingSection,
    setEditingSection,
    updateSectionData,
    openAiAssistant,
  } = useResumeStudio();

  const [formData, setFormData] = useState(() =>
    editingSection?.data ? JSON.parse(JSON.stringify(editingSection.data)) : {}
  );

  useEffect(() => {
    if (editingSection?.data) {
      setFormData(JSON.parse(JSON.stringify(editingSection.data)));
    }
  }, [editingSection]);

  const handleClose = useCallback(() => {
    setEditingSection(null);
  }, [setEditingSection]);

  // Handle keyboard escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (editingSection) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [editingSection, handleClose]);

  if (!editingSection) return null;

  const handleSave = () => {
    // Ensure both items and entries are in sync for collection sections
    const cleanData = { ...formData };
    if (Array.isArray(cleanData.items)) {
      cleanData.entries = cleanData.items;
    } else if (Array.isArray(cleanData.entries)) {
      cleanData.items = cleanData.entries;
    }
    updateSectionData(editingSection.id, cleanData);
    handleClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const renderSectionEditor = () => {
    switch (editingSection.type) {
      case 'personal_info':
        return <PersonalInfoEditor formData={formData} onChange={setFormData} />;
      case 'summary':
        return (
          <SummaryEditor
            formData={formData}
            onChange={setFormData}
            onOpenAi={openAiAssistant}
          />
        );
      case 'skills':
        return <SkillsEditor formData={formData} onChange={setFormData} />;
      case 'experience':
        return (
          <ExperienceEditor
            formData={formData}
            onChange={setFormData}
            onOpenAi={openAiAssistant}
          />
        );
      case 'education':
        return <EducationEditor formData={formData} onChange={setFormData} />;
      case 'projects':
        return (
          <ProjectEditor
            formData={formData}
            onChange={setFormData}
            onOpenAi={openAiAssistant}
          />
        );
      case 'certifications':
        return <CertificationEditor formData={formData} onChange={setFormData} />;
      default:
        return (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Editing raw section data for {editingSection.title}:
            </p>
            <textarea
              rows={8}
              value={JSON.stringify(formData, null, 2)}
              onChange={(e) => {
                try {
                  setFormData(JSON.parse(e.target.value));
                } catch {
                  // Wait for valid JSON
                }
              }}
              className="w-full text-xs p-3 bg-background border border-border rounded-lg font-mono focus:ring-1 focus:ring-primary leading-relaxed"
            />
          </div>
        );
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <div
        className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div>
            <h3 id="modal-title" className="text-base font-bold text-foreground">
              Edit Section: {editingSection.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Modify the structured content for this section of your resume.
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {renderSectionEditor()}

          {/* Fact Integrity Notice */}
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span>JobAchiever AI strictly preserves fact truthfulness. Only verified user details will be rendered on the exported PDF.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-muted/20">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors cursor-pointer"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
