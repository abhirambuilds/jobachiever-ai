import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Layers,
  FileCheck2,
  Kanban,
  Bookmark,
  ArrowUpRight,
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CareerOverviewCards() {
  const { profile, calculateCompleteness } = useProfile();
  const { percentage } = calculateCompleteness();

  const activeTracksCount = profile.careerTracks?.length || 1;
  const primaryTrack =
    profile.careerTracks?.find((t) => t.isPrimary) || profile.careerTracks?.[0];

  const cards = [
    {
      id: 'profile-completeness',
      title: 'Profile Completeness',
      value: `${percentage}%`,
      subtitle: 'Verified credentials & experience',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      badge: percentage >= 85 ? 'Strong' : 'In Progress',
      badgeVariant: percentage >= 85 ? 'success' : 'warning',
      link: '/profile',
      linkText: 'Inspect Profile',
    },
    {
      id: 'career-tracks',
      title: 'Active Career Tracks',
      value: `${activeTracksCount}`,
      subtitle: primaryTrack ? primaryTrack.name : 'Target Personas',
      icon: Layers,
      iconColor: 'text-primary',
      badge: 'Primary Active',
      badgeVariant: 'secondary',
      link: '/profile',
      linkText: 'Manage Tracks',
    },
    {
      id: 'resume-health',
      title: 'ATS Resume Score',
      value: '94%',
      subtitle: '2 Tailored versions ready',
      icon: FileCheck2,
      iconColor: 'text-cyan-400',
      badge: 'High Impact',
      badgeVariant: 'ai',
      link: '/resume-analyzer',
      linkText: 'View Analysis',
    },
    {
      id: 'applications-active',
      title: 'Active Applications',
      value: '5',
      subtitle: '2 in Technical Screen',
      icon: Kanban,
      iconColor: 'text-amber-500',
      badge: 'In Pipeline',
      badgeVariant: 'outline',
      link: '/applications',
      linkText: 'Open Kanban',
    },
    {
      id: 'saved-opportunities',
      title: 'Saved Opportunities',
      value: '8',
      subtitle: '3 high semantic matches',
      icon: Bookmark,
      iconColor: 'text-indigo-400',
      badge: 'Wishlisted',
      badgeVariant: 'outline',
      link: '/jobs',
      linkText: 'Explore Jobs',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.id}
            className="group relative overflow-hidden border-border/80 bg-card/75 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs flex flex-col justify-between"
          >
            <CardContent className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 border border-border/60 group-hover:border-primary/30 transition-colors">
                    <Icon className={`h-4 w-4 ${card.iconColor}`} />
                  </div>
                  <Badge variant={card.badgeVariant} className="text-[10px] px-1.5 py-0">
                    {card.badge}
                  </Badge>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground block truncate">
                    {card.title}
                  </span>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {card.value}
                  </div>
                  <p className="text-[11px] text-muted-foreground/90 truncate">
                    {card.subtitle}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-border/40 flex items-center justify-between">
                <Link
                  to={card.link}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary hover:underline"
                >
                  <span>{card.linkText}</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
