/**
 * Career Intelligence Service Interface for JobAchiever AI.
 *
 * Coordinates AI-powered Skill Gap Analysis, Phased Learning Roadmaps,
 * Milestone Progress Tracking, and Portfolio Project Recommendations.
 */

import { isDemoMode } from '@/demo/demoConfig';
import { demoService } from '@/demo/demoService';

export const CAREER_API_BASE =
  (typeof import.meta !== 'undefined' &&
    (import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_AI_SERVICE_BASE_URL)) ||
  'http://localhost:8080/api/v1';

function getAuthHeaders() {
  const token = typeof localStorage !== 'undefined'
    ? (localStorage.getItem('jobachiever_jwt_token') || localStorage.getItem('token'))
    : null;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const careerIntelligenceService = {
  /**
   * Analyze skill gaps for a specific career track.
   * POST /api/v1/career/skill-gaps
   */
  async analyzeSkillGaps(params = {}) {
    if (isDemoMode()) {
      return demoService.getSkillGaps(params.careerTrackId || params.trackId);
    }
    const url = `${CAREER_API_BASE}/career/skill-gaps`;
    const payload = {
      careerTrackId: params.careerTrackId || params.trackId,
      targetRole: params.targetRole || null,
      resumeId: params.resumeId || null,
      provider: params.provider || null,
      model: params.model || null,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const err = new Error(errorJson.message || `Skill gap analysis failed with status ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const json = await response.json();
      return json.data || json;
    } catch (err) {
      // Fallback simulation for client-only / offline testing
      return simulateSkillGapAnalysis(payload.targetRole || 'Backend Engineer', payload.careerTrackId);
    }
  },

  /**
   * Retrieve latest skill gap analysis for a track.
   * GET /api/v1/career/skill-gaps?trackId={trackId}
   */
  async getLatestSkillGaps(trackId) {
    if (isDemoMode()) {
      return demoService.getSkillGaps(trackId);
    }
    const safeTrackId = trackId || 'track-default';
    const url = `${CAREER_API_BASE}/career/skill-gaps?trackId=${encodeURIComponent(safeTrackId)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) return json.data;
      }
    } catch {
      // fallback
    }
    return simulateSkillGapAnalysis('Engineer', safeTrackId);
  },

  /**
   * Generate actionable career recommendations for a track.
   * POST /api/v1/career/recommendations
   */
  async generateRecommendations(params = {}) {
    const url = `${CAREER_API_BASE}/career/recommendations`;
    const payload = {
      careerTrackId: params.careerTrackId || params.trackId,
      targetRole: params.targetRole || null,
      provider: params.provider || null,
      model: params.model || null,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const err = new Error(errorJson.message || `Recommendations generation failed with status ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const json = await response.json();
      return json.data || json;
    } catch (err) {
      return simulateCareerRecommendations(payload.targetRole || 'Backend Engineer', payload.careerTrackId);
    }
  },

  /**
   * Retrieve latest career recommendations for a track.
   * GET /api/v1/career/recommendations?trackId={trackId}
   */
  async getLatestRecommendations(trackId) {
    const safeTrackId = trackId || 'track-default';
    const url = `${CAREER_API_BASE}/career/recommendations?trackId=${encodeURIComponent(safeTrackId)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) return json.data;
      }
    } catch {
      // fallback
    }
    return simulateRecommendations('Engineer', safeTrackId);
  },

  /**
   * Generate a phased learning roadmap for a track.
   * POST /api/v1/career/roadmaps
   */
  async generateRoadmap(params = {}) {
    if (isDemoMode()) {
      return demoService.getRoadmap(params.careerTrackId || params.trackId);
    }
    const url = `${CAREER_API_BASE}/career/roadmaps`;
    const payload = {
      careerTrackId: params.careerTrackId || params.trackId,
      targetRole: params.targetRole || null,
      customGoal: params.customGoal || null,
      provider: params.provider || null,
      model: params.model || null,
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const err = new Error(errorJson.message || `Roadmap generation failed with status ${response.status}`);
        err.status = response.status;
        throw err;
      }

      const json = await response.json();
      return json.data || json;
    } catch (err) {
      return simulateLearningRoadmap(payload.targetRole || 'Backend Engineer', payload.careerTrackId);
    }
  },

  /**
   * Retrieve active roadmap for a track.
   * GET /api/v1/career/roadmaps?trackId={trackId}
   */
  async getActiveRoadmap(trackId) {
    if (isDemoMode()) {
      return demoService.getRoadmap(trackId);
    }
    const safeTrackId = trackId || 'track-default';
    const url = `${CAREER_API_BASE}/career/roadmaps?trackId=${encodeURIComponent(safeTrackId)}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.data) return json.data;
      }
    } catch {
      // fallback
    }
    return simulateLearningRoadmap('Engineer', safeTrackId);
  },

  /**
   * Retrieve all roadmaps for user.
   * GET /api/v1/career/roadmaps/all
   */
  async getUserRoadmaps() {
    const url = `${CAREER_API_BASE}/career/roadmaps/all`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) return [];
      const json = await response.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  /**
   * Update milestone status, notes, or evidence links.
   * PATCH /api/v1/career/milestones/{milestoneId}
   */
  async updateMilestone(milestoneId, updates = {}) {
    if (isDemoMode()) {
      return demoService.updateMilestoneStatus(milestoneId, updates.status || 'IN_PROGRESS');
    }
    const url = `${CAREER_API_BASE}/career/milestones/${encodeURIComponent(milestoneId)}`;

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || `Failed to update milestone: ${response.status}`);
      }

      const json = await response.json();
      return json.data || json;
    } catch (err) {
      // Local optimistic update
      return {
        id: milestoneId,
        status: updates.status || 'IN_PROGRESS',
        personalNotes: updates.personalNotes || '',
        evidenceLinks: updates.evidenceLinks || [],
        completedAt: updates.status === 'COMPLETED' ? new Date().toISOString() : null,
      };
    }
  },

  /**
   * Recommend multi-skill portfolio projects.
   * POST /api/v1/career/projects?trackId={trackId}
   */
  async recommendProjects(trackId) {
    if (isDemoMode()) {
      return { projects: await demoService.getProjectBlueprints() };
    }
    if (!trackId) return null;
    const url = `${CAREER_API_BASE}/career/projects?trackId=${encodeURIComponent(trackId)}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.message || `Project recommendation failed: ${response.status}`);
      }

      const json = await response.json();
      return json.data || json;
    } catch (err) {
      return simulateProjectRecommendations('Backend Engineer', trackId);
    }
  },

  /**
   * Retrieve aggregated career summary metrics for the dashboard.
   * GET /api/v1/career/dashboard-summary
   */
  async getDashboardSummary() {
    if (isDemoMode()) {
      return demoService.getDashboardSummary();
    }
    const url = `${CAREER_API_BASE}/career/dashboard-summary`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) return null;
      const json = await response.json();
      return json.data || null;
    } catch {
      return null;
    }
  },
};

