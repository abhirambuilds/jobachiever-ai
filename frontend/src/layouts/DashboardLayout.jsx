import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  UserCheck,
  Layers,
  FileText,
  FileSearch,
  Compass,
  Target,
  Kanban,
  FileSignature,
  Globe,
  GraduationCap,
  Bot,
  Settings,
  Search,
  Bell,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Sparkles,
  Check,
  LogOut,
  Zap,
} from 'lucide-react';

import { useProfile } from '@/hooks/useProfile';
import { useAiPreferences } from '@/hooks/useAiPreferences';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { Toaster, toast } from '@/components/ui/toast';
import { DemoModeBanner, DemoTourGuide } from '@/components/demo';

const navItems = [
  { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'My Profile', path: '/profile', icon: UserCheck },
  { label: 'Career Tracks', path: '/tracks', icon: Layers },
  { label: 'Resume Library', path: '/resumes', icon: FileText },
  { label: 'Resume Studio', path: '/resume-studio', icon: Sparkles },
  { label: 'Resume Analyzer', path: '/resume-analyzer', icon: FileSearch },
  { label: 'JD Analyzer', path: '/jd-analyzer', icon: FileSearch },
  { label: 'Job Discovery', path: '/jobs', icon: Compass, upcoming: true },
  { label: 'Job Matching', path: '/job-matcher', icon: Target },
  { label: 'Applications', path: '/applications', icon: Kanban },
  { label: 'Cover Letters', path: '/cover-letters', icon: FileSignature, upcoming: true },
  { label: 'Portfolio', path: '/portfolio', icon: Globe, upcoming: true },
  { label: 'Interview Prep', path: '/interviews', icon: GraduationCap, upcoming: true },
  { label: 'Career Intelligence', path: '/career-assistant', icon: Bot },
  { label: 'Settings', path: '/settings/ai', icon: Settings },
];

const AI_PROVIDERS = [
  { id: 'GROQ', name: 'Groq', model: 'Llama 3.3 70B', icon: Zap },
  { id: 'GEMINI', name: 'Google Gemini', model: 'Gemini 2.0 Flash', icon: Sparkles },
];

