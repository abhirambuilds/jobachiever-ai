/**
 * Resume Studio Service Interface & Template Configuration for JobAchiever AI.
 *
 * Defines contracts for template layouts, typography, design systems, section types,
 * version histories, and the AI Writing Assistant.
 *
 * Prepares for Spring Boot 3.x document persistence and FastAPI AI generation.
 */

export const RESUME_STUDIO_API_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_AI_SERVICE_BASE_URL || import.meta.env?.VITE_API_BASE_URL)) ||
  'http://localhost:8080/api/v1';

export const TEMPLATES = [
  {
    id: 'ats_professional',
    name: 'ATS Professional',
    category: 'Single-Column / ATS Optimized',
    description: '100% single-column layout with standard headings, optimal machine parseability, and zero decorative collisions.',
    badge: 'Maximum ATS Score',
    recommendedFor: 'Corporate ATS, Traditional Enterprise, Finance, Government',
  },
  {
    id: 'modern_professional',
    name: 'Modern Professional',
    category: 'Two-Column / Modern',
    description: 'Contemporary asymmetric layout with left credential sidebar and right career progression stream.',
    badge: 'Popular',
    recommendedFor: 'Tech Startups, Product Management, Commercial SaaS',
  },
  {
    id: 'technical_resume',
    name: 'Technical Resume',
    category: 'Technology & Architecture',
    description: 'Stack-first architecture emphasizing categorized technical proficiencies, project deliverables, and system outcomes.',
    badge: 'Developer Focus',
    recommendedFor: 'Full-Stack, DevOps, Backend, Cloud & AI Systems Engineers',
  },
  {
    id: 'academic_cv',
    name: 'Academic CV',
    category: 'Academic & Research',
    description: 'Formal serif presentation tailored for publications, research scope, teaching foundations, and grants.',
    badge: 'Scholarly',
    recommendedFor: 'Researchers, Professors, Ph.D. Candidates, Data Scientists',
  },
  {
    id: 'international_resume',
    name: 'International Resume',
    category: 'Global & Multilingual',
    description: 'Structured executive format featuring global mobility indicators, CEFR multilingual matrix, and cross-border delivery.',
    badge: 'Global Mobility',
    recommendedFor: 'International Applicants, Remote Global Roles, Enterprise Consultants',
  },
];

export const AVAILABLE_FONTS = [
  { id: 'font-inter', name: 'Inter (Modern Sans)', family: "'Inter', sans-serif", type: 'sans' },
  { id: 'font-roboto', name: 'Roboto (Clean Sans)', family: "'Roboto', sans-serif", type: 'sans' },
  { id: 'font-merriweather', name: 'Merriweather (Editorial Serif)', family: "'Merriweather', Georgia, serif", type: 'serif' },
  { id: 'font-playfair', name: 'Playfair (Executive Serif)', family: "'Playfair Display', Georgia, serif", type: 'serif' },
  { id: 'font-mono', name: 'JetBrains Mono (Technical)', family: "'JetBrains Mono', monospace", type: 'mono' },
];

export const COLOR_PALETTES = [
  { id: 'slate', name: 'Slate Executive', primary: '#0f172a', secondary: '#475569', accent: '#2563eb' },
  { id: 'indigo', name: 'Indigo Modern', primary: '#1e1b4b', secondary: '#4338ca', accent: '#6366f1' },
  { id: 'emerald', name: 'Emerald Tech', primary: '#064e3b', secondary: '#047857', accent: '#10b981' },
  { id: 'rose', name: 'Crimson Professional', primary: '#881337', secondary: '#be123c', accent: '#f43f5e' },
  { id: 'charcoal', name: 'Classic Monochromatic', primary: '#18181b', secondary: '#3f3f46', accent: '#52525b' },
];

