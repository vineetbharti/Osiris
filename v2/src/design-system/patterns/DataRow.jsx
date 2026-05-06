import React from 'react';

/**
 * DataRow — generic clickable row used in list views.
 * Wraps content in a bordered card with a chevron on the right.
 *
 * Children are responsible for the grid layout inside; this component
 * just provides the chrome (border, padding, chevron, hover state).
 */
export default function DataRow({ onClick, children, style = {} }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '14px 16px',
        marginBottom: 8,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 100ms',
        ...style,
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.borderColor = 'var(--color-border-primary)';
      }}
      onMouseLeave={(e) => {
        if (onClick) e.currentTarget.style.borderColor = 'var(--color-border-tertiary)';
      }}
    >
      {children}
    </div>
  );
}

/**
 * Chevron — small right-pointing arrow used at end of clickable rows.
 */
export function Chevron() {
  return (
    <span
      style={{
        color: 'var(--color-text-tertiary)',
        fontSize: 13,
        textAlign: 'center',
      }}
    >
      ›
    </span>
  );
}

/**
 * ColumnHeader — small uppercase labels above a list of DataRows.
 *
 * @param {Array<{label: string, align?: 'left'|'right'}>} columns
 * @param {string} gridTemplate  CSS grid-template-columns matching the row layout
 */
export function ColumnHeader({ columns, gridTemplate, gap = 14 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: gridTemplate,
        gap,
        padding: '0 16px 8px',
      }}
    >
      {columns.map((col, i) => (
        <span
          key={i}
          style={{
            fontSize: 10,
            color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 500,
            textAlign: col.align || 'left',
          }}
        >
          {col.label}
        </span>
      ))}
    </div>
  );
}
