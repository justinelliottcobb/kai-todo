/**
 * Generate a unique identifier.
 * Uses crypto.randomUUID() when available, falls back to a timestamp-based approach.
 */
export function generateId(): string {
  // Use crypto.randomUUID if available (modern browsers, Node 19+, React Native with Hermes)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback: timestamp + random string for uniqueness
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  const randomPart2 = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomPart}-${randomPart2}`;
}
