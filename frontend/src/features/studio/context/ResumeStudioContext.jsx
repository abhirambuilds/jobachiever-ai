import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useInRouterContext, useLocation } from 'react-router-dom';
import { useProfile } from '../../profile/context/ProfileContext';
import { toast } from '@/components/ui/toast';
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
        const parsed = JSON.parse(saved);
        if (profile?.personalInfo?.fullName && !profile.personalInfo.fullName.includes('Aarav') && parsed?.sections) {
          const personalSec = parsed.sections.find((s) => s.type === 'personal_info');
          if (personalSec && (personalSec.data?.fullName?.includes('Aarav') || !personalSec.data?.fullName)) {
            personalSec.data.fullName = profile.personalInfo.fullName;
            parsed.title = `${profile.personalInfo.fullName} — Resume`;
          }
        }
        return parsed;
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
  const [showDesignPanel, setShowDesignPanel] = useState(false); // Collapsible design drawer on desktop

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

  const handleAutoTailor = useCallback((jobData) => {
    const { title, company, skills } = jobData || {};
    const companyLower = (company || '').toLowerCase();
    const candidateName = profile?.personalInfo?.fullName || 'K. Abhiram Reddy';

    setResume((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.title = `${candidateName} — ${title || 'Target Role'} (${company || 'Tailored'}) ATS Resume`;
      updated.targetJobTitle = title;
      updated.targetCompany = company;
      updated.designSettings = {
        ...updated.designSettings,
        template: 'ats_professional',
        spacing: 'compact',
        margins: 'standard',
      };

      // 1. Update Personal Headline
      const personalSec = updated.sections?.find((s) => s.type === 'personal' || s.type === 'personal_info');
      if (personalSec) {
        if (companyLower.includes('stripe') || title?.toLowerCase().includes('backend') || title?.toLowerCase().includes('platform')) {
          personalSec.data.headline = 'Senior Backend & Distributed Systems Engineer | High-Throughput Financial Platforms';
        } else if (companyLower.includes('databricks') || title?.toLowerCase().includes('data') || title?.toLowerCase().includes('infra')) {
          personalSec.data.headline = 'Distributed Infrastructure & Cloud Systems Engineer | High-Volume Streaming & Vector Search';
        } else if (companyLower.includes('vercel') || title?.toLowerCase().includes('full') || title?.toLowerCase().includes('front')) {
          personalSec.data.headline = 'Full-Stack Cloud & Platform Engineer | Distributed Microservices & Edge Architectures';
        } else {
          personalSec.data.headline = `${title || 'Software Engineer'} | Distributed Systems & Cloud Platforms`;
        }
      }

      // 2. Update Professional Summary
      const summarySec = updated.sections?.find((s) => s.type === 'summary');
      if (summarySec) {
        if (companyLower.includes('stripe')) {
          summarySec.data = {
            summaryText: `Results-driven Backend Systems Engineer with proven expertise building scalable, fault-tolerant transaction infrastructure using Java 21, Spring Boot 3, and PostgreSQL. Architected idempotent payment processing services handling 3,000+ operations/minute, reducing p99 API latency by 42%. Deep understanding of distributed transactions, ACID consistency, Redis distributed locks, and containerized deployment for high-availability financial platforms.`,
          };
        } else if (companyLower.includes('databricks')) {
          summarySec.data = {
            summaryText: `High-impact Systems & Backend Engineer specializing in high-throughput data processing pipelines, Apache Kafka event streaming, and pgvector semantic retrieval. Track record designing resilient distributed services with sub-20ms query latency, partition pruning, and automated observability. Strong computer science foundation from SRM (CGPA 9.48/10) with published Gold honors in Java and AWS certification.`,
          };
        } else if (companyLower.includes('vercel')) {
          summarySec.data = {
            summaryText: `Innovative Full-Stack & Cloud Platform Engineer combining modern React 18 frontend architectures with robust Java 21/Spring Boot microservices. Delivered commercial SaaS deliverables across 10+ client engagements and architected the SRM Secure Exam platform serving 3,000+ simultaneous students with 99.95% uptime. Passionate about developer tooling, sub-second edge performance, and zero-downtime CI/CD workflows.`,
          };
        } else {
          summarySec.data = {
            summaryText: `Accomplished ${title || 'Software Engineer'} specializing in ${skills?.slice(0, 4).join(', ') || 'backend microservices, distributed systems, and cloud infrastructure'}. Proven track record designing high-throughput platforms with strong testing and operational reliability at ${company || 'top engineering firms'}, reducing API response latency by 42% while sustaining 99.95% availability.`,
          };
        }
      }

      // 3. Reorder/Highlight Skills
      const skillsSec = updated.sections?.find((s) => s.type === 'skills');
      if (skillsSec && skillsSec.data?.categories) {
        let prioritizedList = ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Docker', 'AWS', 'REST APIs'];
        if (companyLower.includes('stripe')) {
          prioritizedList = ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Redis Locks', 'Idempotent APIs', 'Kafka', 'Docker', 'AWS'];
        } else if (companyLower.includes('databricks')) {
          prioritizedList = ['Java 21', 'Python', 'PostgreSQL', 'pgvector', 'Apache Kafka', 'Distributed Systems', 'Docker', 'Linux'];
        } else if (companyLower.includes('vercel')) {
          prioritizedList = ['React 18', 'Tailwind CSS', 'TypeScript', 'Java 21', 'Spring Boot 3', 'REST APIs', 'PostgreSQL', 'Docker'];
        }

        const categories = skillsSec.data.categories.map((cat, idx) => {
          if (idx === 0) {
            return {
              ...cat,
              skills: [...new Set([...prioritizedList, ...(cat.skills || [])])],
            };
          }
          return cat;
        });
        skillsSec.data.categories = categories;
      }

      // 4. Prioritize Relevant Projects
      const projSec = updated.sections?.find((s) => s.type === 'projects');
      if (projSec && projSec.data?.items) {
        const items = [...projSec.data.items];
        if (companyLower.includes('stripe')) {
          items.sort((a, b) => (b.name?.toLowerCase().includes('transaction') || b.name?.toLowerCase().includes('financial') ? 1 : -1));
        } else if (companyLower.includes('databricks')) {
          items.sort((a, b) => (b.name?.toLowerCase().includes('order') || b.name?.toLowerCase().includes('task') ? 1 : -1));
        } else if (companyLower.includes('vercel')) {
          items.sort((a, b) => (b.name?.toLowerCase().includes('commerce') || b.name?.toLowerCase().includes('exam') ? 1 : -1));
        }
        projSec.data.items = items;
      }

      return updated;
    });

    toast.success(`Tailored ATS single-column resume generated for ${company || 'Target Employer'} — ${title || 'Target Role'}!`);
  }, [profile?.personalInfo?.fullName]);

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
    setResume((prev) => {
      const updated = {
        ...prev,
        sections: prev.sections.map((sec) =>
          sec.id === sectionId ? { ...sec, data: newData } : sec
        ),
        lastSaved: new Date().toISOString(),
      };
      if (newData.fullName) {
        updated.title = `${newData.fullName} — Resume`;
        updated.name = updated.title;
      }
      return updated;
    });
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
    const originalTitle = document.title;
    const cleanTitle = (resume?.title || 'Abhiram_Reddy_ATS_Resume')
      .replace(/[^\w\s-]/gi, '')
      .replace(/\s+/g, '_');
    document.title = cleanTitle;
    setZoom(100);
    setTimeout(() => {
      window.print();
      document.title = originalTitle;
    }, 150);
  }, [resume?.title]);

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
    handleAutoTailor,
    handlePrint,
    exportAsJson,
    tracks,
    showDesignPanel,
    setShowDesignPanel,
  };

  return (
    <ResumeStudioContext.Provider value={value}>
      <AutoTailorListener onAutoTailor={handleAutoTailor} />
      {children}
    </ResumeStudioContext.Provider>
  );
}

function AutoTailorListener({ onAutoTailor }) {
  const inRouter = useInRouterContext();
  if (!inRouter) return null;
  return <AutoTailorInner onAutoTailor={onAutoTailor} />;
}

function AutoTailorInner({ onAutoTailor }) {
  const location = useLocation();
  useEffect(() => {
    if (location?.state?.autoTailorJob) {
      onAutoTailor(location.state.autoTailorJob);
    }
  }, [location?.state, onAutoTailor]);
  return null;
}

export function useResumeStudio() {
  const context = useContext(ResumeStudioContext);
  if (!context) {
    throw new Error('useResumeStudio must be used within a ResumeStudioProvider');
  }
  return context;
}
