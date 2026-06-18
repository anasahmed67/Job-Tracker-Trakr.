import { useEffect, useMemo, useState } from 'react';
import { X, Briefcase, Calendar, DollarSign, Link, MapPin, AlignLeft, User2, Save, Plus } from 'lucide-react';

const STATUSES = ['Applied', 'Interview', 'Rejected', 'Offer'];

function getTodayYYYYMMDD() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function jobDateToYYYYMMDD(dateStr) {
  if (!dateStr) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  return dateStr;
}

function getInitialFormState(initialJob) {
  if (!initialJob) {
    return {
      company: '',
      role: '',
      status: 'Applied',
      notes: '',
      dateApplied: getTodayYYYYMMDD(),
      location: 'Remote',
      salary: '',
      url: '',
    };
  }

  return {
    company: initialJob.company ?? '',
    role: initialJob.role ?? '',
    status: initialJob.status ?? 'Applied',
    notes: initialJob.notes ?? '',
    dateApplied: jobDateToYYYYMMDD(initialJob.dateApplied) || getTodayYYYYMMDD(),
    location: initialJob.location ?? 'Remote',
    salary: initialJob.salary ?? '',
    url: initialJob.url ?? '',
  };
}

export default function JobForm({ isOpen, initialJob, onSubmit, onCancel }) {
  const mode = initialJob ? 'edit' : 'add';
  const initialState = getInitialFormState(initialJob);

  const [company, setCompany] = useState(initialState.company);
  const [role, setRole] = useState(initialState.role);
  const [status, setStatus] = useState(initialState.status);
  const [notes, setNotes] = useState(initialState.notes);
  const [dateApplied, setDateApplied] = useState(initialState.dateApplied);
  const [location, setLocation] = useState(initialState.location);
  const [salary, setSalary] = useState(initialState.salary);
  const [url, setUrl] = useState(initialState.url);

  const title = useMemo(
    () => (mode === 'edit' ? 'Edit Application' : 'Track New Application'),
    [mode]
  );

  // Support pressing escape to close modal
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onCancel();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  function handleSubmit(e) {
    e.preventDefault();

    const payload = {
      company: company.trim(),
      role: role.trim(),
      status,
      notes: notes.trim(),
      dateApplied,
      location,
      salary: salary.trim(),
      url: url.trim(),
    };

    if (!payload.company || !payload.role) return;

    onSubmit(payload);
  }

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close-btn" onClick={onCancel} title="Close Form">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <form className="job-form" onSubmit={handleSubmit}>
            {/* Company Input */}
            <div className="field">
              <label htmlFor="company">Company</label>
              <div className="form-input-wrapper">
                <Briefcase size={16} className="form-input-icon" />
                <input
                  id="company"
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  required
                  placeholder="e.g. Google"
                />
              </div>
            </div>

            {/* Role Input */}
            <div className="field">
              <label htmlFor="role">Role / Job Title</label>
              <div className="form-input-wrapper">
                <User2 size={16} className="form-input-icon" />
                <input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  placeholder="e.g. Frontend Engineer"
                />
              </div>
            </div>

            {/* Row: Status & Date */}
            <div className="form-row-2">
              <div className="field">
                <label htmlFor="status">Status</label>
                <div className="form-input-wrapper">
                  <span className="form-input-icon" style={{ display: 'flex', alignItems: 'center' }}>
                    <ActivityIcon status={status} />
                  </span>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="dateApplied">Date Applied</label>
                <div className="form-input-wrapper">
                  <Calendar size={16} className="form-input-icon" />
                  <input
                    id="dateApplied"
                    type="date"
                    value={dateApplied}
                    onChange={(e) => setDateApplied(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Location Pill Selector */}
            <div className="field">
              <label>Location Mode</label>
              <div className="location-options">
                {['Remote', 'Hybrid', 'On-site'].map((loc) => (
                  <div key={loc}>
                    <input
                      type="radio"
                      id={`loc-${loc}`}
                      name="location"
                      value={loc}
                      checked={location === loc}
                      onChange={(e) => setLocation(e.target.value)}
                      className="location-radio-input"
                    />
                    <label htmlFor={`loc-${loc}`} className="location-radio-label">
                      <MapPin size={12} style={{ marginRight: '6px' }} />
                      {loc}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Row: Salary & Job URL */}
            <div className="form-row-2">
              <div className="field">
                <label htmlFor="salary">Salary Range</label>
                <div className="form-input-wrapper">
                  <DollarSign size={16} className="form-input-icon" />
                  <input
                    id="salary"
                    type="text"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    placeholder="e.g. $120k - $140k"
                  />
                </div>
              </div>

              <div className="field">
                <label htmlFor="url">Job Listing URL</label>
                <div className="form-input-wrapper">
                  <Link size={16} className="form-input-icon" />
                  <input
                    id="url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="e.g. jobs.company.com/role"
                  />
                </div>
              </div>
            </div>

            {/* Notes Textarea */}
            <div className="field">
              <label htmlFor="notes">Notes & Logs</label>
              <div className="form-input-wrapper">
                <AlignLeft size={16} className="form-input-icon" style={{ top: '15px' }} />
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Recruiter contact, interview prep notes, feedback..."
                />
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="form-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {mode === 'edit' ? <Save size={16} /> : <Plus size={16} />}
                {mode === 'edit' ? 'Save Changes' : 'Track Application'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Inline helper component for select icon status match
function ActivityIcon({ status }) {
  const size = 16;
  switch (status) {
    case 'Applied': return <Briefcase size={size} style={{ color: 'var(--color-applied)' }} />;
    case 'Interview': return <Calendar size={size} style={{ color: 'var(--color-interview)' }} />;
    case 'Offer': return <AwardIcon size={size} />;
    case 'Rejected': return <X size={size} style={{ color: 'var(--color-rejected)' }} />;
    default: return <Briefcase size={size} />;
  }
}

function AwardIcon({ size }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--color-offer)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}
