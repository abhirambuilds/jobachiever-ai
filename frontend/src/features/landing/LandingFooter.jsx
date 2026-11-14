import { Link } from 'react-router-dom';
import { Sparkles, Github, Shield, Terminal } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LandingFooter() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-border/60 bg-card/40 backdrop-blur-md">
      <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-5">
          {/* Brand Column */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-cyan-400 text-white shadow-glow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">
                JobAchiever<span className="text-primary font-extrabold">.AI</span>
              </span>
            </Link>

            <p className="max-w-sm text-xs sm:text-sm text-muted-foreground leading-relaxed">
              The AI-Powered Career Operating System. Guiding students, freshers, and experienced
              professionals through every stage of the modern hiring lifecycle.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/abhirambuilds/jobachiever-ai"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
              >
                <Github className="h-4 w-4" />
                <span>GitHub Repository</span>
              </a>
              <Badge variant="outline" className="text-[10px]">
                v1.0.0-SNAPSHOT
              </Badge>
            </div>
          </div>

          {/* Product Navigation */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Platform
            </span>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <button
                  onClick={() => scrollTo('features')}
                  className="hover:text-foreground transition-colors"
                >
                  Features Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('how-it-works')}
                  className="hover:text-foreground transition-colors"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('career-tracks')}
                  className="hover:text-foreground transition-colors"
                >
                  Multi-Career Tracks
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollTo('ai-engine')}
                  className="hover:text-foreground transition-colors"
                >
                  AI Inference Engine
                </button>
              </li>
              <li>
                <Link to="/showcase" className="hover:text-foreground transition-colors">
                  Design System Showcase
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Core */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Architecture
            </span>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-primary" />
                <span>Spring Boot 3 (Core)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-cyan-400" />
                <span>FastAPI (AI Engine)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-emerald-500" />
                <span>Zero-Fabrication Guard</span>
              </li>
              <li>
                <span>PostgreSQL + pgvector</span>
              </li>
              <li>
                <span>Groq / Gemini / Ollama</span>
              </li>
            </ul>
          </div>

          {/* Governance & Compliance */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Trust & Legal
            </span>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>
                <span className="hover:text-foreground cursor-pointer transition-colors">
                  Privacy Policy (Planned)
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer transition-colors">
                  Terms of Service (Planned)
                </span>
              </li>
              <li>
                <span className="hover:text-foreground cursor-pointer transition-colors">
                  Human-In-The-Loop Ethics
                </span>
              </li>
              <li>
                <a
                  href="https://github.com/abhirambuilds/jobachiever-ai/issues"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground transition-colors"
                >
                  Report Issue / Feedback
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} JobAchiever AI. Engineered for ambitious career advancement.
          </div>
          <div className="flex items-center gap-1.5">
            <span>Built with precision for top-tier SaaS performance</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
