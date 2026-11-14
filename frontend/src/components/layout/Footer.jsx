import { Shield, Sparkles, Terminal } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-card/30 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8 sm:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex flex-col items-center gap-1.5 md:items-start">
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-foreground">
                JobAchiever AI
              </span>
              <span className="text-xs text-muted-foreground">
                — Prepare Smarter. Apply Better. Get Hired.
              </span>
            </div>
            <p className="text-xs text-muted-foreground/80">
              Built with React, Vite, Tailwind CSS, shadcn/ui & Framer Motion.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-emerald-500" />
              <span>Zero-Fabrication Guardrails</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-primary" />
              <span>Spring Boot + FastAPI Monorepo</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
              <span>Manual AI Provider Choice</span>
            </span>
          </div>
        </div>

        <div className="mt-6 border-t border-border/40 pt-4 text-center text-xs text-muted-foreground/60">
          © {new Date().getFullYear()} JobAchiever AI. All rights reserved. Milestone 2: Frontend Foundation & Design System.
        </div>
      </div>
    </footer>
  );
}
