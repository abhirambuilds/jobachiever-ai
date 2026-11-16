import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useProfile } from '../../profile/context/ProfileContext';
import {
  buildResumeFromProfile,
  DEFAULT_DESIGN_SETTINGS,
} from '@/services/resumeStudioService';
import { isDemoMode } from '@/demo/demoConfig';

const PROD_STUDIO_STORAGE_KEY = 'jobachiever_studio_resume_draft';
const PROD_STUDIO_VERSIONS_KEY = 'jobachiever_studio_resume_versions';
const DEMO_STUDIO_STORAGE_KEY = 'jobachiever_demo_studio_resume_draft';
const DEMO_STUDIO_VERSIONS_KEY = 'jobachiever_demo_studio_resume_versions';

export const ResumeStudioContext = createContext(null);

export function ResumeStudioProvider({ children }) {
  const { profile, tracks, activeTrackId } = useProfile();
  const storageKey = isDemoMode() ? DEMO_STUDIO_STORAGE_KEY : PROD_STUDIO_STORAGE_KEY;
  const versionsKey = isDemoMode() ? DEMO_STUDIO_VERSIONS_KEY : PROD_STUDIO_VERSIONS_KEY;

  // Load initial resume from local storage or profile
  const [resume, setResume] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return buildResumeFromProfile(profile, activeTrackId);
  });

  // Saved versions history
  const [versions, setVersions] = useState(() => {
    try {
      const saved = localStorage.getItem(versionsKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return [
      {
        id: 'ver-initial',
        versionNumber: 'v1.0.0',
        timestamp: new Date().toISOString(),
        note: 'Initial draft generated from Master Career Profile',
        templateId: 'ats_professional',
      },
    ];
  });

  const [zoom, setZoom] = useState(100);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('center'); // 'left' | 'center' | 'right'

  // Modal dialog states
  const [editingSection, setEditingSection] = useState(null);
  const [aiAssistantState, setAiAssistantState] = useState({
    isOpen: false,
    text: '',
    context: '',
    onApply: null,
  });
  const [tailorModalOpen, setTailorModalOpen] = useState(false);
  const [versionModalOpen, setVersionModalOpen] = useState(false);

  // Auto-sync to localStorage
  useEffect(() => {
    if (resume) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(resume));
      } catch {
        // Storage quota full or unavailable
      }
    }
  }, [resume, storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(versionsKey, JSON.stringify(versions));
    } catch {
      // Storage quota full
    }
  }, [versions, versionsKey]);

  // Demo reset listener
  useEffect(() => {
    const handleReset = () => {
      if (isDemoMode()) {
        try {
          localStorage.removeItem(DEMO_STUDIO_STORAGE_KEY);
          localStorage.removeItem(DEMO_STUDIO_VERSIONS_KEY);
        } catch {
          // ignore
        }
        const fresh = buildResumeFromProfile(profile, activeTrackId);
        setResume(fresh);
        setVersions([
          {
            id: 'ver-initial',
            versionNumber: 'v1.0.0',
            timestamp: new Date().toISOString(),
            note: 'Initial draft generated from Master Career Profile',
            templateId: 'ats_professional',
          },
        ]);
        setHasUnsavedChanges(false);
      }
    };

    window.addEventListener('jobachiever:demo-state-reset', handleReset);
    return () => window.removeEventListener('jobachiever:demo-state-reset', handleReset);
  }, [profile, activeTrackId]);

  // Design settings proxy
  const designSettings = resume?.designSettings || DEFAULT_DESIGN_SETTINGS;

  // Title update
  const updateResumeTitle = useCallback((newTitle) => {
    setResume((prev) => ({
      ...prev,
      title: newTitle,
      lastSaved: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Template switch
  const setTemplate = useCallback((templateId) => {
    setResume((prev) => ({
      ...prev,
      templateId,
      designSettings: {
        ...prev.designSettings,
        templateId,
      },
      lastSaved: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Design Settings update
  const updateDesignSettings = useCallback((newSettings) => {
    setResume((prev) => ({
      ...prev,
      designSettings: {
        ...prev.designSettings,
        ...newSettings,
      },
      lastSaved: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Section visibility toggle
  const toggleSectionVisibility = useCallback((sectionId) => {
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, visible: !sec.visible } : sec
      ),
      lastSaved: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Section reordering
  const reorderSections = useCallback((fromIndex, toIndex) => {
    setResume((prev) => {
      const nextSections = [...prev.sections];
      const [moved] = nextSections.splice(fromIndex, 1);
      nextSections.splice(toIndex, 0, moved);
      return {
        ...prev,
        sections: nextSections,
        lastSaved: new Date().toISOString(),
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Section content data update
  const updateSectionData = useCallback((sectionId, newData) => {
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.map((sec) =>
        sec.id === sectionId ? { ...sec, data: newData } : sec
      ),
      lastSaved: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Add custom section
  const addSection = useCallback((type, title) => {
    const newSection = {
      id: `sec-${type}-${Date.now()}`,
      type,
      title: title || type.replace('_', ' ').toUpperCase(),
      visible: true,
      data: type === 'summary' ? { summaryText: '' } : { items: [] },
    };
    setResume((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
      lastSaved: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Remove section
  const removeSection = useCallback((sectionId) => {
    setResume((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
      lastSaved: new Date().toISOString(),
    }));
    setHasUnsavedChanges(true);
  }, []);

  // Reset to master profile
  const resetToMasterProfile = useCallback(() => {
    const fresh = buildResumeFromProfile(profile, activeTrackId);
    setResume(fresh);
    setHasUnsavedChanges(true);
  }, [profile, activeTrackId]);

  // Save version snapshot
  const saveCurrentVersion = useCallback((note = 'Manual checkpoint') => {
    setIsSaving(true);
    setTimeout(() => {
      const newVersion = {
        id: `ver-${Date.now()}`,
        versionNumber: `v1.${versions.length}.0`,
        timestamp: new Date().toISOString(),
        note,
        templateId: resume.templateId,
        resumeSnapshot: JSON.parse(JSON.stringify(resume)),
      };
      setVersions((prev) => [newVersion, ...prev]);
      setIsSaving(false);
      setHasUnsavedChanges(false);
    }, 400);
  }, [resume, versions.length]);

  // Restore previous version
  const restoreVersion = useCallback((versionId) => {
    const target = versions.find((v) => v.id === versionId);
    if (target && target.resumeSnapshot) {
      setResume(JSON.parse(JSON.stringify(target.resumeSnapshot)));
      setHasUnsavedChanges(true);
    }
  }, [versions]);

  // AI Assistant trigger
  const openAiAssistant = useCallback((text, context, onApply) => {
    setAiAssistantState({
      isOpen: true,
      text,
      context,
      onApply,
    });
  }, []);

  const closeAiAssistant = useCallback(() => {
    setAiAssistantState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  // Job Tailoring
  const tailorResumeForJob = useCallback((jobTitle, prioritizedSkills = []) => {
    setResume((prev) => {
      // Re-order or highlight skills that match the target job
      const updatedSections = prev.sections.map((sec) => {
        if (sec.type === 'skills' && sec.data?.categories) {
          const reorderedCategories = sec.data.categories.map((cat) => {
            const matches = cat.skills.filter((sk) =>
              prioritizedSkills.some((p) => p.toLowerCase() === sk.toLowerCase())
            );
            const others = cat.skills.filter(
              (sk) => !prioritizedSkills.some((p) => p.toLowerCase() === sk.toLowerCase())
            );
            return {
              ...cat,
              skills: [...matches, ...others],
            };
          });
          return { ...sec, data: { ...sec.data, categories: reorderedCategories } };
        }
        return sec;
      });

      return {
        ...prev,
        title: `${prev.title} (Tailored for ${jobTitle})`,
        targetJobTitle: jobTitle,
        sections: updatedSections,
        lastSaved: new Date().toISOString(),
      };
    });
    setHasUnsavedChanges(true);
  }, []);

  // Vector Print / Export trigger
  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Export as JSON schema
  const exportAsJson = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(resume, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${resume.title.replace(/\s+/g, '_')}_schema.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [resume]);

  const value = {
    resume,
    setResume,
    updateResumeTitle,
    designSettings,
    setTemplate,
    updateDesignSettings,
    toggleSectionVisibility,
    reorderSections,
    updateSectionData,
    addSection,
    removeSection,
    resetToMasterProfile,
    zoom,
    setZoom,
    hasUnsavedChanges,
    isSaving,
    saveCurrentVersion,
    restoreVersion,
    versions,
    activeMobileTab,
    setActiveMobileTab,
    editingSection,
    setEditingSection,
    aiAssistantState,
    openAiAssistant,
    closeAiAssistant,
    tailorModalOpen,
    setTailorModalOpen,
    versionModalOpen,
    setVersionModalOpen,
    tailorResumeForJob,
    handlePrint,
    exportAsJson,
    tracks,
  };

  return (
    <ResumeStudioContext.Provider value={value}>
      {children}
    </ResumeStudioContext.Provider>
  );
}

export function useResumeStudio() {
  const context = useContext(ResumeStudioContext);
  if (!context) {
    throw new Error('useResumeStudio must be used within a ResumeStudioProvider');
  }
  return context;
}