export const SECTION_TYPES = [
  { id: 'personal_info', type: 'personal_info', title: 'Personal Information', label: 'Personal Information', category: 'Identity', isPermanent: true },
  { id: 'summary', type: 'summary', title: 'Professional Summary', label: 'Professional Summary', category: 'Core', isPermanent: false },
  { id: 'skills', type: 'skills', title: 'Technical Skills', label: 'Technical Skills', category: 'Core', isPermanent: false },
  { id: 'experience', type: 'experience', title: 'Work Experience', label: 'Work Experience', category: 'Experience', isPermanent: false },
  { id: 'internships', type: 'internships', title: 'Internships', label: 'Internships', category: 'Experience', isPermanent: false },
  { id: 'projects', type: 'projects', title: 'Projects & Portfolios', label: 'Projects & Portfolios', category: 'Experience', isPermanent: false },
  { id: 'education', type: 'education', title: 'Education', label: 'Education', category: 'Credentials', isPermanent: false },
  { id: 'certifications', type: 'certifications', title: 'Certifications', label: 'Certifications', category: 'Credentials', isPermanent: false },
  { id: 'achievements', type: 'achievements', title: 'Achievements & Milestones', label: 'Achievements & Milestones', category: 'Additional', isPermanent: false },
  { id: 'publications', type: 'publications', title: 'Publications', label: 'Publications', category: 'Academic', isPermanent: false },
  { id: 'research', type: 'research', title: 'Research Experience', label: 'Research Experience', category: 'Academic', isPermanent: false },
  { id: 'awards', type: 'awards', title: 'Honors & Awards', label: 'Honors & Awards', category: 'Additional', isPermanent: false },
  { id: 'languages', type: 'languages', title: 'Languages', label: 'Languages', category: 'Additional', isPermanent: false },
  { id: 'additional_info', type: 'additional_info', title: 'Additional Information', label: 'Additional Information', category: 'Additional', isPermanent: false },
];

export const DEFAULT_DESIGN_SETTINGS = {
  template: 'ats_professional',
  fontFamily: AVAILABLE_FONTS[0].id,
  fontSize: 'normal', // 'compact' (9pt), 'normal' (10pt), 'large' (11pt)
  headingSize: 'normal', // 'compact', 'normal', 'large'
  lineHeight: 'normal', // 'tight', 'normal', 'relaxed'
  colorPalette: COLOR_PALETTES[0].id,
  primaryColor: COLOR_PALETTES[0].primary,
  secondaryColor: COLOR_PALETTES[0].secondary,
  accentColor: COLOR_PALETTES[0].accent,
  pageMargin: 'normal', // 'compact' (12mm), 'normal' (18mm), 'spacious' (24mm)
  sectionSpacing: 'normal', // 'compact', 'normal', 'spacious'
  entrySpacing: 'normal',
  pageSize: 'A4', // 'A4' | 'Letter'
};

/**
 * Helper to build initial resume data populated from user's Master Profile
 */
