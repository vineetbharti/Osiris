import React from 'react';

/**
 * MethodologyCaveat — quiet single-paragraph disclosure rendered between
 * KPIs and the data they describe.
 *
 * Used on Historical Analytics vessel summary to disclose backtest method
 * and pricing assumptions.
 */
export default function MethodologyCaveat({ children }) {
  return (
    <p
      style={{
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
        padding: '8px 12px',
        background: 'var(--color-background-secondary)',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: 22,
        lineHeight: 1.5,
        marginTop: 0,
      }}
    >
      {children}
    </p>
  );
}
