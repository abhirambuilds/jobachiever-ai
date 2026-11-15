import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'jobachiever_profile_draft';

const DEFAULT_PROFILE = {
  personalInfo: {
    fullName: 'Jane Doe',
    headline: 'Senior Full-Stack Engineer & Cloud Systems Architect',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 234-5678',
    country: 'United States',
    city: 'San Francisco, CA',
    linkedinUrl: 'https://linkedin.com/in/janedoe',
    githubUrl: 'https://github.com/janedoe',
    websiteUrl: 'https://janedoe.dev',
    summary:
      'Passionate full-stack engineer with 4+ years of hands-on experience designing high-throughput backend services in Java/Spring Boot and responsive web apps in React. Experienced in distributed PostgreSQL architectures and AI inference integration.',
  },
  education: [
    {
      id: 'edu-1',
      institution: 'University of California, Berkeley',
      degree: 'B.S.',
      fieldOfStudy: 'Computer Science & Engineering',
      startDate: '2019-09',
      graduationDate: '2023-05',
      isCurrent: false,
      gpa: '3.88 / 4.0',
      coursework: 'Distributed Systems, Operating Systems, Database Internals, Algorithms, Machine Learning',
    },
  ],
  skills: [
    {
      id: 'skill-1',
      name: 'Java 21 LTS',
      category: 'Programming Languages',
      proficiency: 'Expert',
      yearsOfExperience: '4',
      evidence: 'Core services in Spring Boot enterprise projects',
    },
    {
      id: 'skill-2',
      name: 'Spring Boot 3',
      category: 'Backend Development',
      proficiency: 'Expert',
      yearsOfExperience: '4',
      evidence: 'Architected microservices handling high concurrency',
    },
    {
      id: 'skill-3',
      name: 'React 18',
      category: 'Frontend Development',
      proficiency: 'Advanced',
      yearsOfExperience: '3',
      evidence: 'Production SaaS user interfaces with Tailwind CSS and Radix UI',
    },
    {
      id: 'skill-4',
      name: 'PostgreSQL & pgvector',
      category: 'Databases',
      proficiency: 'Advanced',
      yearsOfExperience: '3',
      evidence: 'Optimized HNSW vector indexing and relational schema migrations',
    },
    {
      id: 'skill-5',
      name: 'Python 3.11',
      category: 'Programming Languages',
      proficiency: 'Advanced',
      yearsOfExperience: '3',
      evidence: 'FastAPI microservices and automated parsing pipelines',
    },
    {
      id: 'skill-6',
      name: 'Docker & Compose',
      category: 'Cloud and DevOps',
      proficiency: 'Advanced',
      yearsOfExperience: '3',
      evidence: 'Containerized multi-tier monorepos for staging and production',
    },
    {
      id: 'skill-7',
      name: 'REST & gRPC APIs',
      category: 'Backend Development',
      proficiency: 'Expert',
      yearsOfExperience: '4',
      evidence: 'Designed strict DTO isolation and versioned REST endpoints',
    },
    {
      id: 'skill-8',
      name: 'Data Structures & Algorithms',
      category: 'Core Computer Science',
      proficiency: 'Advanced',
      yearsOfExperience: '4',
      evidence: 'Sub-linear search performance and memory optimization',
    },
  ],
  experience: [
    {
      id: 'exp-1',
      company: 'Apex Cloud Solutions',
      jobTitle: 'Senior Full-Stack Engineer',
      employmentType: 'Full-time',
      location: 'San Francisco, CA (Hybrid)',
      startDate: '2023-06',
      endDate: '',
      isCurrent: true,
      responsibilities:
        'Led architecture for cloud-native microservices processing 2.5M daily events. Guided junior engineers in code review and test-driven development.',
      achievements:
        'Decreased 99th-percentile API response latency by 38% via PostgreSQL indexing and connection pool tuning. Built responsive dashboard in React.',
      technologies: 'Java, Spring Boot, React, PostgreSQL, Docker, AWS',
    },
    {
      id: 'exp-2',
      company: 'Nexis Tech Labs',
      jobTitle: 'Software Engineering Intern',
      employmentType: 'Internship',
      location: 'San Jose, CA',
      startDate: '2022-05',
      endDate: '2022-08',
      isCurrent: false,
      responsibilities:
        'Developed internal diagnostic dashboard and automated continuous integration pipelines with GitHub Actions.',
      achievements:
        'Migrated 14 legacy endpoints to Spring Boot 3 with comprehensive JUnit and Mockito test coverage.',
      technologies: 'Java, Spring Boot, JUnit, Docker, Git',
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'VectorDB Query Engine',
      description:
        'A high-performance semantic search service integrating pgvector with FastAPI for rapid document similarity scoring.',
      problemSolved:
        'Eliminated costly external SaaS vector database subscriptions by running optimized on-premise embeddings with HNSW indexing.',
      technologies: 'Python, FastAPI, PostgreSQL, pgvector, Docker',
      githubUrl: 'https://github.com/janedoe/vectordb-engine',
      liveDemoUrl: 'https://vectordb.janedoe.dev',
      role: 'Sole Architect & Lead Developer',
      keyAchievements: 'Achieved sub-50ms latency across 500,000 document vector queries.',
      startDate: '2023-01',
      endDate: '2023-04',
    },
    {
      id: 'proj-2',
      name: 'CloudMetrics Observability Suite',
      description:
        'Real-time metrics aggregator and visual dashboard monitoring distributed service health.',
      problemSolved:
        'Provided granular latency attribution across multi-tier Spring Boot and React applications.',
      technologies: 'React, Tailwind CSS, Spring Boot, WebSockets',
      githubUrl: 'https://github.com/janedoe/cloudmetrics-suite',
      liveDemoUrl: 'https://metrics.janedoe.dev',
      role: 'Full-Stack Developer',
      keyAchievements: 'Adopted by 3 internal engineering teams to debug release bottlenecks.',
      startDate: '2023-08',
      endDate: '2023-11',
    },
  ],
  certifications: [
    {
      id: 'cert-1',
      name: 'AWS Certified Solutions Architect – Associate',
      issuingOrg: 'Amazon Web Services',
      issueDate: '2023-07',
      expirationDate: '2026-07',
      credentialUrl: 'https://aws.amazon.com/verification',
    },
    {
      id: 'cert-2',
      name: 'Spring Certified Professional',
      issuingOrg: 'VMware Tanzu',
      issueDate: '2022-11',
      expirationDate: '',
      credentialUrl: 'https://vmware.com/credentials',
    },
  ],
  achievements: [
    {
      id: 'ach-1',
      title: 'First Place – CalHacks Hackathon',
      description:
        'Built an accessible AI career advisory tool within 36 hours competing against 400+ collegiate developer teams.',
      issuingOrg: 'UC Berkeley CalHacks',
      date: '2022-10',
    },
  ],
  careerPreferences: {
    targetRoles: ['Backend Developer', 'Full Stack Developer', 'Solutions Architect'],
    employmentTypes: ['Full-time'],
    workArrangement: 'Hybrid',
    preferredLocations: 'San Francisco Bay Area, Seattle, Remote',
    preferredCountries: 'United States',
    expectedSalary: '$140,000 - $175,000',
    careerGoals:
      'Lead backend platform architecture for scalable cloud systems, deepen expertise in LLM embedding pipelines, and mentor emerging engineers.',
  },
  careerTracks: [
    {
      id: 'track-1',
      name: 'Backend Systems Engineer',
      targetRole: 'Senior Backend Engineer',
      description:
        'Specialized track prioritizing high-concurrency microservices, Spring Boot, distributed databases, and fault tolerance.',
      relevantSkills: [
        'Java 21 LTS',
        'Spring Boot 3',
        'PostgreSQL & pgvector',
        'Docker & Compose',
        'REST & gRPC APIs',
        'Data Structures & Algorithms',
      ],
      targetIndustries: 'Cloud Infrastructure, Developer Tooling, Fintech',
      careerObjectives: 'Architect resilient event-driven systems with sub-50ms p99 latency.',
      preferredOpportunities: 'Mid-to-Senior Individual Contributor roles',
      isPrimary: true,
    },
    {
      id: 'track-2',
      name: 'Full-Stack Product Engineer',
      targetRole: 'Full-Stack Developer',
      description:
        'End-to-end product engineering track combining modern React/Tailwind frontends with Spring Boot and Node.js APIs.',
      relevantSkills: [
        'React 18',
        'Java 21 LTS',
        'Spring Boot 3',
        'PostgreSQL & pgvector',
        'Docker & Compose',
      ],
      targetIndustries: 'Commercial SaaS, Enterprise Software',
      careerObjectives: 'Deliver polished, user-delighting SaaS products from concept to scale.',
      preferredOpportunities: 'Product-focused engineering teams',
      isPrimary: false,
    },
    {
      id: 'track-3',
      name: 'AI & Vector Solutions Engineer',
      targetRole: 'AI / ML Solutions Engineer',
      description:
        'Applied AI track focusing on semantic search, pgvector database indexing, and structured inference services.',
      relevantSkills: [
        'Python 3.11',
        'PostgreSQL & pgvector',
        'Docker & Compose',
        'REST & gRPC APIs',
      ],
      targetIndustries: 'Applied AI, Intelligent Search, Enterprise Analytics',
      careerObjectives: 'Implement grounded AI workflows without hallucinations.',
      preferredOpportunities: 'Applied AI and Infrastructure teams',
      isPrimary: false,
    },
  ],
};

const ProfileContext = createContext(null);

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // localStorage may fail in restricted modes
    }
    return DEFAULT_PROFILE;
  });

  // Persist non-sensitive draft profile data in localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore write errors
    }
  }, [profile]);

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
  };

  const updateCareerTrack = (id, updated) => {
    setProfile((prev) => {
      let tracks = prev.careerTracks.map((t) => (t.id === id ? { ...t, ...updated } : t));
      if (updated.isPrimary) {
        tracks = tracks.map((t) => (t.id === id ? t : { ...t, isPrimary: false }));
      }
      return { ...prev, careerTracks: tracks };
    });
  };

  const removeCareerTrack = (id) => {
    setProfile((prev) => {
      const remaining = prev.careerTracks.filter((t) => t.id !== id);
      if (remaining.length > 0 && !remaining.some((t) => t.isPrimary)) {
        remaining[0].isPrimary = true;
      }
      return { ...prev, careerTracks: remaining };
    });
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

  const resetToDemo = () => {
    setProfile(DEFAULT_PROFILE);
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
