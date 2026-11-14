import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Server,
  Layers,
  BrainCircuit,
  Database,
  GraduationCap,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const tracks = [
  {
    id: 'backend',
    name: 'Backend Developer',
    icon: Server,
    headline: 'High-Throughput Systems & Cloud APIs',
    targetSummary:
      'Focuses on distributed microservices, scalable database architectures, transaction integrity, and API performance.',
    skills: ['Java 21 LTS', 'Spring Boot 3', 'PostgreSQL', 'Docker', 'Redis', 'REST & gRPC'],
    tailoredHighlights: [
      'Tailors resumes toward throughput, low latency, and system resilience.',
      'Emphasizes database indexing, Flyway schema migrations, and clean architecture.',
      'Filters discovery for Senior Backend, Systems Engineer, and Platform roles.',
    ],
    sampleScore: '95% Match for Platform Roles',
  },
  {
    id: 'fullstack',
    name: 'Full Stack Developer',
    icon: Layers,
    headline: 'End-to-End Product Engineering',
    targetSummary:
      'Balances responsive, modern user interfaces with robust API backend services and clean data flows.',
    skills: ['React 18', 'Tailwind CSS', 'TypeScript', 'Node.js', 'REST APIs', 'PostgreSQL'],
    tailoredHighlights: [
      'Emphasizes end-to-end product delivery, UI polish, and state management.',
      'Tailors resumes to highlight commercial SaaS finish and full-lifecycle ownership.',
      'Filters discovery for Product Engineer and Full-Stack Specialist openings.',
    ],
    sampleScore: '96% Match for Product Roles',
  },
  {
    id: 'aiml',
    name: 'AI / ML Engineer',
    icon: BrainCircuit,
    headline: 'LLM Orchestration & Intelligent Services',
    targetSummary:
      'Specializes in structured AI completions, retrieval-augmented generation (RAG), vector embeddings, and inference pipelines.',
    skills: ['Python 3.11', 'FastAPI', 'Pydantic v2', 'pgvector', 'Groq / Gemini APIs', 'PyTorch'],
    tailoredHighlights: [
      'Showcases semantic search algorithms, embedding pipelines, and prompt engineering.',
      'Highlights deterministic structured JSON outputs and latency mitigation.',
      'Filters discovery for Applied AI, ML Infrastructure, and GenAI Engineer roles.',
    ],
    sampleScore: '93% Match for AI Services',
  },
  {
    id: 'data',
    name: 'Data Analyst',
    icon: Database,
    headline: 'Data Modeling & Quantitative Strategy',
    targetSummary:
      'Translates operational data into actionable business intelligence through complex SQL, analytics pipelines, and metrics.',
    skills: ['Advanced SQL', 'Python (Pandas)', 'PostgreSQL', 'Data Warehousing', 'Tableau', 'Statistics'],
    tailoredHighlights: [
      'Tailors resumes toward metric lift, attribution modeling, and pipeline efficiency.',
      'Highlights dimensional modeling, query tuning, and cross-functional reporting.',
      'Filters discovery for Analytics Engineer and Business Intelligence roles.',
    ],
    sampleScore: '90% Match for Analytics Roles',
  },
  {
    id: 'intern',
    name: 'Research / Engineering Intern',
    icon: GraduationCap,
    headline: 'Early-Career & Academic Transition',
    targetSummary:
      'Transforms coursework, capstone projects, algorithms, and university hackathons into commercial-grade resume impact.',
    skills: ['Data Structures & Algorithms', 'Object-Oriented Design', 'Git', 'Java / Python', 'Team Collaboration'],
    tailoredHighlights: [
      'Translates theoretical coursework and capstones into commercial impact statements.',
      'ATS optimization for competitive campus recruitment and fresher entry gates.',
      'Filters discovery for Software Engineering Internships and Graduate Trainee roles.',
    ],
    sampleScore: '94% Match for Intern Programs',
  },
];

export function CareerTracks() {
  const [activeTrack, setActiveTrack] = useState(tracks[0]);

  return (
    <section id="career-tracks" className="py-20 md:py-28 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="ai" className="mb-3">
            Multi-Track Personas
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            One Master Profile.{' '}
            <span className="gradient-text-primary">Multiple Career Tracks.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Never duplicate your work history. Create distinct career tracks under one master
            account to generate targeted resumes and discover opportunities for every facet of your
            professional skill set.
          </p>
        </div>

        {/* Track Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {tracks.map((track) => {
            const Icon = track.icon;
            const isSelected = activeTrack.id === track.id;
            return (
              <button
                key={track.id}
                onClick={() => setActiveTrack(track)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-medium transition-all duration-200 border ${
                  isSelected
                    ? 'border-primary bg-primary/10 text-primary shadow-sm font-semibold'
                    : 'border-border/60 bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                <span>{track.name}</span>
              </button>
            );
          })}
        </div>

        {/* Active Track Deep Dive Display */}
        <motion.div
          key={activeTrack.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          className="mx-auto max-w-4xl"
        >
          <Card className="border-border/80 bg-gradient-to-b from-card via-card/80 to-card/50 shadow-xl backdrop-blur-md overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Header inside card */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/50 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary border border-primary/30">
                    <activeTrack.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{activeTrack.name} Track</h3>
                    <p className="text-xs sm:text-sm text-primary font-medium">
                      {activeTrack.headline}
                    </p>
                  </div>
                </div>
                <Badge variant="success" dot className="self-start sm:self-auto text-xs py-1 px-3">
                  {activeTrack.sampleScore}
                </Badge>
              </div>

              {/* Summary */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeTrack.targetSummary}
              </p>

              {/* Skills highlighted */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
                  Prioritized Core Skills In This Track:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeTrack.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-border/70 bg-secondary px-3 py-1 text-xs font-medium text-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Tailoring details */}
              <div className="space-y-2.5 rounded-xl border border-border/60 bg-muted/30 p-4">
                <span className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>How JobAchiever Tailors For This Track:</span>
                </span>
                <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
                  {activeTrack.tailoredHighlights.map((hl, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{hl}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
