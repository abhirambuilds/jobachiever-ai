import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Github,
  Globe,
  ArrowRight,
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SimulatedResultBadge } from '@/components/demo';
import { isDemoMode } from '@/demo/demoConfig';

export function ProfileHeader() {
  const { profile, calculateCompleteness } = useProfile();
  const { percentage } = calculateCompleteness();

  const primaryTrack = profile.careerTracks.find((t) => t.isPrimary) || profile.careerTracks[0];

  return (
    <Card className="border-border/80 bg-gradient-to-br from-card via-card/85 to-primary/5 shadow-xl backdrop-blur-md overflow-hidden">
      <CardContent className="p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Left Avatar & Identity */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Initials Avatar */}
            <div className="relative">
              <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-gradient-to-tr from-primary via-indigo-600 to-cyan-400 text-white font-extrabold text-2xl sm:text-3xl shadow-glow-sm">
                {profile.personalInfo.fullName
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'JA'}
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-background ring-2 ring-primary">
                <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </div>

            {/* Name, Headline, Contact Chips */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {profile.personalInfo.fullName || 'Career Candidate'}
                </h1>
                <Badge variant="success" dot className="text-xs">
                  Human-Verified Graph
                </Badge>
                {primaryTrack && (
                  <Badge variant="ai" className="text-xs">
                    {primaryTrack.name}
                  </Badge>
                )}
                {isDemoMode() && <SimulatedResultBadge size="sm" />}
              </div>

              <p className="text-sm sm:text-base font-medium text-primary">
                {profile.personalInfo.headline || 'Master Career Profile'}
              </p>

              {/* Meta Chips */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                {profile.personalInfo.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>
                      {profile.personalInfo.city}, {profile.personalInfo.country}
                    </span>
                  </span>
                )}
                {profile.personalInfo.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-3.5 w-3.5" />
                    <span>{profile.personalInfo.email}</span>
                  </span>
                )}
                {profile.personalInfo.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5" />
                    <span>{profile.personalInfo.phone}</span>
                  </span>
                )}
              </div>

              {/* Social URLs */}
              <div className="flex items-center gap-3 pt-1 text-xs">
                {profile.personalInfo.linkedinUrl && (
                  <a
                    href={profile.personalInfo.linkedinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Linkedin className="h-3.5 w-3.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {profile.personalInfo.githubUrl && (
                  <a
                    href={profile.personalInfo.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Github className="h-3.5 w-3.5" />
                    <span>GitHub</span>
                  </a>
                )}
                {profile.personalInfo.websiteUrl && (
                  <a
                    href={profile.personalInfo.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-muted-foreground hover:text-cyan-400 transition-colors"
                  >
                    <Globe className="h-3.5 w-3.5" />
                    <span>Website</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Right Completeness Widget & CTA */}
          <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 border-t lg:border-t-0 border-border/40 pt-4 lg:pt-0 shrink-0">
            <div className="space-y-1.5 lg:text-right">
              <div className="flex items-center lg:justify-end gap-2 text-xs">
                <span className="text-muted-foreground">Master Completeness</span>
                <span className="font-mono font-bold text-foreground text-sm">
                  {percentage}%
                </span>
              </div>
              <div className="h-2 w-36 sm:w-48 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground block">
                {profile.careerTracks.length} Active Career Track(s)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link to="/onboarding">
                <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                  <span>Revisit Onboarding</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
