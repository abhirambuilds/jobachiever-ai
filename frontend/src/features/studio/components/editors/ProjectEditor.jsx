import { Plus, Sparkles, Trash2 } from 'lucide-react';

export function ProjectEditor({ formData, onChange, onOpenAi }) {
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

  const handleAddProject = () => {
    const newProj = {
      id: `proj-${Date.now()}`,
      title: '',
      role: '',
      technologies: [],
      description: '',
      githubUrl: '',
      liveUrl: '',
      bullets: [''],
    };
    updateItems([...items, newProj]);
  };

  const handleDeleteProject = (index) => {
    updateItems(items.filter((_, i) => i !== index));
  };

  const handleBulletChange = (projIndex, bulletIndex, value) => {
    const next = [...items];
    const nextBullets = [...(next[projIndex].bullets || [])];
    nextBullets[bulletIndex] = value;
    next[projIndex] = { ...next[projIndex], bullets: nextBullets };
    updateItems(next);
  };

  const handleAddBullet = (projIndex) => {
    const next = [...items];
    const nextBullets = [...(next[projIndex].bullets || []), ''];
    next[projIndex] = { ...next[projIndex], bullets: nextBullets };
    updateItems(next);
  };

  const handleDeleteBullet = (projIndex, bulletIndex) => {
    const next = [...items];
    const nextBullets = (next[projIndex].bullets || []).filter((_, i) => i !== bulletIndex);
    next[projIndex] = { ...next[projIndex], bullets: nextBullets };
    updateItems(next);
  };

  return (
    <div className="space-y-4">
      {items.map((proj, pIdx) => {
        const techList = Array.isArray(proj.technologies)
          ? proj.technologies.join(', ')
          : (proj.technologies || '');

        return (
          <div key={proj.id || pIdx} className="p-3 border border-border rounded-lg bg-muted/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Project #{pIdx + 1}</span>
              <button
                type="button"
                onClick={() => handleDeleteProject(pIdx)}
                className="text-muted-foreground hover:text-destructive p-1 rounded"
                title="Delete Project"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block">Project Title</label>
                <input
                  type="text"
                  value={proj.title || proj.name || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const next = [...items];
                    next[pIdx] = { ...next[pIdx], title: val, name: val };
                    updateItems(next);
                  }}
                  className="w-full text-xs p-1.5 bg-background border border-border rounded"
                  placeholder="Distributed Task Queue"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block">Role / Scope</label>
                <input
                  type="text"
                  value={proj.role || ''}
                  onChange={(e) => handleFieldChange(pIdx, 'role', e.target.value)}
                  className="w-full text-xs p-1.5 bg-background border border-border rounded"
                  placeholder="Sole Developer / Lead Architect"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-muted-foreground block">Technologies (comma-separated)</label>
              <input
                type="text"
                value={techList}
                onChange={(e) => {
                  const arr = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                  handleFieldChange(pIdx, 'technologies', arr);
                }}
                className="w-full text-xs p-1.5 bg-background border border-border rounded font-mono"
                placeholder="React, Node.js, Redis, Docker"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground block">GitHub URL</label>
                <input
                  type="text"
                  value={proj.githubUrl || proj.github || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const next = [...items];
                    next[pIdx] = { ...next[pIdx], githubUrl: val, github: val };
                    updateItems(next);
                  }}
                  className="w-full text-xs p-1.5 bg-background border border-border rounded"
                  placeholder="https://github.com/..."
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground block">Live Demo URL</label>
                <input
                  type="text"
                  value={proj.liveUrl || proj.link || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    const next = [...items];
                    next[pIdx] = { ...next[pIdx], liveUrl: val, link: val };
                    updateItems(next);
                  }}
                  className="w-full text-xs p-1.5 bg-background border border-border rounded"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Bullet points */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-semibold text-muted-foreground block">
                Impact Highlights:
              </label>
              {(proj.bullets || []).map((bullet, bIdx) => (
                <div key={bIdx} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={bullet}
                    onChange={(e) => handleBulletChange(pIdx, bIdx, e.target.value)}
                    className="flex-1 text-xs p-1.5 bg-background border border-border rounded"
                    placeholder="Built asynchronous worker pipeline..."
                  />
                  {onOpenAi && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenAi(bullet, 'project', (rewritten) => {
                          handleBulletChange(pIdx, bIdx, rewritten);
                        });
                      }}
                      className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                      title="Enhance highlight with AI"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteBullet(pIdx, bIdx)}
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                    title="Delete highlight"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => handleAddBullet(pIdx)}
                className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-1 font-medium"
              >
                <Plus className="w-3 h-3" />
                <span>Add highlight</span>
              </button>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={handleAddProject}
        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Project</span>
      </button>
    </div>
  );
}