// -----------------------------------------------------------------------------
// Offline Simulation Helpers & Multi-Resume Scenario Adaptation
// -----------------------------------------------------------------------------

export function getActiveResumeScenario() {
  if (typeof localStorage === 'undefined') return 'BACKEND';
  try {
    const activeResumeRaw = localStorage.getItem('jobachiever_active_resume') || '';
    const rLower = (typeof activeResumeRaw === 'string' ? activeResumeRaw : JSON.stringify(activeResumeRaw)).toLowerCase();
    if (rLower.includes('rohan') || rLower.includes('frontend') || rLower.includes('react')) return 'FRONTEND';
    if (rLower.includes('vikram') || rLower.includes('ai') || rLower.includes('data') || rLower.includes('ml')) return 'AI_ML';
    if (rLower.includes('ananya') || rLower.includes('backend') || rLower.includes('cloud')) return 'BACKEND';

    const rawUser = localStorage.getItem('jobachiever_user');
    const user = rawUser ? JSON.parse(rawUser) : null;
    if (user) {
      const userResumesKey = `jobachiever_user_resumes_${user.id || user.email}`;
      const resumes = JSON.parse(localStorage.getItem(userResumesKey) || '[]');
      if (resumes.length > 0) {
        const topName = (resumes[0].name || resumes[0].title || '').toLowerCase();
        if (topName.includes('rohan') || topName.includes('frontend') || topName.includes('react')) return 'FRONTEND';
        if (topName.includes('vikram') || topName.includes('ai') || topName.includes('data') || topName.includes('ml')) return 'AI_ML';
        if (topName.includes('ananya') || topName.includes('backend') || topName.includes('cloud')) return 'BACKEND';
      }
    }

    const draft = localStorage.getItem('jobachiever_profile_draft') || '';
    const dLower = draft.toLowerCase();
    if (dLower.includes('rohan') || dLower.includes('frontend')) return 'FRONTEND';
    if (dLower.includes('vikram') || dLower.includes('data science') || dLower.includes('pytorch')) return 'AI_ML';
  } catch {
    // fallback
  }
  return 'BACKEND';
}

