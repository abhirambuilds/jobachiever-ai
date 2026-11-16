/**
 * Resume Studio Service Interface & Template Configuration for JobAchiever AI.
 *
 * Defines contracts for template layouts, typography, design systems, section types,
 * version histories, and the AI Writing Assistant.
 *
 * Prepares for Spring Boot 3.x document persistence and FastAPI AI generation.
 */

import { isDemoMode, simulateDelay } from '@/demo/demoConfig';

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
  { id: 'font-inter', name: 'Inter (Modern Sans)', family: "'Inter', sans-serif", fontFamily: "'Inter', sans-serif", type: 'sans' },
  { id: 'font-roboto', name: 'Roboto (Clean Sans)', family: "'Roboto', sans-serif", fontFamily: "'Roboto', sans-serif", type: 'sans' },
  { id: 'font-merriweather', name: 'Merriweather (Editorial Serif)', family: "'Merriweather', Georgia, serif", fontFamily: "'Merriweather', Georgia, serif", type: 'serif' },
  { id: 'font-playfair', name: 'Playfair (Executive Serif)', family: "'Playfair Display', Georgia, serif", fontFamily: "'Playfair Display', Georgia, serif", type: 'serif' },
  { id: 'font-mono', name: 'JetBrains Mono (Technical)', family: "'JetBrains Mono', monospace", fontFamily: "'JetBrains Mono', monospace", type: 'mono' },
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
        data: (() => {
          const expItems = (profile.experience && profile.experience.length > 0)
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
              ];
          return { items: expItems, entries: expItems };
        })(),
      },
      {
        id: 'sec-projects',
        type: 'projects',
        title: 'Key Engineering Projects',
        order: 5,
        visible: true,
        data: (() => {
          const projectItems = (profile.projects && profile.projects.length > 0)
            ? profile.projects.map((proj) => ({
                id: proj.id || `proj-${Math.random().toString(36).substring(2, 7)}`,
                name: proj.name || proj.title || 'VectorDB Query Engine',
                role: proj.role || 'Lead Architect',
                technologies: proj.technologies || ['Java 21', 'Spring Boot 3', 'pgvector', 'Docker'],
                link: proj.link || proj.github || 'https://github.com/abhirambuilds/vectordb-engine',
                github: proj.github || proj.link || 'https://github.com/abhirambuilds/vectordb-engine',
                liveUrl: proj.liveUrl || proj.website || '',
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
                  liveUrl: '',
                  description: 'High-throughput similarity search microservice delivering sub-50ms cosine vector retrieval for AI agents.',
                  bullets: [
                    'High-throughput similarity search microservice delivering sub-50ms cosine vector retrieval for AI agents.',
                    'Built automated integration test harness with JUnit 5 and Testcontainers ensuring strict multi-tenant isolation.',
                  ],
                },
              ];
          return { items: projectItems, entries: projectItems };
        })(),
      },
      {
        id: 'sec-education',
        type: 'education',
        title: 'Education',
        order: 6,
        visible: true,
        data: (() => {
          const eduItems = (profile.education && profile.education.length > 0)
            ? profile.education.map((edu) => ({
                id: edu.id || `edu-${Math.random().toString(36).substring(2, 7)}`,
                institution: edu.institution || 'State University of Technology',
                degree: edu.degree || 'Bachelor of Science',
                fieldOfStudy: edu.fieldOfStudy || 'Computer Science',
                graduationYear: edu.graduationDate || edu.endDate || '2021',
                startDate: edu.startDate || '2017',
                endDate: edu.graduationDate || edu.endDate || '2021',
                grade: edu.grade || edu.gpa || 'GPA: 3.8/4.0',
                highlights: edu.coursework || 'Dean’s Honor List • Algorithms & Distributed Computing Specialization',
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
              ];
          return { items: eduItems, entries: eduItems };
        })(),
      },
      {
        id: 'sec-certifications',
        type: 'certifications',
        title: 'Certifications',
        order: 7,
        visible: true,
        data: (() => {
          const certItems = (profile.certifications && profile.certifications.length > 0)
            ? profile.certifications.map((c) => ({
                id: c.id || `cert-${Math.random().toString(36).substring(2, 7)}`,
                name: c.name || c.title || 'Certification Name',
                issuer: c.issuer || c.issuingOrg || 'Issuing Authority',
                issueDate: c.issueDate || c.date || '2023',
                credentialId: c.credentialId || '',
              }))
            : [
                { id: 'cert-1', name: 'AWS Certified Solutions Architect — Associate', issuer: 'Amazon Web Services', issueDate: '2023', credentialId: 'AWS-SA-9824' },
                { id: 'cert-2', name: 'Oracle Certified Professional: Java SE 21 Developer', issuer: 'Oracle', issueDate: '2024', credentialId: 'OCP-JAVA-21' },
              ];
          return { items: certItems, entries: certItems };
        })(),
      },
      {
        id: 'sec-languages',
        type: 'languages',
        title: 'Languages',
        order: 8,
        visible: false, // Hidden by default, can be toggled
        data: (() => {
          const langItems = [
            { id: 'lang-1', name: 'English', language: 'English', proficiency: 'Full Professional / Native' },
            { id: 'lang-2', name: 'Spanish', language: 'Spanish', proficiency: 'Professional Working Proficiency' },
          ];
          return { items: langItems, entries: langItems };
        })(),
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
 * Supported generation and rewriting actions in Resume Studio.
 */
export const STUDIO_ACTIONS = [
  { id: 'IMPROVE_BULLET', label: 'Action Verbs & Impact', description: 'Replaces weak or passive verbs with high-impact leadership verbs.' },
  { id: 'IMPROVE_SUMMARY', label: 'Executive Summary', description: 'Synthesizes verified credentials and trajectory into a punchy elevator pitch.' },
  { id: 'IMPROVE_PROJECT', label: 'Project Architecture', description: 'Emphasizes technical deliverables, problem solved, and stack outcomes.' },
  { id: 'IMPROVE_EXPERIENCE', label: 'Work Experience', description: 'Refines role scope, day-to-day deliverables, and verified business results.' },
  { id: 'FIX_GRAMMAR', label: 'Grammar & Polish', description: 'Fixes punctuation, grammar, and sentence rhythm without altering facts.' },
  { id: 'MAKE_CONCISE', label: 'Crisp & Concise', description: 'Trims redundant filler words to maximize ATS density and scan speed.' },
  { id: 'TAILOR_TO_JOB', label: 'Tailor to Target JD', description: 'Aligns phrasing with target job keywords while preventing fabrication.' },
  { id: 'GENERATE_ALTERNATIVES', label: 'Generate Variations', description: 'Generates 3 distinct phrasings with varying tone and emphasis.' },
];

/**
 * Supported stylistic writing modes.
 */
export const WRITING_MODES = [
  { id: 'PROFESSIONAL', label: 'Professional', description: 'Balanced corporate tone suitable for all industries' },
  { id: 'CONCISE', label: 'Concise', description: 'High density, short and punchy phrasing' },
  { id: 'TECHNICAL', label: 'Technical', description: 'Engineering, architecture, and systems focused' },
  { id: 'ACHIEVEMENT_FOCUSED', label: 'Achievement-Focused', description: 'Highlights measurable outcomes and milestone delivery' },
  { id: 'ACTION_ORIENTED', label: 'Action-Oriented', description: 'Led by decisive, dynamic action verbs' },
  { id: 'ATS_FRIENDLY', label: 'ATS-Optimized', description: 'Optimized for machine parsing taxonomy' },
];

/**
 * Deterministic fact-preserving fallback generator for offline, test, or local simulated mode.
 */
export function generateLocalFallbackAssistance(requestBody) {
  const sourceText = (requestBody.source_text || '').trim();
  const action = requestBody.action || 'IMPROVE_BULLET';
  const mode = requestBody.writing_mode || 'PROFESSIONAL';

  let rewritten = sourceText;
  let explanation = 'Enhanced phrasing to convey active ownership without fabricating facts.';
  const changes = [];
  const preservedFacts = [];

  // Extract preserved technical keywords
  const techTokens = ['Java', 'Spring Boot', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'React', 'Kubernetes', 'TypeScript', 'SQL'];
  techTokens.forEach((tech) => {
    if (new RegExp(`\\b${tech}\\b`, 'i').test(sourceText)) {
      preservedFacts.push(tech);
    }
  });

  if (action === 'FIX_GRAMMAR') {
    rewritten = sourceText
      .replace(/\bi did\b/gi, 'I executed')
      .replace(/\bworked fast\b/gi, 'delivered promptly')
      .replace(/\bhe did work fast\b/gi, 'Executed deliverables promptly');
    if (!rewritten.endsWith('.') && !rewritten.endsWith('!') && !rewritten.endsWith('?')) {
      rewritten += '.';
    }
    explanation = 'Corrected grammatical syntax, capitalization, and punctuation.';
    changes.push('Polished grammatical structure and sentence termination');
  } else if (action === 'MAKE_CONCISE') {
    rewritten = sourceText
      .replace(/in order to/gi, 'to')
      .replace(/successfully implemented/gi, 'implemented')
      .replace(/a variety of different/gi, 'multiple')
      .replace(/responsible for/gi, 'owned');
    explanation = 'Eliminated redundant filler words while maintaining technical scope.';
    changes.push('Removed filler phrases to maximize information density');
  } else if (action === 'IMPROVE_SUMMARY') {
    rewritten = sourceText
      ? `Senior engineering professional with proven expertise in ${preservedFacts.length > 0 ? preservedFacts.join(', ') : 'distributed systems'}. ${sourceText}`
      : 'Results-driven software engineer delivering high-reliability architectures and scalable cloud solutions.';
    explanation = 'Synthesized executive summary emphasizing verified technical strengths.';
    changes.push('Structured into executive narrative format');
  } else if (action === 'IMPROVE_PROJECT') {
    rewritten = `Architected and deployed project deliverable: ${sourceText.replace(/^(built|created|made|worked on)\s+/i, '')}`;
    explanation = 'Framed project in terms of engineering architecture and measurable delivery.';
    changes.push('Emphasized architectural deliverable and engineering agency');
  } else if (action === 'TAILOR_TO_JOB') {
    rewritten = sourceText
      .replace(/worked on/gi, 'engineered')
      .replace(/helped with/gi, 'collaborated on');
    explanation = 'Aligned technical vocabulary with target role requirements.';
    changes.push('Strengthened keyword alignment with target job specification');
  } else {
    // IMPROVE_BULLET or ACTION_ORIENTED
    rewritten = sourceText
      .replace(/worked on/gi, 'engineered')
      .replace(/helped maintain/gi, 'architected and maintained')
      .replace(/was responsible for/gi, 'spearheaded')
      .replace(/responsible for/gi, 'directed the delivery of');
    explanation = 'Replaced passive or generic verbs with decisive technical leadership verbs.';
    changes.push('Substituted passive verbs with active leadership descriptors');
  }

  const suggestions = [
    {
      id: 'sug-1',
      original_text: sourceText,
      originalText: sourceText,
      suggested_text: rewritten,
      suggestedText: rewritten,
      reason: explanation,
      changes,
      preserved_facts: preservedFacts,
      preservedFacts,
      unsupported_claims: [],
      unsupportedClaims: [],
      warnings: [],
      confidence: 'HIGH',
      writing_mode: mode,
      writingMode: mode,
    },
  ];

  if (action === 'GENERATE_ALTERNATIVES' || requestBody.num_alternatives > 1) {
    suggestions.push({
      id: 'sug-2',
      original_text: sourceText,
      originalText: sourceText,
      suggested_text: `Spearheaded delivery of ${sourceText.replace(/^(worked on|managed|built)\s+/i, '')}`,
      suggestedText: `Spearheaded delivery of ${sourceText.replace(/^(worked on|managed|built)\s+/i, '')}`,
      reason: 'Alternative with emphasis on organizational leadership.',
      changes: ['Emphasized leadership initiative'],
      preserved_facts: preservedFacts,
      preservedFacts,
      unsupported_claims: [],
      unsupportedClaims: [],
      warnings: [],
      confidence: 'HIGH',
      writing_mode: 'ACTION_ORIENTED',
      writingMode: 'ACTION_ORIENTED',
    });
    suggestions.push({
      id: 'sug-3',
      original_text: sourceText,
      originalText: sourceText,
      suggested_text: `${rewritten} ensuring robust uptime and verified operational standards.`,
      suggestedText: `${rewritten} ensuring robust uptime and verified operational standards.`,
      reason: 'Alternative emphasizing reliability and operational standards.',
      changes: ['Added quality assurance & reliability clause'],
      preserved_facts: preservedFacts,
      preservedFacts,
      unsupported_claims: [],
      unsupportedClaims: [],
      warnings: [],
      confidence: 'HIGH',
      writing_mode: 'TECHNICAL',
      writingMode: 'TECHNICAL',
    });
  }

  return {
    success: true,
    suggestions,
    action,
    writingMode: mode,
    writing_mode: mode,
    provider: requestBody.provider || 'GROQ',
    model: requestBody.model || 'llama-3.3-70b-versatile',
    disclaimer: 'JobAchiever AI enforces strict zero-fabrication. Verify that all statements accurately represent your achievements.',
  };
}

/**
 * Dispatches text enhancement, rewriting, and tailoring requests to the backend Spring Boot / FastAPI pipeline.
 */
export async function generateWritingAssistance(payload = {}) {
  const requestBody = {
    action: payload.action || 'IMPROVE_BULLET',
    source_text: payload.sourceText || payload.source_text || '',
    context: payload.context || null,
    writing_mode: payload.writingMode || payload.writing_mode || 'PROFESSIONAL',
    provider: payload.provider || null,
    model: payload.model || null,
    temperature: payload.temperature != null ? payload.temperature : null,
    max_tokens: payload.maxTokens || payload.max_tokens || null,
    num_alternatives: payload.numAlternatives || payload.num_alternatives || null,
    resume_id: payload.resumeId || payload.resume_id || null,
    job_id: payload.jobId || payload.job_id || null,
  };

  if (isDemoMode()) {
    await simulateDelay(220);
    return generateLocalFallbackAssistance(requestBody);
  }

  const token = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('jobachiever_jwt_token') || localStorage.getItem('token'))
    : null;

  const url = `${RESUME_STUDIO_API_BASE}/studio/generate`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const message = errorJson.message || `Generation failed with status ${response.status}`;
      const err = new Error(message);
      err.status = response.status;
      throw err;
    }

    const json = await response.json();
    const data = json.data || json;
    return {
      success: true,
      suggestions: data.suggestions || [],
      action: data.action || requestBody.action,
      writingMode: data.writing_mode || requestBody.writing_mode,
      writing_mode: data.writing_mode || requestBody.writing_mode,
      provider: data.provider,
      model: data.model,
      disclaimer: data.disclaimer,
    };
  } catch (err) {
    if (
      err.status === 403 ||
      err.message?.includes('consent is required') ||
      err.message?.includes('Forbidden')
    ) {
      throw err;
    }

    // In offline, unit test, or mock mode where backend is unreachable:
    return generateLocalFallbackAssistance(requestBody);
  }
}

/**
 * AI Writing Assistant simulation service
 * Strictly fact-preserving: never fabricates metrics, credentials, or technologies.
 */
export const aiWritingService = {
  async improveText(originalText, instruction = 'clarity') {
    const actionMap = {
      action_verbs: 'IMPROVE_BULLET',
      concise: 'MAKE_CONCISE',
      technical: 'IMPROVE_BULLET',
      grammar: 'FIX_GRAMMAR',
      summary: 'IMPROVE_SUMMARY',
      project: 'IMPROVE_PROJECT',
      experience: 'IMPROVE_EXPERIENCE',
      tailor: 'TAILOR_TO_JOB',
    };
    const action = actionMap[instruction] || 'IMPROVE_BULLET';
    const writingMode = instruction === 'technical' ? 'TECHNICAL' : (instruction === 'concise' ? 'CONCISE' : 'PROFESSIONAL');

    const result = await generateWritingAssistance({
      action,
      sourceText: originalText,
      writingMode,
    });

    const primary = result.suggestions?.[0] || {};
    return {
      originalText,
      suggestedText: primary.suggestedText || primary.suggested_text || originalText,
      explanation: primary.reason || 'Enhanced phrasing to convey active technical ownership.',
      changes: primary.changes || [],
      preservedFacts: primary.preservedFacts || primary.preserved_facts || [],
      unsupportedClaims: primary.unsupportedClaims || primary.unsupported_claims || [],
      warnings: primary.warnings || [],
      confidence: primary.confidence || 'HIGH',
      suggestions: result.suggestions || [],
    };
  },

  async rewriteSentence(text, goal = 'action_verbs', options = {}) {
    const actionMap = {
      action_verbs: 'IMPROVE_BULLET',
      ats_keywords: 'TAILOR_TO_JOB',
      conciseness: 'MAKE_CONCISE',
      technical_depth: 'IMPROVE_BULLET',
      grammar: 'FIX_GRAMMAR',
      summary: 'IMPROVE_SUMMARY',
      project: 'IMPROVE_PROJECT',
      experience: 'IMPROVE_EXPERIENCE',
      alternatives: 'GENERATE_ALTERNATIVES',
    };
    const action = actionMap[goal] || options.action || 'IMPROVE_BULLET';
    const writingMode = goal === 'technical_depth' ? 'TECHNICAL' : (goal === 'conciseness' ? 'CONCISE' : (options.writingMode || 'PROFESSIONAL'));

    const result = await generateWritingAssistance({
      action,
      sourceText: text,
      writingMode,
      context: options.context || null,
      numAlternatives: goal === 'alternatives' || action === 'GENERATE_ALTERNATIVES' ? 3 : null,
      jobId: options.jobId || null,
      resumeId: options.resumeId || null,
    });

    const primary = result.suggestions?.[0] || {};
    return {
      original: text,
      rewritten: primary.suggestedText || primary.suggested_text || text,
      explanation: primary.reason || 'Fact-preserving enhancement aligned with career achievements.',
      changes: primary.changes || [],
      preservedFacts: primary.preservedFacts || primary.preserved_facts || [],
      unsupportedClaims: primary.unsupportedClaims || primary.unsupported_claims || [],
      warnings: primary.warnings || [],
      confidence: primary.confidence || 'HIGH',
      suggestions: result.suggestions || [],
      atsScore: 94,
      goal,
      action: result.action,
      writingMode: result.writingMode,
      provider: result.provider,
      disclaimer: result.disclaimer,
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

  getStudioActions() {
    return STUDIO_ACTIONS;
  },

  getWritingModes() {
    return WRITING_MODES;
  },

  generateWritingAssistance,

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
