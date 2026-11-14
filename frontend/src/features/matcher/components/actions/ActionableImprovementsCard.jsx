import { Link } from 'react-router-dom';
import {
  FileSearch,
  FolderGit2,
  UserCheck,
  FileSignature,
  Bookmark,
  GraduationCap,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useJobMatcher } from '@/hooks/useJobMatcher';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';

export function ActionableImprovementsCard() {
  const { saveCurrentAnalysis } = useJobMatcher();

  const handleCreateTailoredResume = () => {
    toast.info(
      'Tailored Resume Studio generation will be enabled in upcoming Milestone 10. Use Resume Analyzer to tune existing documents.'
    );
  };

  const actions = [
    {
      id: 'act-analyzer',
      title: 'Tune Resume in Analyzer',
      description: 'Audit passive phrasing, bullet point impact, and single-column formatting.',
      icon: FileSearch,
      color: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
      link: '/resume-analyzer',
      isExternal: false,
    },
    {
      id: 'act-project-evidence',
      title: 'Add Supporting Project Evidence',
      description: 'Link repositories, architectures, and deliverables in your Master Profile.',
      icon: FolderGit2,
      color: 'text-primary bg-primary/10 border-primary/20',
      link: '/profile',
      isExternal: false,
    },
    {
      id: 'act-skills',
      title: 'Review Verified Skills',
      description: 'Update proficiency levels and category groupings in your skills matrix.',
      icon: UserCheck,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      link: '/profile',
      isExternal: false,
    },
    {
      id: 'act-tailor',
      title: 'Create Tailored Resume',
      description: 'Compile a role-specific resume without fabricated qualifications.',
      icon: FileSignature,
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      onClick: handleCreateTailoredResume,
      badge: 'Coming in M10',
    },
    {
      id: 'act-save',
      title: 'Save Opportunity & Analysis',
      description: 'Bookmark this role to your career pipeline and saved matches stream.',
      icon: Bookmark,
      color: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
      onClick: saveCurrentAnalysis,
    },
    {
      id: 'act-interview',
      title: 'Prepare for Interview',
      description: 'Practice role-specific STAR behavioral queries for this position.',
      icon: GraduationCap,
      color: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
      link: '/interviews',
      isExternal: false,
      badge: 'Prep Suite',
    },
  ];

  return (
    <Card className="border-border/80 bg-card/75 backdrop-blur-sm">
      <CardContent className="p-5 sm:p-6 space-y-4">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Actionable Next Steps &amp; Application Prep</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Execute high-impact enhancements to elevate your alignment before submitting your application.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {actions.map((act) => {
            const Icon = act.icon;

            const cardContent = (
              <div className="h-full rounded-xl border border-border/70 bg-card p-4 flex flex-col justify-between space-y-3 transition-all hover:border-primary/50 hover:shadow-glow-xs cursor-pointer">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-xl border ${act.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {act.badge && (
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {act.badge}
                      </Badge>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-foreground">{act.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {act.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-primary font-semibold">
                  <span>Take Action</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            );

            if (act.link) {
              return (
                <Link key={act.id} to={act.link}>
                  {cardContent}
                </Link>
              );
            }

            return (
              <div key={act.id} onClick={act.onClick}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
