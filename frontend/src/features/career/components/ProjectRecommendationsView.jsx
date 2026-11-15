import {
  Boxes,
  CheckCircle,
  Clock,
  Code2,
  FolderKanban,
  RotateCw,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function ProjectRecommendationsView({
  projectsData,
  onRecommendProjects,
  isGenerating = false,
  provider = 'GROQ',
  model = null,
}) {
  const projects = projectsData?.projects || [];

  return (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-card border border-border/70 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Multi-Skill Portfolio Projects
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Provider: {projectsData?.provider || provider} {projectsData?.model || model ? `(${projectsData?.model || model})` : ''}
            </span>
          </div>
          <h3 className="text-xl font-bold text-foreground mt-1">
            Production-Grade Portfolio Project Blueprints
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-2xl">
            Practical project architectures structured to eliminate multiple missing skill gaps simultaneously with demonstrable recruiter-facing deliverables.
          </p>
        </div>

        <button
          type="button"
          onClick={onRecommendProjects}
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 shrink-0"
        >
          {isGenerating ? (
            <>
              <Clock className="w-4 h-4 animate-spin" />
              <span>Architecting Projects...</span>
            </>
          ) : (
            <>
              {projects.length > 0 ? <RotateCw className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{projects.length > 0 ? 'Refresh Blueprints' : 'Generate Project Blueprints'}</span>
            </>
          )}
        </button>
      </div>

      {/* Projects List */}
      {projects.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-xl bg-card">
          <FolderKanban className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <h4 className="text-sm font-bold text-foreground">No Project Blueprints Generated</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Click &quot;Generate Project Blueprints&quot; to architect hands-on portfolio projects that prove your unevidenced skills.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((proj, idx) => (
            <ProjectCard key={idx} project={proj} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project }) {
  return (
    <div className="bg-card border border-border/70 rounded-xl p-5 shadow-sm space-y-4 hover:border-primary/40 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
              Portfolio Blueprint
            </span>
            <DifficultyBadge difficulty={project.estimatedDifficulty} />
          </div>
          <h4 className="text-base font-bold text-foreground mt-1">{project.title}</h4>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
            {project.description}
          </p>
        </div>
      </div>

      {/* Missing Skills Targeted */}
      {project.targetMissingSkills && project.targetMissingSkills.length > 0 && (
        <div className="p-3 bg-indigo-500/[0.04] border border-indigo-500/20 rounded-lg space-y-1.5">
          <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Eliminates Skill Gaps for:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {project.targetMissingSkills.map(skill => (
              <span
                key={skill}
                className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/30"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Architecture Overview */}
      {project.architectureOverview && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Boxes className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Architecture & Topology Overview:</span>
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed bg-muted/40 p-3 rounded-lg border border-border/50">
            {project.architectureOverview}
          </p>
        </div>
      )}

      {/* Key Deliverables */}
      {project.keyDeliverables && project.keyDeliverables.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-muted-foreground" />
            <span>Key Demonstrable Deliverables:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {project.keyDeliverables.map((deliv, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/30 p-2.5 rounded-lg border border-border/40"
              >
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span className="leading-snug">{deliv}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Portfolio Impact */}
      {project.portfolioImpact && (
        <div className="p-3 bg-emerald-500/[0.04] border border-emerald-500/20 rounded-lg text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
          <span className="font-semibold">Hiring Impact: </span>
          {project.portfolioImpact}
        </div>
      )}
    </div>
  );
}

function DifficultyBadge({ difficulty }) {
  const isAdv = difficulty === 'ADVANCED';
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
        isAdv
          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
      }`}
    >
      {difficulty || 'INTERMEDIATE'}
    </span>
  );
}
