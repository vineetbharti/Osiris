import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { PageShell, Breadcrumb } from '../../design-system/layout';
import { Card, Pill } from '../../design-system/primitives';
import { SpecsStrip, CongestionBadge } from '../../design-system/patterns';

import CongestionTimeline from './CongestionTimeline';
import SpatialHeatmap from './SpatialHeatmap';
import { portRepo } from '../../data/repositories';

/**
 * PortDetailPage — Tab 4 (level 2).
 * Time-aware view of a single port:
 *   - Header + ship-type filter
 *   - Static specs strip
 *   - Time slider with NOW marker
 *   - Observed-vs-predicted timeline strip
 *   - Headline congestion read for selected bucket
 *   - Schematic spatial heatmap
 *   - "Why this rating" feature attribution
 */
export default function PortDetailPage() {
  const { code } = useParams();
  const [port, setPort] = useState(null);
  const [buckets, setBuckets] = useState([]);
  const [features, setFeatures] = useState(null);
  const [shipType, setShipType] = useState('all');
  const [selectedIndex, setSelectedIndex] = useState(20); // default to "Now" bucket
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      portRepo.getByCode(code),
      portRepo.getCongestionTimeline(code, { shipType }),
    ]).then(([p, b]) => {
      if (cancelled) return;
      setPort(p);
      setBuckets(b);
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [code, shipType]);

  // When selectedIndex or port changes, fetch features for that bucket
  useEffect(() => {
    if (!port || buckets.length === 0) return;
    const bucket = buckets[selectedIndex];
    if (!bucket) return;
    portRepo
      .getFeaturesAt(port.code, bucket.bucketStart, shipType)
      .then((f) => setFeatures(f));
  }, [port, buckets, selectedIndex, shipType]);

  if (isLoading || !port) {
    return (
      <PageShell>
        <div style={{ padding: 40, color: 'var(--color-text-secondary)' }}>Loading…</div>
      </PageShell>
    );
  }

  const selected = buckets[selectedIndex];
  const isFuture = selected && !selected.observed;
  const matched = selected && selected.observed === selected.predicted;

  const specs = [
    { label: 'Profile', value: port.profile },
    { label: 'Berths', value: String(port.berths) },
    { label: 'Quay', value: `${port.quayKm} km` },
    { label: 'Max draft', value: `${port.maxDraft} m` },
    { label: 'Anchorages', value: String(port.anchorages) },
    { label: 'Capacity', value: port.scale },
    { label: 'Avg turnaround', value: port.avgTurnaround },
  ];

  return (
    <PageShell>
      <div style={{ padding: '20px 20px 28px' }}>
        <Breadcrumb items={[{ label: 'Port Intelligence', to: '/ports' }, { label: port.name }]} />

        <PortHeader port={port} shipType={shipType} onShipTypeChange={setShipType} />
        <SpecsStrip items={specs} />

        <TimeSlider
          buckets={buckets}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />

        <CongestionTimeline
          buckets={buckets}
          selectedIndex={selectedIndex}
          onSelect={setSelectedIndex}
        />

        {selected && features && (
          <HeadlineRead bucket={selected} features={features} isFuture={isFuture} matched={matched} />
        )}

        {features && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.4fr 1fr',
              gap: 12,
              marginBottom: 18,
            }}
          >
            <Card padding={16}>
              <SpatialHeader bucket={selected} />
              <div style={{ marginTop: 12 }}>
                <SpatialHeatmap spatial={features.spatial} />
              </div>
            </Card>
            <Card padding={16}>
              <FeatureAttribution features={features.features} />
            </Card>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function PortHeader({ port, shipType, onShipTypeChange }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 14,
        marginBottom: 14,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <h1
          style={{
            fontSize: 22,
            fontWeight: 500,
            margin: '0 0 4px',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}
        >
          {port.name}
        </h1>
        <p
          className="tabular"
          style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}
        >
          {port.country} · UN/LOCODE {port.code}
          {port.coords && ` · ${port.coords[0].toFixed(2)}°N, ${port.coords[1].toFixed(2)}°E`}
        </p>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {[
          { id: 'all', label: 'All ships' },
          { id: 'cargo', label: 'Cargo' },
          { id: 'tanker', label: 'Tanker' },
        ].map((t) => (
          <span key={t.id} onClick={() => onShipTypeChange(t.id)} style={{ cursor: 'pointer' }}>
            <Pill selected={shipType === t.id}>{t.label}</Pill>
          </span>
        ))}
      </div>
    </div>
  );
}

