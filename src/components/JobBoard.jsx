import { Briefcase, Eye, CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import JobCard from './JobCard';

const COLUMNS = [
  { id: 'Applied', title: 'Applied', icon: Briefcase, color: 'var(--color-applied)' },
  { id: 'Interview', title: 'Interview', icon: Eye, color: 'var(--color-interview)' },
  { id: 'Offer', title: 'Offer', icon: CheckCircle, color: 'var(--color-offer)' },
  { id: 'Rejected', title: 'Rejected', icon: XCircle, color: 'var(--color-rejected)' },
];

export default function JobBoard({ jobs, onEdit, onDelete, onStatusChange }) {
  const [activeDragCol, setActiveDragCol] = useState(null);

  function handleDragOver(e, columnId) {
    e.preventDefault();
    if (activeDragCol !== columnId) {
      setActiveDragCol(columnId);
    }
  }

  function handleDragLeave(e) {
    e.preventDefault();
    // Only remove active state if we actually leave the column container
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setActiveDragCol(null);
    }
  }

  function handleDrop(e, columnId) {
    e.preventDefault();
    setActiveDragCol(null);
    const jobId = e.dataTransfer.getData('text/plain');
    if (jobId) {
      onStatusChange(jobId, columnId);
    }
  }

  return (
    <div className="board-wrapper">
      {COLUMNS.map((col) => {
        const colJobs = jobs.filter((j) => j.status === col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className={`board-column ${activeDragCol === col.id ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
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
                colJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))
              ) : (
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
