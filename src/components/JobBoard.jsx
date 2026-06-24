import { Briefcase, Eye, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import JobCard from './JobCard';

// COLUMNS describes the visual pipeline columns.
// Each column maps to a job.status value in the App state.
const COLUMNS = [
  { id: 'Applied', title: 'Applied', icon: Briefcase, color: 'var(--color-applied)' },
  { id: 'Interview', title: 'Interview', icon: Eye, color: 'var(--color-interview)' },
  { id: 'Offer', title: 'Offer', icon: CheckCircle, color: 'var(--color-offer)' },
  { id: 'Rejected', title: 'Rejected', icon: XCircle, color: 'var(--color-rejected)' },
];

export default function JobBoard({ jobs, onEdit, onDelete, onStatusChange }) {
  /**
   * activeDragCol is used only for UI feedback:
   * - When a user drags a JobCard over a column, we highlight that column.
   * - When the drag leaves or drops, we clear the highlight.
   */
  const [activeDragCol, setActiveDragCol] = useState(null);

  // Called continuously while dragging over a column.
  // preventDefault() is required so the browser allows drop on this element.
  function handleDragOver(e, columnId) {
    e.preventDefault();
    if (activeDragCol !== columnId) {
      setActiveDragCol(columnId);
    }
  }

  // Called when the dragged item leaves the column area.
  // The code checks mouse coordinates so we don't un-highlight if the cursor
  // is still within the column (e.g., moving over child elements).
  function handleDragLeave(e) {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;

    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setActiveDragCol(null);
    }
  }

  // Called when the user drops a card on a column.
  // We read jobId from the drag payload and ask the parent to change status.
  function handleDrop(e, columnId) {
    e.preventDefault();
    setActiveDragCol(null);

    // JobCard sets this during onDragStart: dataTransfer.setData('text/plain', job.id)
    const jobId = e.dataTransfer.getData('text/plain');

    if (jobId) {
      // Update state in App (parent), which then re-renders columns.
      onStatusChange(jobId, columnId);
    }
  }

  return (
    // board-wrapper is the container for the whole pipeline board.
    <div className="board-wrapper">
      {COLUMNS.map((col) => {
        // Only show jobs that belong to this column's status.
        const colJobs = jobs.filter((j) => j.status === col.id);
        const Icon = col.icon;

        return (
          // Each column is a drop target.
          <div
            key={col.id}
            className={`board-column ${activeDragCol === col.id ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
            // --col-color is used by CSS for gradient/border styling.
            style={{ '--col-color': col.color }}
          >
            <div className="board-column-header">
              <div className="column-title-group">
                <Icon size={16} className="column-icon" />
                <h3>{col.title}</h3>
              </div>
              <span className="column-count-badge">{colJobs.length}</span>
            </div>

            <div className="cards-container">
              {colJobs.length > 0 ? (
                // Render one JobCard per job in this column.
                colJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                // Empty state when the column has no jobs.
                <div className="column-empty">
                  <ArrowRight size={24} className="column-empty-icon" style={{ transform: 'rotate(90deg)' }} />
                  <p>Drag jobs here</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