function TimeSlider({ buckets, selectedIndex, onSelect }) {
  const total = buckets.length || 28;
  // "Now" is at the boundary between past (20) and future (8)
  const nowPercent = (20 / total) * 100;
  const handlePercent = (selectedIndex / (total - 1)) * 100;

  return (
    <div
      style={{
        padding: '16px 18px 14px',
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
        <span
          style={{
            fontSize: 11,
            color: 'var(--color-text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 500,
          }}
        >
          Selected time
        </span>
        <span
          className="tabular"
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)' }}
        >
          Bucket {selectedIndex + 1} of {total}{' '}
          <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400, marginLeft: 6 }}>
            {selectedIndex < 20 ? `${(20 - selectedIndex) * 6}h ago · observed` : `${(selectedIndex - 20) * 6}h ahead · predicted`}
          </span>
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          height: 6,
          background: 'var(--color-background-secondary)',
          borderRadius: 3,
          margin: '14px 4px 8px',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${nowPercent}%`,
            transform: 'translateX(-50%)',
            top: -22,
            fontSize: 10,
            color: 'var(--color-text-info)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 500,
            whiteSpace: 'nowrap',
          }}
        >
          Now
        </div>
        <div
          style={{
            position: 'absolute',
            left: `${nowPercent}%`,
            top: -7,
            bottom: -7,
            width: 1.5,
            background: 'var(--color-text-info)',
          }}
        />
        <input
          type="range"
          min={0}
          max={total - 1}
          value={selectedIndex}
          onChange={(e) => onSelect(parseInt(e.target.value, 10))}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            opacity: 0,
            cursor: 'pointer',
            margin: 0,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: `${handlePercent}%`,
            top: -6,
            width: 18,
            height: 18,
            marginLeft: -9,
            borderRadius: '50%',
            background: 'var(--color-text-primary)',
            border: '3px solid var(--color-background-primary)',
            boxShadow: '0 0 0 1px var(--color-border-tertiary)',
            pointerEvents: 'none',
          }}
        />
      </div>
      <div
        className="tabular"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '0 4px',
          fontSize: 10,
          color: 'var(--color-text-tertiary)',
        }}
      >
        <span>5d ago</span>
        <span>3d ago</span>
        <span>1d ago</span>
        <span>Now</span>
        <span>+1d</span>
        <span>+2d</span>
      </div>
    </div>
  );
}

function HeadlineRead({ bucket, features, isFuture, matched }) {
  const congestion = bucket.observed || bucket.predicted;

  return (
    <Card padding={18} style={{ marginBottom: 18 }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.3fr) minmax(0, 1.6fr)',
          gap: 24,
          alignItems: 'center',
        }}
      >
        <div style={{ borderRight: '0.5px solid var(--color-border-tertiary)', paddingRight: 24 }}>
          <p
            style={{
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: 500,
              margin: '0 0 6px',
            }}
          >
            Selected bucket
          </p>
          <div style={{ marginBottom: 12 }}>
            <CongestionBadge level={congestion} size="lg" />
          </div>
          <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
            {isFuture ? (
              <>
                <b style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Predicted</b>{' '}
                · forward forecast
              </>
            ) : matched ? (
              <>
                <b style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Observed</b>{' '}
                · model predicted{' '}
                <b style={{ color: 'var(--color-text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>
                  {bucket.predicted}
                </b>{' '}
                · rating matched
              </>
            ) : (
              <>
                <b style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>Observed</b>{' '}
                · model predicted{' '}
                <b style={{ color: 'var(--color-text-primary)', fontWeight: 500, textTransform: 'capitalize' }}>
                  {bucket.predicted}
                </b>
              </>
            )}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px 24px' }}>
          <Stat
            label="Ships in port"
            value={features.shipsInPort}
            sub={`vs typical ${features.typicalShipsInPort} (${features.shipsInPort > features.typicalShipsInPort ? '+' : ''}${Math.round(((features.shipsInPort / features.typicalShipsInPort - 1) * 100))}%)`}
          />
          <Stat label="Avg wait, last 24h" value={features.avgWait24h} sub={`vs typical ${features.typicalAvgWait24h}`} />
          <Stat label="Arrivals, last 6h" value={features.arrivals6h} sub={features.arrivals6hBreakdown} />
          <Stat label="Departures, last 6h" value={features.departures6h} sub={`net ${features.netFlow}`} />
        </div>
      </div>
    </Card>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div>
      <p
        style={{
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          margin: '0 0 3px',
        }}
      >
        {label}
      </p>
      <p
        className="tabular"
        style={{ fontSize: 16, fontWeight: 500, margin: 0, lineHeight: 1.2 }}
      >
        {value}
      </p>
      <p
        className="tabular"
        style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '2px 0 0' }}
      >
        {sub}
      </p>
    </div>
  );
}

function SpatialHeader({ bucket }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        gap: 12,
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
        Spatial load
      </p>
      <span style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--color-text-secondary)' }}>
        <Chip color="var(--color-text-success)">Empty</Chip>
        <Chip color="var(--color-text-warning)">Filling</Chip>
        <Chip color="var(--color-text-danger)">Full</Chip>
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

function FeatureAttribution({ features }) {
  return (
    <>
      <p
        style={{
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          margin: '0 0 12px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 500,
        }}
      >
        Why this rating
      </p>
      {features.map((f, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 8,
            padding: '8px 0',
            borderBottom:
              i < features.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
            alignItems: 'baseline',
          }}
        >
          <div>
            <p style={{ fontSize: 13, margin: '0 0 3px', lineHeight: 1.3 }}>{f.name}</p>
            <p
              style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.3 }}
            >
              {f.sub}
            </p>
          </div>
          <span
            className="tabular"
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: f.tone === 'up' ? 'var(--color-text-danger)' : 'var(--color-text-success)',
            }}
          >
            {f.trend}
          </span>
        </div>
      ))}
    </>
  );
}
