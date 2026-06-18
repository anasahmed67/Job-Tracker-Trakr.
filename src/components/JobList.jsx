import { Calendar, Trash2, Edit2, MapPin, DollarSign, ExternalLink, Briefcase } from 'lucide-react';

// Returns a deterministic gradient based on company name
// Note: uses CSS token gradients so theme changes stay consistent.
function getCompanyGradient(name) {
  const gradients = [
    'var(--gradient-applied)',
    'var(--gradient-interview)',
    'var(--gradient-offer)',
    'var(--gradient-rejected)',
    'var(--gradient-applied)',
  ];

  if (!name) return gradients[0];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export default function JobList({ jobs, onEdit, onDelete }) {
  if (jobs.length === 0) {
    return (
      <div className="app-empty-state animated-slide-up">
        <div className="empty-state-icon">
          <Briefcase size={28} />
        </div>
        <h3>No applications found</h3>
        <p>Try refining your filters or search terms, or add a new job tracker.</p>
      </div>
    );
  }

  return (
    <div className="list-wrapper animated-slide-up">
      {/* Table Header - Hidden on small screens via CSS/media query if needed, or structured cleanly */}
      <div className="list-table-header">
        <div className="list-header-cell">Company</div>
        <div className="list-header-cell">Role</div>
        <div className="list-header-cell">Status</div>
        <div className="list-header-cell">Details</div>
        <div className="list-header-cell" style={{ textAlign: 'right' }}>Actions</div>
      </div>

      <div className="list-cards-container">
        {jobs.map((job) => {
          const initials = job.company ? job.company.slice(0, 2).toUpperCase() : 'JB';
          const logoBg = getCompanyGradient(job.company);

          return (
            <div key={job.id} className="list-item-row">
              {/* Company Column */}
              <div className="list-item-company-cell">
                <div className="company-logo-circle" style={{ background: logoBg }}>
                  {initials}
                </div>
                <div className="company-details-txt">
                  <h4>{job.company}</h4>
                  <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {job.dateApplied}
                  </p>
                </div>
              </div>

              {/* Role Column */}
              <div className="list-item-role-cell">
                {job.role}
              </div>

              {/* Status Column */}
              <div>
                <span className={`status-badge status-badge-${job.status.toLowerCase()}`}>
                  {job.status}
                </span>
              </div>

              {/* Details (Location / Salary / Notes) Column */}
              <div className="list-item-meta-cell" style={{ flexWrap: 'wrap', gap: '8px' }}>
                {job.location && (
                  <span className="card-tag" style={{ margin: 0 }}>
                    <MapPin size={10} />
                    {job.location}
                  </span>
                )}
                {job.salary && (
                  <span className="card-tag card-tag-salary" style={{ margin: 0 }}>
                    <DollarSign size={10} />
                    {job.salary}
                  </span>
                )}
                {job.url && (
                  <a
                    href={job.url.startsWith('http') ? job.url : `https://${job.url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-tag card-tag-url"
                    style={{ margin: 0 }}
                  >
                    <ExternalLink size={10} />
                    URL
                  </a>
                )}
              </div>

              {/* Actions Column */}
              <div className="list-item-actions-cell">
                <button
                  type="button"
                  className="card-action-btn"
                  onClick={() => onEdit(job.id)}
                  title="Edit"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  type="button"
                  className="card-action-btn btn-delete"
                  onClick={() => onDelete(job.id)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
