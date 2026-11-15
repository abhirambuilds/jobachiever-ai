import { Plus, Trash2 } from 'lucide-react';

export function EducationEditor({ formData, onChange }) {
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

  const handleAddEducation = () => {
    const newEdu = {
      id: `edu-${Date.now()}`,
      degree: '',
      fieldOfStudy: '',
      institution: '',
      graduationYear: '',
      grade: '',
    };
    updateItems([...items, newEdu]);
  };

  const handleDeleteEducation = (index) => {
    updateItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {items.map((edu, eIdx) => (
        <div key={edu.id || eIdx} className="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Institution #{eIdx + 1}</span>
            <button
              type="button"
              onClick={() => handleDeleteEducation(eIdx)}
              className="text-muted-foreground hover:text-destructive p-1 rounded"
              title="Delete Institution"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground block">Degree</label>
              <input
                type="text"
                placeholder="Degree (e.g. B.S., M.S.)"
                value={edu.degree || ''}
                onChange={(e) => handleFieldChange(eIdx, 'degree', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block">Field of Study</label>
              <input
                type="text"
                placeholder="Field of Study (e.g. Computer Science)"
                value={edu.fieldOfStudy || ''}
                onChange={(e) => handleFieldChange(eIdx, 'fieldOfStudy', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground block">Institution</label>
              <input
                type="text"
                placeholder="Institution Name"
                value={edu.institution || ''}
                onChange={(e) => handleFieldChange(eIdx, 'institution', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block">Graduation Year / Period</label>
              <input
                type="text"
                placeholder="Graduation Year (e.g. 2024)"
                value={edu.graduationYear || edu.endDate || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const next = [...items];
                  next[eIdx] = { ...next[eIdx], graduationYear: val, endDate: val };
                  updateItems(next);
                }}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddEducation}
        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Institution</span>
      </button>
    </div>
  );
}
