export function createId() {
  // Good enough for local app; avoids extra deps
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}
