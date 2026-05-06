import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { PageShell, Breadcrumb } from '../../design-system/layout';
import { StatusDot } from '../../design-system/primitives';
import { EntityHeader, SpecsStrip, ColumnHeader } from '../../design-system/patterns';

import VoyageMap from './VoyageMap';
import ProfileCard from './ProfileCard';

import { vesselIntelRepo } from '../../data/repositories';
import { monogram, statusLabel } from '../../utils/format';

/**
 * VesselIntelligencePage — Tab 3.
 * Single-vessel decision support: header, specs, status, voyage map,
 * and a stack of voyage profiles.
 */
export default function VesselIntelligencePage() {
  const { imo } = useParams();
  const navigate = useNavigate();
  const [state, setState] = useState({ data: null, isLoading: true });
  const [track, setTrack] = useState(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      vesselIntelRepo.getCurrentState(imo),
      vesselIntelRepo.getTrack(imo),
    ]).then(([data, trackData]) => {
      if (!cancelled) {
        setState({ data, isLoading: false });
        setTrack(trackData);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [imo]);

  if (state.isLoading) {
    return (
      <PageShell>
        <div style={{ padding: 40, color: 'var(--color-text-secondary)' }}>Loading…</div>
      </PageShell>
    );
  }

  if (!state.data) {
    return (
      <PageShell>
        <div style={{ padding: 40 }}>
          <p style={{ marginBottom: 12 }}>Vessel not found.</p>
          <button
            type="button"
            onClick={() => navigate('/fleet')}
            style={{
              color: 'var(--color-text-info)',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              padding: 0,
              font: 'inherit',
            }}
          >
            ← Back to Fleet
          </button>
        </div>
      </PageShell>
    );
  }

  const { vessel, profiles } = state.data;
  const status = vessel.status || {};
  const meta = [
    `IMO ${vessel.imo}`,
    vessel.type,
    vessel.flag && `Flag ${vessel.flag}`,
    vessel.yearBuilt && `Built ${vessel.yearBuilt}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const specs = [
    vessel.length && { label: 'Length', value: `${vessel.length} m` },
    vessel.beam && { label: 'Beam', value: `${vessel.beam} m` },
    vessel.draft && { label: 'Draft', value: `${vessel.draft} m` },
    vessel.grossTonnage && { label: 'GT', value: vessel.grossTonnage.toLocaleString() },
    vessel.deadweight && { label: 'DWT', value: vessel.deadweight.toLocaleString() },
  ].filter(Boolean);

  return (
    <PageShell>
      <div style={{ padding: '20px 20px 28px' }}>
        <Breadcrumb items={[{ label: 'Fleet', to: '/fleet' }, { label: vessel.name }]} />
        <EntityHeader
          name={vessel.name}
          monogram={monogram(vessel.name)}
          imageUrl={vessel.imageUrl}
          meta={meta}
        />
        <SpecsStrip items={specs} />

        <StatusBar status={status} />

        {track && (
          <>
            <SectionHeading title="Voyage track" />
            <VoyageMap
              observed={track.observed}
              predicted={track.predicted}
              origin={{ name: 'Aarhus' }}
              destination={{
                name: status.destination,
                time: status.eta,
                isLive: status.state === 'in-transit',
              }}
            />
          </>
        )}

        <SectionHeading
          title="Voyage profiles"
          action={profiles.length > 0 ? 'Compare in Optimization Lab →' : null}
        />
        {profiles.length > 0 ? (
          <>
            <ColumnHeader
              gap={12}
              gridTemplate="minmax(0, 1.55fr) minmax(0, 1.45fr) 88px 88px 88px 90px 16px"
              columns={[
                { label: 'Profile' },
                { label: 'Action' },
                { label: 'ETA' },
                { label: 'Anchorage' },
                { label: 'Berth' },
                { label: 'Cost' },
                { label: '' },
              ]}
            />
            {profiles.map((p) => (
              <ProfileCard
                key={p.id}
                profile={p}
                defaultExpanded={p.isCurrent || p.isRecommended}
              />
            ))}
          </>
        ) : (
          <div
            style={{
              padding: '20px 16px',
              border: '0.5px dashed var(--color-border-tertiary)',
              borderRadius: 'var(--border-radius-lg)',
              color: 'var(--color-text-secondary)',
              fontSize: 13,
              lineHeight: 1.5,
            }}
          >
            <p style={{ margin: '0 0 4px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
              Recommendations not yet available for this vessel.
            </p>
            <p style={{ margin: 0 }}>
              Profiles are generated once the recommendation engine has observed enough AIS data
              for this IMO. Newly added vessels typically begin showing recommendations within 24
              hours of their next voyage.
            </p>
          </div>
        )}
      </div>
    </PageShell>
  );
}

function StatusBar({ status }) {
  if (!status?.state) return null;
  const inTransit = status.state === 'in-transit';
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'var(--color-background-secondary)',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <StatusDot tone="info" />
        <span style={{ fontSize: 13 }}>
          {inTransit ? (
            <>
              {statusLabel(status.state)} to{' '}
              <b style={{ fontWeight: 500 }}>{status.destination}</b>
              {status.speed && ` · ${status.speed} kn`}
              {status.heading && ` · Heading ${status.heading}°`}
            </>
          ) : (
            <>
              {statusLabel(status.state)} at <b style={{ fontWeight: 500 }}>{status.port}</b>
              {status.waitingTime && ` · waiting ${status.waitingTime}`}
            </>
          )}
        </span>
      </div>
      {status.eta && (
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span
            style={{
              fontSize: 11,
              color: 'var(--color-text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              fontWeight: 500,
            }}
          >
            ETA
          </span>
          <span className="tabular" style={{ fontSize: 13, fontWeight: 500 }}>
            {status.eta} {status.etaRange && <span style={{ color: 'var(--color-text-secondary)', fontWeight: 400 }}>{status.etaRange}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

function SectionHeading({ title, action }) {
  return (
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
        {title}
      </p>
      {action && <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{action}</span>}
    </div>
  );
}
