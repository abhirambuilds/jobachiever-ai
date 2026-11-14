import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Edit3,
  Eye,
  EyeOff,
  GripVertical,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';
import { SECTION_TYPES } from '@/services/resumeStudioService';

export function LeftContentPanel() {
  const {
    resume,
    updateResumeTitle,
    toggleSectionVisibility,
    reorderSections,
    removeSection,
    addSection,
    setEditingSection,
    resetToMasterProfile,
    openAiAssistant,
  } = useResumeStudio();

  const [addDropdownOpen, setAddDropdownOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(resume?.title || 'Master Resume');

  const sections = resume?.sections || [];

  const handleTitleSubmit = (e) => {
    e.preventDefault();
    if (titleInput.trim()) {
      updateResumeTitle(titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleAddSectionSelect = (type) => {
    const defaultMeta = SECTION_TYPES.find((s) => s.type === type);
    addSection(type, defaultMeta?.label || type);
    setAddDropdownOpen(false);
  };

  return (
    <aside className="w-full lg:w-80 xl:w-96 border-r border-border bg-card/60 backdrop-blur-sm flex flex-col h-full overflow-hidden">
      {/* 1. Header: Resume Title & Master Sync */}
      <div className="p-4 border-b border-border space-y-3 bg-muted/20">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Active Resume
          </span>
          {isEditingTitle ? (
            <form onSubmit={handleTitleSubmit} className="flex items-center gap-1.5 mt-1">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                autoFocus
                onBlur={handleTitleSubmit}
                className="w-full text-sm font-semibold px-2 py-1 bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </form>
          ) : (
            <div className="flex items-center justify-between group mt-0.5">
              <h2 className="text-sm font-bold text-foreground truncate pr-2">
                {resume?.title || 'Master Resume'}
              </h2>
              <button
                onClick={() => {
                  setTitleInput(resume?.title || '');
                  setIsEditingTitle(true);
                }}
                className="p-1 text-muted-foreground hover:text-foreground rounded hover:bg-muted opacity-80 group-hover:opacity-100 transition-opacity"
                title="Rename resume"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Sync or Reset Button */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-xs">
          <button
            onClick={() => {
              if (window.confirm('Reset this resume to match current Master Career Profile? Custom edits will be overwritten.')) {
                resetToMasterProfile();
              }
            }}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset to Master Profile</span>
          </button>
          <span className="text-[10px] px-1.5 py-0.5 bg-primary/10 text-primary font-mono font-medium rounded">
            {sections.filter((s) => s.visible).length} / {sections.length} Visible
          </span>
        </div>
      </div>

      {/* 2. Section List (Reorderable, Toggleable) */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <div className="flex items-center justify-between px-1 pb-1">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            Resume Sections
          </span>
          <span className="text-[10px] text-muted-foreground">Order & Visibility</span>
        </div>

        <div className="space-y-1.5">
          {sections.map((section, index) => {
            const isVisible = section.visible;
            const meta = SECTION_TYPES.find((s) => s.type === section.type);

            return (
              <div
                key={section.id}
                className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                  isVisible
                    ? 'bg-card border-border shadow-xs hover:border-border/80'
                    : 'bg-muted/40 border-dashed border-border/60 opacity-60'
                }`}
              >
                {/* Drag Grip / Reorder arrows */}
                <div className="flex items-center gap-1 text-muted-foreground">
                  <div className="flex flex-col -space-y-1">
                    <button
                      onClick={() => index > 0 && reorderSections(index, index - 1)}
                      disabled={index === 0}
                      className="p-0.5 hover:text-foreground disabled:opacity-20 transition-opacity"
                      title="Move up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => index < sections.length - 1 && reorderSections(index, index + 1)}
                      disabled={index === sections.length - 1}
                      className="p-0.5 hover:text-foreground disabled:opacity-20 transition-opacity"
                      title="Move down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </div>
                  <GripVertical className="w-3.5 h-3.5 text-muted-foreground/60" />
                </div>

                {/* Section Title & Description */}
                <div className="flex-1 min-w-0 px-2 cursor-pointer" onClick={() => setEditingSection(section)}>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-foreground truncate">
                      {section.title}
                    </span>
                    {meta?.badge && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground font-mono">
                        {meta.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {section.type === 'summary'
                      ? section.data?.summaryText?.slice(0, 35) + '...'
                      : section.data?.items
                      ? `${section.data.items.length} items recorded`
                      : section.data?.categories
                      ? `${section.data.categories.length} categories`
                      : 'Click to edit content'}
                  </p>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-0.5">
                  {/* AI Writing assistant shortcut for summary or experience */}
                  {(section.type === 'summary' || section.type === 'experience') && (
                    <button
                      onClick={() => {
                        const targetText =
                          section.type === 'summary'
                            ? section.data?.summaryText || ''
                            : section.data?.items?.[0]?.bullets?.[0] || '';
                        openAiAssistant(targetText, section.type, (newText) => {
                          if (section.type === 'summary') {
                            section.data.summaryText = newText;
                          }
                        });
                      }}
                      className="p-1 text-primary hover:bg-primary/10 rounded transition-colors"
                      title="AI Writing Assistant"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {/* Edit Section */}
                  <button
                    onClick={() => setEditingSection(section)}
                    className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                    title="Edit content"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    onClick={() => toggleSectionVisibility(section.id)}
                    className={`p-1 rounded transition-colors ${
                      isVisible
                        ? 'text-foreground hover:bg-muted'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                    title={isVisible ? 'Hide from resume' : 'Show on resume'}
                  >
                    {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete section (if not personal info) */}
                  {section.type !== 'personal_info' && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete section "${section.title}"?`)) {
                          removeSection(section.id);
                        }
                      }}
                      className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
                      title="Remove section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Add Section Footer */}
      <div className="p-3 border-t border-border bg-card relative">
        <button
          onClick={() => setAddDropdownOpen(!addDropdownOpen)}
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground font-semibold text-xs rounded-lg border border-border/80 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Resume Section</span>
        </button>

        {/* Dropdown Menu */}
        {addDropdownOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-popover border border-border rounded-lg shadow-xl p-1 z-30 space-y-0.5 max-h-60 overflow-y-auto">
            <div className="p-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/50">
              Select Section to Add
            </div>
            {SECTION_TYPES.map((st) => (
              <button
                key={st.type}
                onClick={() => handleAddSectionSelect(st.type)}
                className="w-full text-left px-2 py-1.5 text-xs hover:bg-accent rounded flex items-center justify-between text-popover-foreground transition-colors"
              >
                <span className="font-medium">{st.label}</span>
                <span className="text-[10px] text-muted-foreground font-mono">{st.category}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
