/**
 * createId generates a unique-ish id for each job card.
 * This app is local-only, so we don't need a full UUID dependency.
 */
export function createId() {
  // Use current time + some randomness to reduce collisions.
  // - Date.now() makes ids different over time
  // - Math.random() adds extra entropy
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
