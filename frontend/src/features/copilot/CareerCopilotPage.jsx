import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  RotateCcw,
  Briefcase,
  TrendingUp,
  GraduationCap,
  FileText,
  Copy,
  Check,
} from 'lucide-react';
import { groqService } from '@/services/groqService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useProfile } from '@/hooks/useProfile';

const SUGGESTIONS = [
  {
    icon: GraduationCap,
    label: 'STAR Behavioral Rehearsal',
    prompt: 'Give me a challenging STAR-method behavioral interview question for an SDE 2 role and critique my answer.',
  },
  {
    icon: TrendingUp,
    label: 'Salary Benchmark India',
    prompt: 'What is the compensation range for a Senior Backend Developer (5 YOE) with Go and Kubernetes in Bengaluru / Hyderabad in 2026?',
  },
  {
    icon: Briefcase,
    label: 'System Design Question',
    prompt: 'How would you architect a distributed rate limiter handling 100,000 requests per second with Redis sliding windows?',
  },
  {
    icon: FileText,
    label: 'ATS Bullet Critique',
    prompt: 'Review this bullet point and rewrite it with Google XYZ formula: "Worked on payment gateway APIs and improved database performance."',
  },
];

export default function CareerCopilotPage() {
  const { profile } = useProfile();
  const [messages, setMessages] = useState([
    {
      id: 'm-welcome',
      role: 'assistant',
      content: `Hello! I'm your **JobAchiever AI Career Copilot**, powered by real-time Groq LPU inference.

I have full contextual awareness of your skills, career tracks, and target roles in the Indian tech market. How can I help you today? You can ask about:
- **Mock Interviews & STAR Framing**
- **System Design & Coding Deep Dives**
- **Bangalore/Hyderabad Salary Benchmarks (INR)**
- **Resume Impact Statement Optimization**`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (textToSend) => {
    const query = (textToSend || input).trim();
    if (!query || isTyping) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Build conversation context
      const candidateContext = `Candidate Name: ${profile?.personalInfo?.fullName || 'K. Abhiram Reddy'}.
Current Skills: ${(profile?.skills || []).slice(0, 10).map((s) => (typeof s === 'string' ? s : s?.name || '')).filter(Boolean).join(', ')}.
Target Career Track: ${profile?.careerTracks?.[0]?.name || 'Backend Software Engineer'}.
Target Market: India (Bengaluru, Hyderabad, Pune, Gurgaon).`;

      const systemPrompt = `You are JobAchiever AI Career Copilot, an elite career strategist, technical recruiter, and staff engineer.
${candidateContext}
Answer authoritatively with concrete, actionable advice.
Use clear Markdown formatting with bolding, bullet points, and code snippets where relevant.
Be direct, encouraging, and tailored to modern software engineering standards.`;

      const apiMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
          .filter((m) => m.id !== 'm-welcome')
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: query },
      ];

      const responseText = await groqService.chat(apiMessages, {
        temperature: 0.4,
        maxTokens: 1500,
      });

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an issue connecting to the Groq inference engine. Please check your network and try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'm-welcome',
        role: 'assistant',
        content: `Chat history reset. How can I assist you with your career goals?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-6rem)] flex flex-col space-y-4 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/80 pb-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-indigo-600 flex items-center justify-center text-white shadow-md shadow-primary/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-foreground">AI Career Copilot</h1>
              <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 py-0.5">
                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                <span>Groq LPU Realtime</span>
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Intelligent career advisory, STAR mock rounds, salary intelligence, and resume refinement.
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleReset}
          className="text-xs gap-1.5 border-border/70 text-muted-foreground hover:text-foreground"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </Button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs shrink-0 ${
                  isUser
                    ? 'bg-primary text-primary-foreground font-bold'
                    : 'bg-muted border border-border/80 text-foreground'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-primary" />}
              </div>

              <div
                className={`group relative max-w-[85%] rounded-2xl p-4 shadow-xs text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-card border border-border/80 text-foreground rounded-tl-none'
                }`}
              >
                {m.content}

                <div
                  className={`mt-2 flex items-center gap-2 text-[10px] ${
                    isUser ? 'text-primary-foreground/70 justify-end' : 'text-muted-foreground justify-between'
                  }`}
                >
                  <span>{m.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => handleCopy(m.id, m.content)}
                      className="opacity-0 group-hover:opacity-100 hover:text-foreground transition-opacity"
                      title="Copy response"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-muted border border-border/80 flex items-center justify-center text-xs shrink-0">
              <Bot className="w-4 h-4 text-primary animate-pulse" />
            </div>
            <div className="bg-card border border-border/80 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-muted-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
              <span>Groq AI is formulating response...</span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Quick Prompts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 shrink-0">
        {SUGGESTIONS.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => handleSend(item.prompt)}
              className="p-2 text-left rounded-lg border border-border/70 bg-card hover:bg-muted/60 transition-colors text-xs flex items-center gap-2 group"
            >
              <Icon className="w-3.5 h-3.5 text-primary shrink-0 group-hover:scale-110 transition-transform" />
              <span className="line-clamp-1 font-medium text-foreground">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 bg-card p-2 rounded-xl border border-border focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 shadow-sm shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything: mock questions, salary insights, system design, or resume feedback..."
          className="flex-1 bg-transparent border-0 px-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isTyping || !input.trim()}
          className="gap-1.5 px-4 text-xs font-semibold"
        >
          <span>Send</span>
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}
