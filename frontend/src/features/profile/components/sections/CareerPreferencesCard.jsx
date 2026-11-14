import { Target, MapPin, DollarSign, Briefcase } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function CareerPreferencesCard() {
  const { profile } = useProfile();
  const { careerPreferences } = profile;

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          <span>Career Goals &amp; Preferences</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        {/* Target Roles */}
        <div className="space-y-1.5">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
            Target Roles &amp; Functions
          </span>
          <div className="flex flex-wrap gap-1.5">
            {careerPreferences.targetRoles?.map((role) => (
              <Badge key={role} variant="default" className="text-xs">
                {role}
              </Badge>
            ))}
          </div>
        </div>

        {/* Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <Briefcase className="h-3 w-3 text-primary" />
              <span>Arrangement</span>
            </span>
            <span className="font-bold text-foreground">
              {careerPreferences.workArrangement || 'Flexible'}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {careerPreferences.employmentTypes?.join(', ') || 'Full-time'}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <MapPin className="h-3 w-3 text-primary" />
              <span>Locations</span>
            </span>
            <span className="font-bold text-foreground">
              {careerPreferences.preferredLocations || 'Any Location'}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {careerPreferences.preferredCountries || 'Global'}
            </span>
          </div>

          <div className="p-3 rounded-xl border border-border/60 bg-muted/20 space-y-1">
            <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
              <DollarSign className="h-3 w-3 text-primary" />
              <span>Expected Comp</span>
            </span>
            <span className="font-bold text-foreground">
              {careerPreferences.expectedSalary || 'Negotiable'}
            </span>
            <span className="text-[10px] text-muted-foreground block">Annual Target</span>
          </div>
        </div>

        {/* Career Objectives Statement */}
        {careerPreferences.careerGoals && (
          <div className="pt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
              Near-Term Career Objectives
            </span>
            <p className="text-xs text-foreground/90 leading-relaxed bg-muted/30 p-3 rounded-xl border border-border/60">
              {careerPreferences.careerGoals}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
