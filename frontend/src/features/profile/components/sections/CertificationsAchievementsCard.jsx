import { Award, Trophy, Trash2, ExternalLink } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function CertificationsAchievementsCard() {
  const { profile, removeCertification, removeAchievement } = useProfile();

  return (
    <Card className="border-border/70 bg-card">
      <CardHeader className="pb-3 border-b border-border/50">
        <CardTitle className="text-base font-bold flex items-center gap-2">
          <Award className="h-4 w-4 text-primary" />
          <span>Certifications &amp; Distinct Honors</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-6">
        {/* Certifications Sub-list */}
        <div className="space-y-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Award className="h-3.5 w-3.5 text-primary" />
            <span>Verified Credentials ({profile.certifications.length})</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.certifications.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">{item.name}</h4>
                  <p className="text-[11px] font-semibold text-primary">{item.issuingOrg}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Issued: {item.issueDate}
                    {item.expirationDate ? ` • Expires: ${item.expirationDate}` : ''}
                  </p>
                  {item.credentialUrl && (
                    <a
                      href={item.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline pt-0.5"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span>Verify Certificate</span>
                    </a>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCertification(item.id)}
                  className="text-muted-foreground hover:text-destructive h-7 w-7"
                  aria-label="Remove certification"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Sub-list */}
        <div className="space-y-3 pt-2 border-t border-border/40">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            <span>Honors &amp; Awards ({profile.achievements.length})</span>
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.achievements.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border/60 bg-muted/20 p-3.5 flex items-start justify-between gap-3"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                  {item.issuingOrg && (
                    <p className="text-[11px] font-semibold text-amber-500">{item.issuingOrg}</p>
                  )}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                  {item.date && (
                    <p className="text-[10px] text-muted-foreground font-mono">Date: {item.date}</p>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeAchievement(item.id)}
                  className="text-muted-foreground hover:text-destructive h-7 w-7"
                  aria-label="Remove achievement"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
