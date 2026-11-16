/**
 * Job Description AI Analysis Service Interface.
 *
 * Dispatches raw job postings or saved job IDs to the Spring Boot backend
 * under /api/v1/jobs/analyze-description and /api/v1/jobs/{jobId}/analyze.
 * Coordinates with the FastAPI microservice for anti-fabrication structured extraction.
 */

import { isDemoMode } from '@/demo/demoConfig';

export const API_BASE_URL =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_AI_SERVICE_BASE_URL || import.meta.env?.VITE_API_BASE_URL)) ||
  'http://localhost:8080/api/v1';

function getAuthHeaders() {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_jwt_token') : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

/**
 * Normalizes raw backend JobAnalysisDto / JsonNode into a consistent client schema
 */
export function normalizeBackendJobAnalysis(dto) {
  if (!dto) return null;

  const report = dto.report || {};
  const overview = report.jobOverview || report.job_overview || {};
  const skills = report.technicalSkills || report.technical_skills || {};
  const qualifications = report.qualifications || {};
  const keywords = report.keywords || {};
  const experienceRange = overview.experienceRange || overview.experience_range || {};

  return {
    id: dto.id,
    jobId: dto.jobId,
    provider: dto.provider || report.provider || 'AI Provider',
    model: dto.model || report.model || 'Default Model',
    createdAt: dto.createdAt || report.timestamp || new Date().toISOString(),

    jobOverview: {
      jobTitle: dto.jobTitle || overview.jobTitle || overview.job_title || 'Untitled Role',
      companyName: dto.companyName || overview.companyName || overview.company_name || 'Unspecified Company',
      roleCategory: overview.roleCategory || overview.role_category || 'GENERAL_ENGINEERING',
      seniority: dto.seniority || overview.seniority || 'UNKNOWN',
      employmentType: dto.employmentType || overview.employmentType || overview.employment_type || 'UNKNOWN',
      workArrangement: dto.workArrangement || overview.workArrangement || overview.work_arrangement || 'UNKNOWN',
      location: dto.location || overview.location || 'Location Not Specified',
      experienceRange: {
        minimumYears: experienceRange.minimumYears ?? experienceRange.minimum_years ?? null,
        maximumYears: experienceRange.maximumYears ?? experienceRange.maximum_years ?? null,
        rawRequirement: dto.experienceSummary || experienceRange.rawRequirement || experienceRange.raw_requirement || 'Not specified',
      },
    },

    technicalSkills: {
      required: skills.required || [],
      preferred: skills.preferred || [],
      mentioned: skills.mentioned || [],
    },

    softSkills: report.softSkills || report.soft_skills || [],
    responsibilities: report.responsibilities || [],

    qualifications: {
      education: qualifications.education || [],
      certifications: qualifications.certifications || [],
      otherRequirements: qualifications.otherRequirements || qualifications.other_requirements || [],
    },

    toolsAndTechnologies: report.toolsAndTechnologies || report.tools_and_technologies || [],

    keywords: {
      coreTechnical: keywords.coreTechnical || keywords.core_technical || [],
      frameworksAndTools: keywords.frameworksAndTools || keywords.frameworks_and_tools || [],
      domain: keywords.domain || [],
      softSkills: keywords.softSkills || keywords.soft_skills || [],
      roleAndResponsibility: keywords.roleAndResponsibility || keywords.role_and_responsibility || [],
    },

    requirements: (report.requirements || []).map((req) => ({
      name: req.name || 'Requirement',
      category: req.category || 'TECHNICAL_SKILL',
      importance: req.importance || 'MEDIUM',
      requirementType: req.requirementType || req.requirement_type || 'EXPLICIT',
      evidenceExcerpt: req.evidenceExcerpt || req.evidence_excerpt || '',
      section: req.section || 'General',
      confidence: req.confidence ?? 1.0,
    })),

    ambiguities: (report.ambiguities || []).map((amb) => ({
      topic: amb.topic || 'Ambiguity',
      observation: amb.observation || '',
      classification: amb.classification || 'POTENTIAL_AMBIGUITY',
      recommendation: amb.recommendation || '',
    })),

    redFlags: report.redFlags || report.red_flags || [],
    summary: dto.summary || report.summary || 'Job description analyzed successfully.',
    warnings: report.warnings || [],
  };
}

export const jobAnalysisService = {
  /**
   * Analyzes an arbitrary raw job description text.
   * Target endpoint: POST /api/v1/jobs/analyze-description
   */
  async analyzeJobDescription(jobDescription, overrides = {}, onProgress = () => {}) {
    if (!jobDescription || jobDescription.trim().length < 50) {
      throw new Error('Job description must contain at least 50 characters.');
    }
    if (jobDescription.length > 50000) {
      throw new Error('Job description exceeds maximum limit of 50,000 characters.');
    }

    if (isDemoMode()) {
      onProgress(30, 'Dispatching to demo decomposition pipeline...');
      await new Promise((r) => setTimeout(r, 120));
      onProgress(75, 'Extracting structured role overview, skills, and qualifications...');
      await new Promise((r) => setTimeout(r, 120));
      onProgress(100, 'Demo analysis complete!');
      return normalizeBackendJobAnalysis({
        id: 'demo-job-ana-001',
        jobId: 'job-demo-stripe',
        provider: 'GROQ',
        model: 'llama-3.3-70b-versatile',
        jobTitle: overrides.jobTitle || 'Backend Software Engineer — Core Platform',
        companyName: overrides.companyName || 'Stripe',
        report: {
          jobOverview: {
            jobTitle: overrides.jobTitle || 'Backend Software Engineer — Core Platform',
            companyName: overrides.companyName || 'Stripe',
            roleCategory: 'BACKEND_DEVELOPMENT',
            seniority: 'ENTRY_TO_MID',
            employmentType: 'FULL_TIME',
            workArrangement: 'HYBRID',
            location: 'San Francisco, CA / Remote',
            experienceRange: { minimumYears: 0, maximumYears: 3, rawRequirement: '0–3 years backend development' },
          },
          technicalSkills: {
            required: [
              { name: 'Java 21', category: 'Languages', importance: 'MANDATORY' },
              { name: 'Spring Boot 3', category: 'Frameworks', importance: 'MANDATORY' },
              { name: 'PostgreSQL', category: 'Databases', importance: 'MANDATORY' },
              { name: 'REST APIs', category: 'Architecture', importance: 'MANDATORY' },
            ],
            preferred: [
              { name: 'Apache Kafka', category: 'Streaming', importance: 'PREFERRED' },
              { name: 'Docker', category: 'DevOps', importance: 'PREFERRED' },
              { name: 'Redis', category: 'Databases', importance: 'PREFERRED' },
              { name: 'Kubernetes', category: 'DevOps', importance: 'PREFERRED' },
            ],
            mentioned: [],
          },
          qualifications: {
            responsibilities: [
              'Build high-availability RESTful APIs in Java 21 and Spring Boot 3.',
              'Design and optimize PostgreSQL database schemas and transaction isolation.',
              'Implement unit and integration testing suites to guarantee 99.99% service reliability.',
              'Collaborate across cross-functional engineering teams to uphold microservice boundaries.',
            ],
            educationalRequirements: ['B.S. in Computer Science, Software Engineering, or equivalent practical experience.'],
            certifications: ['AWS Cloud Practitioner certification is a bonus.'],
          },
          cultureSignals: ['High precision & zero-fabrication', 'Collaborative engineering culture'],
        },
      });
    }

    onProgress(20, 'Dispatching text to Job Description Analyzer...');
    const url = `${API_BASE_URL}/jobs/analyze-description`;

    const payload = {
      jobDescription,
      jobTitle: overrides.jobTitle || undefined,
      companyName: overrides.companyName || undefined,
      provider: overrides.provider || undefined,
      model: overrides.model || undefined,
      temperature: overrides.temperature || undefined,
      maxTokens: overrides.maxTokens || undefined,
    };

    onProgress(50, 'Extracting structured role overview, skills, and qualifications...');
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    onProgress(85, 'Validating requirement extractions & anti-fabrication boundaries...');

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const message = errorJson.message || `Analysis failed with status ${response.status}`;
      throw new Error(message);
    }

    const body = await response.json();
    const rawData = body.data || body;
    onProgress(100, 'Analysis complete!');

    return normalizeBackendJobAnalysis(rawData);
  },

  /**
   * Analyzes an existing saved job posting record.
   * Target endpoint: POST /api/v1/jobs/{jobId}/analyze
   */
  async analyzeSavedJob(jobId, onProgress = () => {}) {
    onProgress(25, 'Loading saved job description...');
    const url = `${API_BASE_URL}/jobs/${jobId}/analyze`;

    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    onProgress(75, 'Extracting structured requirements...');

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      const message = errorJson.message || `Job analysis failed with status ${response.status}`;
      throw new Error(message);
    }

    const body = await response.json();
    const rawData = body.data || body;
    onProgress(100, 'Analysis complete!');

    return normalizeBackendJobAnalysis(rawData);
  },

  /**
   * Retrieves all job analyses for the current user.
   * Target endpoint: GET /api/v1/jobs/analyses
   */
  async getAnalyses() {
    const url = `${API_BASE_URL}/jobs/analyses`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      return [];
    }

    const body = await response.json();
    return body.data || body || [];
  },

  /**
   * Retrieves full analysis report details by ID.
   * Target endpoint: GET /api/v1/jobs/analyses/{analysisId}
   */
  async getAnalysisDetails(analysisId) {
    const url = `${API_BASE_URL}/jobs/analyses/${analysisId}`;
    const response = await fetch(url, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to load job analysis details (${response.status})`);
    }

    const body = await response.json();
    return normalizeBackendJobAnalysis(body.data || body);
  },

  /**
   * Deletes a job analysis report.
   * Target endpoint: DELETE /api/v1/jobs/analyses/{analysisId}
   */
  async deleteAnalysis(analysisId) {
    const url = `${API_BASE_URL}/jobs/analyses/${analysisId}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to delete analysis (${response.status})`);
    }

    return true;
  },
};
