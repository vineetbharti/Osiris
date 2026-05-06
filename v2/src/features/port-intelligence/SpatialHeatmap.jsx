import React from 'react';

/**
 * SpatialHeatmap — schematic port map with berth and anchorage zones
 * colored by load. Real Google Maps with overlay polygons can replace this
 * later; the data inputs (`berths`, `anchorages`) are unchanged.
 */
export default function SpatialHeatmap({ spatial }) {
  if (!spatial) return null;
  const { berths = [], anchorages = [] } = spatial;

  const fillFor = (tone) => {
    switch (tone) {
      case 'heavy':
        return 'var(--color-text-danger)';
      case 'moderate':
        return 'var(--color-text-warning)';
      case 'light':
        return 'var(--color-text-success)';
      default:
        return 'var(--color-background-tertiary)';
    }
  };

  return (
    <svg
      viewBox="0 0 540 240"
      width="100%"
      height="240"
      preserveAspectRatio="none"
      style={{
        display: 'block',
        background: 'var(--color-background-secondary)',
        borderRadius: 'var(--border-radius-md)',
      }}
      role="img"
    >
      {/* Coast outlines */}
      <path
        d="M 0,0 L 240,0 L 245,40 L 232,90 L 250,140 L 240,200 L 220,240 L 0,240 Z"
        fill="var(--color-background-tertiary)"
        opacity="0.6"
      />
      <path
        d="M 540,0 L 540,240 L 470,240 L 458,180 L 470,120 L 460,60 L 470,0 Z"
        fill="var(--color-background-tertiary)"
        opacity="0.6"
      />

      {/* Berths along the coast */}
      {berths.map((b, i) => {
        const y = 48 + i * 32;
        const filled = b.capacity > 0 && b.occupied / b.capacity > 0.6;
        return (
          <g key={i}>
            <rect
              x="245"
              y={y}
              width="40"
              height="14"
              rx="2"
              fill={fillFor(b.fillTone)}
              opacity="0.85"
            />
            <text
              x="265"
              y={y - 6}
              fontSize="9"
              fill="var(--color-text-secondary)"
              textAnchor="middle"
              fontFamily="var(--font-sans)"
            >
              {b.name}
            </text>
            <text
              x="265"
              y={y + 10}
              fontSize="9"
              fill={filled ? 'var(--color-background-primary)' : 'var(--color-text-primary)'}
              textAnchor="middle"
              fontFamily="var(--font-sans)"
              fontWeight="500"
            >
              {b.occupied}/{b.capacity}
            </text>
          </g>
        );
      })}

      {/* Anchorages */}
      {anchorages.map((a, i) => {
        const cy = 60 + i * 70;
        return (
          <g key={i}>
            <ellipse
              cx="380"
              cy={cy}
              rx="50"
              ry="22"
              fill={fillFor(a.fillTone)}
              opacity="0.45"
              stroke={fillFor(a.fillTone)}
              strokeWidth="1"
              strokeDasharray="3 2"
            />
            <text
              x="380"
              y={cy - 2}
              fontSize="10"
              fill="var(--color-text-primary)"
              textAnchor="middle"
              fontFamily="var(--font-sans)"
              fontWeight="500"
            >
              {a.name}
            </text>
            <text
              x="380"
              y={cy + 11}
              fontSize="10"
              fill="var(--color-text-primary)"
              textAnchor="middle"
              fontFamily="var(--font-sans)"
            >
              {a.ships} ship{a.ships === 1 ? '' : 's'}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
