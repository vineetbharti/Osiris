import React from 'react';
import StatusDot from '../primitives/StatusDot';

/**
 * CongestionBadge — dot + label combo for port congestion.
 * Three states: light, moderate, heavy.
 */
const STATES = {
  light: { tone: 'success', label: 'Light' },
  moderate: { tone: 'warning', label: 'Moderate' },
  heavy: { tone: 'danger', label: 'Heavy' },
};

const TEXT_COLORS = {
  success: 'var(--color-text-success)',
  warning: 'var(--color-text-warning)',
  danger: 'var(--color-text-danger)',
};

export default function CongestionBadge({ level, size = 'md' }) {
  const state = STATES[level] || STATES.light;
  const fontSize = size === 'lg' ? 26 : 13;
  const fontWeight = size === 'lg' ? 500 : 500;

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'baseline',
        gap: size === 'lg' ? 12 : 8,
      }}
    >
      <StatusDot tone={state.tone} size={size === 'lg' ? 12 : 8} />
      <span
        style={{
          fontSize,
          fontWeight,
          color: TEXT_COLORS[state.tone],
          letterSpacing: size === 'lg' ? '-0.01em' : 0,
          lineHeight: size === 'lg' ? 1.1 : 1.3,
        }}
      >
        {state.label}
      </span>
    </span>
  );
}
