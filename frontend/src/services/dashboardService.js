/**
 * Dashboard Data Service Interface for JobAchiever AI.
 *
 * Defines the contract with the primary Spring Boot 3.x backend under /api/v1/dashboard.
 * Provides structured development data for recent activities, opportunity previews,
 * and AI insights. Clearly marked as development simulation.
 */

export const DASHBOARD_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const dashboardService = {
  /**
   * Fetches illustrative recent activity stream.
   * Target endpoint: GET /api/v1/dashboard/recent-activity
   */
  async getRecentActivity() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [
      {
        id: 'act-1',
        type: 'resume_analyzed',
        title: 'Master Resume Analyzed',
        description: 'ATS structural score calculated at 94%. Zero formatting flaws detected.',
        timestamp: '2 hours ago',
        icon: 'FileSearch',
        badge: 'Score: 94%',
        badgeVariant: 'success',
      },
      {
        id: 'act-2',
        type: 'profile_updated',
        title: 'Master Profile Updated',
        description: 'Added 2 new skills in Databases category: PostgreSQL & pgvector.',
        timestamp: '5 hours ago',
        icon: 'UserCheck',
        badge: 'Verified',
        badgeVariant: 'outline',
      },
      {
        id: 'act-3',
        type: 'job_saved',
        title: 'Opportunity Bookmarked',
        description: 'Saved "Senior Cloud Systems Architect" at Stripe (San Francisco, CA).',
        timestamp: '1 day ago',
        icon: 'Bookmark',
        badge: 'Wishlisted',
        badgeVariant: 'secondary',
      },
      {
        id: 'act-4',
        type: 'cover_letter_generated',
        title: 'Tailored Cover Letter Drafted',
        description: 'Drafted role-specific letter aligned with Backend Developer track.',
        timestamp: '2 days ago',
        icon: 'FileText',
        badge: 'Draft Ready',
        badgeVariant: 'ai',
      },
      {
        id: 'act-5',
        type: 'application_moved',
        title: 'Application Stage Advanced',
        description: 'Cloud Infrastructure Engineer role moved to "Technical Screen".',
        timestamp: '3 days ago',
        icon: 'TrendingUp',
        badge: 'Interview',
        badgeVariant: 'primary',
      },
    ];
  },

  /**
   * Fetches sample job opportunities matched against active career tracks.
   * Target endpoint: GET /api/v1/dashboard/recommended-jobs
   */
  async getRecommendedJobs() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [
      {
        id: 'job-1',
        title: 'Senior Backend Engineer – Core Platform',
        company: 'Stripe',
        location: 'San Francisco, CA',
        workMode: 'Hybrid',
        employmentType: 'Full-time',
        salaryRange: '$170k - $215k',
        matchScore: 95,
        requiredSkills: ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Distributed Systems'],
        matchedSkillsCount: 4,
        totalSkillsCount: 4,
        postedAgo: '1d ago',
      },
      {
        id: 'job-2',
        title: 'Full-Stack Product Engineer',
        company: 'Vercel',
        location: 'Remote (US)',
        workMode: 'Remote',
        employmentType: 'Full-time',
        salaryRange: '$160k - $195k',
        matchScore: 92,
        requiredSkills: ['React 18', 'TypeScript', 'Tailwind CSS', 'Node.js', 'REST APIs'],
        matchedSkillsCount: 4,
        totalSkillsCount: 5,
        postedAgo: '3d ago',
      },
      {
        id: 'job-3',
        title: 'AI Infrastructure & Vector Search Engineer',
        company: 'Databricks',
        location: 'Mountain View, CA',
        workMode: 'Hybrid',
        employmentType: 'Full-time',
        salaryRange: '$180k - $230k',
        matchScore: 89,
        requiredSkills: ['Python 3.11', 'FastAPI', 'pgvector', 'Docker', 'Distributed Cache'],
        matchedSkillsCount: 4,
        totalSkillsCount: 5,
        postedAgo: '5d ago',
      },
    ];
  },

  /**
   * Fetches strategic AI career recommendations.
   * Target endpoint: GET /api/v1/dashboard/ai-insights
   */
  async getAiInsights() {
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [
      {
        id: 'ins-1',
        category: 'Skill Evidence',
        title: 'Strengthen PostgreSQL pgvector Evidence',
        description:
          'Your Master Profile lists pgvector as Advanced. Linking it to your VectorDB Query Engine project will boost your Explainable AI match scores by +8%.',
        actionLabel: 'Link Project to Skill',
        actionRoute: '/profile',
        badge: 'High Impact',
        badgeVariant: 'warning',
      },
      {
        id: 'ins-2',
        category: 'Keyword Optimization',
        title: 'High-Demand Keyword Opportunity: "System Resilience"',
        description:
          'Top Backend track listings frequently emphasize fault tolerance and circuit breaking. Consider highlighting your Spring Boot resilience experience.',
        actionLabel: 'Update Track Objectives',
        actionRoute: '/profile',
        badge: 'Keyword Fit',
        badgeVariant: 'ai',
      },
      {
        id: 'ins-3',
        category: 'Interview Preparation',
        title: 'Practice STAR Behavioral Responses for System Outages',
        description:
          'Your active interviews are approaching technical and architecture screening stages. Practice 3 common incident response scenarios.',
        actionLabel: 'Start Mock Rehearsal',
        actionRoute: '/interviews',
        badge: 'Interview Prep',
        badgeVariant: 'default',
      },
    ];
  },
};