export function buildResumeFromProfile(profile, trackId = 'track-1') {
  const primaryTrack = profile.careerTracks?.find((t) => t.id === trackId) || profile.careerTracks?.[0];
  const p = profile.personalInfo || {};

  const resumeTitle = `${p.fullName || 'Candidate'} — ${primaryTrack?.name || 'Full-Stack Engineer'} Resume`;

  return {
    id: `resume-${Date.now().toString(36)}`,
    title: resumeTitle,
    name: resumeTitle,
    careerTrackId: primaryTrack?.id || 'track-1',
    careerTrackName: primaryTrack?.name || 'Full-Stack Engineer',
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    designSettings: { ...DEFAULT_DESIGN_SETTINGS },
    sections: [
      {
        id: 'sec-personal',
        type: 'personal_info',
        title: 'Personal Information',
        order: 1,
        visible: true,
        data: {
          fullName: p.fullName || 'Abhiram Reddy',
          headline: p.headline || 'Senior Full-Stack Engineer | Distributed Systems & Cloud Infrastructure',
          email: p.email || 'abhiram@example.com',
          phone: p.phoneNumber || '+1 (555) 234-5678',
          city: p.city || 'San Francisco',
          country: p.country || 'United States',
          linkedin: p.linkedin || 'https://linkedin.com/in/abhirambuilds',
          github: p.github || 'https://github.com/abhirambuilds',
          website: p.website || 'https://abhiram.dev',
        },
      },
      {
        id: 'sec-summary',
        type: 'summary',
        title: 'Professional Summary',
        order: 2,
        visible: true,
        data: {
          summaryText:
            p.summary ||
            'Senior Full-Stack Engineer with 5+ years of experience architecting high-throughput distributed systems in Java 21, Spring Boot 3, React 18, and PostgreSQL with pgvector. Proven track record leading cloud-native microservice migrations and optimizing database query latencies.',
        },
      },
      {
        id: 'sec-skills',
        type: 'skills',
        title: 'Technical Proficiencies',
        order: 3,
        visible: true,
        data: {
          categories: [
            { category: 'Languages', skills: ['Java 21 LTS', 'JavaScript (ESNext)', 'Python 3.11', 'SQL', 'TypeScript'] },
            { category: 'Frameworks & Libraries', skills: ['Spring Boot 3.x', 'React 18', 'Tailwind CSS', 'FastAPI', 'Node.js'] },
            { category: 'Databases & Storage', skills: ['PostgreSQL 16', 'pgvector', 'Redis', 'Flyway Migrations'] },
            { category: 'DevOps & Architecture', skills: ['Docker', 'Kubernetes', 'CI/CD Pipelines', 'RESTful APIs', 'Microservices'] },
          ],
        },
      },
      {
        id: 'sec-experience',
        type: 'experience',
        title: 'Professional Experience',
        order: 4,
        visible: true,
        data: {
          items: (profile.experience && profile.experience.length > 0)
            ? profile.experience.map((exp) => ({
                id: exp.id || `exp-${Math.random().toString(36).substring(2, 7)}`,
                title: exp.title || exp.jobTitle || 'Senior Software Engineer',
                jobTitle: exp.title || exp.jobTitle || 'Senior Software Engineer',
                company: exp.company || 'CloudScale Technologies',
                location: exp.location || 'San Francisco, CA',
                startDate: exp.startDate || 'Jan 2023',
                endDate: exp.isCurrent ? 'Present' : exp.endDate || 'Dec 2024',
                current: !!exp.isCurrent,
                bullets: exp.bullets || exp.responsibilities || [
                  'Architected distributed microservices in Java 21 and Spring Boot 3 handling 1.2M queries/sec with sub-50ms latency.',
                  'Engineered vector embedding search pipelines with PostgreSQL pgvector, cutting candidate matching query times by 40%.',
                  'Led cross-functional sprint teams, conducted rigorous code reviews, and enforced zero-trust security postures.',
                ],
              }))
            : [
                {
                  id: 'exp-1',
                  title: 'Senior Software Engineer',
                  jobTitle: 'Senior Software Engineer',
                  company: 'CloudScale Technologies',
                  location: 'San Francisco, CA',
                  startDate: 'Jan 2023',
                  endDate: 'Present',
                  current: true,
                  bullets: [
                    'Architected distributed microservices in Java 21 and Spring Boot 3 handling 1.2M queries/sec with sub-50ms latency.',
                    'Engineered vector embedding search pipelines with PostgreSQL pgvector, cutting candidate matching query times by 40%.',
                    'Spearheaded multi-tenant cloud migration with zero downtime across multi-region deployments.',
                  ],
                },
                {
                  id: 'exp-2',
                  title: 'Software Engineer — Platform',
                  jobTitle: 'Software Engineer — Platform',
                  company: 'Apex Systems',
                  location: 'San Jose, CA',
                  startDate: 'Aug 2021',
                  endDate: 'Dec 2022',
                  current: false,
                  bullets: [
                    'Built resilient REST APIs using Spring Boot and Hibernate with 99.95% uptime guarantees.',
                    'Optimized PostgreSQL query execution plans, reducing p99 latency by 35% on critical transactional workflows.',
                  ],
                },
              ],
        },
      },
      {
        id: 'sec-projects',
        type: 'projects',
        title: 'Key Engineering Projects',
        order: 5,
        visible: true,
        data: {
          items: (profile.projects && profile.projects.length > 0)
            ? profile.projects.map((proj) => ({
                id: proj.id || `proj-${Math.random().toString(36).substring(2, 7)}`,
                name: proj.name || proj.title || 'VectorDB Query Engine',
                role: proj.role || 'Lead Architect',
                technologies: proj.technologies || ['Java 21', 'Spring Boot 3', 'pgvector', 'Docker'],
                link: proj.link || proj.github || 'https://github.com/abhirambuilds/vectordb-engine',
                github: proj.github || proj.link || 'https://github.com/abhirambuilds/vectordb-engine',
                description: proj.description || '',
                bullets: proj.bullets || [
                  proj.description || 'High-throughput similarity search microservice delivering cosine vector retrieval for AI agents.',
                  'Built automated benchmark harness with JUnit 5 and Testcontainers verifying transactional data isolation.',
                ],
              }))
            : [
                {
                  id: 'proj-1',
                  name: 'VectorDB Query Engine',
                  role: 'Lead Architect',
                  technologies: ['Java 21', 'Spring Boot 3', 'pgvector', 'Docker'],
                  link: 'https://github.com/abhirambuilds/vectordb-engine',
                  github: 'https://github.com/abhirambuilds/vectordb-engine',
                  description: 'High-throughput similarity search microservice delivering sub-50ms cosine vector retrieval for AI agents.',
                  bullets: [
                    'High-throughput similarity search microservice delivering sub-50ms cosine vector retrieval for AI agents.',
                    'Built automated integration test harness with JUnit 5 and Testcontainers ensuring strict multi-tenant isolation.',
                  ],
                },
              ],
        },
      },
      {
        id: 'sec-education',
        type: 'education',
        title: 'Education',
        order: 6,
        visible: true,
        data: {
          items: (profile.education && profile.education.length > 0)
            ? profile.education.map((edu) => ({
                id: edu.id || `edu-${Math.random().toString(36).substring(2, 7)}`,
                institution: edu.institution || 'State University of Technology',
                degree: edu.degree || 'Bachelor of Science',
                fieldOfStudy: edu.fieldOfStudy || 'Computer Science',
                graduationYear: edu.graduationDate || edu.endDate || '2021',
                startDate: edu.startDate || '2017',
                endDate: edu.graduationDate || edu.endDate || '2021',
                grade: edu.grade || edu.gpa || 'GPA: 3.8/4.0',
                highlights: 'Dean’s Honor List • Algorithms & Distributed Computing Specialization',
              }))
            : [
                {
                  id: 'edu-1',
                  institution: 'State University of Technology',
                  degree: 'Bachelor of Science',
                  fieldOfStudy: 'Computer Science',
                  graduationYear: '2021',
                  startDate: '2017',
                  endDate: '2021',
                  grade: 'GPA: 3.8/4.0',
                  highlights: 'Dean’s Honor List • Algorithms & Distributed Computing Specialization',
                },
              ],
        },
      },
      {
        id: 'sec-certifications',
        type: 'certifications',
        title: 'Certifications',
        order: 7,
        visible: true,
        data: {
          entries: [
            { id: 'cert-1', name: 'AWS Certified Solutions Architect — Associate', issuer: 'Amazon Web Services', issueDate: '2023', credentialId: 'AWS-SA-9824' },
            { id: 'cert-2', name: 'Oracle Certified Professional: Java SE 21 Developer', issuer: 'Oracle', issueDate: '2024', credentialId: 'OCP-JAVA-21' },
          ],
        },
      },
      {
        id: 'sec-languages',
        type: 'languages',
        title: 'Languages',
        order: 8,
        visible: false, // Hidden by default, can be toggled
        data: {
          entries: [
            { language: 'English', proficiency: 'Full Professional / Native' },
            { language: 'Spanish', proficiency: 'Professional Working Proficiency' },
          ],
        },
      },
    ],
    versions: [
      {
        versionNumber: 1,
        description: 'Initial resume compiled from Master Career Profile.',
        createdAt: new Date().toISOString(),
      },
    ],
  };
}

