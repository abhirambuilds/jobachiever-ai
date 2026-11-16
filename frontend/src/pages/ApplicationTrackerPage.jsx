import { useState, useEffect, useCallback } from 'react';
import {
  Kanban,
  Building2,
  Calendar,
  DollarSign,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Search,
  Filter,
  Briefcase,
  X,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SimulatedResultBadge } from '@/components/demo';
import { isDemoMode } from '@/demo/demoConfig';
import { demoService } from '@/demo/demoService';

const STAGES = [
  { id: 'SAVED', title: 'Saved', color: 'slate', border: 'border-slate-500/30', bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400' },
  { id: 'APPLIED', title: 'Applied', color: 'blue', border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  { id: 'INTERVIEWING', title: 'Interviewing', color: 'indigo', border: 'border-indigo-500/30', bg: 'bg-indigo-500/10', text: 'text-indigo-600 dark:text-indigo-400' },
  { id: 'OFFER', title: 'Offer', color: 'emerald', border: 'border-emerald-500/30', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'REJECTED', title: 'Archived', color: 'rose', border: 'border-rose-500/30', bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400' },
];

export function ApplicationTrackerPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [notesDraft, setNotesDraft] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newAppForm, setNewAppForm] = useState({
    company: '',
    role: '',
    careerTrackId: 'track-demo-backend',
    careerTrackName: 'Backend Software Engineer',
    stage: 'SAVED',
    salary: '$120,000 - $140,000',
    location: 'Remote',
    matchScore: 85,
    nextStep: 'Research engineering blog and team structure',
    notes: '',
  });

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      if (isDemoMode()) {
        const apps = await demoService.getApplications();
        setApplications(apps);
      } else {
        // Fallback for live environments
        setApplications([]);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();

    const handleReset = () => {
      loadApplications();
    };

    window.addEventListener('jobachiever:demo-state-reset', handleReset);
    return () => window.removeEventListener('jobachiever:demo-state-reset', handleReset);
  }, [loadApplications]);

  const handleStageChange = async (appId, newStage) => {
    // Optimistic update
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, stage: newStage } : app))
    );

    if (isDemoMode()) {
      await demoService.updateApplicationStage(appId, newStage);
    }
  };

  const handleSaveNotes = async (appId) => {
    setApplications((prev) =>
      prev.map((app) => (app.id === appId ? { ...app, notes: notesDraft } : app))
    );
    setEditingNotesId(null);

    if (isDemoMode()) {
      await demoService.updateApplicationNotes(appId, notesDraft);
    }
  };

  const handleDelete = async (appId) => {
    setApplications((prev) => prev.filter((app) => app.id !== appId));
    if (isDemoMode()) {
      await demoService.deleteApplication(appId);
    }
  };

  const handleCreateApplication = async (e) => {
    e.preventDefault();
    if (!newAppForm.company || !newAppForm.role) return;

    if (isDemoMode()) {
      const created = await demoService.addApplication(newAppForm);
      setApplications((prev) => [created, ...prev]);
    }

    setIsAddModalOpen(false);
    setNewAppForm({
      company: '',
      role: '',
      careerTrackId: 'track-demo-backend',
      careerTrackName: 'Backend Software Engineer',
      stage: 'SAVED',
      salary: '$120,000 - $140,000',
      location: 'Remote',
      matchScore: 85,
      nextStep: 'Research engineering blog and team structure',
      notes: '',
    });
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesTrack = selectedTrack === 'all' || app.careerTrackId === selectedTrack;
    const matchesSearch =
      searchQuery === '' ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTrack && matchesSearch;
  });

  // Calculate metrics
  const activeCount = applications.filter((a) => a.stage !== 'REJECTED').length;
  const interviewingCount = applications.filter((a) => a.stage === 'INTERVIEWING').length;
  const offerCount = applications.filter((a) => a.stage === 'OFFER').length;
  const avgMatch =
    applications.length > 0
      ? Math.round(
          applications.reduce((acc, curr) => acc + (curr.matchScore || 0), 0) /
            applications.length
        )
      : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Kanban className="w-7 h-7 text-primary" />
              <span>Job Application Pipeline</span>
            </h1>
            {isDemoMode() && <SimulatedResultBadge />}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Visual Kanban lifecycle tracking from saved opportunities to technical screens and offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            size="sm"
            className="gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </Button>
        </div>
      </div>

      {/* 2. Pipeline Metrics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 border-border/70 bg-card/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Active Applications
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{activeCount}</span>
            <span className="text-xs text-muted-foreground">in pipeline</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 bg-card/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider">
            In Interviews
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {interviewingCount}
            </span>
            <span className="text-xs text-muted-foreground">advancing</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 bg-card/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">
            Offers Extended
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {offerCount}
            </span>
            <span className="text-xs text-muted-foreground">decisions pending</span>
          </div>
        </Card>

        <Card className="p-4 border-border/70 bg-card/60 backdrop-blur-sm">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Avg Compatibility
          </p>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black text-foreground">{avgMatch}%</span>
            <span className="text-xs text-emerald-500 font-medium">ATS-aligned</span>
          </div>
        </Card>
      </div>

      {/* 3. Search & Track Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border/70">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by company or role..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground shrink-0 font-medium">Filter Track:</span>
          <button
            onClick={() => setSelectedTrack('all')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              selectedTrack === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted text-muted-foreground'
            }`}
          >
            All Tracks
          </button>
          <button
            onClick={() => setSelectedTrack('track-demo-backend')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              selectedTrack === 'track-demo-backend'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted text-muted-foreground'
            }`}
          >
            Backend Engineer
          </button>
          <button
            onClick={() => setSelectedTrack('track-demo-cloud')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              selectedTrack === 'track-demo-cloud'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted text-muted-foreground'
            }`}
          >
            Cloud Systems
          </button>
        </div>
      </div>

      {/* 4. Kanban 5-Column Board */}
      {loading ? (
        <div className="flex items-center justify-center p-16 text-muted-foreground gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Loading application pipeline...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
          {STAGES.map((stage) => {
            const stageApps = filteredApps.filter((a) => a.stage === stage.id);
            const stageIndex = STAGES.findIndex((s) => s.id === stage.id);

            return (
              <div
                key={stage.id}
                className="flex flex-col bg-muted/20 border border-border/80 rounded-xl p-3 min-h-[500px] space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-border/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${stage.bg} border ${stage.border}`} />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {stage.title}
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                    {stageApps.length}
                  </span>
                </div>

                {/* Column Card List */}
                <div className="space-y-3 flex-1">
                  {stageApps.length === 0 ? (
                    <div className="h-32 border border-dashed border-border/60 rounded-lg flex items-center justify-center p-3 text-center">
                      <p className="text-[11px] text-muted-foreground/60 italic">
                        No applications in {stage.title}
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {stageApps.map((app) => (
                        <motion.div
                          key={app.id}
                          layout
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Card className="p-3.5 border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all space-y-2.5">
                            {/* Card Top: Company & Match */}
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
                                <span className="text-xs font-bold text-foreground">
                                  {app.company}
                                </span>
                              </div>
                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  app.matchScore >= 90
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                    : app.matchScore >= 80
                                    ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                                }`}
                              >
                                {app.matchScore}% Match
                              </span>
                            </div>

                            {/* Role Title */}
                            <p className="text-xs font-medium text-foreground leading-snug line-clamp-2">
                              {app.role}
                            </p>

                            {/* Meta: Track, Location, Salary */}
                            <div className="space-y-1 text-[11px] text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Briefcase className="w-3 h-3 text-muted-foreground/80 shrink-0" />
                                <span className="truncate">{app.careerTrackName}</span>
                              </div>
                              {app.salary && (
                                <div className="flex items-center gap-1 text-foreground font-medium">
                                  <DollarSign className="w-3 h-3 text-emerald-500 shrink-0" />
                                  <span>{app.salary}</span>
                                </div>
                              )}
                              {app.location && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-muted-foreground/80 shrink-0" />
                                  <span className="truncate">{app.location}</span>
                                </div>
                              )}
                            </div>

                            {/* Next Scheduled Step Alert */}
                            {app.nextStep && (
                              <div className="p-2 rounded-lg bg-primary/5 border border-primary/15 text-[11px] space-y-0.5">
                                <div className="flex items-center gap-1 font-semibold text-primary">
                                  <Clock className="w-3 h-3 shrink-0" />
                                  <span>Next Step:</span>
                                </div>
                                <p className="text-muted-foreground leading-tight text-[10px]">
                                  {app.nextStep}
                                </p>
                              </div>
                            )}

                            {/* Application Date */}
                            {app.appliedDate && (
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                <Calendar className="w-3 h-3 shrink-0" />
                                <span>Applied: {app.appliedDate}</span>
                              </div>
                            )}

                            {/* Notes Section with Inline Edit */}
                            <div className="pt-1 border-t border-border/50 text-[11px]">
                              {editingNotesId === app.id ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    value={notesDraft}
                                    onChange={(e) => setNotesDraft(e.target.value)}
                                    rows={2}
                                    className="w-full p-1.5 text-[11px] rounded bg-muted border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                                    placeholder="Add interview notes or prep steps..."
                                  />
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      onClick={() => setEditingNotesId(null)}
                                      className="px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted rounded"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() => handleSaveNotes(app.id)}
                                      className="px-2 py-0.5 text-[10px] bg-primary text-primary-foreground rounded font-medium"
                                    >
                                      Save
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="group/note flex items-start justify-between gap-1">
                                  <p className="text-[10px] text-muted-foreground italic line-clamp-2">
                                    {app.notes ? `"${app.notes}"` : 'No notes added yet.'}
                                  </p>
                                  <button
                                    onClick={() => {
                                      setEditingNotesId(app.id);
                                      setNotesDraft(app.notes || '');
                                    }}
                                    className="opacity-0 group-hover/note:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-opacity"
                                    title="Edit notes"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Stage Transition Actions */}
                            <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-1">
                              {stageIndex > 0 ? (
                                <button
                                  onClick={() => handleStageChange(app.id, STAGES[stageIndex - 1].id)}
                                  className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted text-[10px] flex items-center gap-0.5"
                                  title={`Move back to ${STAGES[stageIndex - 1].title}`}
                                >
                                  <ArrowLeft className="w-3 h-3" />
                                  <span className="hidden sm:inline">Back</span>
                                </button>
                              ) : (
                                <div />
                              )}

                              {/* Delete Action */}
                              <button
                                onClick={() => handleDelete(app.id)}
                                className="p-1 text-muted-foreground hover:text-rose-500 rounded hover:bg-rose-500/10 transition-colors"
                                title="Delete application"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>

                              {stageIndex < STAGES.length - 1 ? (
                                <button
                                  onClick={() => handleStageChange(app.id, STAGES[stageIndex + 1].id)}
                                  className="p-1 rounded text-primary hover:bg-primary/10 text-[10px] flex items-center gap-0.5 font-medium"
                                  title={`Advance to ${STAGES[stageIndex + 1].title}`}
                                >
                                  <span className="hidden sm:inline">Advance</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <div />
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Add Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <Card className="w-full max-w-lg p-5 border-border bg-card shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Plus className="w-4 h-4 text-primary" />
                <span>Track New Job Application</span>
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Company Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Netflix, Apple, Airbnb"
                  value={newAppForm.company}
                  onChange={(e) => setNewAppForm({ ...newAppForm, company: e.target.value })}
                  className="w-full mt-1 p-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Position Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Distributed Systems Engineer"
                  value={newAppForm.role}
                  onChange={(e) => setNewAppForm({ ...newAppForm, role: e.target.value })}
                  className="w-full mt-1 p-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Career Track</label>
                  <select
                    value={newAppForm.careerTrackId}
                    onChange={(e) => {
                      const trackName =
                        e.target.value === 'track-demo-cloud'
                          ? 'Cloud Systems & DevOps'
                          : 'Backend Software Engineer';
                      setNewAppForm({
                        ...newAppForm,
                        careerTrackId: e.target.value,
                        careerTrackName: trackName,
                      });
                    }}
                    className="w-full mt-1 p-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    <option value="track-demo-backend">Backend Software Engineer</option>
                    <option value="track-demo-cloud">Cloud Systems & DevOps</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Initial Stage</label>
                  <select
                    value={newAppForm.stage}
                    onChange={(e) => setNewAppForm({ ...newAppForm, stage: e.target.value })}
                    className="w-full mt-1 p-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground">Salary / Compensation</label>
                  <input
                    type="text"
                    placeholder="e.g. $130,000 - $150,000"
                    value={newAppForm.salary}
                    onChange={(e) => setNewAppForm({ ...newAppForm, salary: e.target.value })}
                    className="w-full mt-1 p-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Remote / San Francisco, CA"
                    value={newAppForm.location}
                    onChange={(e) => setNewAppForm({ ...newAppForm, location: e.target.value })}
                    className="w-full mt-1 p-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Next Scheduled Action</label>
                <input
                  type="text"
                  placeholder="e.g. Recruiter phone screen on Tuesday"
                  value={newAppForm.nextStep}
                  onChange={(e) => setNewAppForm({ ...newAppForm, nextStep: e.target.value })}
                  className="w-full mt-1 p-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Notes / Strategy</label>
                <textarea
                  rows={2}
                  placeholder="Key keywords, referral contacts, or talking points..."
                  value={newAppForm.notes}
                  onChange={(e) => setNewAppForm({ ...newAppForm, notes: e.target.value })}
                  className="w-full mt-1 p-2 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Add Application
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export default ApplicationTrackerPage;
