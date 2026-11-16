import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  ChevronDown,
  Sparkles,
  LayoutDashboard,
  UserCheck,
  FileText,
  FileSearch,
  Target,
  Bot,
  Settings,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isDemoMode } from '@/demo/demoConfig';

const TOUR_STORAGE_KEY = 'jobachiever_demo_tour_dismissed';

export const TOUR_STEPS = [
  {
    step: 1,
    id: 'dashboard',
    route: '/dashboard',
    title: 'Career Command Center',
    badge: 'Step 1 of 9',
    icon: LayoutDashboard,
    headline: 'Unified Career Readiness & Command Overview',
    description:
      'Welcome to Aarav Sharma’s career command center. Observe unified readiness metrics, 94% ATS resume compatibility, active tracks (Senior Backend Software Engineer & Cloud Systems), and live interview scheduling with Razorpay.',
    takeaway: 'Zero fragmentation: Profile metrics, resume scores, and application pipeline stay synchronized.',
  },
  {
    step: 2,
    id: 'profile',
    route: '/profile',
    title: 'Master Career Profile',
    badge: 'Step 2 of 9',
    icon: UserCheck,
    headline: 'Single Source of Factual Career Truth',
    description:
      'Inspect verified academic credentials (Indian Institute of Technology Bombay, 9.2 CGPA), technical proficiencies (Java 21, Spring Boot 3, Kafka, Postgres), and career milestones with strict zero-fabrication guarantees.',
    takeaway: 'Human-in-the-loop: Every skill and achievement requires verification before entering generation pipelines.',
  },
  {
    step: 3,
    id: 'resumes',
    route: '/resumes',
    title: 'Resume Library & Document Hub',
    badge: 'Step 3 of 9',
    icon: FileText,
    headline: 'Multi-Persona Document Management',
    description:
      'Examine 3 targeted resumes with instant vector-accurate HTML previews: Aarav’s Master Backend Resume (94% ATS), Full Stack variant (91%), and AI/ML Systems variant (90%).',
    takeaway: 'Live document operations: Try renaming, setting primary, or uploading resumes directly.',
  },
  {
    step: 4,
    id: 'resume-analyzer',
    route: '/resume-analyzer',
    title: 'AI Resume Analyzer',
    badge: 'Step 4 of 9',
    icon: FileSearch,
    headline: 'Machine-Readability & 8-Point Rubric Audit',
    description:
      'Diagnose ATS structural parsing, evaluate bullet point impact with qualitative ratings, and explore interactive before/after sentence phrasing enhancements.',
    takeaway: 'Explainable ratings: Strengths and gaps are paired with contextual engineering evidence.',
  },
  {
    step: 5,
    id: 'jd-analyzer',
    route: '/jd-analyzer',
    title: 'Job Description Analyzer',
    badge: 'Step 5 of 9',
    icon: FileSearch,
    headline: 'Automated Expectation Decomposition',
    description:
      'Deconstruct real-world job postings into mandatory vs. preferred technical skills, soft skills, and employer signals without manual copy-pasting.',
    takeaway: 'Pre-loaded presets: Try loading the Razorpay Core Payments or Swiggy Distributed Logistics job posting.',
  },
  {
    step: 6,
    id: 'job-matcher',
    route: '/job-matcher',
    title: 'Resume–Job Matching Engine',
    badge: 'Step 6 of 9',
    icon: Target,
    headline: 'Explainable Compatibility Scoring',
    description:
      'Compare Aarav Sharma’s Master Resume against Razorpay’s Core Payments role. The engine scores a 94% overall match with 100% mandatory skills coverage and highlights the consensus protocol gap.',
    takeaway: 'Absolute truthfulness: Gaps are flagged transparently with learning compensation advice.',
  },
  {
    step: 7,
    id: 'resume-studio',
    route: '/resume-studio',
    title: 'AI-Powered Resume Studio',
    badge: 'Step 7 of 9',
    icon: Sparkles,
    headline: 'Vector Canvas & Interactive Assistant',
    description:
      'Experience dynamic A4 resume building with 5 ATS-compliant templates, drag-and-drop section reordering, version snapshot checkpoints, and native browser print rendering.',
    takeaway: 'Writer assistant: Polish bullets in Professional, Metric-Driven, or Concise modes.',
  },
  {
    step: 8,
    id: 'career-assistant',
    route: '/career-assistant',
    title: 'Career Intelligence & Roadmaps',
    badge: 'Step 8 of 9',
    icon: Bot,
    headline: 'Formula-Weighted Skill Gap Strategy',
    description:
      'View prioritized missing skills (Kubernetes, Raft Consensus) and track learning milestones on a phased roadmap. Check off milestones to observe reactive progress calculations.',
    takeaway: 'Deterministic curriculum: Learning roadmaps directly bridge the diagnosed candidate gaps.',
  },
  {
    step: 9,
    id: 'settings',
    route: '/settings/ai',
    title: 'AI Provider Settings & Transparency',
    badge: 'Step 9 of 9',
    icon: Settings,
    headline: 'High-Throughput Groq LPU Engine',
    description:
      'Inspect production-grade Groq LPU inference (Llama 3.3 70B) powering real-time resume analysis and matching at sub-second speeds.',
    takeaway: 'Architectural sovereignty: Enterprise Groq LPU engine delivers instant, privacy-conscious processing.',
  },
];

