import React from 'react';

/**
 * StatusDot — small colored circle indicating state.
 * Used for vessel status (in-transit, at-port, anchored) and
 * congestion levels (light, moderate, heavy).
 */
export default function StatusDot({ tone = 'neutral', size = 8, style = {} }) {
  const colors = {
    neutral: 'var(--color-text-tertiary)',
    info: 'var(--color-text-info)',
    success: 'var(--color-text-success)',
    warning: 'var(--color-text-warning)',
    danger: 'var(--color-text-danger)',
  };

  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        borderRadius: '50%',
        background: colors[tone] || colors.neutral,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