export function DashboardLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { selectedProvider: activeProvId, updatePreferences: updateAiPrefs } = useAiPreferences();
  const selectedProvider = AI_PROVIDERS.find((p) => p.id === activeProvId) || AI_PROVIDERS[0];
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Profile Completeness High',
      time: '1h ago',
      read: false,
    },
    {
      id: 2,
      title: 'Explainable Match Engine Ready',
      time: '3h ago',
      read: false,
    },
  ]);

  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useProfile();

  const fullName = profile.personalInfo.fullName || 'Candidate';
  const email = profile.personalInfo.email || 'user@example.com';
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleProviderSelect = (provider) => {
    updateAiPrefs({ selectedProvider: provider.id });
    toast.success(`AI provider switched to ${provider.name} (${provider.model})`);
  };

  const dismissNotification = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // Determine current section breadcrumb
  const currentNavItem = navItems.find(
    (item) =>
      item.path === location.pathname ||
      (item.path === '/job-matcher' && location.pathname === '/job-match') ||
      (item.path === '/jd-analyzer' && location.pathname === '/jobs/analyze')
  );
  const breadcrumbTitle = currentNavItem?.label || 'Command Center';

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        <DemoModeBanner />
        <div className="flex flex-1 overflow-hidden">
        {/* =========================================================================
            DESKTOP SIDEBAR
            ========================================================================= */}
        <aside
          className={`hidden md:flex flex-col border-r border-border/70 bg-card/75 backdrop-blur-md transition-all duration-300 z-30 shrink-0 ${
            isCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          {/* Sidebar Header Brand */}
          <div className="flex h-16 items-center justify-between border-b border-border/60 px-4">
            <Link
              to="/dashboard"
              className={`flex items-center gap-2.5 overflow-hidden transition-all ${
                isCollapsed ? 'justify-center w-full' : ''
              }`}
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-primary via-indigo-600 to-cyan-400 text-white shadow-glow-sm">
                <Sparkles className="h-5 w-5" />
              </div>
              {!isCollapsed && (
                <div className="flex flex-col truncate">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold tracking-tight text-foreground truncate">
                      JobAchiever<span className="text-primary font-extrabold">.AI</span>
                    </span>
                    <Badge variant="ai" className="text-[9px] px-1 py-0">
                      v1.0
                    </Badge>
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Career Operating System
                  </span>
                </div>
              )}
            </Link>

            {/* Collapse / Expand Toggle Button */}
            {!isCollapsed && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(true)}
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Navigation Links Scrollable Area */}
          <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.path ||
                (item.path === '/job-matcher' && location.pathname === '/job-match') ||
                (item.path === '/jd-analyzer' && location.pathname === '/jobs/analyze');

              const linkContent = (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs sm:text-sm font-medium transition-all ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'border border-primary/30 bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}
                  />
                  {!isCollapsed && (
                    <div className="flex flex-1 items-center justify-between truncate">
                      <span className="truncate">{item.label}</span>
                      {item.upcoming && (
                        <span className="text-[9px] uppercase tracking-wider text-muted-foreground/70 font-mono">
                          Soon
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right">
                      <div className="flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.upcoming && (
                          <Badge variant="outline" className="text-[9px]">
                            Milestone
                          </Badge>
                        )}
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </div>

          {/* Collapsed Expand Trigger in footer if collapsed */}
          {isCollapsed && (
            <div className="p-3 border-t border-border/50 flex justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                aria-label="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Sidebar User Profile Section at Bottom */}
          <div className="border-t border-border/60 p-3 bg-muted/20">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex items-center gap-3 w-full rounded-xl p-2 text-left hover:bg-accent transition-colors ${
                    isCollapsed ? 'justify-center' : ''
                  }`}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary font-bold text-xs border border-primary/30">
                    {initials}
                  </div>
                  {!isCollapsed && (
                    <div className="flex flex-col truncate flex-1">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {fullName}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {email}
                      </span>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isCollapsed ? 'center' : 'start'} className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs text-foreground">{fullName}</span>
                    <span className="text-[10px] text-muted-foreground font-normal truncate">
                      {email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <UserCheck className="mr-2 h-4 w-4 text-primary" />
                  <span>Master Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/onboarding')}>
                  <Sparkles className="mr-2 h-4 w-4 text-cyan-400" />
                  <span>Onboarding Wizard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings/ai')}>
                  <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>AI Provider Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/login')} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* =========================================================================
            RIGHT MAIN WRAPPER (Top bar + scrollable content)
            ========================================================================= */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Bar Header */}
          <header className="flex h-16 items-center justify-between border-b border-border/60 bg-card/60 backdrop-blur-md px-4 sm:px-6 z-20 shrink-0">
            {/* Left: Mobile hamburger & Breadcrumb */}
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden h-9 w-9 text-muted-foreground"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <div className="flex items-center gap-2 text-xs font-medium">
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Workspace
                </Link>
                <span className="text-muted-foreground/60">/</span>
                <span className="font-semibold text-foreground">{breadcrumbTitle}</span>
              </div>
            </div>

            {/* Center: Global Search Simulation */}
            <div className="hidden lg:flex items-center max-w-sm w-full mx-4">
              <div
                onClick={() => toast.info('Global Search / Command Palette will index profiles & applications in Milestone 8.')}
                className="flex items-center justify-between w-full h-9 rounded-xl border border-input bg-background/50 px-3 text-xs text-muted-foreground cursor-pointer hover:border-primary/50 transition-colors shadow-xs"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Search skills, jobs, applications...</span>
                </span>
                <kbd className="rounded border border-border/70 bg-muted/60 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
            </div>

            {/* Right: Actions, AI Selector, Notifications, ThemeToggle, User Menu */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              {/* AI Provider Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs border-border/80 bg-background/60"
                  >
                    <selectedProvider.icon className="h-3.5 w-3.5 text-cyan-400" />
                    <span className="hidden sm:inline font-semibold">{selectedProvider.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Active AI Inference Engine
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {AI_PROVIDERS.map((prov) => {
                    const Icon = prov.icon;
                    const isSelected = selectedProvider.id === prov.id;
                    return (
                      <DropdownMenuItem
                        key={prov.id}
                        onClick={() => handleProviderSelect(prov)}
                        className="flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-primary" />
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold">{prov.name}</span>
                            <span className="text-[10px] text-muted-foreground">{prov.model}</span>
                          </div>
                        </div>
                        {isSelected && <Check className="h-4 w-4 text-primary" />}
                      </DropdownMenuItem>
                    );
                  })}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings/ai')} className="text-xs text-primary cursor-pointer">
                    <Settings className="mr-2 h-3.5 w-3.5" />
                    <span>AI Provider Settings</span>
                  </DropdownMenuItem>
                  <div className="p-2 text-[10px] text-muted-foreground">
                    100% User-Selected. No automatic silent routing.
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Notifications Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 text-muted-foreground hover:text-foreground"
                    aria-label="Notifications"
                  >
                    <Bell className="h-4 w-4" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-400" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72">
                  <div className="flex items-center justify-between p-2 px-3 border-b border-border/50">
                    <span className="text-xs font-semibold text-foreground">Notifications</span>
                    <Badge variant="outline" className="text-[10px]">
                      {notifications.length} New
                    </Badge>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-border/40">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        className="p-3 text-xs flex items-start justify-between gap-2 hover:bg-muted/40 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <p className="font-semibold text-foreground">{n.title}</p>
                          <span className="text-[10px] text-muted-foreground">{n.time}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => dismissNotification(n.id, e)}
                          className="text-muted-foreground hover:text-foreground text-[10px] p-1"
                          aria-label="Dismiss"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        All notifications cleared.
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Theme Toggle */}
              <ThemeToggle className="h-8 w-8" />
            </div>
          </header>

          {/* Mobile Drawer Navigation */}
          {mobileMenuOpen && (
            <div className="border-b border-border/80 bg-background/95 p-4 md:hidden animate-in slide-in-from-top-2 z-40 max-h-[80vh] overflow-y-auto">
              <nav className="flex flex-col space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                location.pathname === item.path ||
                (item.path === '/job-matcher' && location.pathname === '/job-match') ||
                (item.path === '/jd-analyzer' && location.pathname === '/jobs/analyze');
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.upcoming && (
                        <span className="text-[10px] text-muted-foreground">Milestone</span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Main Scrollable Dashboard Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
      <DemoTourGuide />
      </div>
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  );
}
