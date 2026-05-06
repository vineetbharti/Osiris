import React from 'react';

/**
 * SourceLabel — small uppercase label indicating provenance of a value.
 *
 * Used heavily on speed-schedule segments and any other place where
 * users need to know "where did this number come from".
 *
 * Three sources:
 *   - 'observed': from AIS, ground truth
 *   - 'predicted': model output
 *   - 'recommended': system suggestion
 */
export default function SourceLabel({ source }) {
  const labels = {
    observed: 'AIS observed',
    predicted: 'Predicted',
    recommended: 'recommended',
  };

  return (
    <span
      style={{
        fontSize: 10,
        color: 'var(--color-text-tertiary)',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontWeight: 500,
      }}
    >
      {labels[source] || source}
    </span>
  );
}
