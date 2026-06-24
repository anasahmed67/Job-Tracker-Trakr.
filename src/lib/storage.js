const STORAGE_KEY = 'job-tracker.jobs.v1';

// loadJobs reads the saved jobs from the browser's localStorage.
// If anything goes wrong (missing data, bad JSON, etc.), it safely falls back to [].
export function loadJobs() {
  try {
    // Get the raw string we stored earlier.
    const raw = localStorage.getItem(STORAGE_KEY);

    // If nothing is stored yet, there are no jobs.
    if (!raw) return [];

    // Parse JSON back into a JavaScript value (should be an array).
    const parsed = JSON.parse(raw);

    // Basic safety: only accept arrays.
    if (!Array.isArray(parsed)) return [];

    return parsed;
  } catch {
    // Any error (JSON parse, storage access issues) => return empty list.
    return [];
  }
}

// saveJobs stores the current jobs array back to localStorage as JSON.
export function saveJobs(jobs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(jobs));
}

// clearJobs removes the saved jobs entirely.
export function clearJobs() {
  localStorage.removeItem(STORAGE_KEY);
}
