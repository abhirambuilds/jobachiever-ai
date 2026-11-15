import React from 'react';
import { Briefcase, CheckCircle2, ChevronDown, Plus, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CareerTrackSelector({
  tracks = [],
  selectedTrackId,
  onSelectTrack,
  isLoading = false,
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTrack = tracks.find(t => t.id === selectedTrackId) || tracks[0] || null;

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/70 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                Active Career Persona
              </span>
              {currentTrack?.primary && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Star className="w-2.5 h-2.5 fill-current" /> Primary
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-foreground">
              {currentTrack?.name || 'No Career Track Selected'}
            </h2>
            {currentTrack?.targetRole && (
              <p className="text-xs text-muted-foreground">
                Target Role: <span className="font-medium text-foreground">{currentTrack.targetRole}</span>
                {currentTrack.targetSeniority && ` • ${currentTrack.targetSeniority.replace('_', ' ')}`}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {tracks.length > 1 && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                disabled={isLoading}
                className="inline-flex items-center justify-between gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg bg-background border border-border hover:bg-muted/60 transition-colors shadow-sm disabled:opacity-50"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
              >
                <span>Switch Track ({tracks.length})</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl bg-card border border-border shadow-xl z-50 p-1 divide-y divide-border/50">
                  <div className="py-1">
                    <p className="px-3 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Available Career Personas
                    </p>
                    {tracks.map(track => {
                      const isSelected = track.id === selectedTrackId;
                      return (
                        <button
                          key={track.id}
                          type="button"
                          onClick={() => {
                            onSelectTrack(track.id);
                            setIsOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs rounded-lg transition-colors ${
                            isSelected
                              ? 'bg-primary/10 text-primary font-semibold'
                              : 'text-foreground hover:bg-muted/70'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="truncate">{track.name}</span>
                              {track.primary && (
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500 shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate">
                              {track.targetRole}
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-1">
                    <Link
                      to="/career-tracks"
                      className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-colors"
                      onClick={() => setIsOpen(false)}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Manage Career Tracks
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          <Link
            to="/career-tracks"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg border border-transparent transition-colors"
          >
            Tracks Overview
          </Link>
        </div>
      </div>
    </div>
  );
}
