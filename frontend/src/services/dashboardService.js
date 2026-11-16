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
    const rawUser = typeof localStorage !== 'undefined' ? localStorage.getItem('jobachiever_user') : null;
    const user = rawUser ? JSON.parse(rawUser) : null;
    const isAarav = user?.email?.toLowerCase().includes('aarav') || isDemoMode();

    if (isAarav) {
      return demoService.getDashboardActivities();
    }

    await new Promise((resolve) => setTimeout(resolve, 150));
    return [
      {
        id: 'act-new-1',
        type: 'profile_updated',
        title: 'Master Account Initialized',
        description: 'Master Career Profile workspace created and synchronized with PostgreSQL database.',
        timestamp: 'Just now',
        icon: 'UserCheck',
        badge: 'Active',
        badgeVariant: 'outline',
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
          category: 'AI Career Advisory',
          title: 'Technical Screen Scheduled: Stripe Core Platform',
          description: 'Ask AI Copilot for deep-dive questions and Java 21 concurrency review before your interview.',
          actionLabel: 'Open AI Copilot',
          actionRoute: '/copilot',
          badge: 'Copilot Ready',
          badgeVariant: 'ai',
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
        category: 'AI Career Advisory',
        title: 'Engage AI Copilot for Technical & Behavioral Preparation',
        description:
          'Get real-time answers, STAR method frameworks, and salary negotiation insights powered by Groq LPUs.',
        actionLabel: 'Launch Copilot',
        actionRoute: '/copilot',
        badge: 'Copilot Active',
        badgeVariant: 'ai',
      },
    ];
  },
};
