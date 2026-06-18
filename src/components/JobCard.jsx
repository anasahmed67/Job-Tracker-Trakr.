import { Calendar, Trash2, Edit2, MapPin, DollarSign, ExternalLink, GripVertical } from 'lucide-react';

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

export default function JobCard({ job, onEdit, onDelete, index }) {
  const initials = job.company ? job.company.slice(0, 2).toUpperCase() : 'JB';
  const logoBg = getCompanyGradient(job.company);

  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', job.id);
    e.dataTransfer.effectAllowed = 'move';
    // Add small delay to allow ghost image rendering before hiding
    setTimeout(() => {
      const el = document.getElementById(`card-${job.id}`);
      if (el) el.classList.add('dragging');
    }, 0);
  }

  function handleDragEnd() {
    const el = document.getElementById(`card-${job.id}`);
    if (el) el.classList.remove('dragging');
  }

  return (
    <article
      id={`card-${job.id}`}
      className={`job-card job-card-${job.status.toLowerCase()}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="job-card-header">
        <div className="card-company-group">
          <div className="company-logo-circle" style={{ background: logoBg }}>
            {initials}
          </div>
          <div className="card-title-text">
            <h4 className="card-company-name">{job.company}</h4>
            <span className="card-role-title">{job.role}</span>
          </div>
        </div>
        
        <div className="card-options-btn" title="Drag to move" style={{ cursor: 'grab' }}>
          <GripVertical size={16} />
        </div>
      </div>

      {job.notes ? (
        <p className="job-card-notes" title={job.notes}>
          {job.notes}
        </p>
      ) : null}

      {/* Tags Row: Location, Salary, URL Link */}
      <div className="card-tags">
        {job.location && (
          <span className="card-tag">
            <MapPin size={10} />
            {job.location}
          </span>
        )}
        
        {job.salary && (
          <span className="card-tag card-tag-salary">
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
            title="Open job listing"
            onClick={(e) => e.stopPropagation()} // Prevent card click behaviors
          >
            <ExternalLink size={10} />
            Listing
          </a>
        )}
      </div>

      <div className="job-card-footer">
        <span className="card-date">
          <Calendar size={12} />
          {job.dateApplied}
        </span>

        <div className="card-actions">
          <button
            type="button"
            className="card-action-btn"
            onClick={() => onEdit(job.id)}
            title="Edit Application"
          >
            <Edit2 size={13} />
          </button>
          <button
            type="button"
            className="card-action-btn btn-delete"
            onClick={() => onDelete(job.id)}
            title="Delete Application"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </article>
  );
}
