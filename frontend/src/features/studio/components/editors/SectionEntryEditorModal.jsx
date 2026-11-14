import { useState, useEffect } from 'react';
import {
  AlertCircle,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';

export function SectionEntryEditorModal() {
  const {
    editingSection,
    setEditingSection,
    updateSectionData,
    openAiAssistant,
  } = useResumeStudio();

  const [formData, setFormData] = useState(() =>
    editingSection?.data ? JSON.parse(JSON.stringify(editingSection.data)) : {}
  );

  useEffect(() => {
    if (editingSection?.data) {
      setFormData(JSON.parse(JSON.stringify(editingSection.data)));
    }
  }, [editingSection]);

  if (!editingSection) return null;

  const handleSave = () => {
    updateSectionData(editingSection.id, formData);
    setEditingSection(null);
  };

  const handleClose = () => {
    setEditingSection(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-card text-card-foreground border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Edit Section: {editingSection.title}
            </h3>
            <p className="text-xs text-muted-foreground">
              Modify the structured content for this section of your resume.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* 1. PERSONAL INFO EDITOR */}
          {editingSection.type === 'personal_info' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName || ''}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Professional Headline</label>
                  <input
                    type="text"
                    value={formData.headline || ''}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Email</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">City</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Country</label>
                  <input
                    type="text"
                    value={formData.country || ''}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">LinkedIn URL</label>
                <input
                  type="text"
                  value={formData.linkedin || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">GitHub URL</label>
                  <input
                    type="text"
                    value={formData.github || ''}
                    onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                    className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Portfolio URL</label>
                  <input
                    type="text"
                    value={formData.portfolio || ''}
                    onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                    className="w-full text-xs p-2 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. SUMMARY EDITOR */}
          {editingSection.type === 'summary' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  Professional Summary Text
                </label>
                <button
                  type="button"
                  onClick={() => {
                    openAiAssistant(
                      formData.summaryText || '',
                      'summary',
                      (rewritten) => setFormData({ ...formData, summaryText: rewritten })
                    );
                  }}
                  className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Writing Assistant</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={formData.summaryText || ''}
                onChange={(e) => setFormData({ ...formData, summaryText: e.target.value })}
                className="w-full text-xs p-3 bg-background border border-border rounded-lg focus:ring-1 focus:ring-primary leading-relaxed"
                placeholder="Enter your professional summary..."
              />

              <div className="flex justify-between text-[11px] text-muted-foreground">
                <span>Recommended: 3 to 5 concise impact sentences.</span>
                <span className="font-mono">{(formData.summaryText || '').length} characters</span>
              </div>
            </div>
          )}

          {/* 3. SKILLS EDITOR */}
          {editingSection.type === 'skills' && (
            <div className="space-y-4">
              <div className="text-xs text-muted-foreground">
                Organize your skills by domain categories.
              </div>

              {(formData.categories || []).map((cat, cIdx) => (
                <div key={cIdx} className="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={cat.category}
                      onChange={(e) => {
                        const next = [...formData.categories];
                        next[cIdx].category = e.target.value;
                        setFormData({ ...formData, categories: next });
                      }}
                      className="text-xs font-bold bg-background border border-border rounded px-2 py-1 w-1/2"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = formData.categories.filter((_, i) => i !== cIdx);
                        setFormData({ ...formData, categories: next });
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded"
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
                      value={cat.skills.join(', ')}
                      onChange={(e) => {
                        const next = [...formData.categories];
                        next[cIdx].skills = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setFormData({ ...formData, categories: next });
                      }}
                      className="w-full text-xs p-2 bg-background border border-border rounded font-mono"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const next = [
                    ...(formData.categories || []),
                    { category: 'New Category', skills: [] },
                  ];
                  setFormData({ ...formData, categories: next });
                }}
                className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Skill Category</span>
              </button>
            </div>
          )}

          {/* 4. EXPERIENCE EDITOR */}
          {editingSection.type === 'experience' && (
            <div className="space-y-4">
              {(formData.items || []).map((job, jIdx) => (
                <div key={job.id || jIdx} className="p-3 border border-border rounded-lg bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Position #{jIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = formData.items.filter((_, i) => i !== jIdx);
                        setFormData({ ...formData, items: next });
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground block">Job Title</label>
                      <input
                        type="text"
                        value={job.title || ''}
                        onChange={(e) => {
                          const next = [...formData.items];
                          next[jIdx].title = e.target.value;
                          setFormData({ ...formData, items: next });
                        }}
                        className="w-full text-xs p-1.5 bg-background border border-border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block">Company</label>
                      <input
                        type="text"
                        value={job.company || ''}
                        onChange={(e) => {
                          const next = [...formData.items];
                          next[jIdx].company = e.target.value;
                          setFormData({ ...formData, items: next });
                        }}
                        className="w-full text-xs p-1.5 bg-background border border-border rounded"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-muted-foreground block">Start Date</label>
                      <input
                        type="text"
                        value={job.startDate || ''}
                        onChange={(e) => {
                          const next = [...formData.items];
                          next[jIdx].startDate = e.target.value;
                          setFormData({ ...formData, items: next });
                        }}
                        className="w-full text-xs p-1.5 bg-background border border-border rounded"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted-foreground block">End Date</label>
                      <input
                        type="text"
                        value={job.endDate || ''}
                        onChange={(e) => {
                          const next = [...formData.items];
                          next[jIdx].endDate = e.target.value;
                          setFormData({ ...formData, items: next });
                        }}
                        className="w-full text-xs p-1.5 bg-background border border-border rounded"
                      />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] text-muted-foreground block">Location</label>
                      <input
                        type="text"
                        value={job.location || ''}
                        onChange={(e) => {
                          const next = [...formData.items];
                          next[jIdx].location = e.target.value;
                          setFormData({ ...formData, items: next });
                        }}
                        className="w-full text-xs p-1.5 bg-background border border-border rounded"
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
                          onChange={(e) => {
                            const next = [...formData.items];
                            next[jIdx].bullets[bIdx] = e.target.value;
                            setFormData({ ...formData, items: next });
                          }}
                          className="flex-1 text-xs p-1.5 bg-background border border-border rounded"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            openAiAssistant(bullet, 'experience', (rewritten) => {
                              const next = [...formData.items];
                              next[jIdx].bullets[bIdx] = rewritten;
                              setFormData({ ...formData, items: next });
                            });
                          }}
                          className="p-1.5 text-primary hover:bg-primary/10 rounded transition-colors"
                          title="Enhance with AI"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const next = [...formData.items];
                            next[jIdx].bullets = next[jIdx].bullets.filter((_, i) => i !== bIdx);
                            setFormData({ ...formData, items: next });
                          }}
                          className="p-1.5 text-muted-foreground hover:text-destructive rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={() => {
                        const next = [...formData.items];
                        next[jIdx].bullets = [...(next[jIdx].bullets || []), ''];
                        setFormData({ ...formData, items: next });
                      }}
                      className="text-[11px] text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add bullet</span>
                    </button>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  const next = [
                    ...(formData.items || []),
                    {
                      id: `exp-${Date.now()}`,
                      title: 'Software Engineer',
                      company: 'Company Name',
                      startDate: '2023',
                      endDate: 'Present',
                      current: true,
                      bullets: ['Engineered scalable features...'],
                    },
                  ];
                  setFormData({ ...formData, items: next });
                }}
                className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Position</span>
              </button>
            </div>
          )}

          {/* 5. EDUCATION & OTHER SECTIONS FALLBACK */}
          {editingSection.type === 'education' && (
            <div className="space-y-4">
              {(formData.items || []).map((edu, eIdx) => (
                <div key={edu.id || eIdx} className="p-3 border border-border rounded-lg bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Institution #{eIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const next = formData.items.filter((_, i) => i !== eIdx);
                        setFormData({ ...formData, items: next });
                      }}
                      className="text-muted-foreground hover:text-destructive p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Degree (e.g. B.S., M.S.)"
                      value={edu.degree || ''}
                      onChange={(e) => {
                        const next = [...formData.items];
                        next[eIdx].degree = e.target.value;
                        setFormData({ ...formData, items: next });
                      }}
                      className="text-xs p-1.5 bg-background border border-border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Field of Study"
                      value={edu.fieldOfStudy || ''}
                      onChange={(e) => {
                        const next = [...formData.items];
                        next[eIdx].fieldOfStudy = e.target.value;
                        setFormData({ ...formData, items: next });
                      }}
                      className="text-xs p-1.5 bg-background border border-border rounded"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Institution Name"
                      value={edu.institution || ''}
                      onChange={(e) => {
                        const next = [...formData.items];
                        next[eIdx].institution = e.target.value;
                        setFormData({ ...formData, items: next });
                      }}
                      className="text-xs p-1.5 bg-background border border-border rounded"
                    />
                    <input
                      type="text"
                      placeholder="Graduation Year"
                      value={edu.graduationYear || ''}
                      onChange={(e) => {
                        const next = [...formData.items];
                        next[eIdx].graduationYear = e.target.value;
                        setFormData({ ...formData, items: next });
                      }}
                      className="text-xs p-1.5 bg-background border border-border rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Fact Integrity Notice */}
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border/80 flex items-start gap-2 text-xs text-muted-foreground">
            <AlertCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
            <div>
              <span>JobAchiever AI strictly preserves fact truthfulness. Only verified user details will be rendered on the exported PDF.</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 p-4 border-t border-border bg-muted/20">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
