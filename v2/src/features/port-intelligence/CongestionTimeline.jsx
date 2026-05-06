import React from 'react';

/**
 * CongestionTimeline — two-row strip showing observed (top, solid) and
 * predicted (bottom, faded) congestion levels per 6h bucket.
 *
 * @param {Array<{bucketStart, observed, predicted}>} buckets
 * @param {number} selectedIndex
 * @param {(index: number) => void} onSelect
 */
export default function CongestionTimeline({ buckets = [], selectedIndex, onSelect }) {
  const colorFor = (level, faded = false) => {
    const opacity = faded ? 0.5 : 0.85;
    switch (level) {
      case 'heavy':
        return { bg: 'var(--color-text-danger)', opacity };
      case 'moderate':
        return { bg: 'var(--color-text-warning)', opacity };
      case 'light':
        return { bg: 'var(--color-text-success)', opacity };
      default:
        return { bg: 'var(--color-background-secondary)', opacity: 0.6 };
    }
  };

  return (
    <div
      style={{
        padding: '14px 18px 16px',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        background: 'var(--color-background-primary)',
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: 10,
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            margin: 0,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 500,
          }}
        >
          Congestion timeline
        </p>
        <span
          style={{ fontSize: 12, color: 'var(--color-text-secondary)', cursor: 'pointer' }}
        >
          Jump to date →
        </span>
      </div>

      <Row label="Observed">
        {buckets.map((b, i) => {
          const { bg, opacity } = colorFor(b.observed);
          const isSelected = i === selectedIndex;
          return (
            <button
              key={i}
              onClick={() => onSelect && onSelect(i)}
              style={{
                flex: 1,
                height: '100%',
                background: bg,
                opacity,
                border: 'none',
                padding: 0,
                cursor: 'pointer',
                boxShadow: isSelected ? 'inset 0 0 0 2px var(--color-text-primary)' : 'none',
                borderRadius: isSelected ? 2 : 0,
              }}
              aria-label={`Observed bucket ${i}`}
            />
          );
        })}
      </Row>

      <Row label="Predicted">
        {buckets.map((b, i) => {
          const { bg, opacity } = colorFor(b.predicted, true);
          return <div key={i} style={{ flex: 1, height: '100%', background: bg, opacity }} />;
        })}
      </Row>

      <Legend />
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '70px 1fr',
        gap: 12,
        alignItems: 'center',
        padding: '4px 0',
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 500,
        }}
      >
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          height: 16,
          gap: 1,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        fontSize: 11,
        color: 'var(--color-text-secondary)',
        alignItems: 'center',
        paddingTop: 10,
        borderTop: '0.5px solid var(--color-border-tertiary)',
        marginTop: 10,
      }}
    >
      <Chip color="var(--color-text-success)">Light</Chip>
      <Chip color="var(--color-text-warning)">Moderate</Chip>
      <Chip color="var(--color-text-danger)">Heavy</Chip>
      <span style={{ marginLeft: 'auto' }}>
        Solid = observed · faded = predicted · 6h buckets
      </span>
    </div>
  );
}

function Chip({ color, children }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 12, height: 10, borderRadius: 2, background: color }} />
      {children}
    </span>
  );
}
