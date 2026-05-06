import React from 'react';

/**
 * CoverageBadge — pill on Fleet rows indicating prediction coverage.
 *
 * Three states:
 *   - available: green, predictions are wired
 *   - limited: amber, partial data (e.g., missing port info)
 *   - unsupported: gray, vessel type not yet modeled
 *
 * Honesty pattern: makes prediction availability visible without taking
 * the row offline.
 */
const TONE_STYLES = {
  available: {
    background: 'var(--color-background-success)',
    color: 'var(--color-text-success)',
  },
  limited: {
    background: 'var(--color-background-warning)',
    color: 'var(--color-text-warning)',
  },
  unsupported: {
    background: 'var(--color-background-secondary)',
    color: 'var(--color-text-tertiary)',
  },
};

const TONE_LABELS = {
  available: 'Predictions available',
  limited: 'Limited coverage',
  unsupported: 'Type pending',
};

export default function CoverageBadge({ status = 'available', label }) {
  const tone = TONE_STYLES[status] || TONE_STYLES.available;
  const text = label || TONE_LABELS[status];

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11,
        padding: '2px 8px',
        borderRadius: 999,
        lineHeight: 1.4,
        fontWeight: 500,
        ...tone,
      }}
    >
      {text}
    </span>
  );
}
