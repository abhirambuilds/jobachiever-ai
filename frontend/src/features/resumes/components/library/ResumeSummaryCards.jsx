import { FileText, Layers, Clock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ResumeSummaryCards() {
  const { metrics, documents } = useDocuments();

  const pdfCount = documents.filter((d) => d.fileExtension === 'pdf').length;
  const docxCount = documents.filter((d) => d.fileExtension === 'docx').length;

  const formatDate = (isoString) => {
    if (!isoString) return 'None';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const cards = [
    {
      id: 'total-resumes',
      title: 'Total Resumes',
      value: metrics.total.toString(),
      subtitle: `${pdfCount} PDF • ${docxCount} DOCX`,
      icon: FileText,
      iconColor: 'text-primary',
      badge: 'Library',
      badgeVariant: 'outline',
    },
    {
      id: 'tracks-covered',
      title: 'Career Tracks Covered',
      value: metrics.uniqueTracks.toString(),
      subtitle: 'Associated personas',
      icon: Layers,
      iconColor: 'text-cyan-400',
      badge: 'Personas',
      badgeVariant: 'secondary',
    },
    {
      id: 'recently-updated',
      title: 'Recently Updated',
      value: formatDate(metrics.lastUpdated),
      subtitle: 'Latest revision',
      icon: Clock,
      iconColor: 'text-amber-400',
      badge: 'Activity',
      badgeVariant: 'outline',
    },
    {
      id: 'processing-status',
      title: 'Processing Status',
      value: `${metrics.processed} Ready`,
      subtitle: metrics.processing > 0 ? `${metrics.processing} processing` : 'All verified',
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      badge: 'ATS Compliant',
      badgeVariant: 'success',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Card
            key={c.id}
            className="border-border/80 bg-card/75 backdrop-blur-sm transition-all duration-200 hover:border-primary/40 hover:shadow-glow-xs"
          >
            <CardContent className="p-4 sm:p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-muted/60 border border-border/60">
                  <Icon className={`h-4 w-4 ${c.iconColor}`} />
                </div>
                <Badge variant={c.badgeVariant} className="text-[10px] px-1.5 py-0">
                  {c.badge}
                </Badge>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground block truncate">
                  {c.title}
                </span>
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                  {c.value}
                </div>
                <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-muted-foreground/70" />
                  <span>{c.subtitle}</span>
                </p>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
