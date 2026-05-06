import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Breadcrumb — drill-down navigation rendered above page titles.
 *
 * @param {Array<{label: string, to?: string}>} items
 *   Each item is rendered as a link if `to` is set, otherwise plain text.
 */
export default function Breadcrumb({ items = [] }) {
  return (
    <p
      style={{
        fontSize: 12,
        color: 'var(--color-text-secondary)',
        margin: '0 0 14px',
      }}
    >
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {item.to ? (
            <Link
              to={item.to}
              style={{
                color: 'var(--color-text-secondary)',
                textDecoration: 'none',
              }}
            >
              {item.label}
            </Link>
          ) : (
            item.label
          )}
          {i < items.length - 1 && <span style={{ margin: '0 6px' }}>›</span>}
        </React.Fragment>
      ))}
    </p>
  );
}
