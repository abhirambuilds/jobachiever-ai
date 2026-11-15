import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Flame,
  HelpCircle,
  Info,
  Search,
  X,
} from 'lucide-react';

export default function SkillGapExplorer({ skillGapData }) {
  const [activeFilter, setActiveFilter] = React.useState('ALL');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedSkill, setSelectedSkill] = React.useState(null);

  const allSkills = skillGapData?.allEvaluatedSkills || [
    ...(skillGapData?.criticalPriorities || []),
    ...(skillGapData?.missingEvidenceSkills || []),
    ...(skillGapData?.developingSkills || []),
    ...(skillGapData?.demonstratedSkills || []),
  ];

  // Deduplicate by canonicalName
  const uniqueSkillsMap = new Map();
  allSkills.forEach(skill => {
    if (skill.canonicalName && !uniqueSkillsMap.has(skill.canonicalName)) {
      uniqueSkillsMap.set(skill.canonicalName, skill);
    }
  });
  const uniqueSkills = Array.from(uniqueSkillsMap.values());

  const filteredSkills = uniqueSkills.filter(skill => {
    const matchesSearch =
      skill.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (skill.category && skill.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === 'CRITICAL') return skill.priorityLevel === 'CRITICAL' || skill.priorityScore >= 90;
    if (activeFilter === 'MISSING') return skill.classification === 'MISSING_EVIDENCE' || skill.evidenceStatus === 'MISSING';
    if (activeFilter === 'DEVELOPING') return skill.classification === 'DEVELOPING' || skill.evidenceStatus === 'EVIDENCED';
    if (activeFilter === 'DEMONSTRATED') return skill.classification === 'STRONG' || skill.evidenceStatus === 'CONFIRMED';
    return true;
  });

  return (
    <div className="bg-card border border-border/70 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground">Skill Gap Explorer</h3>
          <p className="text-xs text-muted-foreground">
            Inspect individual skills, priority weights, and candidate evidence verified across your profile.
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border/60 pb-3">
        {[
          { id: 'ALL', label: `All Skills (${uniqueSkills.length})` },
          { id: 'CRITICAL', label: `Critical Priority (${uniqueSkills.filter(s => s.priorityLevel === 'CRITICAL' || s.priorityScore >= 90).length})`, icon: Flame },
          { id: 'MISSING', label: `Missing Evidence (${uniqueSkills.filter(s => s.classification === 'MISSING_EVIDENCE').length})` },
          { id: 'DEVELOPING', label: `Developing (${uniqueSkills.filter(s => s.classification === 'DEVELOPING').length})` },
          { id: 'DEMONSTRATED', label: `Demonstrated (${uniqueSkills.filter(s => s.classification === 'STRONG').length})` },
        ].map(filter => {
          const Icon = filter.icon;
          const isActive = activeFilter === filter.id;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => setActiveFilter(filter.id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/70'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{filter.label}</span>
            </button>
          );
        })}
      </div>

      {/* Skill List */}
      <div className="space-y-2">
        {filteredSkills.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-lg">
            <HelpCircle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-xs font-medium text-foreground">No matching skills found</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Try adjusting your search query or filters.</p>
          </div>
        ) : (
          filteredSkills.map(skill => (
            <div
              key={skill.canonicalName}
              onClick={() => setSelectedSkill(skill)}
              className="flex items-center justify-between p-3 rounded-lg border border-border/60 hover:border-primary/40 bg-card hover:bg-muted/30 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                  {skill.priorityScore}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                      {skill.canonicalName}
                    </span>
                    <span className="text-[10px] text-muted-foreground uppercase px-1.5 py-0.5 bg-muted rounded">
                      {skill.category || 'TECHNICAL'}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 max-w-lg">
                    {skill.importanceRationale || 'Essential capability for target role benchmark.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Priority Badge */}
                <PriorityBadge level={skill.priorityLevel} score={skill.priorityScore} />

                {/* Classification Badge */}
                <ClassificationBadge classification={skill.classification} />

                {/* Evidence Status */}
                <EvidenceStatusBadge status={skill.evidenceStatus} />

                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Inspection Modal */}
      {selectedSkill && (
        <SkillDetailModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
        />
      )}
    </div>
  );
}

function PriorityBadge({ level, score }) {
  const isCritical = level === 'CRITICAL' || score >= 90;
  const isHigh = level === 'HIGH' || (score >= 70 && score < 90);
  const isMedium = level === 'MEDIUM' || (score >= 50 && score < 70);

  if (isCritical) {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
        <Flame className="w-3 h-3 fill-current" /> Critical
      </span>
    );
  }
  if (isHigh) {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        High Priority
      </span>
    );
  }
  if (isMedium) {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
        Medium
      </span>
    );
  }
  return (
    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
      Low
    </span>
  );
}

function ClassificationBadge({ classification }) {
  if (classification === 'STRONG') {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
        Demonstrated
      </span>
    );
  }
  if (classification === 'DEVELOPING') {
    return (
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        Developing
      </span>
    );
  }
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
      Missing Evidence
    </span>
  );
}

function EvidenceStatusBadge({ status }) {
  if (status === 'CONFIRMED') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" /> Confirmed
      </span>
    );
  }
  if (status === 'EVIDENCED') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-blue-600 dark:text-blue-400">
        <Info className="w-3 h-3" /> Evidenced
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
      <AlertCircle className="w-3 h-3" /> No Evidence
    </span>
  );
}

function SkillDetailModal({ skill, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 space-y-4 animate-in fade-in zoom-in-95">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                {skill.category || 'TECHNICAL SKILL'}
              </span>
              <PriorityBadge level={skill.priorityLevel} score={skill.priorityScore} />
            </div>
            <h3 className="text-xl font-bold text-foreground mt-1">{skill.canonicalName}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Priority Score Breakdown */}
        <div className="p-3.5 bg-muted/40 border border-border/60 rounded-lg space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground">Priority Score: {skill.priorityScore} / 100</span>
            <span className="text-[11px] text-muted-foreground">Formula Weighted</span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Computed from 35% target role importance, 20% job specification frequency, 20% track relevance, 15% skill dependency graph, and 10% career goal alignment.
          </p>
        </div>

        {/* Rationale */}
        <div className="space-y-1">
          <h4 className="text-xs font-semibold text-foreground">Strategic Importance</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {skill.importanceRationale || 'Critical technical competence required for target role progression.'}
          </p>
        </div>

        {/* Prerequisites */}
        {skill.prerequisites && skill.prerequisites.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="text-xs font-semibold text-foreground">Prerequisite Dependencies</h4>
            <div className="flex flex-wrap gap-1.5">
              {skill.prerequisites.map(pre => (
                <span key={pre} className="text-[11px] font-medium px-2 py-0.5 bg-muted rounded-md text-foreground">
                  {pre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Candidate Evidence */}
        <div className="space-y-1.5">
          <h4 className="text-xs font-semibold text-foreground">Verified Candidate Evidence</h4>
          {skill.candidateEvidence && skill.candidateEvidence.length > 0 ? (
            <ul className="space-y-1">
              {skill.candidateEvidence.map((ev, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400">
              Zero evidence found in candidate verified profile or project descriptions. Advised to complete recommended portfolio milestones.
            </div>
          )}
        </div>

        {/* Target Roles */}
        {skill.requiredForRoles && skill.requiredForRoles.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-border/60">
            <span className="text-[11px] text-muted-foreground">Directly required for roles:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {skill.requiredForRoles.map(role => (
                <span key={role} className="text-[10px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
