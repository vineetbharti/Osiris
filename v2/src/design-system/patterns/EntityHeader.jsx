import React from 'react';

/**
 * EntityHeader — large heading for an entity (vessel or port).
 * Renders a monogram thumbnail, name, and meta line.
 *
 * @param {string} name        Display name (e.g., "Maersk Hamilton")
 * @param {string} monogram    2-3 character abbreviation (e.g., "MH")
 * @param {string} meta        Sub-line (e.g., "IMO 9434728 · Cargo · Flag DK")
 * @param {React.ReactNode} actions  Optional right-side actions
 */
export default function EntityHeader({ name, monogram, meta, actions }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        marginBottom: 14,
      }}
    >
      {monogram && (
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: 'var(--border-radius-md)',
            background: 'var(--color-background-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            fontWeight: 500,
            color: 'var(--color-text-secondary)',
            flexShrink: 0,
            letterSpacing: '0.02em',
          }}
        >
          {monogram}
        </div>
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            margin: '0 0 4px',
            color: 'var(--color-text-primary)',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {name}
        </h1>
        {meta && (
          <p
            className="tabular"
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            {meta}
          </p>
        )}
      </div>
      {actions}
    </div>
  );
}