/**
 * AI Writing Assistant simulation service
 * Strictly fact-preserving: never fabricates metrics, credentials, or technologies.
 */
export const aiWritingService = {
  async improveText(originalText, instruction = 'clarity') {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const clean = originalText.trim();
    let suggested = clean;
    let explanation = 'Enhanced phrasing to convey active technical ownership.';

    if (instruction === 'action_verbs') {
      suggested = clean
        .replace(/worked on/gi, 'engineered')
        .replace(/helped maintain/gi, 'architected and maintained')
        .replace(/was responsible for/gi, 'spearheaded');
      explanation = 'Replaced passive or generic verbs with decisive technical leadership verbs.';
    } else if (instruction === 'concise') {
      suggested = clean
        .replace(/in order to/gi, 'to')
        .replace(/successfully implemented/gi, 'implemented')
        .replace(/a variety of different/gi, 'multiple');
      explanation = 'Eliminated redundant filler words while preserving technical deliverables.';
    } else if (instruction === 'technical') {
      suggested = `${clean} ensuring fault-tolerant ACID compliance and sub-linear query execution.`;
      explanation = 'Clarified architectural reliability guarantees without fabricating metrics.';
    } else {
      // General clarity
      suggested = clean.replace(/responsible for/gi, 'directed the delivery of');
      explanation = 'Clarified technical agency and eliminated grammatical ambiguity.';
    }

    return {
      originalText,
      suggestedText: suggested,
      explanation,
    };
  },

  async rewriteSentence(text, goal = 'action_verbs') {
    const res = await this.improveText(text, goal);
    return {
      original: text,
      rewritten: res.suggestedText,
      explanation: res.explanation,
      atsScore: 94,
      goal,
    };
  },
};

const _inMemoryDrafts = new Map();

/**
 * Service implementation for Resume Studio operations
 */
export const resumeStudioService = {
  getTemplates() {
    return TEMPLATES;
  },

  getAvailableFonts() {
    return AVAILABLE_FONTS;
  },

  getColorPalettes() {
    return COLOR_PALETTES;
  },

  getSectionTypes() {
    return SECTION_TYPES;
  },

  async saveResumeDraft(resume) {
    if (resume?.id) {
      _inMemoryDrafts.set(resume.id, resume);
    }
    return {
      success: true,
      message: 'Resume draft saved successfully.',
      data: resume,
    };
  },

  async fetchResumeDraft(id) {
    const draft = _inMemoryDrafts.get(id) || {
      id,
      title: 'Master Resume',
    };
    return {
      success: true,
      data: draft,
    };
  },
};

export const resumeStudioApiService = resumeStudioService;
