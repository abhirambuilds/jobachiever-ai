import { useState } from 'react';
import {
  Check,
  Columns,
  Layout,
  Palette,
  Sliders,
  Type,
} from 'lucide-react';
import { useResumeStudio } from '../../context/ResumeStudioContext';
import {
  TEMPLATES,
  AVAILABLE_FONTS,
  COLOR_PALETTES,
} from '@/services/resumeStudioService';

export function RightDesignPanel() {
  const { resume, designSettings, setTemplate, updateDesignSettings } = useResumeStudio();

  const [activeTab, setActiveTab] = useState('templates'); // 'templates' | 'typography' | 'colors' | 'layout'

  const activeTemplateId = resume?.templateId || designSettings?.templateId || 'ats_professional';

  return (
    <aside className="w-full lg:w-80 xl:w-96 border-l border-border bg-card/60 backdrop-blur-sm flex flex-col h-full overflow-hidden">
      {/* 1. Header & Navigation Tabs */}
      <div className="border-b border-border bg-muted/20">
        <div className="p-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Resume Styling & Layout
          </span>
          <h2 className="text-sm font-bold text-foreground">Design Studio</h2>
        </div>

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 px-2 pb-2 gap-1 text-xs">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'templates'
                ? 'bg-background text-foreground shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span className="text-[10px]">Templates</span>
          </button>

          <button
            onClick={() => setActiveTab('typography')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'typography'
                ? 'bg-background text-foreground shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            <span className="text-[10px]">Fonts</span>
          </button>

          <button
            onClick={() => setActiveTab('colors')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'colors'
                ? 'bg-background text-foreground shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="text-[10px]">Colors</span>
          </button>

          <button
            onClick={() => setActiveTab('layout')}
            className={`py-1.5 px-2 rounded-lg font-semibold flex flex-col items-center gap-1 transition-colors ${
              activeTab === 'layout'
                ? 'bg-background text-foreground shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="text-[10px]">Layout</span>
          </button>
        </div>
      </div>

      {/* 2. Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* TAB 1: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-3">
            <div className="text-xs text-muted-foreground">
              Choose from 5 professionally engineered, ATS-compliant template architectures.
            </div>

            <div className="space-y-2.5">
              {TEMPLATES.map((tpl) => {
                const isSelected = activeTemplateId === tpl.id || activeTemplateId.replace(/-/g, '_') === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => setTemplate(tpl.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary/5 border-primary shadow-xs ring-1 ring-primary'
                        : 'bg-card border-border hover:border-border/80 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{tpl.name}</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-secondary text-secondary-foreground font-medium">
                            {tpl.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-1 leading-snug">
                          {tpl.description}
                        </p>
                      </div>
                      {isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-border shrink-0" />
                      )}
                    </div>

                    <div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span className="truncate">For: {tpl.recommendedFor}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: TYPOGRAPHY */}
        {activeTab === 'typography' && (
          <div className="space-y-4">
            {/* Font Family */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Font Family
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {AVAILABLE_FONTS.map((f) => {
                  const isCurrent = designSettings.fontFamily === f.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => updateDesignSettings({ fontFamily: f.id })}
                      className={`w-full text-left p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-primary/10 border-primary text-primary font-bold'
                          : 'bg-card border-border hover:bg-muted/50 text-foreground'
                      }`}
                      style={{ fontFamily: f.family }}
                    >
                      <span>{f.name}</span>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Base Font Size */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Body Font Size
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'compact', label: 'Compact', detail: '9.5 pt' },
                  { id: 'normal', label: 'Standard', detail: '10.5 pt' },
                  { id: 'relaxed', label: 'Large', detail: '11.5 pt' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateDesignSettings({ fontSize: s.id })}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      (designSettings.fontSize || 'normal') === s.id
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'bg-card border-border hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="text-xs">{s.label}</div>
                    <div className="text-[10px] font-mono opacity-80">{s.detail}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Line Height */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <div className="flex justify-between items-center text-xs">
                <label className="font-bold text-foreground uppercase tracking-wider">
                  Line Spacing
                </label>
                <span className="font-mono text-muted-foreground">{designSettings.lineHeight || 1.45}x</span>
              </div>
              <input
                type="range"
                min="1.25"
                max="1.75"
                step="0.05"
                value={designSettings.lineHeight || 1.45}
                onChange={(e) => updateDesignSettings({ lineHeight: parseFloat(e.target.value) })}
                className="w-full accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                <span>Tight (1.25x)</span>
                <span>Balanced (1.45x)</span>
                <span>Spacious (1.75x)</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COLORS */}
        {activeTab === 'colors' && (
          <div className="space-y-4">
            <div className="text-xs text-muted-foreground">
              Select an accent palette or customize individual primary and secondary tones.
            </div>

            {/* Preset Palettes */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Color Presets
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {COLOR_PALETTES.map((palette) => {
                  const isCurrent = designSettings.primaryColor === palette.primary;
                  return (
                    <button
                      key={palette.id}
                      onClick={() =>
                        updateDesignSettings({
                          primaryColor: palette.primary,
                          secondaryColor: palette.secondary,
                        })
                      }
                      className={`w-full p-2.5 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                        isCurrent
                          ? 'bg-muted border-primary font-bold'
                          : 'bg-card border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="flex items-center -space-x-1">
                          <span
                            className="w-4 h-4 rounded-full border border-background shadow-xs"
                            style={{ backgroundColor: palette.primary }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-background shadow-xs"
                            style={{ backgroundColor: palette.secondary }}
                          />
                        </div>
                        <span className="text-foreground">{palette.name}</span>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Inputs */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Custom Colors
              </label>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Primary Accent:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designSettings.primaryColor || '#0f172a'}
                      onChange={(e) => updateDesignSettings({ primaryColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={designSettings.primaryColor || '#0f172a'}
                      onChange={(e) => updateDesignSettings({ primaryColor: e.target.value })}
                      className="w-20 text-xs font-mono px-1.5 py-0.5 border border-border rounded bg-background"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Secondary Accent:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={designSettings.secondaryColor || '#475569'}
                      onChange={(e) => updateDesignSettings({ secondaryColor: e.target.value })}
                      className="w-6 h-6 rounded cursor-pointer border border-border"
                    />
                    <input
                      type="text"
                      value={designSettings.secondaryColor || '#475569'}
                      onChange={(e) => updateDesignSettings({ secondaryColor: e.target.value })}
                      className="w-20 text-xs font-mono px-1.5 py-0.5 border border-border rounded bg-background"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LAYOUT & SPACING */}
        {activeTab === 'layout' && (
          <div className="space-y-4">
            {/* Page Margins */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Page Margins (A4 Padding)
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'compact', label: 'Compact', detail: '16 mm' },
                  { id: 'normal', label: 'Normal', detail: '24 mm' },
                  { id: 'relaxed', label: 'Relaxed', detail: '30 mm' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() => updateDesignSettings({ margins: m.id })}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      (designSettings.margins || 'normal') === m.id
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'bg-card border-border hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="text-xs">{m.label}</div>
                    <div className="text-[10px] font-mono opacity-80">{m.detail}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Section Spacing */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <label className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Section Separation
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'compact', label: 'Tight' },
                  { id: 'normal', label: 'Standard' },
                  { id: 'spacious', label: 'Spacious' },
                ].map((sp) => (
                  <button
                    key={sp.id}
                    onClick={() => updateDesignSettings({ sectionSpacing: sp.id })}
                    className={`p-2 rounded-lg border text-center transition-colors ${
                      (designSettings.sectionSpacing || 'normal') === sp.id
                        ? 'bg-primary/10 border-primary text-primary font-bold'
                        : 'bg-card border-border hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <div className="text-xs">{sp.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Column Layout summary */}
            <div className="p-3 bg-muted/40 rounded-xl border border-border/60 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Columns className="w-3.5 h-3.5 text-primary" />
                <span>Layout Architecture</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Single-column layouts maximize ATS machine readability, while two-column layouts compress high volume credentials efficiently.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
