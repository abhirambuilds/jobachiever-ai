import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Building2,
  MapPin,
  DollarSign,
  Sparkles,
  ArrowRight,
  Target,
} from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export function OpportunityPreviewList() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    dashboardService
      .getRecommendedJobs()
      .then((data) => {
        if (mounted) {
          setJobs(data);
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
            <Compass className="h-4 w-4 text-primary" />
            <span>Recommended Opportunities</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time opportunities matched against your primary career track.
          </p>
        </div>

        <Link to="/jobs">
          <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-5 flex-1 space-y-3.5">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Spinner size="md" />
            <span className="text-xs text-muted-foreground">Matching opportunities...</span>
          </div>
        ) : jobs.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No matching opportunities discovered yet.
          </div>
        ) : (
          <div className="space-y-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group relative rounded-xl border border-border/70 bg-card p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                        {job.title}
                      </h4>
                      <Badge variant="outline" className="text-[10px]">
                        {job.workMode}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-foreground/80">
                        <DollarSign className="h-3 w-3 text-emerald-500" />
                        {job.salaryRange}
                      </span>
                    </div>
                  </div>

                  {/* Compatibility Match Score Badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                    <Badge variant="ai" className="text-xs font-bold gap-1 px-2 py-0.5 shadow-xs">
                      <Sparkles className="h-3 w-3 text-cyan-400" />
                      <span>{job.matchScore}% Match</span>
                    </Badge>
                    <span className="text-[10px] text-muted-foreground font-mono mt-1">
                      Posted {job.postedAgo}
                    </span>
                  </div>
                </div>

                {/* Skills tags */}
                <div className="mt-3 pt-3 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {job.requiredSkills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md bg-muted/60 border border-border/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <Link to="/job-match">
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-primary gap-1">
                      <Target className="h-3 w-3" />
                      <span>Explain Match</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
