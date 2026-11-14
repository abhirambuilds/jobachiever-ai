import { Search, X, LayoutGrid, List, Filter, ArrowUpDown, Layers } from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function ResumeFilterBar() {
  const {
    searchQuery,
    setSearchQuery,
    trackFilter,
    setTrackFilter,
    typeFilter,
    setTypeFilter,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
    viewMode,
    setViewMode,
    availableTracks,
    filteredDocuments,
    documents,
  } = useDocuments();

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    trackFilter !== 'all' ||
    typeFilter !== 'all' ||
    statusFilter !== 'all';

  const handleResetFilters = () => {
    setSearchQuery('');
    setTrackFilter('all');
    setTypeFilter('all');
    setStatusFilter('all');
    setSortBy('recent_upload');
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left: Search input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes by name, filename, or persona..."
            className="pl-9 pr-8 h-9 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs p-1"
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Right: Filters, Sorters & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Career Track Filter */}
          <div className="flex items-center gap-1.5 bg-card border border-border/70 rounded-lg px-2 py-1 text-xs">
            <Layers className="h-3.5 w-3.5 text-primary shrink-0" />
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
              className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by career track"
            >
              <option value="all">All Tracks</option>
              {availableTracks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Format / Type Filter */}
          <div className="flex items-center gap-1.5 bg-card border border-border/70 rounded-lg px-2 py-1 text-xs">
            <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by file type"
            >
              <option value="all">All Formats</option>
              <option value="pdf">PDF (.pdf)</option>
              <option value="docx">Word (.docx)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-card border border-border/70 rounded-lg px-2 py-1 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer pr-1"
              aria-label="Filter by processing status"
            >
              <option value="all">All Statuses</option>
              <option value="processed">Processed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Sorting */}
          <div className="flex items-center gap-1.5 bg-card border border-border/70 rounded-lg px-2 py-1 text-xs">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs text-foreground focus:outline-none cursor-pointer pr-1"
              aria-label="Sort resumes"
            >
              <option value="recent_upload">Recently Uploaded</option>
              <option value="recent_update">Recently Updated</option>
              <option value="alphabetical">Alphabetical (A–Z)</option>
              <option value="file_size">File Size (Largest)</option>
            </select>
          </div>

          {/* Grid / List View Toggle */}
          <div className="flex items-center rounded-lg border border-border/70 bg-muted/40 p-0.5">
            <Button
              type="button"
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('grid')}
              className="h-7 w-7 rounded-md"
              aria-label="Grid view"
              title="Grid view"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setViewMode('list')}
              className="h-7 w-7 rounded-md"
              aria-label="List view"
              title="List view"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results and Reset Bar */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <span>
          Showing <span className="font-semibold text-foreground">{filteredDocuments.length}</span> of{' '}
          <span className="font-semibold text-foreground">{documents.length}</span> resumes
        </span>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="text-primary hover:underline font-medium text-xs flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            <span>Reset filters</span>
          </button>
        )}
      </div>
    </div>
  );
}
