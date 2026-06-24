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

const STATUSES = ['Applied', 'Interview', 'Rejected', 'Offer'];

function normalizeText(s) {
  return String(s ?? '').toLowerCase().trim();
}

export default function App() {
  const [jobs, setJobs] = useState(() => loadJobs());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [viewMode, setViewMode] = useState('board');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [sidebarSection, setSidebarSection] = useState('pipeline');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => { saveJobs(jobs); }, [jobs]);

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), []);

  const editingJob = useMemo(
    () => jobs.find((j) => j.id === editingId) ?? null,
    [jobs, editingId]
  );

  const filteredJobs = useMemo(() => {
    const q = normalizeText(searchQuery);
    return jobs.filter((job) => {
      if (statusFilter !== 'All' && job.status !== statusFilter) return false;
      if (!q) return true;
      return (
        normalizeText(job.company).includes(q) ||
        normalizeText(job.role).includes(q) ||
        normalizeText(job.notes).includes(q) ||
        normalizeText(job.location).includes(q) ||
        normalizeText(job.salary).includes(q)
      );
    });
  }, [jobs, searchQuery, statusFilter]);

  const counts = useMemo(() => {
    const c = { All: jobs.length, Applied: 0, Interview: 0, Rejected: 0, Offer: 0 };
    for (const j of jobs) if (c[j.status] !== undefined) c[j.status]++;
    return c;
  }, [jobs]);

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
      setJobs((prev) => prev.map((j) => (j.id === editingJob.id ? { ...j, ...sanitized } : j)));
      setEditingId(null);
    } else {
      setJobs((prev) => [...prev, { id: createId(), ...sanitized }]);
    }
    setIsFormOpen(false);
  }

  function handleDelete(id) {
    const job = jobs.find((j) => j.id === id);
    if (!job) return;
    if (!window.confirm(`Delete ${job.company} — ${job.role}? This cannot be undone.`)) return;
    setJobs((prev) => prev.filter((j) => j.id !== id));
    if (editingId === id) { setEditingId(null); setIsFormOpen(false); }
  }

  function handleEdit(id) { setEditingId(id); setIsFormOpen(true); }
  function handleCancelForm() { setEditingId(null); setIsFormOpen(false); }
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
