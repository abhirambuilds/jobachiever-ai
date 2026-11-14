import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, Sparkles, ArrowRight, Lightbulb } from 'lucide-react';
import { dashboardService } from '@/services/dashboardService';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export function CareerInsightsPanel() {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    dashboardService
      .getAiInsights()
      .then((data) => {
        if (mounted) {
          setInsights(data);
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
    <Card className="border-border/80 bg-gradient-to-br from-card via-card to-primary/5 shadow-md">
      <CardHeader className="p-5 pb-3 border-b border-border/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span>AI Career Strategist &amp; Advisory</span>
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Prescriptive, evidence-grounded recommendations to elevate your market standing.
          </p>
        </div>

        <Badge variant="ai" className="text-[10px] gap-1 px-2 py-0.5 font-medium">
          <Sparkles className="h-3 w-3 text-cyan-400" />
          <span>Active Advisory</span>
        </Badge>
      </CardHeader>

      <CardContent className="p-5 space-y-3.5">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <Spinner size="md" />
            <span className="text-xs text-muted-foreground">Synthesizing advisory insights...</span>
          </div>
        ) : insights.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No advisory insights generated yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {insights.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card/90 p-4 transition-all duration-200 hover:border-primary/50 hover:shadow-glow-xs"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                      <Lightbulb className="h-3.5 w-3.5" />
                      <span>{item.category}</span>
                    </span>
                    <Badge variant={item.badgeVariant || 'outline'} className="text-[9px] px-1.5 py-0">
                      {item.badge}
                    </Badge>
                  </div>

                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
                    {item.title}
                  </h4>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-border/40">
                  <Link to={item.actionRoute}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-between h-8 text-xs text-foreground group-hover:text-primary font-semibold px-2"
                    >
                      <span>{item.actionLabel}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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
