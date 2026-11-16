import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { enableDemoMode } from '@/demo/demoConfig';

export function HeroSection() {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background radial gradients for subtle futuristic ambiance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-gradient-to-tr from-primary/20 via-indigo-600/10 to-cyan-400/20 blur-[130px] pointer-events-none -z-10" />

      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        {/* Top Tagline Pill */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-3.5 py-1.5 text-xs backdrop-blur-md shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-foreground">AI Career Operating System</span>
            <span className="text-muted-foreground">•</span>
            <span className="text-muted-foreground">Prepare Smarter. Apply Better. Get Hired.</span>
          </div>
        </motion.div>

        {/* Main Headline & Supporting Text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-4xl text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
            Your Next Career Move{' '}
            <span className="gradient-text-primary">Starts Here.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed">
            Build a stronger professional profile, discover opportunities that fit you, and turn
            your career goals into real opportunities — powered by AI.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button
              variant="ai"
              size="lg"
              onClick={() => navigate('/register')}
              className="gap-2 px-8 text-base shadow-glow-sm"
            >
              <span>Start Your Career Journey</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                enableDemoMode();
                navigate('/dashboard');
              }}
              className="gap-2 border-primary/30 bg-primary/5 hover:bg-primary/15 text-foreground font-semibold shadow-xs text-base"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Explore Interactive Demo</span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={scrollToFeatures}
              className="text-base border-border/80"
            >
              Explore Features
            </Button>
          </div>

          {/* Micro Trust Indicators */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Zero-Fabrication Guarantee</span>
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span>Human-Verified Data</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-cyan-400" />
              <span>User-Chosen AI Engine</span>
            </span>
          </div>
        </motion.div>

        {/* Product Preview Composition */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative mx-auto mt-16 max-w-5xl"
        >
          {/* Outer glow and border */}
          <div className="relative rounded-2xl border border-border/80 bg-card/60 p-2 sm:p-4 shadow-2xl backdrop-blur-xl">
            {/* Top illustrative browser header */}
            <div className="mb-4 flex items-center justify-between border-b border-border/60 pb-3 px-2">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                <span className="ml-2 text-xs font-mono text-muted-foreground hidden sm:inline-block">
                  jobachiever.workspace/career-os
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="ai" className="text-[10px] px-2 py-0.5">
                  Live Platform Preview
                </Badge>
              </div>
            </div>

            {/* Dashboard Workspace Grid */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
              {/* Left Column: Master Profile & Career Track */}
              <div className="space-y-4 lg:col-span-4">
                <Card className="border-border/60 bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                          JD
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-foreground">John Doe</div>
                          <div className="text-xs text-muted-foreground">Master Career Graph</div>
                        </div>
                      </div>
                      <Badge variant="success" dot className="text-[10px]">
                        Verified
                      </Badge>
                    </div>

                    <div className="rounded-lg border border-border/60 bg-muted/30 p-2.5 text-xs space-y-1">
                      <div className="font-semibold text-foreground flex items-center justify-between">
                        <span>Active Track</span>
                        <Badge variant="outline" className="text-[9px]">Track 1 of 3</Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px]">
                        Full-Stack & Cloud Architecture
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Verified Skills Ingested</span>
                        <span className="font-semibold text-foreground">18 Skills</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">React</span>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">Spring Boot</span>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">Python</span>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">PostgreSQL</span>
                        <span className="rounded-md bg-secondary px-2 py-0.5 text-[10px] font-medium text-foreground">Docker</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Provider Config */}
                <Card className="border-border/60 bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                        <span>AI Inference Provider</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground">User Managed</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-2 text-xs">
                      <span className="font-medium text-foreground">Groq Cloud (Llama 3.3)</span>
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Middle & Right Column: Explainable Match Score & Application Pipeline */}
              <div className="space-y-4 lg:col-span-8">
                {/* Explainable Match Diagnostic Card */}
                <Card className="border-border/60 bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/40 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                            Explainable Match Engine
                          </span>
                          <Badge variant="outline" className="text-[10px]">Deterministic</Badge>
                        </div>
                        <h4 className="text-base font-bold text-foreground mt-0.5">
                          Target: Senior Full-Stack Engineer — Cloud Platforms
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <div className="text-right">
                          <div className="text-2xl font-extrabold text-foreground">94%</div>
                          <div className="text-[10px] text-muted-foreground">Compatibility Score</div>
                        </div>
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                          <TrendingUp className="h-6 w-6" />
                        </div>
                      </div>
                    </div>

                    {/* Breakdown Dimension Bars */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-border/60 bg-card/60 p-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Technical Skills</span>
                          <span className="font-semibold text-foreground">96%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary rounded-full w-[96%]" />
                        </div>
                        <div className="text-[10px] text-emerald-500 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>11/12 skills aligned</span>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-card/60 p-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Experience Fit</span>
                          <span className="font-semibold text-foreground">92%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full w-[92%]" />
                        </div>
                        <div className="text-[10px] text-muted-foreground">Seniority tier match</div>
                      </div>

                      <div className="rounded-xl border border-border/60 bg-card/60 p-3 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">ATS Keyword Ratio</span>
                          <span className="font-semibold text-foreground">95%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-cyan-400 rounded-full w-[95%]" />
                        </div>
                        <div className="text-[10px] text-cyan-400">Zero keyword stuffing</div>
                      </div>
                    </div>

                    {/* Actionable Recommendations Snippet */}
                    <div className="rounded-xl border border-border/60 bg-card/40 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-foreground font-semibold">
                        <span className="flex items-center gap-1.5">
                          <FileCheck2 className="h-4 w-4 text-primary" />
                          <span>Tailored Bullet Point Suggestion (Truthful Grounding)</span>
                        </span>
                        <Badge variant="ai" className="text-[9px]">Grounded in verified experience</Badge>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-relaxed">
                        &quot;Architected decoupled Spring Boot REST APIs with PostgreSQL pgvector, reducing
                        semantic search query latency by 42% across high-concurrency microservices.&quot;
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Mini Kanban Pipeline Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Wishlisted</span>
                    <div className="mt-1 font-bold text-foreground text-sm">6 Roles</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">Curated matching</div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">Applied</span>
                    <div className="mt-1 font-bold text-foreground text-sm">14 Roles</div>
                    <div className="mt-1 text-[10px] text-primary">Tailored Resumes</div>
                  </div>
                  <div className="rounded-xl border border-primary/40 bg-primary/5 p-3">
                    <span className="text-[10px] text-primary uppercase font-bold">Interviews</span>
                    <div className="mt-1 font-bold text-foreground text-sm">4 Active</div>
                    <div className="mt-1 text-[10px] text-emerald-500 font-medium">STAR Prep Ready</div>
                  </div>
                  <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/5 p-3">
                    <span className="text-[10px] text-emerald-500 uppercase font-bold">Offers</span>
                    <div className="mt-1 font-bold text-foreground text-sm">2 Offers</div>
                    <div className="mt-1 text-[10px] text-muted-foreground">Evaluating terms</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
