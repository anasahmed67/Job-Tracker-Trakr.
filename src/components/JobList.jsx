import { Calendar, Trash2, Edit2, MapPin, DollarSign, ExternalLink, Briefcase } from 'lucide-react';

// getCompanyGradient picks a consistent CSS gradient for each company name.
// This makes it easy to visually scan the list.
function getCompanyGradient(name) {
  const gradients = [
    'var(--gradient-applied)',
    'var(--gradient-interview)',
    'var(--gradient-offer)',
    'var(--gradient-rejected)',
    'var(--gradient-applied)',
  ];

  // If there's no company name, fall back to the first gradient.
  if (!name) return gradients[0];

  // Turn the string into a number so we can pick an index.
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Pick a gradient using modulo.
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

export default function JobList({ jobs, onEdit, onDelete }) {
  // Empty state: when there are no jobs to show (after filtering/search).
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
    // list-wrapper contains the table-like rows.
    <div className="list-wrapper animated-slide-up">
      {/* Header row */}
      <div className="list-table-header">
        <div className="list-header-cell">Company</div>
        <div className="list-header-cell">Role</div>
        <div className="list-header-cell">Status</div>
        <div className="list-header-cell">Details</div>
        <div className="list-header-cell" style={{ textAlign: 'right' }}>Actions</div>
      </div>

      <div className="list-cards-container">
        {/* One list row per job in the provided jobs array */}
        {jobs.map((job) => {
          // initials are used inside the avatar circle.
          const initials = job.company ? job.company.slice(0, 2).toUpperCase() : 'JB';
          // choose a consistent gradient avatar background.
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

                  {/* dateApplied is stored as a YYYY-MM-DD string in App/JobForm */}
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
                {/* status-badge-{status} lets CSS apply different colors */}
                <span className={`status-badge status-badge-${job.status.toLowerCase()}`}>
                  {job.status}
                </span>
              </div>

              {/* Details (Location / Salary / URL) Column */}
              <div className="list-item-meta-cell" style={{ flexWrap: 'wrap', gap: '8px' }}>
                {/* Only show tags if the field has a value */}
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

              {/* Actions Column: delegate to App handlers */}
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
