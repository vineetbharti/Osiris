import React from 'react';

/**
 * PageHeader — consistent title and subtitle treatment.
 *
 * @param {string} title
 * @param {string} subtitle  (optional)
 * @param {React.ReactNode} actions  (optional, rendered on the right)
 */
export default function PageHeader({ title, subtitle, actions }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            margin: 0,
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
          }}
        >
          {title}
        </h1>
        {actions}
      </div>
      {subtitle && (
        <p
          className="tabular"
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            margin: '4px 0 0',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}
