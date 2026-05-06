import React from 'react';

/**
 * DeltaText — value + delta line, colored by gain/loss/neutral.
 * Used in profile rows, voyage list, leaderboards.
 *
 * @param {string} value      Primary number (e.g., "$43.8k")
 * @param {string} delta      Sub-line (e.g., "−$8.6k")
 * @param {'gain'|'loss'|'neutral'} tone
 * @param {boolean} colorValue  If true, color the primary value with the tone
 */
export default function DeltaText({
  value,
  delta,
  tone = 'neutral',
  colorValue = false,
  align = 'right',
}) {
  const colors = {
    gain: 'var(--color-text-success)',
    loss: 'var(--color-text-danger)',
    neutral: 'var(--color-text-secondary)',
  };

  return (
    <div style={{ textAlign: align, minWidth: 0 }}>
      <p
        className="tabular"
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: colorValue ? colors[tone] : 'var(--color-text-primary)',
          margin: '0 0 1px',
          lineHeight: 1.3,
        }}
      >
        {value}
      </p>
      {delta && (
        <p
          className="tabular"
          style={{
            fontSize: 11,
            color: colors[tone],
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {delta}
        </p>
      )}
    </div>
  );
}
