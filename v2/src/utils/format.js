/**
 * Formatters and small utilities used across features.
 */

/**
 * Build a 1-2 character monogram from a name.
 * "Maersk Hamilton" → "MH", "Bremerhaven" → "BR"
 */
export function monogram(name) {
  if (!name) return 'OS';
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Format USD savings for compact display.
 */
export function formatUsdShort(usd) {
  const abs = Math.abs(usd);
  if (abs >= 1_000_000) return `$${(usd / 1_000_000).toFixed(2)}M`;
  if (abs >= 1_000) return `$${Math.round(usd / 1_000)}k`;
  return `$${usd}`;
}

/**
 * Map a vessel status state to a tone for StatusDot.
 */
export function statusTone(state) {
  switch (state) {
    case 'in-transit':
      return 'info';
    case 'at-port':
      return 'success';
    case 'anchored':
      return 'warning';
    default:
      return 'neutral';
  }
}

/**
 * Convert a status state to a label.
 */
export function statusLabel(state) {
  switch (state) {
    case 'in-transit':
      return 'In transit';
    case 'at-port':
      return 'At berth';
    case 'anchored':
      return 'Anchored';
    default:
      return 'Unknown';
  }
}
