import { useState, useRef, useEffect } from 'react';
import {
  MessageSquareCode,
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  Minimize2,
} from 'lucide-react';
import { groqService } from '@/services/groqService';
import { useProfile } from '@/hooks/useProfile';

export function FloatingCopilotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'm-init',
      role: 'assistant',
      content: "Hi! I'm your Groq-powered Career Copilot. Ask me about roles, interview preparation, salary benchmarks, or how to frame your projects!",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  const { profile } = useProfile();

  useEffect(() => {
    if (isOpen) {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const query = input.trim();
    if (!query || isTyping) return;

    const userMsg = { id: `u-${Date.now()}`, role: 'user', content: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const candidateContext = `Candidate: ${profile?.personalInfo?.fullName || 'Candidate'}.
Skills: ${(profile?.skills || []).slice(0, 8).join(', ')}.
Target Track: ${profile?.careerTracks?.[0]?.name || 'Software Engineering'}.`;

      const systemPrompt = `You are JobAchiever AI Career Copilot. Answer concisely (2-4 sentences max).
${candidateContext}
Helpful, encouraging, and focused on tech hiring in India.`;

      const reply = await groqService.chat([
        { role: 'system', content: systemPrompt },
        ...messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: query },
      ]);

      setMessages((prev) => [...prev, { id: `a-${Date.now()}`, role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: `err-${Date.now()}`, role: 'assistant', content: 'Connection issue. Please verify Groq API connection.' },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 print:hidden">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-indigo-600 text-white shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transition-all group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-primary" />
          </div>
          <span className="text-xs font-bold tracking-wide">AI Copilot</span>
          <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded-full font-mono">Groq</span>
        </button>
      ) : (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-primary/15 via-indigo-500/10 to-transparent border-b border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-foreground">Career Copilot</h3>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-1 rounded font-mono">
                    LIVE
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">Powered by Groq LPUs</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                title="Minimize"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
                title="Close"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 text-xs">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] ${
                      isUser ? 'bg-primary text-primary-foreground font-bold' : 'bg-muted border border-border text-foreground'
                    }`}
                  >
                    {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-primary" />}
                  </div>

                  <div
                    className={`max-w-[80%] p-2.5 rounded-xl whitespace-pre-wrap leading-relaxed ${
                      isUser
                        ? 'bg-primary text-primary-foreground rounded-tr-none font-medium'
                        : 'bg-muted/60 border border-border/60 text-foreground rounded-tl-none'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground text-[11px] pl-8">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                <span>Thinking with Groq...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-2.5 border-t border-border/80 bg-background/50 flex items-center gap-1.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a quick career question..."
              className="flex-1 bg-muted/60 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={isTyping || !input.trim()}
              className="p-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-40 transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
