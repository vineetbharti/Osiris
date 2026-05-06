import React, { useState } from 'react';
import { monogram } from '../../utils/format';

/**
 * VesselImage — renders a vessel photo with graceful fallback.
 *
 * If `url` is missing OR the image fails to load (CORS, 404, etc.),
 * renders a monogram thumbnail using the vessel's name as fallback.
 * Same visual treatment in both states keeps layout stable.
 *
 * @param {string|null} url     Image URL from the vessel data
 * @param {string} name          Vessel name (used to derive fallback monogram)
 * @param {number} size          Square dimension in px (default 60)
 * @param {string} radius        Border radius CSS value
 */
export default function VesselImage({
  url,
  name = '',
  size = 60,
  radius = 'var(--border-radius-md)',
  style = {},
}) {
  const [failed, setFailed] = useState(false);

  const baseStyle = {
    width: size,
    height: size,
    borderRadius: radius,
    background: 'var(--color-background-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    overflow: 'hidden',
    ...style,
  };

  if (!url || failed) {
    return (
      <div
        style={{
          ...baseStyle,
          fontSize: Math.round(size * 0.27),
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.02em',
        }}
        aria-label={name}
      >
        {monogram(name)}
      </div>
    );
  }

  return (
    <div style={baseStyle}>
      <img
        src={url}
        alt={name}
        onError={() => setFailed(true)}
        // referrerPolicy is important — many image hosts block hotlinking
        // when the Referer header reveals the embedding origin.
        referrerPolicy="no-referrer"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
    </div>
  );
}
