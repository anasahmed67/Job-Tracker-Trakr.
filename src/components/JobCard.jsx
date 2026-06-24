import { Calendar, Trash2, Edit2, MapPin, DollarSign, ExternalLink, GripVertical } from 'lucide-react';

// getCompanyGradient returns a *stable* (consistent) gradient choice
// based on the company name. That way, the same company always looks the same.
function getCompanyGradient(name) {
  const gradients = [
    'var(--gradient-applied)',
    'var(--gradient-interview)',
    'var(--gradient-offer)',
    'var(--gradient-rejected)',
    'var(--gradient-applied)',
  ];

  // Fallback if company name is empty.
  if (!name) return gradients[0];

  // Simple hash: turns the string into a number.
  // Using modulo picks one gradient from the array.
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;

  // Return the chosen CSS variable-based gradient.
  return gradients[index];
}

export default function JobCard({ job, onEdit, onDelete, index }) {
  // initials are displayed inside the circular "logo".
  const initials = job.company ? job.company.slice(0, 2).toUpperCase() : 'JB';

  // Pick a color theme for the card based on company name.
  const logoBg = getCompanyGradient(job.company);

  // Start drag: we store the job id inside the drag "payload".
  function handleDragStart(e) {
    // This is later read by JobBoard when the drop happens.
    e.dataTransfer.setData('text/plain', job.id);

    // Hint to the browser that the intended effect is moving.
    e.dataTransfer.effectAllowed = 'move';

    // Small delay so the browser can render the drag ghost image
    // before we apply the 'dragging' class.
    setTimeout(() => {
      const el = document.getElementById(`card-${job.id}`);
      if (el) el.classList.add('dragging');
    }, 0);
  }

  // End drag: remove any temporary CSS class.
  function handleDragEnd() {
    const el = document.getElementById(`card-${job.id}`);
    if (el) el.classList.remove('dragging');
  }

  return (
    // article acts as a draggable card UI element.
    <article
      id={`card-${job.id}`}
      className={`job-card job-card-${job.status.toLowerCase()}`}
      draggable="true"
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      // Stagger animation delay for nicer visual effect.
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Header: company "logo" + company/role text + drag handle */}
      <div className="job-card-header">
        <div className="card-company-group">
          {/* Circular company avatar with gradient background */}
          <div className="company-logo-circle" style={{ background: logoBg }}>
            {initials}
          </div>

          {/* Text area next to the avatar */}
          <div className="card-title-text">
            <h4 className="card-company-name">{job.company}</h4>
            <span className="card-role-title">{job.role}</span>
          </div>
        </div>

        {/* Visual drag cue (actual drag behavior is on the article element) */}
        <div className="card-options-btn" title="Drag to move" style={{ cursor: 'grab' }}>
          <GripVertical size={16} />
        </div>
      </div>

      {/* Notes are optional; only show this paragraph when there is text. */}
      {job.notes ? (
        <p className="job-card-notes" title={job.notes}>
          {job.notes}
        </p>
      ) : null}

      {/* Tags Row: Location, Salary, URL Link */}
      <div className="card-tags">
        {/* Show location tag only if provided */}
        {job.location && (
          <span className="card-tag">
            <MapPin size={10} />
            {job.location}
          </span>
        )}

        {/* Show salary tag only if provided */}
        {job.salary && (
          <span className="card-tag card-tag-salary">
            <DollarSign size={10} />
            {job.salary}
          </span>
        )}

        {/* Show external link only if provided */}
        {job.url && (
          <a
            href={job.url.startsWith('http') ? job.url : `https://${job.url}`}
            target="_blank"
            rel="noopener noreferrer"
            className="card-tag card-tag-url"
            title="Open job listing"
            // stopPropagation prevents the click from affecting parent drag/click behavior.
            onClick={(e) => e.stopPropagation()} // Prevent card click behaviors
          >
            <ExternalLink size={10} />
            Listing
          </a>
        )}
      </div>

      {/* Footer: date + edit/delete buttons */}
      <div className="job-card-footer">
        <span className="card-date">
          <Calendar size={12} />
          {job.dateApplied}
        </span>

        <div className="card-actions">
          {/* Ask the parent App to open the edit modal */}
          <button
            type="button"
            className="card-action-btn"
            onClick={() => onEdit(job.id)}
            title="Edit Application"
          >
            <Edit2 size={13} />
          </button>

          {/* Ask the parent App to delete this job */}
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
