import { motion } from 'framer-motion';
import {
  FileStack,
  Compass,
  Clock,
  Target,
  Kanban,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const problemSolutionPairs = [
  {
    problemIcon: FileStack,
    problemTitle: 'Scattered Resumes & Lost Documents',
    problemDesc:
      'Candidates juggle multiple loose PDF and DOCX files across local folders without a single definitive record of their achievements.',
    solutionTitle: 'Master Career Profile Graph',
    solutionDesc:
      'One authoritative repository storing all your verified skills, experiences, projects, and milestones with granular ownership.',
  },
  {
    problemIcon: Target,
    problemTitle: 'Manual, Exhausting Resume Tailoring',
    problemDesc:
      'Spending hours reformatting and editing bullet points for each job application leads to fatigue, formatting bugs, and missed deadlines.',
    solutionTitle: 'Targeted Resume Generation',
    solutionDesc:
      'Generate customized, ATS-compliant resumes tailored to job descriptions in seconds—grounded strictly in your confirmed credentials.',
  },
  {
    problemIcon: Compass,
    problemTitle: 'Opaque Applicant Tracking (Black Boxes)',
    problemDesc:
      'Applying into ATS black boxes with zero visibility into why applications are rejected or which skills were deemed missing.',
    solutionTitle: 'Explainable Compatibility Scoring',
    solutionDesc:
      'Receive a transparent 0–100% score breaking down skills alignment, experience relevance, seniority fit, and actionable gap advice.',
  },
  {
    problemIcon: Clock,
    problemTitle: 'Rigid Single-Role Limitations',
    problemDesc:
      'Professionals with diverse talents struggle to position themselves across distinct tracks (e.g., Full-Stack vs. Solutions Architect).',
    solutionTitle: 'Multi-Track Career Personas',
    solutionDesc:
      'Maintain multiple distinct career tracks under one account without re-entering your master career information.',
  },
  {
    problemIcon: Kanban,
    problemTitle: 'Chaotic Spreadsheets & Missed Rounds',
    problemDesc:
      'Tracking dozens of active submissions via ad-hoc spreadsheets results in missed follow-ups, lost notes, and chaotic prep.',
    solutionTitle: 'Integrated Kanban Pipeline',
    solutionDesc:
      'Manage your entire lifecycle from discovery to wishlist, active interviews, mock evaluations, and final compensation decisions.',
  },
  {
    problemIcon: Sparkles,
    problemTitle: 'Hallucinating AI & Fabricated Claims',
    problemDesc:
      'Generic AI chatbots invent qualifications or degrees, risking candidate disqualification, ethical concerns, and interview failure.',
    solutionTitle: 'Zero-Fabrication Policy',
    solutionDesc:
      'Strict truthfulness guardrails. If a job requires a skill you lack, the platform highlights the gap honestly instead of inventing claims.',
  },
];

export function ValueSection() {
  return (
    <section id="value" className="relative py-20 md:py-28 bg-muted/20 border-y border-border/50">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="ai" className="mb-3">
            Platform Value
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            Everything Your Career Needs.{' '}
            <span className="gradient-text-primary">Finally Connected.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            The conventional job search is fragmented across disjointed tools, opaque algorithms,
            and ungrounded shortcuts. JobAchiever AI unifies your entire career workflow under one
            intelligent, reliable operating system.
          </p>
        </div>

        {/* Problem vs Solution Grid */}
        <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {problemSolutionPairs.map((item, index) => {
            const Icon = item.problemIcon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <Card className="h-full border-border/70 bg-card hover:border-primary/40 hover:shadow-glow-sm transition-all duration-200">
                  <CardContent className="p-6 space-y-4">
                    {/* Problem Section */}
                    <div className="space-y-1.5 border-b border-border/50 pb-4">
                      <div className="flex items-center gap-2 text-destructive">
                        <XCircle className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          The Challenge
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span>{item.problemTitle}</span>
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {item.problemDesc}
                      </p>
                    </div>

                    {/* Solution Section */}
                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-center gap-2 text-emerald-500">
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                        <span className="text-xs font-semibold uppercase tracking-wider">
                          JobAchiever Solution
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">
                        {item.solutionTitle}
                      </h4>
                      <p className="text-xs text-muted-foreground/90 leading-relaxed">
                        {item.solutionDesc}
                      </p>
                    </div>
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
