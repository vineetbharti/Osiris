import React from 'react';

/**
 * SectionTitle — small uppercase label placed above content blocks.
 * Examples: "VOYAGE PROFILES", "MODEL CALIBRATION", "WHY THIS RATING".
 */
export function SectionTitle({ children, style = {} }) {
  return (
    <p
      style={{
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontWeight: 500,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/**
 * SectionHeader — split row with title on the left and optional link/button on right.
 */
export function SectionHeader({ title, action, style = {} }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 10,
        ...style,
      }}
    >
      <SectionTitle>{title}</SectionTitle>
      {action && (
        <span
          style={{
            fontSize: 12,
            color: 'var(--color-text-secondary)',
            cursor: action.onClick ? 'pointer' : 'default',
          }}
          onClick={action.onClick}
        >
          {action.label}
        </span>
      )}
    </div>
  );
}
