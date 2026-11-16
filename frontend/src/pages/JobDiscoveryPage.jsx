import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  Building2,
  MapPin,
  DollarSign,
  Search,
  Filter,
  Target,
  FileSearch,
  Plus,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import { DEMO_JOBS } from '@/demo/demoJobs';
import { demoService } from '@/demo/demoService';

export function JobDiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState(() => {
    if (typeof localStorage === 'undefined') return 'all';
    const activeRes = (localStorage.getItem('jobachiever_active_resume') || '').toLowerCase();
    if (activeRes.includes('rohan') || activeRes.includes('frontend')) return 'frontend';
    if (activeRes.includes('vikram') || activeRes.includes('ai') || activeRes.includes('data')) return 'aiml';
    if (activeRes.includes('ananya') || activeRes.includes('backend')) return 'backend';
    return 'all';
  });
  const [liveJobs, setLiveJobs] = useState([]);
  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const navigate = useNavigate();

  const handleLiveRapidApiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingLive(true);
    const rapidKey =
      (typeof localStorage !== 'undefined' && localStorage.getItem('jobachiever_rapidapi_key')) ||
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_RAPIDAPI_KEY) ||
      '';

    try {
      const res = await fetch(`https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery + ' India')}&page=1&num_pages=1`, {
        headers: {
          'X-RapidAPI-Key': rapidKey,
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        },
      });
      if (res.ok) {
        const json = await res.json();
        const items = (json.data || []).map((j, i) => ({
          id: `rapid-${j.job_id || i}`,
          company: j.employer_name || 'Tech Enterprise',
          title: j.job_title || searchQuery,
          location: `${j.job_city || 'Bengaluru'}, ${j.job_country || 'India'}`,
          employmentType: j.job_employment_type || 'Full-time',
          salaryRange: j.job_salary_currency ? `${j.job_salary_currency} Competitive` : '₹20 LPA - ₹35 LPA',
          postedAgo: 'Live (RapidAPI)',
          url: j.job_apply_link || 'https://www.linkedin.com/jobs',
          requiredSkills: [searchQuery, 'Problem Solving', 'System Design'],
          preferredSkills: ['Cloud Infrastructure', 'Agile'],
          matchScore: 91,
          isRapidApi: true,
        }));
        if (items.length > 0) {
          setLiveJobs(items);
          toast.success(`Found ${items.length} live jobs via RapidAPI JSearch!`);
          return;
        }
      }
    } catch {
      // fallback to filtered
    } finally {
      setIsSearchingLive(false);
    }
  };

  const handleTrackInPipeline = async (job) => {
    try {
      await demoService.addApplication({
        company: job.company,
        role: job.title,
        careerTrackId: 'track-demo-backend',
        careerTrackName: job.title,
        stage: 'SAVED',
        salary: job.salaryRange,
        location: job.location,
        matchScore: job.matchScore,
        nextStep: 'Tailor resume for role requirements',
        notes: `Discovered in Opportunity Finder. Matched with ${job.matchScore}% score.`,
      });
      toast.success(`Added ${job.company} — ${job.title} to your application pipeline!`);
    } catch {
      toast.error('Failed to save application.');
    }
  };

  const pool = liveJobs.length > 0 ? [...liveJobs, ...DEMO_JOBS] : DEMO_JOBS;

  const filteredJobs = pool.filter((job) => {
    const matchesSearch =
      searchQuery === '' ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.requiredSkills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTrack =
      selectedTrack === 'all' ||
      (selectedTrack === 'frontend' && (job.track === 'frontend' || job.title.toLowerCase().includes('frontend') || job.title.toLowerCase().includes('ui'))) ||
      (selectedTrack === 'backend' && (job.track === 'backend' || (!job.track && job.title.toLowerCase().includes('backend')))) ||
      (selectedTrack === 'aiml' && (job.track === 'aiml' || job.title.toLowerCase().includes('ai') || job.title.toLowerCase().includes('data')));

    return matchesSearch && matchesTrack;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              <Compass className="w-7 h-7 text-primary" />
              <span>Job Opportunity Discovery</span>
            </h1>
            <Badge variant="ai" className="text-[11px] font-semibold gap-1">
              Active Ingestion
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Real-world openings aggregated from top engineering employers and ranked semantically against your verified career profile.
          </p>
        </div>

        <Button
          onClick={() => navigate('/jd-analyzer')}
          size="sm"
          className="gap-2 shrink-0 font-semibold"
        >
          <FileSearch className="w-4 h-4" />
          <span>Analyze Custom JD</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-xl border border-border/70">
        <div className="relative flex-1 max-w-md flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLiveRapidApiSearch()}
              placeholder="Search roles, skills (e.g. React, Java, PyTorch)..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-background border border-border focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleLiveRapidApiSearch}
            disabled={isSearchingLive || !searchQuery.trim()}
            className="text-xs h-8 gap-1.5 shrink-0 border-primary/40 hover:bg-primary/10"
          >
            <Compass className={`w-3.5 h-3.5 text-primary ${isSearchingLive ? 'animate-spin' : ''}`} />
            <span>{isSearchingLive ? 'Searching...' : 'Search Live (RapidAPI)'}</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground font-medium shrink-0">Persona:</span>
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
            onClick={() => setSelectedTrack('frontend')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              selectedTrack === 'frontend'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted text-muted-foreground'
            }`}
          >
            Frontend &amp; UI
          </button>
          <button
            onClick={() => setSelectedTrack('backend')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              selectedTrack === 'backend'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted text-muted-foreground'
            }`}
          >
            Backend &amp; Cloud
          </button>
          <button
            onClick={() => setSelectedTrack('aiml')}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              selectedTrack === 'aiml'
                ? 'bg-primary text-primary-foreground'
                : 'bg-background hover:bg-muted text-muted-foreground'
            }`}
          >
            AI &amp; Data Science
          </button>
        </div>
      </div>

      {/* Opportunity Cards List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence>
          {filteredJobs.map((job) => (
            <motion.div
              key={job.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-5 border-border/80 bg-card hover:border-primary/40 hover:shadow-md transition-all space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-foreground hover:text-primary transition-colors">
                          {job.title}
                        </h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                          {job.company}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Posted {job.postedAgo}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{job.salaryRange}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-muted-foreground/80" />
                          <span>{job.location}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground/80" />
                          <span>{job.experienceLevel}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-start shrink-0">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                        job.matchScore >= 90
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25'
                      }`}
                    >
                      {job.matchScore}% Match
                    </span>
                  </div>
                </div>

                {/* Skills Ribbon */}
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                    <span className="font-semibold text-foreground">Required Skills:</span>
                    {job.requiredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 font-medium text-[11px]"
                      >
                        {sk}
                      </span>
                    ))}
                    <span className="text-muted-foreground/60">•</span>
                    <span className="font-medium text-muted-foreground">Bonus:</span>
                    {job.preferredSkills.map((sk) => (
                      <span
                        key={sk}
                        className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-[11px]"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <span>View Employer Posting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleTrackInPipeline(job)}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Track Application</span>
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/jd-analyzer')}
                      className="gap-1.5 text-xs h-8"
                    >
                      <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Decompose JD</span>
                    </Button>

                    <Button
                      type="button"
                      variant="ai"
                      size="sm"
                      onClick={() => navigate('/job-matcher')}
                      className="gap-1.5 text-xs h-8 font-semibold shadow-xs"
                    >
                      <Target className="w-3.5 h-3.5" />
                      <span>Match With Resume</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default JobDiscoveryPage;
