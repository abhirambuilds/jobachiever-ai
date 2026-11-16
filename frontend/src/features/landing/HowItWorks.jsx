import { motion } from 'framer-motion';
import { UserCheck, Compass, Sparkles, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const steps = [
  {
    step: '01',
    title: 'Build Your Profile',
    headline: 'Create your central professional profile',
    description:
      'Upload your existing resume in PDF or DOCX format. Our parser extracts your skills, projects, and work history. You inspect and confirm every claim with human-in-the-loop control.',
    icon: UserCheck,
    tag: 'Master Graph',
  },
  {
    step: '02',
    title: 'Discover Opportunities',
    headline: 'Find relevant jobs and career opportunities',
    description:
      'Search aggregated job openings directly matched to your defined career tracks. Filter by seniority, required tech stack, work arrangement, and domain relevance.',
    icon: Compass,
    tag: 'Track Matching',
  },
  {
    step: '03',
    title: 'Prepare With AI',
    headline: 'Analyze job descriptions & generate tailored applications',
    description:
      'Deconstruct job descriptions down to core skills. Calculate your explainable compatibility score (0-100%) and generate targeted ATS resumes with real-time prompt editing grounded strictly in truth.',
    icon: Sparkles,
    tag: 'Zero Fabrication',
  },
  {
    step: '04',
    title: 'Track Your Progress',
    headline: 'Organize applications & leverage AI advisory',
    description:
      'Track every application stage on an interactive Kanban board. Use the AI Career Copilot for continuous advice, strategic roadmap planning, and salary insights.',
    icon: Trophy,
    tag: 'Offer Readiness',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-muted/20 border-y border-border/50 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="ai" className="mb-3">
            Workflow Process
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            A Structured Journey.{' '}
            <span className="gradient-text-primary">From Profile to Offer.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            Follow a proven, data-driven methodology that eliminates application chaos and puts you
            in full control of your career progression.
          </p>
        </div>

        {/* 4-Step Connected Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="relative flex flex-col"
              >
                <Card className="h-full border-border/70 bg-card hover:border-primary/40 transition-all duration-200 flex flex-col justify-between">
                  <CardContent className="p-6 space-y-4">
                    {/* Top Step Pill & Number */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-2xl font-black text-primary/80">
                        {item.step}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {item.tag}
                      </Badge>
                    </div>

                    {/* Step Icon */}
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Titles */}
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                        Step {item.step}
                      </span>
                      <h3 className="text-base font-bold text-foreground">
                        {item.title}
                      </h3>
                      <p className="text-xs font-medium text-muted-foreground">
                        {item.headline}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-muted-foreground/90 leading-relaxed pt-2 border-t border-border/40">
                      {item.description}
                    </p>
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
