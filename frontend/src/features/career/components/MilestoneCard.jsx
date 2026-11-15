import React from 'react';
import {
  CheckCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Flame,
  Link as LinkIcon,
  MessageSquare,
} from 'lucide-react';

export default function MilestoneCard({ milestone, onUpdateStatus, onSaveNotes }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [notes, setNotes] = React.useState(milestone.personalNotes || '');
  const [evidenceUrl, setEvidenceUrl] = React.useState('');
  const [evidenceLinks, setEvidenceLinks] = React.useState(milestone.evidenceLinks || []);
  const [isSaving, setIsSaving] = React.useState(false);

  const status = milestone.status || 'NOT_STARTED';
  const isCompleted = status === 'COMPLETED';
  const isInProgress = status === 'IN_PROGRESS';
  const isBlocked = status === 'BLOCKED';

  const handleStatusChange = async newStatus => {
    if (newStatus === status) return;
    await onUpdateStatus(milestone.id, {
      status: newStatus,
      completedAt: newStatus === 'COMPLETED' ? new Date().toISOString() : null,
    });
  };

  const handleSaveNotes = async () => {
    setIsSaving(true);
    try {
      await onSaveNotes(milestone.id, {
        personalNotes: notes,
        evidenceLinks,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddEvidenceLink = () => {
    if (!evidenceUrl.trim()) return;
    const updated = [...evidenceLinks, evidenceUrl.trim()];
    setEvidenceLinks(updated);
    setEvidenceUrl('');
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        isCompleted
          ? 'bg-emerald-500/[0.03] border-emerald-500/30'
          : isBlocked
          ? 'bg-rose-500/[0.03] border-rose-500/30'
          : isInProgress
          ? 'bg-card border-primary/40 shadow-sm'
          : 'bg-card border-border/70 hover:border-border'
      }`}
    >
      <div className="p-4 sm:p-5 space-y-3">
        {/* Header line */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Phase {milestone.phaseNumber} Milestone
              </span>
              <PriorityBadge priority={milestone.priority} />
              {milestone.completedAt && (
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Completed
                </span>
              )}
            </div>

            <h4
              className={`text-base font-bold transition-colors ${
                isCompleted ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}
            >
              {milestone.title}
            </h4>

            {milestone.description && (
              <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
                {milestone.description}
              </p>
            )}
          </div>

          {/* Status selector & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={status}
              onChange={e => handleStatusChange(e.target.value)}
              className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border focus:outline-none transition-colors ${
                isCompleted
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : isBlocked
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : isInProgress
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-background text-muted-foreground border-border'
              }`}
            >
              <option value="NOT_STARTED">Not Started</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="BLOCKED">Blocked</option>
            </select>

            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
              aria-label={isExpanded ? 'Collapse milestone details' : 'Expand milestone details'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Related Skills Tags */}
        {milestone.relatedSkills && milestone.relatedSkills.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] text-muted-foreground font-medium">Skills Targeted:</span>
            {milestone.relatedSkills.map(skill => (
              <span
                key={skill}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Tasks Checklist */}
        {milestone.tasks && milestone.tasks.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-semibold text-foreground">Actionable Tasks:</span>
            <div className="grid grid-cols-1 gap-1.5">
              {milestone.tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg border border-border/40"
                >
                  <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <span>{task.description}</span>
                    {task.taskType && (
                      <span className="ml-2 text-[9px] uppercase px-1 py-0.2 rounded bg-muted text-muted-foreground font-medium">
                        {task.taskType}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Section: Completion Criteria & Notes */}
        {isExpanded && (
          <div className="space-y-4 pt-3 border-t border-border/60 animate-in fade-in">
            {/* Completion Criteria */}
            {milestone.completionCriteria && milestone.completionCriteria.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-foreground">Demonstrable Completion Criteria:</span>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {milestone.completionCriteria.map((criterion, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span>{criterion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Personal Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Personal Learning Notes & Evidence</span>
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Log your learning breakthroughs, repository links, or blockers..."
                rows={3}
                className="w-full text-xs p-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Evidence Links */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Artifact / Repo Links</span>
              </span>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={evidenceUrl}
                  onChange={e => setEvidenceUrl(e.target.value)}
                  placeholder="https://github.com/..."
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={handleAddEvidenceLink}
                  className="px-3 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                >
                  Add Link
                </button>
              </div>

              {evidenceLinks.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {evidenceLinks.map((link, idx) => (
                    <a
                      key={idx}
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline bg-primary/5 px-2 py-0.5 rounded border border-primary/20"
                    >
                      <ExternalLink className="w-2.5 h-2.5" />
                      <span className="truncate max-w-[200px]">{link}</span>
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Notes & Evidence'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PriorityBadge({ priority }) {
  if (priority === 'CRITICAL') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <Flame className="w-2.5 h-2.5 fill-current" /> Critical
      </span>
    );
  }
  if (priority === 'HIGH') {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        High Priority
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
      Medium
    </span>
  );
}