export function DemoTourGuide() {
  const [isOpen, setIsOpen] = useState(() => {
    if (!isDemoMode()) return false;
    try {
      return localStorage.getItem(TOUR_STORAGE_KEY) !== 'true';
    } catch {
      return true;
    }
  });
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleDemoStateChange = (e) => {
      const active = Boolean(e?.detail?.active ?? isDemoMode());
      if (!active) {
        setIsOpen(false);
      } else {
        const dismissed = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
        if (!dismissed) setIsOpen(true);
      }
    };

    window.addEventListener('jobachiever:demo-state-changed', handleDemoStateChange);
    return () => {
      window.removeEventListener('jobachiever:demo-state-changed', handleDemoStateChange);
    };
  }, []);

  useEffect(() => {
    // Only available in demo mode
    if (!isDemoMode()) {
      setIsOpen(false);
      return;
    }

    // Auto-launch on first demo entry if not dismissed
    const dismissed = localStorage.getItem(TOUR_STORAGE_KEY) === 'true';
    if (!dismissed) {
      setIsOpen(true);
    }

    // Listen for manual tour launch events from DemoModeBanner or buttons
    const handleStartTour = (e) => {
      const targetStep = e?.detail?.stepIndex ?? 0;
      setCurrentStepIndex(targetStep);
      setIsMinimized(false);
      setIsOpen(true);
      const stepObj = TOUR_STEPS[targetStep];
      if (stepObj && location.pathname !== stepObj.route) {
        navigate(stepObj.route);
      }
    };

    window.addEventListener('jobachiever:start-demo-tour', handleStartTour);
    return () => {
      window.removeEventListener('jobachiever:start-demo-tour', handleStartTour);
    };
  }, [location.pathname, navigate]);

  // Synchronize currentStepIndex if user navigates manually while tour is open
  useEffect(() => {
    if (!isOpen) return;
    const matchingIndex = TOUR_STEPS.findIndex((s) => s.route === location.pathname);
    if (matchingIndex !== -1 && matchingIndex !== currentStepIndex) {
      setCurrentStepIndex(matchingIndex);
    }
  }, [location.pathname, isOpen, currentStepIndex]);

  if (!isDemoMode() || !isOpen) {
    return null;
  }

  const currentStep = TOUR_STEPS[currentStepIndex] || TOUR_STEPS[0];
  const StepIcon = currentStep.icon;
  const isFirst = currentStepIndex === 0;
  const isLast = currentStepIndex === TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLast) {
      handleClose();
      return;
    }
    const nextIdx = currentStepIndex + 1;
    setCurrentStepIndex(nextIdx);
    navigate(TOUR_STEPS[nextIdx].route);
  };

  const handlePrev = () => {
    if (isFirst) return;
    const prevIdx = currentStepIndex - 1;
    setCurrentStepIndex(prevIdx);
    navigate(TOUR_STEPS[prevIdx].route);
  };

  const handleClose = () => {
    setIsOpen(false);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const handleSkip = () => {
    handleClose();
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 pointer-events-auto">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.div
            key="minimized-pill"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            <button
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-card/95 border border-primary/40 shadow-xl backdrop-blur-md text-foreground hover:bg-card transition-all hover:scale-105 group"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Compass className="h-3.5 w-3.5 animate-spin-slow" />
              </div>
              <span className="text-xs font-semibold">
                Tour: <span className="text-primary">{currentStep.badge}</span> — {currentStep.title}
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono font-bold">
                Resume
              </span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded-tour-card"
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-sm sm:max-w-md bg-card/95 border border-primary/30 rounded-2xl shadow-2xl backdrop-blur-xl p-5 text-foreground space-y-4"
          >
            {/* Header: Progress, Icon & Window Controls */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/25">
                  <StepIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-[10px] font-bold py-0">
                      {currentStep.badge}
                    </Badge>
                    <span className="text-xs font-bold text-foreground truncate">
                      {currentStep.title}
                    </span>
                  </div>
                  <h4 className="text-sm font-extrabold text-foreground mt-0.5 leading-snug">
                    {currentStep.headline}
                  </h4>
                </div>
              </div>

              {/* Window Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Minimize tour"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  title="Close tour"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              {currentStep.description}
            </p>

            {/* Key Takeaway Highlight */}
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-primary/5 border border-primary/15 text-[11px] text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span className="leading-tight">{currentStep.takeaway}</span>
            </div>

            {/* Progress Bar Dots */}
            <div className="flex items-center justify-between gap-1 pt-1">
              {TOUR_STEPS.map((s, idx) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    navigate(s.route);
                  }}
                  className={`h-1.5 flex-1 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'bg-primary'
                      : idx < currentStepIndex
                      ? 'bg-primary/40'
                      : 'bg-muted'
                  }`}
                  title={`Go to Step ${s.step}: ${s.title}`}
                />
              ))}
            </div>

            {/* Bottom Actions: Prev, Next, Skip */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
              <button
                type="button"
                onClick={handleSkip}
                className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePrev}
                  disabled={isFirst}
                  className="h-7 text-xs px-2.5 gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  <span>Prev</span>
                </Button>

                <Button
                  type="button"
                  variant="ai"
                  size="sm"
                  onClick={handleNext}
                  className="h-7 text-xs px-3 gap-1 font-semibold"
                >
                  <span>{isLast ? 'Complete' : 'Next'}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DemoTourGuide;
