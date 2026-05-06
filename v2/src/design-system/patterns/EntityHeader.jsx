import React from 'react';
import VesselImage from './VesselImage';

/**
 * EntityHeader — large heading for an entity (vessel or port).
 * Renders a thumbnail (image or monogram), name, and meta line.
 *
 * @param {string} name        Display name (e.g., "Maersk Hamilton")
 * @param {string} [monogram]  2-3 character abbreviation, used when no imageUrl
 * @param {string} [imageUrl]  Image URL — preferred over monogram when present
 * @param {string} [meta]      Sub-line (e.g., "IMO 9434728 · Cargo · Flag DK")
 * @param {React.ReactNode} [actions]  Optional right-side actions
 */
export default function EntityHeader({ name, monogram, imageUrl, meta, actions }) {
  const showThumb = imageUrl || monogram;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 14,
        marginBottom: 14,
      }}
    >
      {showThumb && (
        <VesselImage
          url={imageUrl}
          name={name || monogram || ''}
          size={60}
        />
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
