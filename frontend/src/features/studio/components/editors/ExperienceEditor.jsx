import { Plus, Sparkles, Trash2 } from 'lucide-react';

export function ExperienceEditor({ formData, onChange, onOpenAi }) {
  const items = formData.items || formData.entries || [];

  const updateItems = (nextItems) => {
    onChange({
      ...formData,
      items: nextItems,
      entries: nextItems,
    });
  };

  const handleFieldChange = (index, field, value) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: value };
    updateItems(next);
  };

  const handleAddPosition = () => {
    const newPos = {
      id: `exp-${Date.now()}`,
      title: '',
      company: '',
      startDate: '',
      endDate: 'Present',
      location: '',
      bullets: [''],
    };
    updateItems([...items, newPos]);
  };

  const handleDeletePosition = (index) => {
    updateItems(items.filter((_, i) => i !== index));
  };

  const handleBulletChange = (posIndex, bulletIndex, value) => {
    const next = [...items];
    const nextBullets = [...(next[posIndex].bullets || [])];
    nextBullets[bulletIndex] = value;
    next[posIndex] = { ...next[posIndex], bullets: nextBullets };
    updateItems(next);
  };

  const handleAddBullet = (posIndex) => {
    const next = [...items];
    const nextBullets = [...(next[posIndex].bullets || []), ''];
    next[posIndex] = { ...next[posIndex], bullets: nextBullets };
    updateItems(next);
  };

  const handleDeleteBullet = (posIndex, bulletIndex) => {
    const next = [...items];
    const nextBullets = (next[posIndex].bullets || []).filter((_, i) => i !== bulletIndex);
    next[posIndex] = { ...next[posIndex], bullets: nextBullets };
    updateItems(next);
  };

  return (
    <div className="space-y-4">
      {items.map((job, jIdx) => (
        <div key={job.id || jIdx} className="p-3 border border-border rounded-lg bg-muted/20 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Position #{jIdx + 1}</span>
            <button
              type="button"
              onClick={() => handleDeletePosition(jIdx)}
              className="text-muted-foreground hover:text-destructive p-1 rounded"
              title="Delete Position"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground block">Job Title</label>
              <input
                type="text"
                value={job.title || job.jobTitle || ''}
                onChange={(e) => handleFieldChange(jIdx, 'title', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
                placeholder="Software Engineer"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block">Company</label>
              <input
                type="text"
                value={job.company || ''}
                onChange={(e) => handleFieldChange(jIdx, 'company', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
                placeholder="Acme Corp"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground block">Start Date</label>
              <input
                type="text"
                value={job.startDate || ''}
                onChange={(e) => handleFieldChange(jIdx, 'startDate', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
                placeholder="2022"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block">End Date</label>
              <input
                type="text"
                value={job.endDate || ''}
                onChange={(e) => handleFieldChange(jIdx, 'endDate', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
                placeholder="Present"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="text-[10px] text-muted-foreground block">Location</label>
              <input
                type="text"
                value={job.location || ''}
                onChange={(e) => handleFieldChange(jIdx, 'location', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
                placeholder="San Francisco, CA"
              />
            </div>
          </div>

          {/* Bullet points */}
          <div className="space-y-1.5 pt-1">
            <label className="text-[11px] font-semibold text-muted-foreground block">
              Bullet Points & Impact:
            </label>
            {(job.bullets || []).map((bullet, bIdx) => (
              <div key={bIdx} className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={bullet}
                  onChange={(e) => handleBulletChange(jIdx, bIdx, e.target.value)}
                  className="flex-1 text-xs p-1.5 bg-background border border-border rounded"
                  placeholder="Engineered scalable feature increasing throughput by 25%..."
                />
                {onOpenAi && (
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAi(bullet, 'experience', (rewritten) => {
                        handleBulletChange(jIdx, bIdx, rewritten);
                      });
                    }}
                    className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                    title="Enhance bullet with AI"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDeleteBullet(jIdx, bIdx)}
                  className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                  title="Delete bullet"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => handleAddBullet(jIdx)}
              className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-1 font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Add bullet</span>
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddPosition}
        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Position</span>
      </button>
    </div>
  );
}
