import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageShell, PageHeader } from '../../design-system/layout';
import { KpiCard, Input } from '../../design-system/primitives';
import { ColumnHeader, DataRow, Chevron, DeltaText } from '../../design-system/patterns';
import { historicalRepo } from '../../data/repositories';

/**
 * HistoricalLandingPage — Tab 5 (level 1).
 * Fleet roll-up + per-vessel savings rows.
 */
export default function HistoricalLandingPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    historicalRepo.getFleetSummary().then(setSummary);
  }, []);

  if (!summary) {
    return (
      <PageShell>
        <div style={{ padding: 40, color: 'var(--color-text-secondary)' }}>Loading…</div>
      </PageShell>
    );
  }

  const filteredLeaderboard = summary.leaderboard.filter((v) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return v.imo.toLowerCase().includes(q) || v.name.toLowerCase().includes(q);
  });

  return (
    <PageShell>
      <div style={{ padding: '24px 20px 28px' }}>
        <PageHeader
          title="Historical Analytics"
          subtitle="Backtest your fleet against the Osiris recommendation engine. Select a vessel to view voyage-level analysis."
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <KpiCard
            hero
            label="Fleet cost saved"
            value="$1.42M"
            subValue={`−13.1% across ${summary.vesselCount} vessels`}
            subTone="success"
          />
          <KpiCard
            label="Voyages analyzed"
            value="200"
            subValue="Jan 2024 to Apr 2026"
            subTone="secondary"
          />
          <KpiCard label="Avg. per voyage" value="$7.1k" subValue="median $5.6k" subTone="secondary" />
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Input
            placeholder="Search by IMO number or vessel name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Sort: Cost saved ▾
          </span>
        </div>

        <ColumnHeader
          gridTemplate="minmax(0, 1.4fr) 130px 110px 110px 130px 16px"
          columns={[
            { label: 'Vessel' },
            { label: 'Voyages' },
            { label: 'Time saved', align: 'right' },
            { label: 'Fuel saved', align: 'right' },
            { label: 'Cost saved', align: 'right' },
            { label: '' },
          ]}
        />

        {filteredLeaderboard.map((v) => (
          <VesselRow key={v.imo} vessel={v} onClick={() => navigate(`/history/${v.imo}`)} />
        ))}
      </div>
    </PageShell>
  );
}

function VesselRow({ vessel, onClick }) {
  return (
    <DataRow onClick={onClick}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) 130px 110px 110px 130px 16px',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <div>
          <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 3px', lineHeight: 1.3 }}>
            {vessel.name}
          </p>
          <p
            className="tabular"
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            IMO {vessel.imo} · Cargo
          </p>
        </div>
        <div style={{ minWidth: 0 }}>
          <p className="tabular" style={{ fontSize: 13, margin: 0, lineHeight: 1.3 }}>
            <b style={{ fontWeight: 500 }}>{vessel.voyages}</b> voyages
          </p>
          <p
            className="tabular"
            style={{
              fontSize: 11,
              color: 'var(--color-text-secondary)',
              margin: '2px 0 0',
              lineHeight: 1.3,
            }}
          >
            past 90 days
          </p>
        </div>
        <DeltaText value="−14h" delta="−10.2%" tone="gain" colorValue />
        <DeltaText value="−18 t" delta="−8.4%" tone="gain" colorValue />
        <DeltaText value={vessel.costSaved} delta={vessel.costSavedPct} tone="gain" colorValue />
        <Chevron />
      </div>
    </DataRow>
  );
}
