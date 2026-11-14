import { motion } from 'framer-motion';
import {
  FileSearch,
  Sparkles,
  Target,
  UserCheck,
  Compass,
  Kanban,
  FileSignature,
  Globe2,
  GraduationCap,
  Bot,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const features = [
  {
    icon: FileSearch,
    title: 'Resume Intelligence',
    category: 'Ingestion & Diagnostics',
    description:
      'Ingests PDF and DOCX files with structural extraction. Evaluates formatting bugs, weak phrasing, missing impact metrics, and keyword coverage.',
    badge: 'Multi-Format Parser',
    accentColor: 'text-primary',
  },
  {
    icon: Sparkles,
    title: 'AI Resume Builder',
    category: 'Generation',
    description:
      'Generates targeted, ATS-friendly resumes customized to specific job descriptions without manual rework, strictly grounded in verified experience.',
    badge: 'ATS-Optimized',
    accentColor: 'text-cyan-400',
  },
  {
    icon: Target,
    title: 'Smart Job Matching',
    category: 'Compatibility Engine',
    description:
      'Transparent, granular match scores breaking down skills alignment, experience relevance, seniority fit, and actionable gap analysis.',
    badge: 'Explainable AI',
    accentColor: 'text-emerald-500',
  },
  {
    icon: UserCheck,
    title: 'Master Career Profile',
    category: 'Source of Truth',
    description:
      'Central career repository capturing verified skills, experiences, projects, education, certifications, and achievements with human verification.',
    badge: 'Single Source',
    accentColor: 'text-indigo-400',
  },
  {
    icon: Compass,
    title: 'Job Discovery',
    category: 'Aggregation',
    description:
      'Centralized discovery and tracking of relevant job openings matched specifically to your active career tracks and seniority level.',
    badge: 'Track Aligned',
    accentColor: 'text-amber-500',
  },
  {
    icon: Kanban,
    title: 'Application Tracker',
    category: 'Pipeline Management',
    description:
      'Full lifecycle tracking across an interactive Kanban board: wishlisted, applied, technical interviews, offers, and decisions.',
    badge: 'Visual Pipeline',
    accentColor: 'text-blue-400',
  },
  {
    icon: FileSignature,
    title: 'Cover Letter Studio',
    category: 'Tailored Outreach',
    description:
      'Context-aware, personalized cover letters highlighting role-relevant user achievements and answering specific job requirements.',
    badge: 'Grounded Outreach',
    accentColor: 'text-teal-400',
  },
  {
    icon: Globe2,
    title: 'Portfolio Builder',
    category: 'Personal Web Presence',
    description:
      'Generates clean, shareable web portfolio profiles showcasing verified credentials, case studies, open-source projects, and career milestones.',
    badge: 'Shareable Link',
    accentColor: 'text-violet-400',
  },
  {
    icon: GraduationCap,
    title: 'Interview Preparation',
    category: 'Readiness & Mock Rounds',
    description:
      'AI-driven mock interviews, behavioral coaching using the STAR method, technical deep-dives, and role-specific question banks.',
    badge: 'STAR Methodology',
    accentColor: 'text-rose-400',
  },
  {
    icon: Bot,
    title: 'AI Career Assistant',
    category: 'Strategic Advisory',
    description:
      'Personalized career roadmaps, skill acquisition suggestions, market alignment analysis, and continuous guidance throughout your journey.',
    badge: 'Continuous Advisory',
    accentColor: 'text-cyan-300',
  },
];

export function FeatureShowcase() {
  return (
    <section id="features" className="py-20 md:py-28 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="ai" className="mb-3">
            Core Capabilities
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Ten Powerful Tools.{' '}
            <span className="gradient-text-primary">One Unified Platform.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Every feature in JobAchiever AI performs real computation and data persistence,
            engineered to replace fragmented career tools with an integrated operating system.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card className="h-full border-border/70 bg-card hover:border-primary/50 hover:shadow-glow-sm transition-all duration-200 group flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/60 text-foreground ring-1 ring-border/80 group-hover:scale-105 transition-transform duration-200">
                        <Icon className={`h-5 w-5 ${feature.accentColor}`} />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {feature.badge}
                      </Badge>
                    </div>
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      {feature.category}
                    </span>
                    <CardTitle className="text-lg font-bold text-foreground mt-0.5 group-hover:text-primary transition-colors">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
