import { User, MapPin, Mail, Phone, FileText } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function PersonalInfoCard() {
  const { profile } = useProfile();
  const { personalInfo } = profile;

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <User className="h-4 w-4 text-primary" />
          <span>Professional Summary &amp; Background</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5 mb-1.5">
            <FileText className="h-3.5 w-3.5 text-primary" />
            <span>Executive Career Summary</span>
          </span>
          <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed bg-muted/30 p-3.5 rounded-xl border border-border/60">
            {personalInfo.summary || 'No summary entered.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-2.5 rounded-lg border border-border/60 bg-card/60">
            <span className="text-muted-foreground block text-[11px]">Primary Location</span>
            <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-primary" />
              <span>{personalInfo.city || 'N/A'}, {personalInfo.country || 'N/A'}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg border border-border/60 bg-card/60">
            <span className="text-muted-foreground block text-[11px]">Direct Email</span>
            <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5 truncate">
              <Mail className="h-3 w-3 text-primary shrink-0" />
              <span className="truncate">{personalInfo.email || 'N/A'}</span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg border border-border/60 bg-card/60">
            <span className="text-muted-foreground block text-[11px]">Phone Contact</span>
            <span className="font-semibold text-foreground flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3 text-primary" />
              <span>{personalInfo.phone || 'N/A'}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
