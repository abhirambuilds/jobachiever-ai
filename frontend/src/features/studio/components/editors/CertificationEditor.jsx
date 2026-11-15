import { Plus, Trash2 } from 'lucide-react';

export function CertificationEditor({ formData, onChange }) {
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

  const handleAddCertification = () => {
    const newCert = {
      id: `cert-${Date.now()}`,
      name: '',
      issuer: '',
      issueDate: '',
      credentialId: '',
    };
    updateItems([...items, newCert]);
  };

  const handleDeleteCertification = (index) => {
    updateItems(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {items.map((cert, cIdx) => (
        <div key={cert.id || cIdx} className="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">Certification #{cIdx + 1}</span>
            <button
              type="button"
              onClick={() => handleDeleteCertification(cIdx)}
              className="text-muted-foreground hover:text-destructive p-1 rounded"
              title="Delete Certification"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground block">Certification Name</label>
              <input
                type="text"
                placeholder="AWS Certified Solutions Architect"
                value={cert.name || cert.title || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const next = [...items];
                  next[cIdx] = { ...next[cIdx], name: val, title: val };
                  updateItems(next);
                }}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block">Issuing Organization</label>
              <input
                type="text"
                placeholder="Amazon Web Services"
                value={cert.issuer || ''}
                onChange={(e) => handleFieldChange(cIdx, 'issuer', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-muted-foreground block">Issue Date / Year</label>
              <input
                type="text"
                placeholder="2023"
                value={cert.issueDate || cert.date || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const next = [...items];
                  next[cIdx] = { ...next[cIdx], issueDate: val, date: val };
                  updateItems(next);
                }}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
              />
            </div>
            <div>
              <label className="text-[10px] text-muted-foreground block">Credential ID / URL</label>
              <input
                type="text"
                placeholder="Optional Credential ID or Link"
                value={cert.credentialId || cert.credentialUrl || ''}
                onChange={(e) => handleFieldChange(cIdx, 'credentialId', e.target.value)}
                className="w-full text-xs p-1.5 bg-background border border-border rounded"
              />
            </div>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={handleAddCertification}
        className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
      >
        <Plus className="w-3.5 h-3.5" />
        <span>Add Certification</span>
      </button>
    </div>
  );
}
