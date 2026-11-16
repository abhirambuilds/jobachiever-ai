import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
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
import { AnimatedCounter } from '@/components/common/AnimatedCounter';

import { isDemoMode } from '@/demo/demoConfig';

export function CareerOverviewCards() {
  const { profile, calculateCompleteness } = useProfile();
  const { percentage } = calculateCompleteness();

  const isAarav = profile.personalInfo?.email?.toLowerCase().includes('aarav') || isDemoMode();
  const activeTracksCount = profile.careerTracks?.length || (isAarav ? 3 : 0);
  const primaryTrack =
    profile.careerTracks?.find((t) => t.isPrimary) || profile.careerTracks?.[0];

  const cards = [
    {
      id: 'profile-completeness',
      title: 'Profile Completeness',
      numValue: percentage,
      suffix: '%',
      subtitle: percentage >= 85 ? 'Verified credentials & experience' : 'Complete profile to boost match',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      badge: percentage >= 85 ? 'Strong' : (percentage > 0 ? 'In Progress' : 'Initial'),
      badgeVariant: percentage >= 85 ? 'success' : 'warning',
      link: '/profile',
      linkText: 'Inspect Profile',
    },
    {
      id: 'career-tracks',
      title: 'Active Career Tracks',
      numValue: activeTracksCount,
      suffix: '',
      subtitle: primaryTrack ? primaryTrack.name : 'Define your target role',
      icon: Layers,
      iconColor: 'text-primary',
      badge: activeTracksCount > 0 ? 'Primary Active' : 'Setup Needed',
      badgeVariant: activeTracksCount > 0 ? 'secondary' : 'outline',
      link: '/career-tracks',
      linkText: activeTracksCount > 0 ? 'Manage Tracks' : 'Add First Track',
    },
    {
      id: 'resume-health',
      title: 'ATS Resume Score',
      numValue: isAarav ? 94 : 0,
      suffix: '%',
      subtitle: isAarav ? '3 Tailored versions ready' : 'Upload resume to calculate',
      icon: FileCheck2,
      iconColor: 'text-cyan-400',
      badge: isAarav ? 'High Impact' : 'Not Uploaded',
      badgeVariant: isAarav ? 'ai' : 'outline',
      link: isAarav ? '/resume-analyzer' : '/resumes',
      linkText: isAarav ? 'View Analysis' : 'Upload Resume',
    },
    {
      id: 'applications-active',
      title: 'Active Applications',
      numValue: isAarav ? 6 : 0,
      suffix: '',
      subtitle: isAarav ? '1 in Interview (Razorpay), 1 Offer (Swiggy)' : 'Track jobs across pipeline',
      icon: Kanban,
      iconColor: 'text-amber-500',
      badge: isAarav ? 'In Pipeline' : '0 in Pipeline',
      badgeVariant: 'outline',
      link: '/applications',
      linkText: 'Open Kanban',
    },
    {
      id: 'saved-opportunities',
      title: 'Saved Opportunities',
      numValue: isAarav ? 8 : 0,
      suffix: '',
      subtitle: isAarav ? '3 high semantic matches' : 'Explore and bookmark jobs',
      icon: Bookmark,
      iconColor: 'text-indigo-400',
      badge: isAarav ? 'Wishlisted' : '0 Saved',
      badgeVariant: 'outline',
      link: '/jobs',
      linkText: 'Explore Jobs',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: idx * 0.05 }}
            className="flex"
          >
            <Card
              className="group relative overflow-hidden border-border/80 bg-card/75 backdrop-blur-sm transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs flex flex-col justify-between w-full"
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
                      <AnimatedCounter value={card.numValue} suffix={card.suffix} />
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
          </motion.div>
        );
      })}
    </div>
  );
}
