import { Briefcase, Eye, Activity, Award } from 'lucide-react';

export default function StatsBar({ jobs, statusFilter, setStatusFilter }) {
  // total is the number of jobs in the app.
  const total = jobs.length;

  // counts breaks jobs down by status so we can show badges and charts.
  const counts = {
    Applied: 0,
    Interview: 0,
    Rejected: 0,
    Offer: 0,
  };

  // Loop through every job and increment its status bucket.
  for (const job of jobs) {
    // Defensive check: only increment keys we expect.
    if (counts[job.status] !== undefined) {
      counts[job.status] += 1;
    }
  }

  // activePipeline is a quick "Applied + Interview" metric.
  const activePipeline = counts.Applied + counts.Interview;

  // Calculate rates for display cards.
  const interviewRate = total > 0 ? Math.round((counts.Interview / total) * 100) : 0;
  const offerRate = total > 0 ? Math.round((counts.Offer / total) * 100) : 0;

  // Donut Chart Calculations:
  // We use SVG circles where strokeDasharray controls how much arc is filled.
  const radius = 50;
  const strokeWidth = 12;

  // circumference is the full length of the circle's outline.
  const circumference = 2 * Math.PI * radius; // ~314.16

  // categories are the slices we draw + the legend we show.
  const categories = [
    { id: 'Applied', label: 'Applied', count: counts.Applied, color: 'var(--color-applied)', bg: 'rgba(168, 85, 247, 0.2)' },
    { id: 'Interview', label: 'Interviews', count: counts.Interview, color: 'var(--color-interview)', bg: 'rgba(6, 182, 212, 0.2)' },
    { id: 'Offer', label: 'Offers', count: counts.Offer, color: 'var(--color-offer)', bg: 'rgba(16, 185, 129, 0.2)' },
    { id: 'Rejected', label: 'Rejected', count: counts.Rejected, color: 'var(--color-rejected)', bg: 'rgba(244, 63, 94, 0.2)' },
  ];

  // cumulativeOffset helps place each arc after the previous one.
  let cumulativeOffset = 0;

  // Clicking a donut slice or legend item toggles statusFilter in App.jsx.
  function handleFilterToggle(status) {
    if (statusFilter === status) {
      // If already selected, toggle off back to "All".
      setStatusFilter('All');
    } else {
      // Otherwise select this status filter.
      setStatusFilter(status);
    }
  }

  return (
    <div className="animated-fade">
      {/* Top row of stat cards (just display values computed above). */}
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

      {/* Visual Insights Section (Donut Chart + Conversion Rings) */}
      <section className="insights-row" aria-label="Visual Analytics Dashboard">
        {/* Donut Chart Card */}
        <div className="insights-card">
          <div className="insights-title">
            <Activity size={14} /> Pipeline Distribution (Interactive)
          </div>

          <div className="chart-layout">
            <div className="donut-chart-wrapper">
              {/* SVG donut uses 2 things:
                  1) A background circle (always drawn)
                  2) One circle per category where strokeDasharray + strokeDashoffset control the arc length.
               */}
              <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring (very faint) */}
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
                    // percentage controls how large this slice is.
                    const percentage = cat.count / total;

                    // strokeLength becomes the visible part of the circle outline.
                    const strokeLength = percentage * circumference;

                    // offset places this slice after the previous slice(s).
                    const offset = cumulativeOffset;
                    cumulativeOffset += strokeLength;

                    // If there are 0 items for the category, don't draw an arc.
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
                        // strokeDasharray: "<visible part> <hidden part>"
                        strokeDasharray={`${strokeLength} ${circumference}`}
                        // strokeDashoffset positions where the arc starts.
                        strokeDashoffset={-offset}
                        strokeLinecap={percentage === 1 ? 'butt' : 'round'}
                        style={{
                          // Clicking a slice applies a filter.
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',

                          // Visually emphasize the currently selected category.
                          filter: statusFilter === cat.id ? `drop-shadow(0 0 8px ${cat.color})` : 'none',

                          // Dim non-selected categories (unless "All" is selected).
                          opacity: statusFilter === 'All' || statusFilter === cat.id ? 1 : 0.4
                        }}
                        onClick={() => handleFilterToggle(cat.id)}
                        // Tooltip shows label + count + percent.
                        title={`${cat.label}: ${cat.count} (${Math.round(percentage * 100)}%)`}
                      />
                    );
                  })
                ) : (
                  // Empty state circle when there are no jobs.
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

              {/* Text in the center of the donut */}
              <div className="donut-label-center">
                <div className="donut-label-num">{total}</div>
                <div className="donut-label-txt">Jobs</div>
              </div>
            </div>

            {/* Legend Grid (clickable, same behavior as donut slices) */}
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

        {/* Progress Rings card (conversion-like percentages) */}
        <div className="insights-card">
          <div className="insights-title">
            <Award size={14} /> Conversion Metrics
          </div>

          <div className="conversions-layout">
            {/* Interview conversion ring */}
            <div className="conversion-pill">
              <div className="ring-wrapper">
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background ring */}
                  <circle cx="22" cy="22" r="18" fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="4" />

                  {/* Foreground ring:
                      strokeDasharray length is based on interviewRate (0-100).
                   */}
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

            {/* Offer conversion ring */}
            <div className="conversion-pill">
              <div className="ring-wrapper">
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ transform: 'rotate(-90deg)' }}>
                  {/* Background ring */}
                  <circle cx="22" cy="22" r="18" fill="transparent" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="4" />

                  {/* Foreground ring based on offerRate */}
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
