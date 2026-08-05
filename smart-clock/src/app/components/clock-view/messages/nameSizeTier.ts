/** Font-size band for the message name block. Maps to `.messages-names.size-*`. */
export type NameSizeTier = 'xl' | 'lg' | 'md' | 'sm';

/**
 * Picks a size band for the name block from its content alone.
 *
 * Deterministic and measurement-free: a wall display must not re-layout in a
 * loop, and this stays unit-testable in jsdom.
 *
 * @param names Trimmed, non-empty name lines (one per line of `title`).
 */
export function nameSizeTier(names: string[]): NameSizeTier {
  const lines = names.map((n) => n.trim()).filter((n) => n.length > 0);
  if (lines.length === 0) return 'xl';

  const longest = Math.max(...lines.map((n) => n.length));

  if (lines.length >= 3 || longest > 26) return 'sm';
  if (lines.length === 2 || longest > 18) return 'md';
  if (longest > 11) return 'lg';
  return 'xl';
}
