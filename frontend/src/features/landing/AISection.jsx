import { motion } from 'framer-motion';
import {
  Zap,
  Sparkles,
  Cpu,
  Lock,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const aiProviders = [
  {
    name: 'Groq Cloud',
    tagline: 'Ultra-Low Latency Inference',
    models: 'Llama 3.3, Llama 3.1 70B',
    description:
      'Lightning-fast parsing and analysis powered by Groq LPUs. Ideal for instantaneous resume critiquing, real-time prompt-to-edit canvas, and AI Copilot dialogue.',
    badge: 'High Speed',
    icon: Zap,
    accent: 'text-amber-500',
  },
  {
    name: 'Google Gemini',
    tagline: 'Deep Reasoning & Context',
    models: 'Gemini 2.0 Flash, Gemini 1.5 Pro',
    description:
      'Massive context windows and state-of-the-art reasoning for complex job description decomposition and granular semantic match analysis.',
    badge: 'Deep Reasoning',
    icon: Sparkles,
    accent: 'text-cyan-400',
  },
  {
    name: 'Ollama (Local)',
    tagline: '100% On-Device Privacy',
    models: 'Llama 3, Mistral, Qwen',
    description:
      'Run open-weights models entirely on your local machine. Zero document bytes leave your hardware, ensuring absolute data privacy for confidential resumes.',
    badge: '100% Private',
    icon: Cpu,
    accent: 'text-emerald-500',
  },
];

export function AISection() {
  return (
    <section id="ai-engine" className="py-20 md:py-28 bg-muted/20 border-y border-border/50 relative">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="ai" className="mb-3">
            AI Provider Sovereignty
          </Badge>
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl">
            You Choose Your AI Engine.{' '}
            <span className="gradient-text-primary">Zero Vendor Lock-in.</span>
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
            JobAchiever AI gives you total sovereignty over your inference pipeline. Select between
            cloud speed, multimodal intelligence, or completely offline local inference.
          </p>
        </div>

        {/* Provider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {aiProviders.map((provider, index) => {
            const Icon = provider.icon;
            return (
              <motion.div
                key={provider.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Card className="h-full border-border/70 bg-card hover:border-primary/50 hover:shadow-glow-sm transition-all duration-200 flex flex-col justify-between">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted/60 ring-1 ring-border/80">
                        <Icon className={`h-5 w-5 ${provider.accent}`} />
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {provider.badge}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg font-bold text-foreground">
                      {provider.name}
                    </CardTitle>
                    <CardDescription className="text-xs font-semibold text-primary">
                      {provider.tagline}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {provider.description}
                    </p>
                    <div className="rounded-lg border border-border/60 bg-muted/40 p-2.5 text-[11px] font-mono text-muted-foreground">
                      Models: {provider.models}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* AI Ethics & Transparency Banner */}
        <div className="mt-12 rounded-2xl border border-border/80 bg-card/60 p-6 sm:p-8 backdrop-blur-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                <Lock className="h-4 w-4" />
                <span>Responsible AI & Data Privacy Guarantee</span>
              </div>
              <h3 className="text-lg font-bold text-foreground">
                Grounding, Privacy & User Approval on All Actions
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                JobAchiever AI strictly prohibits hallucination and unauthorized automation. The
                platform will never fabricate qualifications you do not possess, will never
                automatically submit job applications without your explicit review, and does not
                promise or guarantee employment outcomes.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>BYOK or Local Models</span>
              </div>
              <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-xs flex items-center gap-2 text-primary">
                <UserCheck className="h-4 w-4 shrink-0" />
                <span>Human-In-The-Loop Approval</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
