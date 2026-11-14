import { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';

export function JobTailorModal() {
  const { tailorModalOpen, setTailorModalOpen, tailorResumeForJob, resume } = useResumeStudio();

  const [jobTitle, setJobTitle] = useState(resume?.targetJobTitle || 'Senior Full-Stack Engineer');
  const [targetCompany, setTargetCompany] = useState('');
  const [skillTags, setSkillTags] = useState('React, TypeScript, Spring Boot, PostgreSQL, Microservices, REST APIs, Docker');

  if (!tailorModalOpen) return null;

  const handleApply = (e) => {
    e.preventDefault();
    const skillsList = skillTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    tailorResumeForJob(jobTitle, skillsList);
    setTailorModalOpen(false);
  };

  const sampleRoles = [
    {
      title: 'Senior Full-Stack Engineer',
      skills: 'React, Spring Boot, Java, PostgreSQL, Tailwind, Docker, Vite',
    },
    {
      title: 'Backend Systems Architect',
      skills: 'Java 21, Spring Boot 3, Distributed Systems, pgvector, Microservices, Redis',
    },
    {
      title: 'Lead Frontend Developer',
      skills: 'React 18, TypeScript, Tailwind CSS, shadcn/ui, State Management, Vitest',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-lg flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Tailor Resume for Job Opportunity</h3>
              <p className="text-[11px] text-muted-foreground">Reorder and prioritize skills for specific ATS requirements</p>
            </div>
          </div>
          <button
            onClick={() => setTailorModalOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleApply} className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Target Job Title
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-muted-foreground absolute left-2.5 top-2.5" />
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Full-Stack Engineer"
                className="w-full text-xs pl-8 pr-3 py-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Company (Optional)
            </label>
            <input
              type="text"
              value={targetCompany}
              onChange={(e) => setTargetCompany(e.target.value)}
              placeholder="e.g. Stripe, Linear, Vercel"
              className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
              Priority ATS Keywords & Skills (Comma-separated)
            </label>
            <textarea
              rows={3}
              value={skillTags}
              onChange={(e) => setSkillTags(e.target.value)}
              placeholder="React, Java, Spring Boot, PostgreSQL..."
              className="w-full text-xs p-2.5 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary leading-relaxed font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              These skills will be promoted to the front of your technical proficiencies matrix.
            </p>
          </div>

          {/* Quick presets */}
          <div className="space-y-1.5 pt-1 border-t border-border/60">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Quick Role Presets
            </span>
            <div className="grid grid-cols-1 gap-1.5">
              {sampleRoles.map((role, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setJobTitle(role.title);
                    setSkillTags(role.skills);
                  }}
                  className="w-full text-left p-2 rounded-lg border border-border hover:bg-muted/50 text-xs flex items-center justify-between transition-colors"
                >
                  <span className="font-semibold text-foreground">{role.title}</span>
                  <span className="text-[10px] font-mono text-muted-foreground truncate max-w-[200px]">
                    {role.skills}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setTailorModalOpen(false)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Tailor Resume</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
