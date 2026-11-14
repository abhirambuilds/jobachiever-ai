import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Github,
  Menu,
  X,
  Layers,
  Home,
  ArrowRight,
} from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Design System', path: '/showcase', icon: Layers },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-cyan-400 text-white shadow-glow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-foreground">
                JobAchiever<span className="text-primary font-extrabold">.AI</span>
              </span>
              <Badge variant="ai" className="text-[10px] px-1.5 py-0">
                v1.0.0
              </Badge>
            </div>
            <span className="hidden text-[10px] text-muted-foreground sm:inline-block">
              Career Operating System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/showcase' && location.pathname === '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Frontend Ready</span>
          </div>

          <a
            href="https://github.com/abhirambuilds/jobachiever-ai"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub Repository"
          >
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Github className="h-4 w-4" />
            </Button>
          </a>

          <ThemeToggle className="h-9 w-9" />

          <Link to="/login" className="hidden sm:inline-block">
            <Button variant="ghost" size="sm" className="text-sm">
              Sign In
            </Button>
          </Link>

          <Link to="/register" className="hidden sm:inline-block">
            <Button variant="ai" size="sm" className="gap-1 font-semibold">
              <span>Get Started</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </Link>

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border/60 bg-background/95 px-4 py-4 backdrop-blur-lg md:hidden animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
                >
                  <Icon className="h-4 w-4 text-primary" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
