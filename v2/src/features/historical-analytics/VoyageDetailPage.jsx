import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { PageShell, Breadcrumb } from '../../design-system/layout';
import { Card } from '../../design-system/primitives';
import { EntityHeader, ColumnHeader } from '../../design-system/patterns';

import VoyageMap from '../vessel-intelligence/VoyageMap';
import ProfileCard from '../vessel-intelligence/ProfileCard';

import { historicalRepo, vesselIntelRepo } from '../../data/repositories';
import { monogram } from '../../utils/format';

/**
 * VoyageDetailPage — Tab 5 (level 3).
 * Single voyage backtest with calibration, track, profile comparison, conclusion.
 */
export default function VoyageDetailPage() {
  const { imo, voyageId } = useParams();
  const [voyage, setVoyage] = useState(null);
  const [track, setTrack] = useState(null);

  useEffect(() => {
    historicalRepo.getVoyageDetail(voyageId).then(setVoyage);
    vesselIntelRepo.getTrack(imo).then(setTrack);
  }, [imo, voyageId]);

  if (!voyage) {
    return (
      <PageShell>
        <div style={{ padding: 40, color: 'var(--color-text-secondary)' }}>Loading…</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div style={{ padding: '20px 20px 28px' }}>
        <Breadcrumb
          items={[
            { label: 'Historical Analytics', to: '/history' },
            { label: voyage.vesselName, to: `/history/${voyage.vesselImo}` },
            { label: `${voyage.routeFrom} → ${voyage.routeTo}` },
          ]}
        />
        <EntityHeader
          name={`${voyage.routeFrom} → ${voyage.routeTo}`}
          monogram={monogram(voyage.vesselName)}
          meta={`${voyage.vesselName} · IMO ${voyage.vesselImo} · ${voyage.vesselType}`}
        />

        <VoyageBar voyage={voyage} />

        <SectionTitle>Model calibration on this voyage</SectionTitle>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 18,
          }}
        >
          {voyage.calibration.map((c, i) => (
            <CalibrationCard key={i} item={c} />
          ))}
        </div>

        {track && (
          <>
            <SectionTitle>Voyage track</SectionTitle>
            <div style={{ marginTop: 8 }}>
              <VoyageMap
                observed={track.observed}
                predicted={track.predicted.length > 0 ? track.predicted : []}
                origin={{ name: voyage.routeFrom, time: voyage.departedAt }}
                destination={{ name: voyage.routeTo, time: voyage.arrivedAt }}
              />
            </div>
          </>
        )}

        <SectionTitle>Profile comparison vs. actual outcome</SectionTitle>
        <div style={{ marginTop: 8 }}>
          <ColumnHeader
            gap={12}
            gridTemplate="minmax(0, 1.55fr) minmax(0, 1.45fr) 88px 88px 88px 90px 16px"
            columns={[
              { label: 'Profile' },
              { label: 'Action' },
              { label: 'Arrival' },
              { label: 'Anchorage' },
              { label: 'Berth' },
              { label: 'Cost' },
              { label: '' },
            ]}
          />
          {voyage.profiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              defaultExpanded={p.isRecommended}
            />
          ))}
        </div>

        <Conclusion conclusion={voyage.conclusion} />
      </div>
    </PageShell>
  );
}

function VoyageBar({ voyage }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: 'var(--color-background-secondary)',
        borderRadius: 'var(--border-radius-md)',
        marginBottom: 18,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--color-text-tertiary)',
          }}
        />
        <span style={{ fontSize: 13 }}>
          Departed <b style={{ fontWeight: 500 }}>{voyage.departedAt}</b> · arrived{' '}
          <b style={{ fontWeight: 500 }}>{voyage.arrivedAt}</b> · {voyage.durationLabel}
        </span>
      </div>
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
          Distance
        </span>
        <span className="tabular" style={{ fontSize: 13, fontWeight: 500 }}>
          {voyage.distanceNmi} nmi
        </span>
      </div>
    </div>
  );
}

function CalibrationCard({ item }) {
  return (
    <Card padding={16}>
      <p
        style={{
          fontSize: 11,
          color: 'var(--color-text-tertiary)',
          margin: '0 0 10px',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          fontWeight: 500,
        }}
      >
        {item.label}
      </p>
      <Line label="Predicted" value={item.predicted} />
      <Line label="Actual" value={item.actual} />
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 6,
          paddingTop: 8,
          marginTop: 6,
          borderTop: '0.5px solid var(--color-border-tertiary)',
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
          Error
        </span>
        <span
          className="tabular"
          style={{
            fontSize: 13,
            fontWeight: 500,
            marginLeft: 'auto',
          }}
        >
          {item.error}
        </span>
      </div>
    </Card>
  );
}

function Line({ label, value }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '76px 1fr',
        gap: 8,
        padding: '4px 0',
        alignItems: 'baseline',
      }}
    >
      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0 }}>{label}</p>
      <p className="tabular" style={{ fontSize: 13, margin: 0, fontWeight: 500 }}>
        {value}
      </p>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p
      style={{
        fontSize: 11,
        color: 'var(--color-text-tertiary)',
        margin: '0 0 10px',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontWeight: 500,
      }}
    >
      {children}
    </p>
  );
}

function Conclusion({ conclusion }) {
  if (!conclusion) return null;
  return (
    <div
      style={{
        padding: '16px 20px',
        border: '1.5px solid var(--color-border-info)',
        borderRadius: 'var(--border-radius-lg)',
        background: 'var(--color-background-info)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        marginTop: 20,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <p
          style={{
            fontSize: 11,
            color: 'var(--color-text-info)',
            margin: '0 0 4px',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            fontWeight: 500,
          }}
        >
          Engine recommendation in retrospect
        </p>
        <p style={{ fontSize: 14, margin: 0, lineHeight: 1.4 }}>
          Of {conclusion.profilesConsidered} profiles considered, the engine would have selected{' '}
          <b style={{ fontWeight: 500 }}>{conclusion.profileChosen}</b> over the actual sailing
          strategy.
        </p>
      </div>
      <div style={{ textAlign: 'right' }}>
        <p
          className="tabular"
          style={{
            fontSize: 24,
            fontWeight: 500,
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
          }}
        >
          {conclusion.costSaved}
        </p>
        <p
          style={{
            fontSize: 12,
            color: 'var(--color-text-success)',
            margin: '4px 0 0',
            fontWeight: 500,
          }}
        >
          cost saved on this voyage
        </p>
      </div>
    </div>
  );
}
