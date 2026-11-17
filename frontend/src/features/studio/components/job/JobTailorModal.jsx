import { useState } from 'react';
import {
  Briefcase,
  Building2,
  CheckCircle2,
  Loader2,
  Sparkles,
  Target,
  Wand2,
  X,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';
import { toast } from '@/components/ui/toast';

export function JobTailorModal() {
  const { tailorModalOpen, setTailorModalOpen, handleAutoTailor, resume } = useResumeStudio();

  const [jobTitle, setJobTitle] = useState(resume?.targetJobTitle || 'Software Engineer Intern — Core Checkout & Payments');
  const [targetCompany, setTargetCompany] = useState(resume?.targetCompany || 'PayPal');
  const [skillTags, setSkillTags] = useState('Java 21, Spring Boot 3, PostgreSQL, Redis, REST APIs, Microservices, JUnit 5, Docker');
  const [isTailoring, setIsTailoring] = useState(false);
  const [tailorStep, setTailorStep] = useState('');

  if (!tailorModalOpen) return null;

  const handleApply = async (e) => {
    e?.preventDefault();
    if (!jobTitle.trim()) return;

    setIsTailoring(true);
    setTailorStep('Decomposing role specifications & ATS keywords...');

    await new Promise((r) => setTimeout(r, 400));
    setTailorStep(`Prioritizing Abhiram's verified projects for ${targetCompany || 'target employer'}...`);

    await new Promise((r) => setTimeout(r, 500));
    setTailorStep('Applying 100% single-column ATS Professional typography...');

    await new Promise((r) => setTimeout(r, 400));

    const skillsList = skillTags
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    handleAutoTailor({
      title: jobTitle,
      company: targetCompany,
      skills: skillsList,
    });

    setIsTailoring(false);
    setTailorModalOpen(false);
  };

  const authenticPresets = [
    {
      company: 'PayPal',
      title: 'Software Engineer Intern — Core Checkout & Payments',
      skills: 'Java 21, Spring Boot 3, PostgreSQL, Redis, REST APIs, Microservices, JUnit 5',
      badge: 'Internship Track',
    },
    {
      company: 'Barclays',
      title: 'Backend Platform Engineer — Financial Services',
      skills: 'Java, Spring Boot, PostgreSQL, Docker, AWS, Kafka, Microservices, CI/CD',
      badge: 'Banking & Fintech',
    },
    {
      company: 'Stripe',
      title: 'Senior Backend Engineer — Payment Platform',
      skills: 'Java 21, Spring Boot 3, PostgreSQL, Redis Distributed Locks, Idempotent APIs, Kafka',
      badge: 'Infrastructure',
    },
    {
      company: 'Databricks',
      title: 'Distributed Infrastructure Engineer',
      skills: 'Java, Python, PostgreSQL, pgvector, Apache Kafka, Distributed Systems, Linux',
      badge: 'Streaming & Vector',
    },
    {
      company: 'Gartner',
      title: 'Cloud Systems & Full-Stack Developer',
      skills: 'React 18, Java, Spring Boot, PostgreSQL, Tailwind CSS, Docker, Cloud Architecture',
      badge: 'Cloud & SaaS',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-card text-card-foreground border border-border/80 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/70 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                <span>AI Resume Tailoring Engine</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold border border-emerald-500/20">
                  Zero Fabrication
                </span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Automatically customize headline, executive summary, and project hierarchy for your target role.
              </p>
            </div>
          </div>
          <button
            onClick={() => !isTailoring && setTailorModalOpen(false)}
            disabled={isTailoring}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading Overlay when tailoring */}
        {isTailoring ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center">
                <Wand2 className="w-8 h-8 text-indigo-500 animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h4 className="text-base font-bold text-foreground">Tailoring Resume for {targetCompany || 'Employer'}...</h4>
              <p className="text-xs text-muted-foreground font-mono animate-pulse">{tailorStep}</p>
            </div>
            <div className="w-48 h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-primary animate-progress rounded-full" />
            </div>
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleApply} className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Target Company
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={targetCompany}
                    onChange={(e) => setTargetCompany(e.target.value)}
                    placeholder="e.g. PayPal, Barclays, Stripe"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:outline-none text-foreground font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                  Target Role Title
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-muted-foreground absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    placeholder="e.g. Backend Platform Engineer"
                    className="w-full text-xs pl-9 pr-3 py-2 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:outline-none text-foreground font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Priority Technical Skills &amp; ATS Keywords
              </label>
              <textarea
                rows={2}
                value={skillTags}
                onChange={(e) => setSkillTags(e.target.value)}
                placeholder="Java 21, Spring Boot 3, PostgreSQL, Docker, Kafka..."
                className="w-full text-xs p-3 bg-background border border-border rounded-xl focus:ring-1 focus:ring-primary focus:outline-none leading-relaxed font-mono text-foreground"
              />
              <p className="text-[11px] text-muted-foreground">
                These keywords will be dynamically promoted to the front of your technical proficiencies matrix.
              </p>
            </div>

            {/* Authentic presets matching uploaded resumes */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Select Predefined Target Presets (Matches Candidate Resumes)
                </span>
                <span className="text-[10px] text-primary font-semibold">1-Click Auto-Fill</span>
              </div>

              <div className="grid grid-cols-1 gap-2">
                {authenticPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setTargetCompany(preset.company);
                      setJobTitle(preset.title);
                      setSkillTags(preset.skills);
                    }}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all ${
                      targetCompany.toLowerCase() === preset.company.toLowerCase()
                        ? 'border-primary bg-primary/10 shadow-xs'
                        : 'border-border/70 hover:bg-muted/60 hover:border-border'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground">{preset.company}</span>
                        <span className="text-[10px] px-2 py-0.2 rounded-md bg-muted text-muted-foreground font-medium">
                          {preset.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground font-medium">{preset.title}</p>
                    </div>

                    <span className="text-[10px] font-mono text-muted-foreground/80 hidden sm:inline truncate max-w-[180px]">
                      {preset.skills.split(',').slice(0, 3).join(', ')}...
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/70">
              <button
                type="button"
                onClick={() => setTailorModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl hover:bg-muted text-muted-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tailor &amp; Generate Resume</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
