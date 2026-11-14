import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Cpu,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

export function AuthLayout({
  children,
  headline = 'Your Next Career Move Starts Here',
  subtitle = 'Manage your entire professional journey from one unified operating system.',
}) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
      {/* Left Column: Visual Brand Hero Panel (Desktop) */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between border-r border-border/60 bg-gradient-to-br from-card via-card/70 to-background p-12 overflow-hidden">
        {/* Ambient radial glows */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-primary/20 blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-400/20 blur-[100px] pointer-events-none" />

        {/* Top Brand Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-cyan-400 text-white shadow-glow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight text-foreground">
                JobAchiever<span className="text-primary font-extrabold">.AI</span>
              </span>
              <span className="text-[10px] text-muted-foreground">
                Career Operating System
              </span>
            </div>
          </Link>
        </div>

        {/* Center Content: Headline & Illustrative Card */}
        <div className="relative z-10 max-w-md space-y-6 my-auto">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-3"
          >
            <Badge variant="ai" dot className="text-xs">
              Prepare Smarter. Apply Better. Get Hired.
            </Badge>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground xl:text-4xl">
              {headline}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {subtitle}
            </p>
          </motion.div>

          {/* Illustrative Preview Snippet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="border-border/70 bg-card/80 backdrop-blur-md shadow-xl">
              <CardContent className="p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-foreground">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Explainable Compatibility</span>
                  </div>
                  <Badge variant="success" className="text-[10px]">
                    94% Match
                  </Badge>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Skills Alignment</span>
                    <span className="font-semibold text-foreground">11/12 Verified</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full w-[94%]" />
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>Zero Fabrication</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Cpu className="h-3.5 w-3.5 text-primary" />
                    <span>User-Selected AI</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Bottom Architectural Guarantee */}
        <div className="relative z-10 pt-6 text-xs text-muted-foreground flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span>Strict Human Verification</span>
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
            <span>Multi-Track Personas</span>
          </span>
        </div>
      </div>

      {/* Right Column: Form Container */}
      <div className="flex-1 flex flex-col justify-between p-4 sm:p-8 lg:p-12 overflow-y-auto">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-2">
            {/* Mobile Brand Link */}
            <Link to="/" className="lg:hidden flex items-center gap-2 mr-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold tracking-tight">JobAchiever.AI</span>
            </Link>
            <ThemeToggle className="h-9 w-9" />
          </div>
        </div>

        {/* Centered Form Slot */}
        <div className="my-auto py-8 flex justify-center">
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Bottom Legal / Footnote */}
        <div className="text-center text-[11px] text-muted-foreground pt-4 border-t border-border/40">
          JobAchiever AI © {new Date().getFullYear()}. Protected by multi-user tenant isolation.
        </div>
      </div>
    </div>
  );
}
