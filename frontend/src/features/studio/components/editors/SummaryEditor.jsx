import { Sparkles } from 'lucide-react';

export function SummaryEditor({ formData, onChange, onOpenAi }) {
  const summaryText = formData.summaryText || '';

  const handleChange = (newText) => {
    onChange({
      ...formData,
      summaryText: newText,
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-muted-foreground">
          Professional Summary Text
        </label>
        {onOpenAi && (
          <button
            type="button"
            onClick={() => {
              onOpenAi(summaryText, 'summary', (rewritten) => {
                handleChange(rewritten);
              });
            }}
            className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Writing Assistant</span>
          </button>
        )}
      </div>

      <textarea
        rows={6}
        value={summaryText}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full text-xs p-3 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary leading-relaxed"
        placeholder="Enter your professional summary highlighting your core background and achievements..."
      />

      <div className="flex justify-between text-[11px] text-muted-foreground">
        <span>Recommended: 3 to 5 concise impact sentences.</span>
        <span className="font-mono">{summaryText.length} characters</span>
      </div>
    </div>
  );
}