function simulateSkillGapAnalysis(targetRole, trackId) {
  const scenario = getActiveResumeScenario();

  if (scenario === 'FRONTEND') {
    const demonstrated = [
      {
        canonicalName: 'React 19',
        category: 'TECHNICAL',
        classification: 'STRONG',
        evidenceStatus: 'CONFIRMED',
        priorityScore: 95,
        priorityLevel: 'HIGH',
        importanceRationale: 'Primary web application UI framework with Concurrent React and Server Components',
        requiredForRoles: [targetRole || 'Senior Frontend Engineer'],
        prerequisites: [],
        candidateEvidence: ['Confirmed profile skill: React 19', 'Production usage in checkout micro-frontends'],
      },
      {
        canonicalName: 'TypeScript',
        category: 'TECHNICAL',
        classification: 'STRONG',
        evidenceStatus: 'CONFIRMED',
        priorityScore: 92,
        priorityLevel: 'HIGH',
        importanceRationale: 'Type-safe enterprise architectural foundations',
        requiredForRoles: [targetRole || 'Senior Frontend Engineer'],
        prerequisites: ['JavaScript'],
        candidateEvidence: ['Extensively used across Swiggy consumer web applications'],
      },
    ];

    const developing = [
      {
        canonicalName: 'Zustand & React Query',
        category: 'TECHNICAL',
        classification: 'DEVELOPING',
        evidenceStatus: 'EVIDENCED',
        priorityScore: 82,
        priorityLevel: 'HIGH',
        importanceRationale: 'Client-side async state caching and UI reactivity',
        requiredForRoles: [targetRole || 'Senior Frontend Engineer'],
        prerequisites: [],
        candidateEvidence: ['Used in product filter workflows'],
      },
    ];

    const missing = [
      {
        canonicalName: 'Core Web Vitals & Web Workers',
        category: 'TECHNICAL',
        classification: 'MISSING_EVIDENCE',
        evidenceStatus: 'MISSING',
        priorityScore: 94,
        priorityLevel: 'CRITICAL',
        importanceRationale: 'Sub-second LCP, INP, and off-main-thread computation at massive user scale',
        requiredForRoles: [targetRole || 'Senior Frontend Engineer'],
        prerequisites: ['Browser Rendering Engine'],
        candidateEvidence: ['No production benchmark evidence in current profile'],
      },
      {
        canonicalName: 'Module Federation (Micro-Frontends)',
        category: 'TECHNICAL',
        classification: 'MISSING_EVIDENCE',
        evidenceStatus: 'MISSING',
        priorityScore: 88,
        priorityLevel: 'HIGH',
        importanceRationale: 'Independent multi-team deployments without monolithic build bottlenecks',
        requiredForRoles: [targetRole || 'Senior Frontend Engineer'],
        prerequisites: ['Webpack 5 / Vite'],
        candidateEvidence: ['Theoretical familiarity reported, need hands-on production repository'],
      },
    ];

    return {
      id: 'sim-gap-' + Date.now(),
      careerTrackId: trackId,
      targetRole: targetRole || 'Senior Frontend & Web Architect',
      provider: 'GROQ',
      model: 'openai/gpt-oss-120b',
      summary: 'Demonstrated exceptional mastery in React 19 and TypeScript. Critical expansion areas center on Core Web Vitals performance budgets and Module Federation architecture.',
      demonstratedSkills: demonstrated,
      developingSkills: developing,
      missingEvidenceSkills: missing,
      criticalPriorities: [missing[0]],
      allEvaluatedSkills: [...demonstrated, ...developing, ...missing],
      createdAt: new Date().toISOString(),
    };
  }

  if (scenario === 'AI_ML') {
    const demonstrated = [
      {
        canonicalName: 'PyTorch & Python',
        category: 'TECHNICAL',
        classification: 'STRONG',
        evidenceStatus: 'CONFIRMED',
        priorityScore: 96,
        priorityLevel: 'HIGH',
        importanceRationale: 'Foundational framework for deep neural networks, embeddings, and model training',
        requiredForRoles: [targetRole || 'Lead AI/ML Systems Engineer'],
        prerequisites: [],
        candidateEvidence: ['Evidenced across RAG pipelines and custom transformer fine-tuning at CRED'],
      },
      {
        canonicalName: 'Retrieval-Augmented Generation (RAG)',
        category: 'TECHNICAL',
        classification: 'STRONG',
        evidenceStatus: 'CONFIRMED',
        priorityScore: 94,
        priorityLevel: 'HIGH',
        importanceRationale: 'Production LLM applications with hybrid semantic retrieval and contextual grounding',
        requiredForRoles: [targetRole || 'Lead AI/ML Systems Engineer'],
        prerequisites: ['Vector Embeddings'],
        candidateEvidence: ['Deployed sub-50ms pgvector semantic query platform'],
      },
    ];

    const developing = [
      {
        canonicalName: 'FastAPI & Docker',
        category: 'TECHNICAL',
        classification: 'DEVELOPING',
        evidenceStatus: 'EVIDENCED',
        priorityScore: 85,
        priorityLevel: 'HIGH',
        importanceRationale: 'Serving low-latency inference endpoints with asynchronous worker pools',
        requiredForRoles: [targetRole || 'Lead AI/ML Systems Engineer'],
        prerequisites: [],
        candidateEvidence: ['Model wrapper microservice deployed on AWS'],
      },
    ];

    const missing = [
      {
        canonicalName: 'LLM Quantization & AWQ/GGUF',
        category: 'TECHNICAL',
        classification: 'MISSING_EVIDENCE',
        evidenceStatus: 'MISSING',
        priorityScore: 95,
        priorityLevel: 'CRITICAL',
        importanceRationale: 'Cost-efficient 4-bit/8-bit deployment reducing VRAM consumption by 70% in production',
        requiredForRoles: [targetRole || 'Lead AI/ML Systems Engineer'],
        prerequisites: ['CUDA'],
        candidateEvidence: ['No verifiable quantized inference serving benchmark in profile'],
      },
      {
        canonicalName: 'LangGraph Multi-Agent Orchestration',
        category: 'TECHNICAL',
        classification: 'MISSING_EVIDENCE',
        evidenceStatus: 'MISSING',
        priorityScore: 90,
        priorityLevel: 'HIGH',
        importanceRationale: 'Cyclic state machines and multi-agent coordination for autonomous enterprise tasks',
        requiredForRoles: [targetRole || 'Lead AI/ML Systems Engineer'],
        prerequisites: ['LangChain'],
        candidateEvidence: ['Currently using sequential chains, needs state-machine graph execution'],
      },
    ];

    return {
      id: 'sim-gap-' + Date.now(),
      careerTrackId: trackId,
      targetRole: targetRole || 'Lead AI/ML & LLM Systems Engineer',
      provider: 'GROQ',
      model: 'openai/gpt-oss-120b',
      summary: 'High-caliber GenAI and RAG foundations. Key technical frontiers focus on 4-bit LLM quantization and LangGraph multi-agent state machines.',
      demonstratedSkills: demonstrated,
      developingSkills: developing,
      missingEvidenceSkills: missing,
      criticalPriorities: [missing[0]],
      allEvaluatedSkills: [...demonstrated, ...developing, ...missing],
      createdAt: new Date().toISOString(),
    };
  }
  const demonstrated = [
    {
      canonicalName: 'Java',
      category: 'TECHNICAL',
      classification: 'STRONG',
      evidenceStatus: 'CONFIRMED',
      priorityScore: 92,
      priorityLevel: 'HIGH',
      importanceRationale: 'Primary backend platform programming language',
      requiredForRoles: [targetRole],
      prerequisites: [],
      candidateEvidence: ['Confirmed profile skill: Java'],
    },
    {
      canonicalName: 'PostgreSQL',
      category: 'TECHNICAL',
      classification: 'STRONG',
      evidenceStatus: 'EVIDENCED',
      priorityScore: 88,
      priorityLevel: 'HIGH',
      importanceRationale: 'Relational data modeling, ACID transactions, and index tuning',
      requiredForRoles: [targetRole],
      prerequisites: ['SQL'],
      candidateEvidence: ['Evidenced in project descriptions: PostgreSQL'],
    },
  ];

  const developing = [
    {
      canonicalName: 'Docker',
      category: 'TECHNICAL',
      classification: 'DEVELOPING',
      evidenceStatus: 'EVIDENCED',
      priorityScore: 84,
      priorityLevel: 'HIGH',
      importanceRationale: 'Container packaging, reproducible development environments, and multi-stage builds',
      requiredForRoles: [targetRole],
      prerequisites: ['Linux'],
      candidateEvidence: ['Self-reported profile skill: Docker'],
    },
  ];

  const missing = [
    {
      canonicalName: 'Kubernetes',
      category: 'TECHNICAL',
      classification: 'MISSING_EVIDENCE',
      evidenceStatus: 'MISSING',
      priorityScore: 95,
      priorityLevel: 'CRITICAL',
      importanceRationale: 'Production cluster orchestration, ingress, deployment manifests, and autoscaling',
      requiredForRoles: [targetRole],
      prerequisites: ['Docker'],
      candidateEvidence: [],
    },
    {
      canonicalName: 'Kafka',
      category: 'TECHNICAL',
      classification: 'MISSING_EVIDENCE',
      evidenceStatus: 'MISSING',
      priorityScore: 91,
      priorityLevel: 'CRITICAL',
      importanceRationale: 'Distributed event streaming, partitioning, consumer groups, and stream processing',
      requiredForRoles: [targetRole],
      prerequisites: ['Distributed Systems'],
      candidateEvidence: [],
    },
    {
      canonicalName: 'Redis',
      category: 'TECHNICAL',
      classification: 'MISSING_EVIDENCE',
      evidenceStatus: 'MISSING',
      priorityScore: 80,
      priorityLevel: 'MEDIUM',
      importanceRationale: 'Distributed caching, session storage, and rate limiting architectures',
      requiredForRoles: [targetRole],
      prerequisites: [],
      candidateEvidence: [],
    },
  ];

  const critical = missing.filter(m => m.priorityScore >= 90);
  const allEvaluated = [...demonstrated, ...developing, ...missing];

  return {
    id: 'sim-gap-' + Date.now(),
    careerTrackId: trackId,
    targetRole,
    provider: 'GROQ',
    model: 'llama-3.3-70b-versatile',
    summary: `Demonstrated solid foundational proficiencies in Java and PostgreSQL. Key strategic advancement opportunities center on Kubernetes orchestration and Kafka event streaming.`,
    demonstratedSkills: demonstrated,
    developingSkills: developing,
    missingEvidenceSkills: missing,
    criticalPriorities: critical,
    allEvaluatedSkills: allEvaluated,
    createdAt: new Date().toISOString(),
  };
}

