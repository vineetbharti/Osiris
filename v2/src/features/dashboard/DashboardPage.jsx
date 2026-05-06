import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageShell, PageHeader } from '../../design-system/layout';
import { Card, KpiCard, Pill } from '../../design-system/primitives';
import { ColumnHeader, DataRow, Chevron, DeltaText } from '../../design-system/patterns';
import { historicalRepo } from '../../data/repositories';

/**
 * DashboardPage — Tab 1.
 * Executive view: fleet KPIs, savings trend, leaderboard, recent voyages.
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [range, setRange] = useState('90d');

  useEffect(() => {
    historicalRepo.getFleetSummary({ rangeDays: rangeToDays(range) }).then(setSummary);
  }, [range]);

  if (!summary) {
    return (
      <PageShell>
        <div style={{ padding: 40, color: 'var(--color-text-secondary)' }}>Loading…</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div style={{ padding: '24px 20px 28px' }}>
        <PageHeader
          title="Dashboard"
          subtitle={`Fleet performance against the Osiris recommendation engine · ${summary.rangeLabel}`}
          actions={
            <div style={{ display: 'flex', gap: 4 }}>
              {['30d', '90d', '365d', 'All time'].map((r) => (
                <span key={r} onClick={() => setRange(r)} style={{ cursor: 'pointer' }}>
                  <Pill selected={range === r}>{r}</Pill>
                </span>
              ))}
            </div>
          }
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.4fr 1fr 1fr 1fr',
            gap: 10,
            marginBottom: 18,
          }}
        >
          <KpiCard
            hero
            label="Cost saved"
            value={summary.costSavedDisplay}
            subValue={`${summary.costSavedPct}% vs actual fleet spend`}
            subTone="success"
          />
          <KpiCard
            label="Time saved"
            value={summary.timeSaved}
            subValue={`${summary.timeSavedPct}% port time`}
            subTone="success"
          />
          <KpiCard
            label="Fuel saved"
            value={summary.fuelSaved}
            subValue={`${summary.fuelSavedPct}% bunker`}
            subTone="success"
          />
          <KpiCard
            label="Voyages analyzed"
            value={String(summary.voyagesAnalyzed)}
            subValue={`across ${summary.vesselCount} vessels`}
            subTone="secondary"
          />
        </div>

        <Card padding={18} style={{ marginBottom: 18 }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 14,
            }}
          >
            <SubTitle>Cost saved by month</SubTitle>
            <button
              type="button"
              onClick={() => navigate('/history')}
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                background: 'transparent',
                border: 'none',
                padding: 0,
                font: 'inherit',
              }}
            >
              View in Historical Analytics →
            </button>
          </div>
          <SavingsChart data={summary.savingsByMonth} />
        </Card>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.5fr 1fr',
            gap: 12,
            marginBottom: 18,
          }}
        >
          <Card padding={18}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: 14,
              }}
            >
              <SubTitle>Vessel leaderboard · cost saved</SubTitle>
              <button
                type="button"
                onClick={() => navigate('/history')}
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  background: 'transparent',
                  border: 'none',
                  padding: 0,
                  font: 'inherit',
                }}
              >
                All vessels →
              </button>
            </div>
            <Leaderboard
              vessels={summary.leaderboard}
              onSelect={(imo) => navigate(`/history/${imo}`)}
            />
          </Card>
          <Card padding={18}>
            <SubTitle>Voyage outcomes</SubTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginTop: 14 }}>
              <OutcomeBar
                label="Improved"
                count={summary.outcomes.improved}
                total={summary.outcomes.total}
                tone="gain"
              />
              <OutcomeBar
                label="No material change"
                count={summary.outcomes.neutral}
                total={summary.outcomes.total}
                tone="neutral"
              />
              <OutcomeBar
                label="Worsened"
                count={summary.outcomes.worsened}
                total={summary.outcomes.total}
                tone="loss"
              />
            </div>
          </Card>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
          }}
        >
          <SubTitle>Recent voyages</SubTitle>
          <button
            type="button"
            onClick={() => navigate('/history')}
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              background: 'transparent',
              border: 'none',
              padding: 0,
              font: 'inherit',
            }}
          >
            All voyages →
          </button>
        </div>
        <ColumnHeader
          gridTemplate="minmax(0, 1.4fr) minmax(0, 1.1fr) 110px 110px 16px"
          columns={[
            { label: 'Route' },
            { label: 'Vessel' },
            { label: 'Date', align: 'right' },
            { label: 'Cost saved', align: 'right' },
            { label: '' },
          ]}
        />
        {summary.recentVoyages.map((v) => (
          <RecentVoyageRow key={v.id} voyage={v} />
        ))}
      </div>
    </PageShell>
  );
}

function rangeToDays(r) {
  switch (r) {
    case '30d':
      return 30;
    case '365d':
      return 365;
    case 'All time':
      return null;
    default:
      return 90;
  }
}

function SubTitle({ children }) {
  return (
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
      {children}
    </p>
  );
}

function SavingsChart({ data }) {
  const W = 700,
    H = 200,
    pad = 50;
  const max = Math.max(...data.map((d) => d.value));
  const project = (i, v) => {
    const x = pad + 60 + (i / (data.length - 1)) * (W - pad - 90);
    const y = pad + (1 - v / max) * (H - 2 * pad);
    return [x, y];
  };
  const points = data.map((d, i) => project(i, d.value));
  const linePath = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${x},${y}`).join(' ');
  const fillPath = `${linePath} L ${points[points.length - 1][0]},${H - pad} L ${points[0][0]},${H - pad} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none">
      <line x1={pad + 10} y1={pad} x2={pad + 10} y2={H - pad} stroke="var(--color-border-tertiary)" strokeWidth="0.5" />
      <line x1={pad + 10} y1={H - pad} x2={W - 20} y2={H - pad} stroke="var(--color-border-tertiary)" strokeWidth="0.5" />
      <text x={pad} y={H - pad + 4} fontSize="10" fill="var(--color-text-tertiary)" textAnchor="end">
        $0
      </text>
      <text x={pad} y={pad + 4} fontSize="10" fill="var(--color-text-tertiary)" textAnchor="end">
        ${(max / 1000).toFixed(0)}k
      </text>
      <path d={fillPath} fill="var(--color-text-info)" opacity="0.08" />
      <path d={linePath} fill="none" stroke="var(--color-text-info)" strokeWidth="2" />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3.5" fill="var(--color-text-info)" />
          <text
            x={x}
            y={y - 10}
            fontSize="10"
            fill="var(--color-text-secondary)"
            textAnchor="middle"
            fontWeight="500"
          >
            {data[i].label}
          </text>
          <text
            x={x}
            y={H - pad + 16}
            fontSize="10"
            fill="var(--color-text-tertiary)"
            textAnchor="middle"
          >
            {data[i].month}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Leaderboard({ vessels, onSelect }) {
  return (
    <div>
      {vessels.map((v, i) => (
        <div
          key={v.imo}
          onClick={() => onSelect(v.imo)}
          style={{
            display: 'grid',
            gridTemplateColumns: '18px minmax(0, 1.2fr) 90px 16px',
            gap: 10,
            padding: '10px 0',
            borderBottom:
              i < vessels.length - 1 ? '0.5px solid var(--color-border-tertiary)' : 'none',
            alignItems: 'center',
            cursor: 'pointer',
          }}
        >
          <span
            className="tabular"
            style={{ fontSize: 12, color: 'var(--color-text-tertiary)', fontWeight: 500 }}
          >
            {i + 1}
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, margin: '0 0 2px', lineHeight: 1.3 }}>
              {v.name}
            </p>
            <p
              className="tabular"
              style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.3 }}
            >
              IMO {v.imo} · {v.voyages} voyages
            </p>
          </div>
          <DeltaText value={v.costSaved} delta={v.costSavedPct} tone="gain" colorValue />
          <Chevron />
        </div>
      ))}
    </div>
  );
}

function OutcomeBar({ label, count, total, tone }) {
  const pct = (count / total) * 100;
  const colors = {
    gain: 'var(--color-text-success)',
    loss: 'var(--color-text-danger)',
    neutral: 'var(--color-text-secondary)',
  };
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>
        <span className="tabular" style={{ fontSize: 13, fontWeight: 500, color: colors[tone] }}>
          {count}
        </span>
      </div>
      <div
        style={{
          height: 6,
          background: 'var(--color-background-secondary)',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <div style={{ width: `${pct}%`, height: '100%', background: colors[tone] }} />
      </div>
      <p
        className="tabular"
        style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '4px 0 0' }}
      >
        {pct.toFixed(1)}% of voyages
      </p>
    </div>
  );
}

function RecentVoyageRow({ voyage }) {
  const navigate = useNavigate();
  return (
    <DataRow
      onClick={() => {
        // The mock fixture uses ids like v_001 — route to a real voyage detail
        // by mapping to the demo voyage we have. Production would use real ids.
        if (voyage.vessel === 'Maersk Hamilton') {
          navigate(`/history/9434728/mh_v_001`);
        }
      }}
      style={{ padding: '12px 16px' }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.1fr) 110px 110px 16px',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <p style={{ fontSize: 13, fontWeight: 500, margin: 0, lineHeight: 1.3 }}>{voyage.route}</p>
        <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0, lineHeight: 1.3 }}>
          <b style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>{voyage.vessel}</b> ·{' '}
          {voyage.vesselType}
        </p>
        <DeltaText value={voyage.date} delta={voyage.daysAgo} tone="neutral" />
        <DeltaText value={voyage.costSaved} delta={voyage.profile} tone={voyage.tone} colorValue />
        <Chevron />
      </div>
    </DataRow>
  );
}
