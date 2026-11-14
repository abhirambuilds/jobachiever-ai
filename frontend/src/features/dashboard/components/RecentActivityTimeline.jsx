import { useState, useEffect } from 'react';
import {
  FileSearch,
  UserCheck,
  Bookmark,
  FileText,
  TrendingUp,
  Clock,
  Sparkles,
} from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

const iconMap = {
  FileSearch: FileSearch,
  UserCheck: UserCheck,
  Bookmark: Bookmark,
  FileText: FileText,
  TrendingUp: TrendingUp,
};

export function RecentActivityTimeline() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    dashboardService
      .getRecentActivity()
      .then((data) => {
        if (mounted) {
          setActivities(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Card className="border-border/80 bg-card/75 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="p-5 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-cyan-400" />
            <span>Recent Activity Timeline</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Audit trail of evaluations, applications, and updates.
          </p>
        </div>

        <Badge variant="outline" className="text-[10px] gap-1 font-mono">
          <Sparkles className="h-2.5 w-2.5 text-primary" />
          <span>Live Stream</span>
        </Badge>
      </CardHeader>

      <CardContent className="p-5 flex-1">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Spinner size="md" />
            <span className="text-xs text-muted-foreground">Loading recent events...</span>
          </div>
        ) : activities.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No recent platform activity logged.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60">
            {activities.map((item) => {
              const Icon = iconMap[item.icon] || FileText;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1 flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full bg-background border-2 border-primary/60 text-primary shadow-xs transition-transform group-hover:scale-110">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs font-bold text-foreground">
                          {item.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant || 'secondary'}
                            className="text-[9px] px-1.5 py-0"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {item.timestamp}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