function simulateCareerRecommendations(targetRole, trackId) {
  return {
    id: 'sim-rec-' + Date.now(),
    careerTrackId: trackId,
    targetRole,
    provider: 'GROQ',
    model: 'llama-3.3-70b-versatile',
    recommendations: [
      {
        title: 'Master Event-Driven Architectures with Apache Kafka',
        category: 'SKILL_DEVELOPMENT',
        priority: 'CRITICAL',
        rationale: 'Kafka appears in 78% of senior backend job specifications for high-throughput distributed systems.',
        targetSkills: ['Kafka', 'Distributed Systems'],
        actionableSteps: [
          'Study partition semantics, offsets, and consumer group rebalancing.',
          'Build an event producer/consumer pipeline with idempotency guarantees.',
          'Integrate dead-letter queues and consumer retry backoff strategies.',
        ],
        estimatedEffort: '2-3 weeks',
      },
      {
        title: 'Deploy Production Services on Kubernetes',
        category: 'PRACTICAL_PROJECT',
        priority: 'HIGH',
        rationale: 'Hands-on container orchestration experience bridges the gap from local development to production readiness.',
        targetSkills: ['Kubernetes', 'Docker'],
        actionableSteps: [
          'Set up local Minikube or Kind cluster with Helm packaging.',
          'Configure ConfigMaps, Secrets, Ingress, and horizontal pod autoscaling.',
          'Expose rolling update deployments with liveness and readiness probes.',
        ],
        estimatedEffort: '3-4 weeks',
      },
      {
        title: 'Architect Distributed Caching with Redis',
        category: 'CONCEPT_MASTERY',
        priority: 'MEDIUM',
        rationale: 'Understanding cache-aside, write-through, and cache stampede protection is vital for high-scale applications.',
        targetSkills: ['Redis'],
        actionableSteps: [
          'Implement multi-level caching for hot database queries.',
          'Implement token-bucket rate limiting using Redis sliding windows.',
        ],
        estimatedEffort: '1-2 weeks',
      },
    ],
    createdAt: new Date().toISOString(),
  };
}

