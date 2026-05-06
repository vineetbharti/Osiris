import React from 'react';

/**
 * SpecsStrip — horizontal label/value grid bordered top and bottom.
 *
 * Used on Vessel Intelligence (5 fields) and Port Detail (7 fields)
 * for static spec data.
 *
 * @param {Array<{label: string, value: string}>} items
 */
export default function SpecsStrip({ items }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${items.length}, 1fr)`,
        gap: 12,
        padding: '12px 0',
        borderTop: '0.5px solid var(--color-border-tertiary)',
        borderBottom: '0.5px solid var(--color-border-tertiary)',
        marginBottom: 18,
      }}
    >
      {items.map((item, i) => (
        <div key={i}>
          <p
            style={{
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
              margin: '0 0 2px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {item.label}
          </p>
          <p
            className="tabular"
            style={{
              fontSize: 13,
              color: 'var(--color-text-primary)',
              margin: 0,
              fontWeight: 500,
            }}
          >
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
}
