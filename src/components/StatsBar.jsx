import { Briefcase, Eye, Activity, Award } from 'lucide-react';

export default function StatsBar({ jobs, statusFilter, setStatusFilter }) {
  const total = jobs.length;
  
  const counts = {
    Applied: 0,
    Interview: 0,
    Rejected: 0,
    Offer: 0,
  };

  for (const job of jobs) {
    if (counts[job.status] !== undefined) {
      counts[job.status] += 1;
    }
  }

  const activePipeline = counts.Applied + counts.Interview;
  
  // Calculate rates
  const interviewRate = total > 0 ? Math.round((counts.Interview / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((counts.Offer / total) * 100) : 0;

  // Donut Chart Calculations
  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius; // ~314.16

  const categories = [
    { id: 'Applied', label: 'Applied', count: counts.Applied, color: 'var(--color-applied)', bg: 'rgba(168, 85, 247, 0.2)' },
    { id: 'Interview', label: 'Interviews', count: counts.Interview, color: 'var(--color-interview)', bg: 'rgba(6, 182, 212, 0.2)' },
    { id: 'Offer', label: 'Offers', count: counts.Offer, color: 'var(--color-offer)', bg: 'rgba(16, 185, 129, 0.2)' },
    { id: 'Rejected', label: 'Rejected', count: counts.Rejected, color: 'var(--color-rejected)', bg: 'rgba(244, 63, 94, 0.2)' },
  ];

  let cumulativeOffset = 0;

  // Handles clicking a donut slice or legend item to filter
  function handleFilterToggle(status) {
    if (statusFilter === status) {
      setStatusFilter('All'); // Toggle off
    } else {
      setStatusFilter(status);
    }
  }

  return (
    <div className="animated-fade">
      {/* 4 Stats Cards Grid */}
      <section className="stats-grid" aria-label="Quick Stats Dashboard">
        {/* Total Applications Card */}
        <div className="stat-card" style={{ '--stat-color': 'var(--primary)' }}>
          <div className="stat-card-top">
            <span className="stat-label">Total Applications</span>
            <div className="stat-icon-wrapper">
              <Briefcase size={16} />
            </div>
          </div>
          <div className="stat-value">{total}</div>
        </div>

        {/* Active Pipeline Card */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-applied)' }}>
          <div className="stat-card-top">
            <span className="stat-label">Active Pipeline</span>
            <div className="stat-icon-wrapper">
              <Activity size={16} />
            </div>
          </div>
          <div className="stat-value">{activePipeline}</div>
          <div className="header-subtitle" style={{ marginTop: '4px' }}>
            {total > 0 ? `${Math.round((activePipeline / total) * 100)}%` : '0%'} of total
          </div>
        </div>

        {/* Interviews Card */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-interview)' }}>
          <div className="stat-card-top">
            <span className="stat-label">Interviews Scheduled</span>
            <div className="stat-icon-wrapper">
              <Eye size={16} />
            </div>
          </div>
          <div className="stat-value">{counts.Interview}</div>
          <div className="header-subtitle" style={{ marginTop: '4px' }}>
            {interviewRate}% response rate
          </div>
        </div>

        {/* Offers Card */}
        <div className="stat-card" style={{ '--stat-color': 'var(--color-offer)' }}>
          <div className="stat-card-top">
            <span className="stat-label">Offers Received</span>
            <div className="stat-icon-wrapper">
              <Award size={16} />
            </div>
          </div>
          <div className="stat-value">{counts.Offer}</div>
          <div className="header-subtitle" style={{ marginTop: '4px' }}>
            {offerRate}% success rate
          </div>
        </div>
      </section>

      {/* Visual Insights Section (Donut Chart + Gauge Rings) */}
      <section className="insights-row" aria-label="Visual Analytics Dashboard">
        {/* Donut Chart Card */}
        <div className="insights-card">
          <div className="insights-title">
            <Activity size={14} /> Pipeline Distribution (Interactive)
          </div>
          <div className="chart-layout">
            <div className="donut-chart-wrapper">
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="transparent"
                  stroke="rgba(255, 255, 255, 0.03)"
                  strokeWidth={strokeWidth}
                />
                {total > 0 ? (
                  categories.map((cat) => {
                    const percentage = cat.count / total;
                    const strokeLength = percentage * circumference;
                    const offset = cumulativeOffset;
                    cumulativeOffset += strokeLength;

                    if (cat.count === 0) return null;

                    return (
                      <circle
                        key={cat.id}
                        cx="70"
                        cy="70"
                        r={radius}
                        fill="transparent"
                        stroke={cat.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        strokeDashoffset={-offset}
                        strokeLinecap={percentage === 1 ? 'butt' : 'round'}
                        style={{
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          filter: statusFilter === cat.id ? `drop-shadow(0 0 8px ${cat.color})` : 'none',
                          opacity: statusFilter === 'All' || statusFilter === cat.id ? 1 : 0.4
                        }}
                        onClick={() => handleFilterToggle(cat.id)}
                        title={`${cat.label}: ${cat.count} (${Math.round(percentage * 100)}%)`}
                      />
                    );
                  })
                ) : (
                  // Empty state circle
                  <circle
                    cx="70"
                    cy="70"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth={strokeWidth}
                  />
                )}
              </svg>
              <div className="donut-label-center">
                <div className="donut-label-num">{total}</div>
                <div className="donut-label-txt">Jobs</div>
              </div>
            </div>

            {/* Legend Grid */}
            <div className="chart-legend">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`legend-item ${statusFilter === cat.id ? 'active' : ''}`}
                  onClick={() => handleFilterToggle(cat.id)}
                  style={{ '--legend-bg': cat.color }}
                >
                  <span className="legend-color"></span>
                  <span>{cat.label}</span>
                  <span className="legend-value">{cat.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Progress Rings conversions card */}
        <div className="insights-card">
          <div className="insights-title">
            <Award size={14} /> Conversion Metrics
          </div>
          <div className="conversions-layout">
            {/* Interview conversion */}
            <div className="conversion-pill">
              <div className="ring-wrapper">
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="22" cy="22" r="18" fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="4" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="transparent"
                    stroke="var(--color-interview)"
                    strokeWidth="4"
                    strokeDasharray={`${(interviewRate / 100) * 113} 113`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                  />
                </svg>
                <div className="ring-text">{interviewRate}%</div>
              </div>
              <div className="conversion-info">
                <span className="conversion-title">Interview Rate</span>
                <span className="conversion-desc">Response rate to applications</span>
              </div>
            </div>

            {/* Offer conversion */}
            <div className="conversion-pill">
              <div className="ring-wrapper">
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="22" cy="22" r="18" fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="4" />
                  <circle
                    cx="22"
                    cy="22"
                    r="18"
                    fill="transparent"
                    stroke="var(--color-offer)"
                    strokeWidth="4"
                    strokeDasharray={`${(offerRate / 100) * 113} 113`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.5s ease-out' }}
                  />
                </svg>
                <div className="ring-text">{offerRate}%</div>
              </div>
              <div className="conversion-info">
                <span className="conversion-title">Offer Success Rate</span>
                <span className="conversion-desc">Offers secured relative to total</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