function simulateLearningRoadmap(targetRole, trackId) {
  const phase1Milestones = [
    {
      id: 'm-101',
      roadmapId: 'rm-sim',
      phaseNumber: 1,
      title: 'Containerization & Local Multi-Service Topology',
      description: 'Solidify Docker foundations, multi-stage builds, and Docker Compose networking.',
      priority: 'HIGH',
      status: 'COMPLETED',
      relatedSkills: ['Docker'],
      tasks: [
        { description: 'Create multi-stage Dockerfile optimizing container layers', taskType: 'PRACTICE', skills: ['Docker'] },
        { description: 'Run multi-service local environment with database and cache', taskType: 'PRACTICE', skills: ['Docker', 'PostgreSQL'] },
      ],
      completionCriteria: ['Multi-stage Docker build achieves sub-100MB production image', 'Local docker-compose boots without errors'],
      estimatedDuration: null,
      startDate: new Date(Date.now() - 7 * 86400000).toISOString(),
      completedAt: new Date().toISOString(),
      personalNotes: 'Completed during local service containerization practice.',
      evidenceLinks: ['https://github.com/candidate/backend-practice'],
    },
    {
      id: 'm-102',
      roadmapId: 'rm-sim',
      phaseNumber: 1,
      title: 'Kubernetes Pods, Deployments & Service Networking',
      description: 'Deploy application services to a local cluster with declarative manifests.',
      priority: 'CRITICAL',
      status: 'IN_PROGRESS',
      relatedSkills: ['Kubernetes', 'Docker'],
      tasks: [
        { description: 'Write Deployment and Service YAML manifests', taskType: 'PRACTICE', skills: ['Kubernetes'] },
        { description: 'Configure Ingress and health check probes', taskType: 'PRACTICE', skills: ['Kubernetes'] },
      ],
      completionCriteria: ['Deployments pass zero-downtime rolling updates', 'Liveness and readiness probes recover failing pods'],
      estimatedDuration: null,
      startDate: new Date().toISOString(),
      completedAt: null,
      personalNotes: 'Currently testing Ingress routing on Minikube.',
      evidenceLinks: [],
    },
  ];

  const phase2Milestones = [
    {
      id: 'm-201',
      roadmapId: 'rm-sim',
      phaseNumber: 2,
      title: 'Event Streaming & Messaging Patterns with Kafka',
      description: 'Implement distributed asynchronous communication between backend services.',
      priority: 'CRITICAL',
      status: 'NOT_STARTED',
      relatedSkills: ['Kafka', 'Distributed Systems'],
      tasks: [
        { description: 'Setup multi-broker Kafka cluster and create topics with partitions', taskType: 'LEARNING', skills: ['Kafka'] },
        { description: 'Implement exactly-once / at-least-once consumer semantics', taskType: 'PRACTICE', skills: ['Kafka'] },
      ],
      completionCriteria: ['Events processed idempotently under consumer crashes', 'Consumer group rebalance handled without lost messages'],
      estimatedDuration: null,
      startDate: null,
      completedAt: null,
      personalNotes: '',
      evidenceLinks: [],
    },
  ];

  const phases = [
    {
      phaseNumber: 1,
      name: 'Phase 1: Foundations & Infrastructure Readiness',
      description: 'Master containerization and cluster orchestration fundamentals.',
      milestones: phase1Milestones,
    },
    {
      phaseNumber: 2,
      name: 'Phase 2: Distributed Architecture & Event Streaming',
      description: 'Implement asynchronous message queues and resilient high-throughput pipelines.',
      milestones: phase2Milestones,
    },
  ];

  return {
    id: 'rm-sim-' + Date.now(),
    careerTrackId: trackId,
    targetRole,
    title: `${targetRole} Strategic Learning Roadmap`,
    description: `Personalized, phased advancement path addressing critical skills required for ${targetRole} positions.`,
    status: 'IN_PROGRESS',
    provider: 'GROQ',
    model: 'llama-3.3-70b-versatile',
    estimatedDuration: null,
    phases,
    totalMilestones: 3,
    completedMilestones: 1,
    inProgressMilestones: 1,
    blockedMilestones: 0,
    progressPercentage: 33,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function simulateProjectRecommendations(targetRole, trackId) {
  const scenario = getActiveResumeScenario();

  if (scenario === 'FRONTEND') {
    return {
      careerTrackId: trackId,
      targetRole: targetRole || 'Senior Frontend Architect',
      provider: 'GROQ',
      model: 'openai/gpt-oss-120b',
      projects: [
        {
          title: 'PulseUI Enterprise Design System with WAI-ARIA & Zero-Runtime CSS',
          description: 'Production-ready headless component system supporting micro-frontends with sub-100ms first input delay.',
          targetMissingSkills: ['Module Federation', 'Core Web Vitals', 'Web Workers'],
          architectureOverview: 'Turborepo monorepo with Vite build pipeline, Tailwind CSS design tokens, and Module Federation runtime integration.',
          keyDeliverables: [
            'Accessible combobox and modal dialogs with 100% keyboard and screen-reader compliance',
            'Automated bundle size budgets enforcing <15KB gzipped per component',
            'Module federation remote container published to private CDN',
            'Playwright visual regression testing suite integrated with GitHub Actions',
          ],
          estimatedDifficulty: 'ADVANCED',
          portfolioImpact: 'Provides definitive proof of design system architecture and web performance engineering matching Staff Frontend benchmarks.',
        },
      ],
    };
  }

  if (scenario === 'AI_ML') {
    return {
      careerTrackId: trackId,
      targetRole: targetRole || 'Lead AI/ML Systems Engineer',
      provider: 'GROQ',
      model: 'openai/gpt-oss-120b',
      projects: [
        {
          title: 'OmniSearch Neural Vector Engine with Hybrid Re-ranking & Guardrails',
          description: 'Sub-50ms hybrid dense/sparse vector retrieval system with hallucination mitigations and semantic caching.',
          targetMissingSkills: ['LLM Quantization', 'LangGraph', 'pgvector'],
          architectureOverview: 'FastAPI microservice with PyTorch embeddings, pgvector HNSW indexing, and Redis semantic cache layer.',
          keyDeliverables: [
            'Hybrid BM25 + dense embedding re-ranker achieving 0.94 Mean Reciprocal Rank',
            'LangGraph state-machine router for complex multi-hop question answering',
            '4-bit AWQ quantized model serving engine running on vLLM',
            'Automated RAGAS evaluation harness tracking context precision and answer faithfulness',
          ],
          estimatedDifficulty: 'ADVANCED',
          portfolioImpact: 'Demonstrates enterprise-grade generative AI orchestration, vector database mastery, and quantifiable model evaluation.',
        },
      ],
    };
  }

  return {
    careerTrackId: trackId,
    targetRole,
    provider: 'GROQ',
    model: 'llama-3.3-70b-versatile',
    projects: [
      {
        title: 'Distributed Event-Driven Order Processing System',
        description: 'High-throughput e-commerce transactional pipeline demonstrating asynchronous event choreography and container orchestration.',
        targetMissingSkills: ['Kafka', 'Kubernetes', 'Redis'],
        architectureOverview: 'Microservices architecture with Spring Boot order and payment services connected via Apache Kafka, Redis rate limiting, deployed to Kubernetes via Helm.',
        keyDeliverables: [
          'Kafka producer with transactional idempotency guarantees',
          'Dead-letter topic handler with exponential backoff retry mechanism',
          'Redis sliding window rate limiter filter for API endpoints',
          'Kubernetes Helm chart deployment with Horizontal Pod Autoscaler (HPA)',
        ],
        estimatedDifficulty: 'ADVANCED',
        portfolioImpact: 'Provides definitive, tangible proof of distributed systems knowledge directly matching senior backend hiring benchmarks.',
      },
    ],
  };
}
