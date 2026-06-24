import { Search, LayoutGrid, List } from 'lucide-react';

// FILTER_CATEGORIES drives the "pill" UI.
// Each pill has:
/// - id: the status value stored in App state
// - label: what we show on the button
// - color/glow: used by inline styles + CSS variables
const FILTER_CATEGORIES = [
  { id: 'All', label: 'All Statuses', color: 'var(--primary)', glow: 'rgba(99, 102, 241, 0.25)' },
  { id: 'Applied', label: 'Applied', color: 'var(--color-applied)', glow: 'rgba(168, 85, 247, 0.25)' },
  { id: 'Interview', label: 'Interviews', color: 'var(--color-interview)', glow: 'rgba(6, 182, 212, 0.25)' },
  { id: 'Offer', label: 'Offers', color: 'var(--color-offer)', glow: 'rgba(16, 185, 129, 0.25)' },
  { id: 'Rejected', label: 'Rejected', color: 'var(--color-rejected)', glow: 'rgba(244, 63, 94, 0.25)' },
];

export default function JobFilters({
  // searchQuery is controlled by App and typed here.
  searchQuery,
  setSearchQuery,

  // statusFilter is the selected pill/status.
  statusFilter,
  setStatusFilter,

  // viewMode decides if App renders board or list.
  viewMode,
  setViewMode,

  // jobs is passed in so we can compute counts for the pills.
  jobs = []
}) {
  // counts are computed from the passed-in jobs list.
  // NOTE: this is for the pill badges, not the filtering itself.
  const counts = {
    All: jobs.length,
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0,
  };

  for (const job of jobs) {
    // Keep All equal to the total number of jobs.
    counts.All = jobs.length;

    // Only increment if the job.status matches one of our keys.
    if (counts[job.status] !== undefined) {
      counts[job.status] += 1;
    }
  }

  return (
    // This section wraps the search + pills + view toggle.
    <section className="controls-row animated-fade" aria-label="Dashboard controls">
      <div className="search-filter-group">
        {/* Search Input */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />

          {/* Controlled input:
              value comes from searchQuery
              changes call setSearchQuery so App state updates */}
          <input
            id="search"
            type="text"
            className="search-input"
            value={searchQuery}
            placeholder="Search company or role..."
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Pills */}
        <div className="status-pills">
          {FILTER_CATEGORIES.map((cat) => {
            // isActive controls the visual "selected" state.
            const isActive = statusFilter === cat.id;

            // count shows how many jobs in the passed list match this status.
            const count = counts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                type="button"
                className={`pill-btn ${isActive ? 'active' : ''}`}
                // Clicking a pill updates App's statusFilter.
                onClick={() => setStatusFilter(cat.id)}
                // Inline styles set CSS variables used for the pill glow.
                style={{
                  '--active-pill-bg': cat.color,
                  '--active-pill-glow': cat.glow,
                }}
              >
                {/* Show "All" as the button text; other pills show their label */}
                <span>{cat.id === 'All' ? 'All' : cat.label}</span>
                <span className="pill-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* View Mode Toggle (Board vs List) */}
      <div className="view-mode-selector">
        <button
          type="button"
          className={`toggle-view-btn ${viewMode === 'board' ? 'active' : ''}`}
          // Clicking updates App view mode state.
          onClick={() => setViewMode('board')}
          title="Board View"
        >
          <LayoutGrid size={15} />
          <span>Board</span>
        </button>

        <button
          type="button"
          className={`toggle-view-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
          title="List View"
        >
          <List size={15} />
          <span>List</span>
        </button>
      </div>
    </section>
  );
}
