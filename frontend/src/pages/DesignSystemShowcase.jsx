import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Mail,
  CheckCircle2,
  AlertTriangle,
  Info,
  XCircle,
  HelpCircle,
  FileText,
  Briefcase,
  Bot,
  Zap,
  Sliders,
  BarChart3,
  Flame,
  Layout,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
} from 'recharts';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from '@/components/ui/toast';
import { Spinner } from '@/components/ui/spinner';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/common/EmptyState';

// Sample chart data illustrating explainable compatibility scoring
const sampleCompatibilityData = [
  { category: 'Skills', score: 92 },
  { category: 'Experience', score: 85 },
  { category: 'Role Fit', score: 78 },
  { category: 'ATS Impact', score: 94 },
  { category: 'Keywords', score: 88 },
];

export function DesignSystemShowcase() {
  const [btnLoading, setBtnLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState('');

  const handleSimulateLoading = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      toast.success('Simulated task completed successfully!');
    }, 1500);
  };

  const handleValidateInput = (val) => {
    setInputValue(val);
    if (val && !val.includes('@')) {
      setInputError('Please enter a valid email address');
    } else {
      setInputError('');
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 sm:px-8 max-w-7xl">
      {/* Hero Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-b from-card via-card/70 to-card/40 p-8 sm:p-12 shadow-2xl backdrop-blur-md mb-12"
      >
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-ai/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Badge variant="ai" dot>
              Milestone 2 Design System
            </Badge>
            <Badge variant="outline">shadcn/ui + Tailwind + Framer Motion</Badge>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            JobAchiever <span className="gradient-text-primary">Design System</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            The foundation for JobAchiever AI. Engineered for clarity, accessibility, and high visual
            polish—featuring custom color tokens, responsive components, dark/light themes, and
            deliberate micro-interactions.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button
              variant="ai"
              onClick={() => toast.info('JobAchiever AI Design System is active')}
              className="gap-2"
            >
              <Zap className="h-4 w-4" />
              <span>Trigger AI Notification</span>
            </Button>
            <Button
              variant="outline"
              onClick={handleSimulateLoading}
              isLoading={btnLoading}
              loadingText="Processing State..."
              className="gap-2"
            >
              <span>Test Async Button</span>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs Layout */}
      <Tabs defaultValue="components" className="space-y-8">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-12 max-w-2xl mx-auto">
          <TabsTrigger value="components" className="gap-2 text-xs sm:text-sm">
            <Sliders className="h-4 w-4" />
            <span>Components</span>
          </TabsTrigger>
          <TabsTrigger value="colors" className="gap-2 text-xs sm:text-sm">
            <Flame className="h-4 w-4" />
            <span>Colors & Tokens</span>
          </TabsTrigger>
          <TabsTrigger value="typography" className="gap-2 text-xs sm:text-sm">
            <Layout className="h-4 w-4" />
            <span>Typography</span>
          </TabsTrigger>
          <TabsTrigger value="interactive" className="gap-2 text-xs sm:text-sm">
            <BarChart3 className="h-4 w-4" />
            <span>Interactive & Charts</span>
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: COMPONENTS */}
        <TabsContent value="components" className="space-y-10">
          {/* Section: Buttons */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Buttons & Variants</h3>
                <p className="text-xs text-muted-foreground">
                  Unified button tokens supporting variants, sizes, and accessible loading states.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="default">Primary Default</Button>
              <Button variant="ai" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span>AI Accent</span>
              </Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link Style</Button>
              <Button isLoading loadingText="Loading">
                Async
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Button size="sm" variant="outline">
                Small (sm)
              </Button>
              <Button size="default" variant="outline">
                Default
              </Button>
              <Button size="lg" variant="outline">
                Large (lg)
              </Button>
              <Button size="icon" variant="outline" aria-label="Icon Button">
                <Bot className="h-4 w-4 text-cyan-400" />
              </Button>
            </div>
          </section>

          {/* Section: Badges & Status */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Badges & Status Tags</h3>
                <p className="text-xs text-muted-foreground">
                  Informative indicators for ATS scores, verification states, and AI metadata.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="default">Default</Badge>
              <Badge variant="ai" dot>
                AI Verified
              </Badge>
              <Badge variant="success" dot>
                Match: 95%
              </Badge>
              <Badge variant="warning" dot>
                Review Required
              </Badge>
              <Badge variant="destructive" dot>
                Skill Gap
              </Badge>
              <Badge variant="info" dot>
                Spring Boot v3
              </Badge>
              <Badge variant="secondary">FastAPI Service</Badge>
              <Badge variant="outline">Read-Only</Badge>
            </div>
          </section>

          {/* Section: Inputs & Forms */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Form Inputs & Controls</h3>
                <p className="text-xs text-muted-foreground">
                  Structured inputs with icons, validation alerts, and helper captions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Input
                label="Job Title or Target Role"
                placeholder="e.g. Senior Full-Stack Engineer"
                leftIcon={Briefcase}
                helperText="Specify the target position to optimize tailored resumes."
              />

              <Input
                label="Email Address (Validation Test)"
                placeholder="user@example.com"
                leftIcon={Mail}
                value={inputValue}
                onChange={(e) => handleValidateInput(e.target.value)}
                error={inputError}
                helperText={!inputError ? 'Type without "@" to observe validation state' : undefined}
              />

              <div className="md:col-span-2">
                <Textarea
                  label="Target Job Description or Summary"
                  placeholder="Paste job listing text or enter your career objective..."
                  helperText="Input will be parsed by FastAPI using strict deterministic schemas."
                  rows={3}
                />
              </div>
            </div>
          </section>

          {/* Section: Cards & Surfaces */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Cards & Glass Panels</h3>
                <p className="text-xs text-muted-foreground">
                  Surface elevation cards supporting standard and frosted glass variants.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card glow>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Standard Card</CardTitle>
                    <Briefcase className="h-4 w-4 text-primary" />
                  </div>
                  <CardDescription>Hover for subtle brand glow.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Crisp border hierarchy with responsive padding and neutral background tones.
                </CardContent>
                <CardFooter>
                  <Button variant="outline" size="sm" className="w-full">
                    Inspect Card
                  </Button>
                </CardFooter>
              </Card>

              <Card glass glow>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Glass Panel</CardTitle>
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                  </div>
                  <CardDescription>Frosted backdrop-blur surface.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Subtle transparency optimized for modern dark/light mode interfaces.
                </CardContent>
                <CardFooter>
                  <Button variant="ai" size="sm" className="w-full">
                    AI Analysis
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Verification Card</CardTitle>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <CardDescription>Human-in-the-loop audit.</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  AI suggestions require confirmation before entering the verified graph.
                </CardContent>
                <CardFooter>
                  <Button variant="secondary" size="sm" className="w-full">
                    Confirm Data
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </section>

          {/* Section: Dialog, Dropdown & Tooltips */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Overlays & Micro-Interactions</h3>
                <p className="text-xs text-muted-foreground">
                  Accessible Radix UI primitives with keyboard trap and animations.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Dialog Modal */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <FileText className="h-4 w-4" />
                    <span>Open Accessible Dialog</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Action</DialogTitle>
                    <DialogDescription>
                      This dialog demonstrates our accessible modal system adhering to WAI-ARIA
                      standards with focus lock and backdrop blur.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-2 text-sm text-muted-foreground">
                    In JobAchiever AI, consequential actions such as external submissions or
                    destructive edits require explicit confirmation.
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <DialogClose asChild>
                      <Button
                        variant="default"
                        onClick={() => toast.success('Action confirmed!')}
                      >
                        Confirm
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Dropdown Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <span>Actions Menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuLabel>AI Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => toast.info('Parsing resume...')}>
                    Parse Resume (PDF/DOCX)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info('Calculating compatibility...')}>
                    Run Compatibility Engine
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => toast.error('Action cancelled')}
                  >
                    Reset Changes
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Help information">
                      <HelpCircle className="h-5 w-5 text-muted-foreground" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Tooltips provide accessible, high-contrast contextual guidance.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Toast Triggers */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.success('Resume parsed without hallucinations!')}
                className="text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/10"
              >
                Success Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => toast.error('Validation failed: Missing required skill parameter')}
                className="text-destructive border-destructive/30 hover:bg-destructive/10"
              >
                Error Toast
              </Button>
            </div>
          </section>

          {/* Section: Loading & Empty States */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <h3 className="text-lg font-semibold tracking-tight">Loading & Empty States</h3>
                <p className="text-xs text-muted-foreground">
                  Feedback mechanisms for asynchronous processing and empty data sets.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Loading & Spinner States</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Spinner size="sm" />
                    <Spinner size="default" />
                    <Spinner size="lg" variant="ai" />
                    <span className="text-xs text-muted-foreground font-mono">
                      Spinner (sm / default / lg ai-variant)
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-12 w-full rounded-xl" />
                </CardContent>
              </Card>

              <EmptyState
                icon={Briefcase}
                title="No Career Tracks Created"
                description="Create a career track to tailor resumes for specific roles (e.g. Full-Stack Engineer)."
                actionLabel="Create Track (Demo)"
                onAction={() => toast.info('Career track creation will be built in a future milestone.')}
              />
            </div>
          </section>
        </TabsContent>

        {/* TAB 2: COLORS & TOKENS */}
        <TabsContent value="colors" className="space-y-8">
          <div className="rounded-2xl border border-border/80 bg-card p-6">
            <h3 className="text-lg font-semibold tracking-tight mb-2">Color Palette Architecture</h3>
            <p className="text-sm text-muted-foreground mb-6">
              CSS variables defined with HSL format. Seamlessly adapts between dark obsidian mode and
              crisp light mode.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-primary shadow-sm ring-1 ring-border" />
                <span className="text-xs font-semibold block text-foreground">Primary</span>
                <span className="text-[10px] text-muted-foreground font-mono">Indigo/Violet</span>
              </div>

              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-ai shadow-sm ring-1 ring-border" />
                <span className="text-xs font-semibold block text-foreground">AI Accent</span>
                <span className="text-[10px] text-muted-foreground font-mono">Cyan/Teal</span>
              </div>

              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-secondary shadow-sm ring-1 ring-border" />
                <span className="text-xs font-semibold block text-foreground">Secondary</span>
                <span className="text-[10px] text-muted-foreground font-mono">Slate Muted</span>
              </div>

              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-background shadow-sm ring-1 ring-border" />
                <span className="text-xs font-semibold block text-foreground">Background</span>
                <span className="text-[10px] text-muted-foreground font-mono">Base Canvas</span>
              </div>

              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-card shadow-sm ring-1 ring-border" />
                <span className="text-xs font-semibold block text-foreground">Card</span>
                <span className="text-[10px] text-muted-foreground font-mono">Surface Panel</span>
              </div>

              <div className="space-y-1.5">
                <div className="h-16 rounded-xl bg-destructive shadow-sm ring-1 ring-border" />
                <span className="text-xs font-semibold block text-foreground">Destructive</span>
                <span className="text-[10px] text-muted-foreground font-mono">Crimson Red</span>
              </div>
            </div>

            <div className="mt-8 border-t border-border/60 pt-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                Semantic Status Indicators
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  <div>
                    <div className="text-xs font-semibold text-emerald-500">Success</div>
                    <div className="text-[10px] text-muted-foreground">High Match (90%+)</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  <div>
                    <div className="text-xs font-semibold text-amber-500">Warning</div>
                    <div className="text-[10px] text-muted-foreground">Unverified Claims</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 flex items-center gap-3">
                  <Info className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="text-xs font-semibold text-blue-500">Information</div>
                    <div className="text-[10px] text-muted-foreground">Spring Boot Status</div>
                  </div>
                </div>

                <div className="p-3 rounded-xl border border-destructive/30 bg-destructive/10 flex items-center gap-3">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <div>
                    <div className="text-xs font-semibold text-destructive">Error / Gap</div>
                    <div className="text-[10px] text-muted-foreground">Missing Requirement</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* TAB 3: TYPOGRAPHY */}
        <TabsContent value="typography" className="space-y-6">
          <div className="rounded-2xl border border-border/80 bg-card p-6 space-y-6">
            <div>
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
                Display 1 — font-extrabold
              </span>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground mt-1">
                Career Operating System
              </h1>
            </div>

            <div className="border-t border-border/40 pt-4">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
                Heading 2 — font-bold
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mt-1">
                AI Compatibility Scoring & Match Diagnostics
              </h2>
            </div>

            <div className="border-t border-border/40 pt-4">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
                Heading 3 — font-semibold
              </span>
              <h3 className="text-xl font-semibold tracking-tight text-foreground mt-1">
                Zero Fabrication Policy & Human-in-the-Loop Verification
              </h3>
            </div>

            <div className="border-t border-border/40 pt-4">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
                Body Regular — text-base
              </span>
              <p className="text-base text-foreground/90 leading-relaxed mt-1">
                JobAchiever AI ensures that every recommendation, tailored bullet point, and score
                is grounded solely in genuine user credentials. Skills are verified before
                integration into the career profile graph.
              </p>
            </div>

            <div className="border-t border-border/40 pt-4">
              <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-widest">
                Code / Monospace — JetBrains Mono
              </span>
              <pre className="mt-2 rounded-lg bg-muted/60 p-3 font-mono text-xs text-foreground overflow-x-auto">
                {`POST /api/v1/ai/match
Authorization: Bearer <jwt>
{ "careerTrackId": "4a71...", "jobDescriptionId": "8b92..." }`}
              </pre>
            </div>
          </div>
        </TabsContent>

        {/* TAB 4: INTERACTIVE & CHARTS */}
        <TabsContent value="interactive" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Compatibility Score Breakdown</CardTitle>
                  <Badge variant="ai" dot>
                    Recharts Demonstration
                  </Badge>
                </div>
                <CardDescription>
                  Visualization of explainable match criteria across dimensions.
                </CardDescription>
              </CardHeader>
              <CardContent className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sampleCompatibilityData}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="category"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: 'hsl(var(--card-foreground))',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="score"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#scoreGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Architecture Status</CardTitle>
                <CardDescription>Two-Tier Monorepo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Spring Boot</span>
                    <Badge variant="success" className="text-[10px]">Source of Truth</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Auth, Profiles, DB Persistence.
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>FastAPI</span>
                    <Badge variant="ai" className="text-[10px]">AI Engine</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Document Parsing, Semantic Matching.
                  </p>
                </div>

                <div className="rounded-xl border border-border/80 bg-muted/40 p-3 space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>PostgreSQL</span>
                    <Badge variant="outline" className="text-[10px]">Next Milestone</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Relational storage + pgvector embeddings.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
