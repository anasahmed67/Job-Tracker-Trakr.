import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Briefcase, Plus, Search, LayoutGrid, List,
  Star, Clock, Target, Settings, ChevronDown, Menu
} from 'lucide-react';
import './App.css';

import { createId } from './lib/id';
import { loadJobs, saveJobs } from './lib/storage';

import StatsBar from './components/StatsBar';
import JobForm from './components/JobForm';
import JobBoard from './components/JobBoard';
import JobList from './components/JobList';

// Allowed job "pipeline" statuses in this app.
// Job cards/board can only switch to one of these values.
const STATUSES = ['Applied', 'Interview', 'Rejected', 'Offer'];

/**
 * normalizeText is used by the search logic.
 * It turns any input into a lowercase trimmed string so searches are forgiving.
 */
function normalizeText(s) {
  return String(s ?? '').toLowerCase().trim();
}

export default function App() {
  /**
   * jobs is the single source of truth for the whole app.
   * - It starts by loading saved jobs from localStorage (loadJobs()).
   * - Any add/edit/delete/status-change updates this array.
   */
  const [jobs, setJobs] = useState(() => loadJobs());

  // searchQuery is the text typed into the search box.
  const [searchQuery, setSearchQuery] = useState('');

  // statusFilter filters jobs shown on screen (either a specific status or 'All').
  const [statusFilter, setStatusFilter] = useState('All');

  // viewMode decides whether we render the board (columns) or list (table) view.
  const [viewMode, setViewMode] = useState('board');

  // isFormOpen controls whether the JobForm modal is visible.
  const [isFormOpen, setIsFormOpen] = useState(false);

  // editingId tells us which job is being edited (null means "adding a new job").
  const [editingId, setEditingId] = useState(null);

  // sidebarSection tracks which sidebar item is currently selected for highlighting.
  const [sidebarSection, setSidebarSection] = useState('pipeline');

  // isSidebarOpen controls the mobile sidebar off-canvas visibility.
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Persist jobs to localStorage whenever jobs change.
  useEffect(() => { saveJobs(jobs); }, [jobs]);

  // Helper to close the sidebar (used by navigation clicks & overlay click).
  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  /**
   * editingJob is the full job object we pass into <JobForm /> when editing.
   * - If editingId is null, editingJob becomes null.
   * - When editingId matches a job.id, we select that job from the jobs array.
   */
  const editingJob = useMemo(
    () => jobs.find((j) => j.id === editingId) ?? null,
    [jobs, editingId]
  );

  /**
   * filteredJobs is derived from:
   * - jobs (the full dataset)
   * - searchQuery (text filter)
   * - statusFilter (status filter)
   *
   * Data flow:
   * user types/searches/chooses a filter -> App state updates ->
   * filteredJobs recomputes -> UI components re-render with the smaller list.
   */
  const filteredJobs = useMemo(() => {
    const q = normalizeText(searchQuery);
    return jobs.filter((job) => {
      // If the user selected a specific status, hide jobs that don't match it.
      if (statusFilter !== 'All' && job.status !== statusFilter) return false;

      // If the user isn't searching anything, keep all jobs that pass status filter.
      if (!q) return true;

      // Otherwise, check if the search query appears in any searchable field.
      return (
        normalizeText(job.company).includes(q) ||
        normalizeText(job.role).includes(q) ||
        normalizeText(job.notes).includes(q) ||
        normalizeText(job.location).includes(q) ||
        normalizeText(job.salary).includes(q)
      );
    });
  }, [jobs, searchQuery, statusFilter]);

  /**
   * counts is used for badges and the header summary.
   * It is calculated from the full jobs array (not filteredJobs) so it reflects total data.
   */
  const counts = useMemo(() => {
    const c = { All: jobs.length, Applied: 0, Interview: 0, Rejected: 0, Offer: 0 };
    for (const j of jobs) if (c[j.status] !== undefined) c[j.status]++;
    return c;
  }, [jobs]);

  /**
   * handleAddOrUpdate receives a "payload" from <JobForm /> and updates App state.
   * - If editingJob exists, we update the matching job in the jobs array.
   * - Otherwise, we create a brand new job with a new id (createId()).
   *
   * IMPORTANT: We only transform/clean fields (trim, defaults) here.
   * The actual UI behavior (open/close modal, job added/updated) remains the same.
   */
  function handleAddOrUpdate(payload) {
    const sanitized = {
      company: payload.company?.trim() ?? '',
      role: payload.role?.trim() ?? '',
      status: STATUSES.includes(payload.status) ? payload.status : 'Applied',
      notes: payload.notes?.trim() ?? '',
      dateApplied: payload.dateApplied ?? '',
      location: payload.location?.trim() ?? 'Remote',
      salary: payload.salary?.trim() ?? '',
      url: payload.url?.trim() ?? '',
    };

    if (editingJob) {
      // Replace only the job being edited.
      setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? { ...j, ...sanitized } : j)));
      setEditingId(null);
    } else {
      // Create a new job entry.
      setJobs((prev) => [...prev, { id: createId(), ...sanitized }]);
    }

    // Close the modal after updating.
    setIsFormOpen(false);
  }

  // Delete flow:
  // - Find the job (so we can show a friendly confirm message).
  // - Confirm with the user.
  // - Remove it from jobs.
  // - If it was currently being edited, close the modal.
  function handleDelete(id) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    if (!window.confirm(`Delete ${job.company} — ${job.role}? This cannot be undone.`)) return;

    setJobs((prev) => prev.filter((j) => j.id !== id));

    if (editingId === id) { setEditingId(null); setIsFormOpen(false); }
  }

  // Start editing: remember which job id we want, then open the modal.
  function handleEdit(id) { setEditingId(id); setIsFormOpen(true); }

  // Cancel closes the modal and clears editingId (goes back to "add" mode).
  function handleCancelForm() { setEditingId(null); setIsFormOpen(false); }

  // Status change flow (used by drag/drop in JobBoard):
  // - validate newStatus
  // - update only the job that matches id
  function handleStatusChange(id, newStatus) {
    if (!STATUSES.includes(newStatus)) return;
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, status: newStatus } : j)));
  }

  const sideNavItems = [
    { id: 'pipeline', label: 'Pipeline', icon: <LayoutGrid size={15} />, count: counts.All },
    { id: 'interviews', label: 'Interviews', icon: <Star size={15} />, count: counts.Interview },
    { id: 'offers', label: 'Offers', icon: <Target size={15} />, count: counts.Offer },
    { id: 'recent', label: 'Recent', icon: <Clock size={15} /> },
  ];

  const SidebarContent = (
    <>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Briefcase size={18} strokeWidth={2.5} />
        </div>
        <span className="brand-name">Trackr.</span>
        <ChevronDown size={14} className="brand-chevron" />
      </div>

      {/* Quick nav */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Workspace</div>
        {sideNavItems.map((item) => (
          <button
            key={item.id}
            className={`sidebar-nav-item ${sidebarSection === item.id ? 'active' : ''}`}
            onClick={() => {
              setSidebarSection(item.id);
              if (item.id === 'interviews') setStatusFilter('Interview');
              else if (item.id === 'offers') setStatusFilter('Offer');
              else setStatusFilter('All');
              closeSidebar();
            }}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span>{item.label}</span>
            {item.count !== undefined && item.count > 0 && (
              <span className="sidebar-nav-badge">{item.count}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Status breakdown */}
      <div className="sidebar-divider" />
      <div className="sidebar-section-label">By Status</div>
      <nav className="sidebar-nav">
        {[
          { id: 'Applied', color: 'var(--color-applied)' },
          { id: 'Interview', color: 'var(--color-interview)' },
          { id: 'Offer', color: 'var(--color-offer)' },
          { id: 'Rejected', color: 'var(--color-rejected)' },
        ].map((s) => (
          <button
            key={s.id}
            className={`sidebar-nav-item ${statusFilter === s.id && sidebarSection === 'pipeline' ? 'active' : ''}`}
            onClick={() => {
              setStatusFilter(s.id);
              setSidebarSection('pipeline');
              closeSidebar();
            }}
          >
            <span className="sidebar-status-dot" style={{ background: s.color }} />
            <span>{s.id}</span>
            <span className="sidebar-nav-badge" style={{ color: s.color, background: 'transparent' }}>
              {counts[s.id]}
            </span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="sidebar-divider" />
        <button className="sidebar-nav-item" onClick={closeSidebar}>
          <span className="sidebar-nav-icon"><Settings size={15} /></span>
          <span>Settings</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="app-shell">

      {/* ── Sidebar (desktop) ── */}
      <aside className="sidebar sidebar-desktop">
        {SidebarContent}
      </aside>

      {/* ── Sidebar (mobile off-canvas) ── */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
        onClick={closeSidebar}
        role="presentation"
      >
        <aside
          className={`sidebar sidebar-mobile ${isSidebarOpen ? 'open' : ''}`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
        >
          {SidebarContent}
        </aside>
      </div>

      {/* ── Main panel ── */}
      <div className="main-panel">

        {/* Top bar */}
        <header className="topbar">
          <button
            type="button"
            className="topbar-hamburger"
            aria-label="Open navigation"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu size={18} />
          </button>

          <div className="topbar-search-wrapper">
            <Search size={15} className="topbar-search-icon" />
            <input
              type="text"
              className="topbar-search"
              placeholder='Try searching "Google" or "Frontend"'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <div className="view-toggle">
              <button
                className={`view-toggle-btn ${viewMode === 'board' ? 'active' : ''}`}
                onClick={() => setViewMode('board')}
              ><LayoutGrid size={14} /> Board</button>
              <button
                className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              ><List size={14} /> List</button>
            </div>
            <button
              className="btn-add"
              onClick={() => { setEditingId(null); setIsFormOpen(true); }}
            >
              <Plus size={15} />
              Track Job
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="content-area">
          {/* Page title */}
          <div className="page-header">
            <h1 className="page-title">My Job Pipeline</h1>
            <p className="page-subtitle">
              {counts.All} applications · {counts.Interview} interviews · {counts.Offer} offers
            </p>
          </div>

          {/* Stats */}
          <StatsBar
            jobs={jobs}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />

          {/* Status filter tabs */}
          <div className="filter-tabs">
            {[
              { id: 'All', label: 'All' },
              { id: 'Applied', label: 'Applied' },
              { id: 'Interview', label: 'Interview' },
              { id: 'Offer', label: 'Offer' },
              { id: 'Rejected', label: 'Rejected' },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`filter-tab ${statusFilter === tab.id ? 'active' : ''}`}
                onClick={() => setStatusFilter(tab.id)}
              >
                {tab.label}
                <span className="filter-tab-count">{counts[tab.id] ?? 0}</span>
              </button>
            ))}
          </div>

          {/* Board / List */}
          {viewMode === 'board' ? (
            <JobBoard
              jobs={filteredJobs}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <JobList
              jobs={filteredJobs}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      {/* Modal */}
      {isFormOpen && (
        <JobForm
          isOpen={isFormOpen}
          initialJob={editingJob}
          onSubmit={handleAddOrUpdate}
          onCancel={handleCancelForm}
        />
      )}
    </div>
  );
}
