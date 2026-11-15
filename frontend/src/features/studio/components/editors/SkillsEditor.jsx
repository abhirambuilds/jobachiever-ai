import { Plus, Trash2 } from 'lucide-react';

export function SkillsEditor({ formData, onChange }) {
  const categories = formData.categories || [];

  const handleCategoryNameChange = (index, newName) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], category: newName };
    onChange({ ...formData, categories: updated });
  };

  const handleSkillsStringChange = (index, commaSeparated) => {
    const skillsList = commaSeparated
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const updated = [...categories];
    updated[index] = { ...updated[index], skills: skillsList };
    onChange({ ...formData, categories: updated });
  };

  const handleAddCategory = () => {
    const updated = [...categories, { category: 'New Category', skills: [] }];
    onChange({ ...formData, categories: updated });
  };

  const handleRemoveCategory = (index) => {
    const updated = categories.filter((_, i) => i !== index);
    onChange({ ...formData, categories: updated });
  };

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        Organize your skills by domain categories.
      </div>

      {categories.map((cat, cIdx) => (
        <div key={cIdx} className="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <input
              type="text"
              value={cat.category}
              onChange={(e) => handleCategoryNameChange(cIdx, e.target.value)}
              className="text-xs font-bold bg-background border border-border rounded px-2 py-1 w-1/2"
              placeholder="Category Name"
            />
            <button
              type="button"
              onClick={() => handleRemoveCategory(cIdx)}
              className="text-muted-foreground hover:text-destructive p-1 rounded"
              title="Remove Category"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-semibold text-muted-foreground block">
              Skills (comma-separated):
            </label>
            <input
              type="text"
              value={(cat.skills || []).join(', ')}
              onChange={(e) => handleSkillsStringChange(cIdx, e.target.value)}
              className="w-full text-xs p-2 bg-background border border-border rounded font-mono"
              placeholder="e.g. React, TypeScript, Vite"
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddCategory}
        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Skill Category</span>
      </button>
    </div>
  );
}
