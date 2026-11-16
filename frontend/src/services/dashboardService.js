/**
 * Dashboard Data Service Interface for JobAchiever AI.
 *
 * Defines the contract with the primary Spring Boot 3.x backend under /api/v1/dashboard.
 * Provides structured development data for recent activities, opportunity previews,
 * and AI insights. Clearly marked as development simulation.
 */

import { isDemoMode } from '@/demo/demoConfig';
import { demoService } from '@/demo/demoService';

export const DASHBOARD_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

export const dashboardService = {
  /**
   * Fetches illustrative recent activity stream.
   * Target endpoint: GET /api/v1/dashboard/recent-activity
   */
  async getRecentActivity() {
    if (isDemoMode()) {
      return demoService.getDashboardActivities();
    }
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
        description: 'Saved "Senior Platform Engineer" at Razorpay (Bengaluru, KA).',
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
    if (isDemoMode()) {
      const demoJobs = await demoService.getJobs();
      return demoJobs.map((j) => ({
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        workMode: j.workMode,
        employmentType: j.employmentType,
        salaryRange: j.salaryRange,
        matchScore: j.matchScore,
        requiredSkills: j.requiredSkills,
        matchedSkillsCount: j.matchedSkillsCount,
        totalSkillsCount: j.totalSkillsCount,
        postedAgo: j.postedAgo,
      }));
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [
      {
        id: 'job-1',
        title: 'Senior Backend Engineer – Core Payments Platform',
        company: 'Razorpay',
        location: 'Bengaluru, Karnataka',
        workMode: 'Hybrid',
        employmentType: 'Full-time',
        salaryRange: '₹35L - ₹48L',
        matchScore: 96,
        requiredSkills: ['Java 21', 'Spring Boot 3', 'PostgreSQL', 'Apache Kafka'],
        matchedSkillsCount: 4,
        totalSkillsCount: 4,
        postedAgo: '1d ago',
      },
      {
        id: 'job-2',
        title: 'Senior Platform Engineer – High-Scale Systems',
        company: 'Swiggy',
        location: 'Bengaluru, Karnataka',
        workMode: 'Hybrid',
        employmentType: 'Full-time',
        salaryRange: '₹32L - ₹45L',
        matchScore: 92,
        requiredSkills: ['Java 21', 'Distributed Systems', 'Redis', 'PostgreSQL', 'REST APIs'],
        matchedSkillsCount: 4,
        totalSkillsCount: 5,
        postedAgo: '2d ago',
      },
      {
        id: 'job-3',
        title: 'Staff Distributed Systems Engineer',
        company: 'Flipkart',
        location: 'Bengaluru, Karnataka',
        workMode: 'On-site',
        employmentType: 'Full-time',
        salaryRange: '₹38L - ₹52L',
        matchScore: 90,
        requiredSkills: ['Java 21', 'Spring Boot 3', 'Kafka', 'System Design', 'Microservices'],
        matchedSkillsCount: 4,
        totalSkillsCount: 5,
        postedAgo: '4d ago',
      },
    ];
  },

  /**
   * Fetches strategic AI career recommendations.
   * Target endpoint: GET /api/v1/dashboard/ai-insights
   */
  async getAiInsights() {
    if (isDemoMode()) {
      return [
        {
          id: 'demo-ins-3',
          category: 'Active Interview Prep',
          title: 'Technical Screen Scheduled: Stripe Core Platform',
          description: 'Practice STAR behavioral and Java 21 concurrency questions before your interview on Thursday.',
          actionLabel: 'Inspect Match Insights',
          actionRoute: '/job-match',
          badge: '91% Match',
          badgeVariant: 'success',
        },
        {
          id: 'demo-ins-1',
          category: 'Skill Gap Strategy',
          title: 'Critical Gap for Stripe Backend Engineer: Kubernetes',
          description: 'Address container orchestration to maximize tier-1 backend hiring compatibility. Follow your active Minikube learning roadmap.',
          actionLabel: 'View Skill Gap Strategy',
          actionRoute: '/career-assistant',
          badge: '2 Gaps',
          badgeVariant: 'warning',
        },
        {
          id: 'demo-ins-2',
          category: 'Learning Roadmap',
          title: 'Target Roadmap Progress: 45% Complete',
          description: '2 of 4 milestones completed. Next: Kafka Consumer Lag Telemetry & Rebalance Handling.',
          actionLabel: 'Open Learning Roadmap',
          actionRoute: '/career-assistant',
          badge: '45% Complete',
          badgeVariant: 'ai',
        },
      ];
    }
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
