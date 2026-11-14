import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Menu, X, ArrowRight, Layers } from 'lucide-react';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled
          ? 'border-b border-border/70 bg-background/85 backdrop-blur-md shadow-sm'
          : 'border-b border-transparent bg-background/50 backdrop-blur-sm'
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-cyan-400 text-white shadow-glow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-foreground">
                JobAchiever<span className="text-primary font-extrabold">.AI</span>
              </span>
              <Badge variant="ai" className="text-[10px] px-1.5 py-0">
                SaaS
              </Badge>
            </div>
            <span className="hidden text-[10px] text-muted-foreground sm:inline-block">
              Career Operating System
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-7 lg:flex">
          <button
            onClick={() => scrollToSection('features')}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection('career-tracks')}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Career Tracks
          </button>
          <button
            onClick={() => scrollToSection('ai-engine')}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            AI Providers
          </button>
          <button
            onClick={() => scrollToSection('value')}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Why JobAchiever
          </button>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/showcase" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <Layers className="h-3.5 w-3.5" />
              <span>UI System</span>
            </Button>
          </Link>

          <ThemeToggle className="h-9 w-9" />

          <Link to="/login" className="hidden sm:inline-block">
            <Button variant="ghost" size="sm" className="text-sm">
              Sign In
            </Button>
          </Link>

          <Button
            variant="ai"
            size="sm"
            onClick={() => navigate('/register')}
            className="gap-1.5 font-semibold"
          >
            <span>Get Started</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>

          {/* Mobile hamburger */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden h-9 w-9"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border/80 bg-background/95 px-6 py-5 backdrop-blur-xl lg:hidden animate-in slide-in-from-top-3 duration-200">
          <nav className="flex flex-col space-y-3.5">
            <button
              onClick={() => scrollToSection('features')}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              <span>Features</span>
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              <span>How It Works</span>
            </button>
            <button
              onClick={() => scrollToSection('career-tracks')}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              <span>Career Tracks</span>
            </button>
            <button
              onClick={() => scrollToSection('ai-engine')}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              <span>AI Providers</span>
            </button>
            <button
              onClick={() => scrollToSection('value')}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-medium text-foreground hover:bg-accent"
            >
              <span>Why JobAchiever</span>
            </button>
            <Link
              to="/showcase"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent"
            >
              <Layers className="h-4 w-4" />
              <span>Design System Showcase</span>
            </Link>
            <div className="pt-2 border-t border-border/50 flex gap-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ai" size="sm" className="w-full">
                  Get Started
                </Button>
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
