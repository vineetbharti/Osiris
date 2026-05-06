import React from 'react';
import { SourceLabel } from '../../design-system/patterns';

/**
 * SpeedScheduleStrip — 4 horizontally arranged segments showing past/now/future
 * speed plan. Past is tinted secondary, Now is tinted info, future is default.
 * Scroll arrows are present but inactive in v1 (single 4-segment view).
 */
export default function SpeedScheduleStrip({ segments = [] }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-md)',
        overflow: 'hidden',
      }}
    >
      <ScrollButton direction="left" />
      <div style={{ flex: 1, overflow: 'hidden', minWidth: 0, position: 'relative' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))`,
          }}
        >
          {segments.map((seg, i) => (
            <Segment key={i} seg={seg} isLast={i === segments.length - 1} />
          ))}
        </div>
      </div>
      <ScrollButton direction="right" />
    </div>
  );
}

function Segment({ seg, isLast }) {
  const bgColor = seg.isPast
    ? 'var(--color-background-secondary)'
    : seg.isNow
    ? 'var(--color-background-info)'
    : 'transparent';

  const labelColor = seg.isNow
    ? 'var(--color-text-info)'
    : 'var(--color-text-tertiary)';

  return (
    <div
      style={{
        padding: '12px 14px',
        borderRight: isLast ? 'none' : '0.5px solid var(--color-border-tertiary)',
        background: bgColor,
        position: 'relative',
      }}
    >
      <div
        style={{
          fontSize: 11,
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 500,
          color: labelColor,
          margin: '0 0 5px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{seg.timeRange}</span>
        {seg.isNow && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: 'var(--color-text-info)',
            }}
          />
        )}
      </div>
      <p
        className="tabular"
        style={{
          fontSize: 12,
          color: 'var(--color-text-secondary)',
          margin: '0 0 6px',
          lineHeight: 1.3,
        }}
      >
        {seg.duration}
      </p>
      <p
        className="tabular"
        style={{
          fontSize: 17,
          fontWeight: seg.isPast ? 400 : 500,
          color: seg.isPast ? 'var(--color-text-secondary)' : 'var(--color-text-primary)',
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {seg.speed}
      </p>
      <div style={{ marginTop: 4 }}>
        <SourceLabel source={seg.source} />
      </div>
    </div>
  );
}

function ScrollButton({ direction }) {
  return (
    <button
      style={{
        width: 22,
        flexShrink: 0,
        background: 'var(--color-background-primary)',
        border: 'none',
        borderRight: direction === 'left' ? '0.5px solid var(--color-border-tertiary)' : 'none',
        borderLeft: direction === 'right' ? '0.5px solid var(--color-border-tertiary)' : 'none',
        color: 'var(--color-text-secondary)',
        fontSize: 13,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
      }}
    >
      {direction === 'left' ? '‹' : '›'}
    </button>
  );
}
