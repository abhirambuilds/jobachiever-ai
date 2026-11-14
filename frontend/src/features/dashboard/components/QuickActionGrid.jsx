import { Link } from 'react-router-dom';
import {
  FileSearch,
  FileSignature,
  Compass,
  Target,
  UserCheck,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const actions = [
  {
    id: 'analyze-resume',
    title: 'Analyze Resume',
    description: 'Diagnose ATS formatting, missing metrics, and keyword density.',
    icon: FileSearch,
    color: 'from-blue-500/20 to-cyan-500/10 text-cyan-400 border-cyan-500/30',
    link: '/resume-analyzer',
    badge: 'AI Diagnostic',
  },
  {
    id: 'tailor-resume',
    title: 'Create Tailored Resume',
    description: 'Generate targeted, ATS-optimized resumes customized to specific JDs.',
    icon: FileSignature,
    color: 'from-primary/20 to-indigo-500/10 text-primary border-primary/30',
    link: '/resumes',
    badge: 'Zero Fabrication',
  },
  {
    id: 'match-jd',
    title: 'Match Job Description',
    description: 'Decompose role requirements with explainable compatibility scoring.',
    icon: Target,
    color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
    link: '/job-match',
    badge: 'Explainable AI',
  },
  {
    id: 'find-jobs',
    title: 'Discover Opportunities',
    description: 'Explore live openings aligned with your primary career tracks.',
    icon: Compass,
    color: 'from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30',
    link: '/jobs',
    badge: 'Smart Discovery',
  },
  {
    id: 'update-profile',
    title: 'Update Master Profile',
    description: 'Review verified credentials, work history, and portfolio links.',
    icon: UserCheck,
    color: 'from-purple-500/20 to-pink-500/10 text-purple-400 border-purple-500/30',
    link: '/profile',
    badge: 'Source of Truth',
  },
  {
    id: 'mock-interview',
    title: 'Practice Interviews',
    description: 'Rehearse STAR behavioral questions and deep-dive technical queries.',
    icon: GraduationCap,
    color: 'from-rose-500/20 to-red-500/10 text-rose-400 border-rose-500/30',
    link: '/interviews',
    badge: 'Interactive Mock',
  },
];

export function QuickActionGrid() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold tracking-tight text-foreground">
            Quick Career Actions
          </h3>
          <p className="text-xs text-muted-foreground">
            Execute key workflows directly from your career command center.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link key={act.id} to={act.link} className="group block focus:outline-none">
              <Card className="h-full border-border/80 bg-card/75 backdrop-blur-sm transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-glow-xs group-focus-visible:ring-2 group-focus-visible:ring-primary">
                <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${act.color} border shadow-xs transition-transform group-hover:scale-105`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-medium">
                        {act.badge}
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                        <span>{act.title}</span>
                      </h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {act.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 mt-3 border-t border-border/40 flex items-center justify-between text-xs font-medium text-muted-foreground group-hover:text-primary transition-colors">
                    <span>Launch Action</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
