import { useState } from 'react';
import {
  Check,
  X,
  Edit2,
  RotateCcw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useAnalyzer } from '@/hooks/useAnalyzer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function SentenceReviewSection({ sectionRef }) {
  const {
    sentenceReviews,
    acceptSentenceSuggestion,
    rejectSentenceSuggestion,
    editSentenceSuggestion,
    resetSentenceSuggestion,
    setIsComparisonModalOpen,
  } = useAnalyzer();

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleStartEdit = (item) => {
    setEditingId(item.id);
    setEditText(item.revisedText || item.suggestedText);
  };

  const handleSaveEdit = (id) => {
    if (editText.trim()) {
      editSentenceSuggestion(id, editText);
      setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const acceptedCount = sentenceReviews.filter(
    (s) => s.status === 'accepted' || s.status === 'modified'
  ).length;

  return (
    <div ref={sectionRef} className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-cyan-400" />
            <span>Interactive Sentence-Level Rewrites</span>
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Refine passive phrasing and strengthen technical ownership without fabricating numbers or claims.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={acceptedCount > 0 ? 'success' : 'outline'} className="text-xs font-mono">
            {acceptedCount} of {sentenceReviews.length} Staged for Comparison
          </Badge>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsComparisonModalOpen(true)}
            className="h-8 text-xs gap-1.5"
          >
            <span>Review Before &amp; After</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {sentenceReviews.map((item) => {
          const isAccepted = item.status === 'accepted' || item.status === 'modified';
          const isRejected = item.status === 'rejected';
          const isEditing = editingId === item.id;

          return (
            <Card
              key={item.id}
              className={`border transition-all duration-200 ${
                isAccepted
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : isRejected
                  ? 'border-muted bg-muted/20 opacity-75'
                  : 'border-border/80 bg-card/75'
              }`}
            >
              <CardContent className="p-5 space-y-4">
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {item.section}
                    </Badge>
                    {isAccepted && (
                      <Badge variant="success" className="text-[10px] gap-1 px-1.5 py-0">
                        <CheckCircle2 className="h-2.5 w-2.5" />
                        <span>{item.status === 'modified' ? 'Custom Revised' : 'Accepted'}</span>
                      </Badge>
                    )}
                    {isRejected && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Rejected (Original Retained)
                      </Badge>
                    )}
                  </div>

                  <span className="text-[10px] text-muted-foreground font-mono">
                    ID: {item.id}
                  </span>
                </div>

                {/* Original vs Suggested Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Left: Original Sentence */}
                  <div className="rounded-xl border border-border/70 bg-background/60 p-3.5 space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Original Text
                    </span>
                    <p className="text-foreground leading-relaxed italic">
                      &ldquo;{item.originalText}&rdquo;
                    </p>
                    <div className="pt-2 border-t border-border/40 text-[11px] text-destructive flex items-start gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                      <span>{item.issue}</span>
                    </div>
                  </div>

                  {/* Right: Suggested Rewrite */}
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-3.5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-primary block">
                        Fact-Preserving Suggested Rewrite
                      </span>
                      <Badge variant="ai" className="text-[9px] px-1 py-0">
                        Zero-Fabrication
                      </Badge>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 pt-1">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="text-xs bg-background resize-none"
                        />
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleCancelEdit}
                            className="h-6 text-[10px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => handleSaveEdit(item.id)}
                            className="h-6 text-[10px]"
                          >
                            Save Rewrite
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="text-foreground leading-relaxed font-medium">
                          &ldquo;{item.revisedText || item.suggestedText}&rdquo;
                        </p>
                        <p className="text-[11px] text-muted-foreground pt-1">
                          {item.explanation}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="pt-2 border-t border-border/40 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Never automatically invents unverified achievements.</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== 'pending' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => resetSentenceSuggestion(item.id)}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reset</span>
                      </Button>
                    )}

                    {!isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleStartEdit(item)}
                        className="h-7 text-xs gap-1"
                      >
                        <Edit2 className="h-3 w-3 text-cyan-400" />
                        <span>Edit</span>
                      </Button>
                    )}

                    <Button
                      type="button"
                      variant={isRejected ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => rejectSentenceSuggestion(item.id)}
                      className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3 w-3 text-destructive" />
                      <span>Reject</span>
                    </Button>

                    <Button
                      type="button"
                      variant={isAccepted ? 'success' : 'ai'}
                      size="sm"
                      onClick={() => acceptSentenceSuggestion(item.id)}
                      className="h-7 text-xs gap-1 shadow-xs"
                    >
                      <Check className="h-3 w-3" />
                      <span>{isAccepted ? 'Accepted' : 'Accept Rewrite'}</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
