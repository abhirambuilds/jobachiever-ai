import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { isDemoMode } from '@/demo/demoConfig';
import { DEMO_PROFILE } from '@/demo/demoProfile';
import { profileService } from '@/services/profileService';
import { careerTrackService } from '@/services/careerTrackService';

const STORAGE_KEY = 'jobachiever_profile_draft';
const DEMO_STORAGE_KEY = 'jobachiever_demo_profile_draft';

export const EMPTY_PROFILE = {
  personalInfo: {
    fullName: '',
    headline: '',
    email: '',
    phone: '',
    city: '',
    country: 'India',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    websiteUrl: '',
    summary: '',
  },
  education: [],
  experience: [],
  skills: [],
  projects: [],
  certifications: [],
  achievements: [],
  careerTracks: [],
  careerPreferences: {
    targetRoles: [],
    targetLocations: [],
    minBaseSalary: 0,
    targetCtc: 0,
    currency: 'INR',
    workplaceType: 'HYBRID',
    careerGoals: '',
  },
};

const DEFAULT_PROFILE = DEMO_PROFILE;

function getInitialProfile() {
  if (isDemoMode()) {
    try {
      const savedDemo = localStorage.getItem(DEMO_STORAGE_KEY);
      if (savedDemo) {
        return JSON.parse(savedDemo);
      }
    } catch {
      // ignore
    }
    return DEMO_PROFILE;
  }

  try {
    const rawUser = localStorage.getItem('jobachiever_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    const isAarav = user?.email?.toLowerCase().includes('aarav');

    if (user) {
      const userKey = `${STORAGE_KEY}_${user.id || user.email}`;
      const saved = localStorage.getItem(userKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!isAarav && user.name && (!parsed.personalInfo?.fullName || parsed.personalInfo?.fullName.includes('Aarav'))) {
          parsed.personalInfo = parsed.personalInfo || {};
          parsed.personalInfo.fullName = user.name;
        }
        return parsed;
      }

      if (isAarav) {
        return DEMO_PROFILE;
      }

      // Return clean empty profile for new candidate account
      const fullName = (user.name || `${user.firstName || ''} ${user.lastName || ''}`).trim();
      return {
        ...EMPTY_PROFILE,
        personalInfo: {
          ...EMPTY_PROFILE.personalInfo,
          fullName: fullName || 'New User',
          email: user.email || '',
        },
      };
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // localStorage may fail in restricted modes
  }
  return DEFAULT_PROFILE;
}

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(getInitialProfile);
  const syncTimeoutRef = useRef(null);

  // Load from real database if user is authenticated with a valid JWT
  useEffect(() => {
    const fetchDbProfile = async () => {
      const rawUser = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_user') : null;
      const user = rawUser ? JSON.parse(rawUser) : null;
      if (!user && !isDemoMode()) {
        return;
      }

      try {
        const res = await profileService.getProfile();
        const isAarav = user?.email?.toLowerCase().includes('aarav') || isDemoMode();

        if (res?.source === 'database' && res.data) {
          const d = res.data;
          setProfile((prev) => ({
            ...prev,
            personalInfo: {
              ...prev.personalInfo,
              fullName: (!isAarav && user?.name)
                ? user.name
                : (d.personalInfo?.fullName || `${d.firstName || ''} ${d.lastName || ''}`.trim() || prev.personalInfo.fullName),
              headline: d.headline || d.personalInfo?.headline || (isAarav ? prev.personalInfo.headline : ''),
              email: d.email || prev.personalInfo.email,
              phone: d.phoneNumber || d.personalInfo?.phone || (isAarav ? prev.personalInfo.phone : ''),
              city: d.currentLocation || d.personalInfo?.city || (isAarav ? prev.personalInfo.city : ''),
              country: d.country || d.personalInfo?.country || 'India',
              linkedinUrl: d.linkedinUrl || d.personalInfo?.linkedinUrl || (isAarav ? prev.personalInfo.linkedinUrl : ''),
              githubUrl: d.githubUrl || d.personalInfo?.githubUrl || (isAarav ? prev.personalInfo.githubUrl : ''),
              portfolioUrl: d.portfolioUrl || d.personalInfo?.portfolioUrl || (isAarav ? prev.personalInfo.portfolioUrl : ''),
              websiteUrl: d.websiteUrl || d.personalInfo?.websiteUrl || (isAarav ? prev.personalInfo.websiteUrl : ''),
              summary: d.summary || d.personalInfo?.summary || (isAarav ? prev.personalInfo.summary : ''),
            },
            skills: d.skills && d.skills.length > 0 ? d.skills : (isAarav ? prev.skills : []),
            experience: d.experiences && d.experiences.length > 0 ? d.experiences : (d.experience && d.experience.length > 0 ? d.experience : (isAarav ? prev.experience : [])),
            education: d.educations && d.educations.length > 0 ? d.educations : (d.education && d.education.length > 0 ? d.education : (isAarav ? prev.education : [])),
            projects: d.projects && d.projects.length > 0 ? d.projects : (isAarav ? prev.projects : []),
            certifications: d.certifications && d.certifications.length > 0 ? d.certifications : (isAarav ? prev.certifications : []),
            achievements: d.achievements && d.achievements.length > 0 ? d.achievements : (isAarav ? prev.achievements : []),
          }));
        }
      } catch (e) {
        // ignore
      }

      try {
        const tracks = await careerTrackService.listTracks();
        const rawUser = localStorage.getItem('jobachiever_user');
        const user = rawUser ? JSON.parse(rawUser) : null;
        const isAarav = user?.email?.toLowerCase().includes('aarav') || isDemoMode();

        if (tracks && tracks.length > 0) {
          setProfile((prev) => ({
            ...prev,
            careerTracks: tracks.map((t) => ({
              id: t.id,
              name: t.name,
              targetRole: t.targetRole,
              description: t.description,
              relevantSkills: t.requiredSkills || t.relevantSkills || [],
              targetIndustries: Array.isArray(t.industries) ? t.industries.join(', ') : (t.industries || ''),
              careerObjectives: t.careerGoals || '',
              preferredOpportunities: '',
              isPrimary: !!t.isPrimary,
            })),
          }));
        } else if (!isAarav) {
          setProfile((prev) => ({
            ...prev,
            careerTracks: [],
          }));
        }
      } catch (e) {
        // ignore
      }
    };

    fetchDbProfile();
    window.addEventListener('jobachiever:auth-changed', fetchDbProfile);
    return () => window.removeEventListener('jobachiever:auth-changed', fetchDbProfile);
  }, []);

  // Persist draft in localStorage and debounce sync to PostgreSQL database
  useEffect(() => {
    try {
      const rawUser = localStorage.getItem('jobachiever_user');
      const user = rawUser ? JSON.parse(rawUser) : null;
      const currentKey = isDemoMode()
        ? DEMO_STORAGE_KEY
        : user?.id || user?.email
        ? `${STORAGE_KEY}_${user.id || user.email}`
        : STORAGE_KEY;
      localStorage.setItem(currentKey, JSON.stringify(profile));
    } catch {
      // ignore write errors
    }

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }
    syncTimeoutRef.current = setTimeout(() => {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_jwt_token') : null;
      if (token && token !== 'demo-valid-bearer-token') {
        profileService.updateProfile({
          personalInfo: {
            fullName: profile.personalInfo.fullName,
            headline: profile.personalInfo.headline,
            phone: profile.personalInfo.phone,
            country: profile.personalInfo.country,
            location: profile.personalInfo.city,
            linkedinUrl: profile.personalInfo.linkedinUrl,
            githubUrl: profile.personalInfo.githubUrl,
            portfolioUrl: profile.personalInfo.portfolioUrl,
            websiteUrl: profile.personalInfo.websiteUrl,
            summary: profile.personalInfo.summary,
          },
          skills: (profile.skills || []).map((s) => ({
            name: s.name,
            category: s.category || 'TECHNICAL',
            proficiency: (s.proficiency || 'INTERMEDIATE').toUpperCase(),
            yearsOfExperience: parseFloat(s.yearsOfExperience) || 1.0,
            evidence: s.evidence || '',
          })),
        }).catch(() => {});
      }
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [profile]);

  // Synchronize on demo state reset or mode toggle
  useEffect(() => {
    const handleResetOrChange = () => {
      setProfile(getInitialProfile());
    };
    window.addEventListener('jobachiever:demo-state-reset', handleResetOrChange);
    window.addEventListener('jobachiever:demo-state-changed', handleResetOrChange);
    return () => {
      window.removeEventListener('jobachiever:demo-state-reset', handleResetOrChange);
      window.removeEventListener('jobachiever:demo-state-changed', handleResetOrChange);
    };
  }, []);

  // Section Update Methods
  const updatePersonalInfo = (info) => {
    setProfile((prev) => ({ ...prev, personalInfo: { ...prev.personalInfo, ...info } }));
  };

  const addEducation = (record) => {
    setProfile((prev) => ({
      ...prev,
      education: [...prev.education, { ...record, id: record.id || `edu-${Date.now()}` }],
    }));
  };

  const updateEducation = (id, updated) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    }));
  };

  const removeEducation = (id) => {
    setProfile((prev) => ({
      ...prev,
      education: prev.education.filter((item) => item.id !== id),
    }));
  };

  const addSkill = (skill) => {
    // Prevent duplicate skill names (case-insensitive)
    const exists = profile.skills.some(
      (s) => s.name.toLowerCase() === skill.name.trim().toLowerCase()
    );
    if (exists) {
      throw new Error(`Skill "${skill.name}" is already present in your master profile.`);
    }

    setProfile((prev) => ({
      ...prev,
      skills: [...prev.skills, { ...skill, id: skill.id || `skill-${Date.now()}` }],
    }));
  };

  const updateSkill = (id, updated) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    }));
  };

  const removeSkill = (id) => {
    setProfile((prev) => ({
      ...prev,
      skills: prev.skills.filter((item) => item.id !== id),
    }));
  };

  const addExperience = (record) => {
    setProfile((prev) => ({
      ...prev,
      experience: [...prev.experience, { ...record, id: record.id || `exp-${Date.now()}` }],
    }));
  };

  const updateExperience = (id, updated) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    }));
  };

  const removeExperience = (id) => {
    setProfile((prev) => ({
      ...prev,
      experience: prev.experience.filter((item) => item.id !== id),
    }));
  };

  const addProject = (record) => {
    setProfile((prev) => ({
      ...prev,
      projects: [...prev.projects, { ...record, id: record.id || `proj-${Date.now()}` }],
    }));
  };

  const updateProject = (id, updated) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.map((item) => (item.id === id ? { ...item, ...updated } : item)),
    }));
  };

  const removeProject = (id) => {
    setProfile((prev) => ({
      ...prev,
      projects: prev.projects.filter((item) => item.id !== id),
    }));
  };

  const addCertification = (record) => {
    setProfile((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { ...record, id: record.id || `cert-${Date.now()}` }],
    }));
  };

  const removeCertification = (id) => {
    setProfile((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((item) => item.id !== id),
    }));
  };

  const addAchievement = (record) => {
    setProfile((prev) => ({
      ...prev,
      achievements: [...prev.achievements, { ...record, id: record.id || `ach-${Date.now()}` }],
    }));
  };

  const removeAchievement = (id) => {
    setProfile((prev) => ({
      ...prev,
      achievements: prev.achievements.filter((item) => item.id !== id),
    }));
  };

  const updateCareerPreferences = (prefs) => {
    setProfile((prev) => ({
      ...prev,
      careerPreferences: { ...prev.careerPreferences, ...prefs },
    }));
  };

  // Career Tracks Methods
  const addCareerTrack = (track) => {
    const newTrack = {
      ...track,
      id: track.id || `track-${Date.now()}`,
      isPrimary: profile.careerTracks.length === 0 ? true : !!track.isPrimary,
    };

    setProfile((prev) => {
      let updatedTracks = [...prev.careerTracks];
      if (newTrack.isPrimary) {
        updatedTracks = updatedTracks.map((t) => ({ ...t, isPrimary: false }));
      }
      return { ...prev, careerTracks: [...updatedTracks, newTrack] };
    });

    careerTrackService.createTrack({
      name: newTrack.name,
      targetRole: newTrack.targetRole,
      description: newTrack.description,
      requiredSkills: newTrack.relevantSkills,
      industries: typeof newTrack.targetIndustries === 'string' ? newTrack.targetIndustries.split(',').map((s) => s.trim()) : newTrack.targetIndustries,
      careerGoals: newTrack.careerObjectives,
      isPrimary: newTrack.isPrimary,
    }).then((created) => {
      if (created?.id) {
        setProfile((prev) => ({
          ...prev,
          careerTracks: prev.careerTracks.map((t) => (t.id === newTrack.id ? { ...t, id: created.id } : t)),
        }));
      }
    }).catch(() => {});
  };

  const updateCareerTrack = (id, updated) => {
    setProfile((prev) => {
      let tracks = prev.careerTracks.map((t) => (t.id === id ? { ...t, ...updated } : t));
      if (updated.isPrimary) {
        tracks = tracks.map((t) => (t.id === id ? t : { ...t, isPrimary: false }));
      }
      return { ...prev, careerTracks: tracks };
    });

    if (id && !id.startsWith('track-')) {
      careerTrackService.updateTrack(id, updated).catch(() => {});
    }
  };

  const removeCareerTrack = (id) => {
    setProfile((prev) => {
      const remaining = prev.careerTracks.filter((t) => t.id !== id);
      if (remaining.length > 0 && !remaining.some((t) => t.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return { ...prev, careerTracks: remaining };
    });

    if (id && !id.startsWith('track-demo') && !id.startsWith('track-1') && !id.startsWith('track-2')) {
      careerTrackService.deleteTrack(id).catch(() => {});
    }
  };

  const setPrimaryCareerTrack = (id) => {
    setProfile((prev) => ({
      ...prev,
      careerTracks: prev.careerTracks.map((t) => ({ ...t, isPrimary: t.id === id })),
    }));
  };

  const toggleTrackStatus = (id) => {
    setProfile((prev) => ({
      ...prev,
      careerTracks: prev.careerTracks.map((t) =>
        t.id === id ? { ...t, active: t.active === undefined ? false : !t.active } : t
      ),
    }));
  };

  const updateTrackPriority = (id, priority) => {
    setProfile((prev) => ({
      ...prev,
      careerTracks: prev.careerTracks.map((t) => (t.id === id ? { ...t, priority } : t)),
    }));
  };

  const getTrackSkillMatch = (trackId) => {
    const track = profile.careerTracks.find((t) => t.id === trackId);
    if (!track) return null;

    const masterSkillNames = profile.skills.map((s) => s.name.trim().toLowerCase());
    const req = track.relevantSkills || track.requiredSkills || [];
    const pref = track.preferredSkills || [];

    const matchedReq = req.filter((s) => masterSkillNames.includes(s.trim().toLowerCase()));
    const missingReq = req.filter((s) => !masterSkillNames.includes(s.trim().toLowerCase()));
    const matchedPref = pref.filter((s) => masterSkillNames.includes(s.trim().toLowerCase()));
    const missingPref = pref.filter((s) => !masterSkillNames.includes(s.trim().toLowerCase()));

    const allTrackNorm = [...req, ...pref].map((s) => s.trim().toLowerCase());
    const additional = profile.skills
      .filter((s) => !allTrackNorm.includes(s.name.trim().toLowerCase()))
      .map((s) => s.name);

    const matchPct = req.length > 0 ? Math.round((matchedReq.length / req.length) * 100) : 100;

    return {
      track,
      matchedRequired: matchedReq,
      missingRequired: missingReq,
      matchedPreferred: matchedPref,
      missingPreferred: missingPref,
      additionalProfileSkills: additional,
      matchPercentage: matchPct,
    };
  };

  // Completeness Calculator
  const calculateCompleteness = () => {
    const checks = [
      { name: 'Personal Information', completed: !!profile.personalInfo.fullName && !!profile.personalInfo.headline && !!profile.personalInfo.summary, weight: 20 },
      { name: 'Education', completed: profile.education.length > 0, weight: 15 },
      { name: 'Skills', completed: profile.skills.length >= 3, weight: 20 },
      { name: 'Experience', completed: profile.experience.length > 0, weight: 15 },
      { name: 'Projects', completed: profile.projects.length > 0, weight: 10 },
      { name: 'Certifications / Achievements', completed: profile.certifications.length > 0 || profile.achievements.length > 0, weight: 10 },
      { name: 'Career Preferences', completed: !!profile.careerPreferences.targetRoles?.length && !!profile.careerPreferences.careerGoals, weight: 10 },
    ];

    const completedScore = checks.reduce((acc, curr) => (curr.completed ? acc + curr.weight : acc), 0);
    const missingSections = checks.filter((c) => !c.completed).map((c) => c.name);

    return { percentage: Math.min(100, completedScore), checks, missingSections };
  };

  const resetToDemo = (overrideUser) => {
    const rawUser = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_user') : null;
    const user = rawUser ? JSON.parse(rawUser) : null;
    const isAarav = user?.email?.toLowerCase().includes('aarav');
    const registeredName = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_registered_name') : null;
    const finalName = overrideUser?.fullName || (!isAarav && (user?.name || registeredName)) || DEFAULT_PROFILE.personalInfo.fullName;
    const finalEmail = overrideUser?.email || (!isAarav && user?.email) || DEFAULT_PROFILE.personalInfo.email;

    const sampleProfile = {
      ...DEFAULT_PROFILE,
      personalInfo: {
        ...DEFAULT_PROFILE.personalInfo,
        fullName: finalName,
        email: finalEmail,
      },
    };
    setProfile(sampleProfile);
    if (typeof localStorage !== 'undefined' && user) {
      const userKey = `${STORAGE_KEY}_${user.id || user.email}`;
      localStorage.setItem(userKey, JSON.stringify(sampleProfile));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleProfile));
    }
  };

  const clearProfile = () => {
    setProfile({
      personalInfo: {
        fullName: '',
        headline: '',
        email: '',
        phone: '',
        country: '',
        city: '',
        linkedinUrl: '',
        githubUrl: '',
        websiteUrl: '',
        summary: '',
      },
      education: [],
      skills: [],
      experience: [],
      projects: [],
      certifications: [],
      achievements: [],
      careerPreferences: {
        targetRoles: [],
        employmentTypes: [],
        workArrangement: 'Hybrid',
        preferredLocations: '',
        preferredCountries: '',
        expectedSalary: '',
        careerGoals: '',
      },
      careerTracks: [],
    });
  };

  const value = {
    profile,
    updatePersonalInfo,
    addEducation,
    updateEducation,
    removeEducation,
    addSkill,
    updateSkill,
    removeSkill,
    addExperience,
    updateExperience,
    removeExperience,
    addProject,
    updateProject,
    removeProject,
    addCertification,
    removeCertification,
    addAchievement,
    removeAchievement,
    updateCareerPreferences,
    addCareerTrack,
    updateCareerTrack,
    removeCareerTrack,
    setPrimaryCareerTrack,
    toggleTrackStatus,
    updateTrackPriority,
    getTrackSkillMatch,
    calculateCompleteness,
    resetToDemo,
    clearProfile,
  };

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
