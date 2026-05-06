import React, { useState } from 'react';
import { Pill } from '../../design-system/primitives';
import { DeltaText } from '../../design-system/patterns';
import SpeedScheduleStrip from './SpeedScheduleStrip';

/**
 * ProfileCard — one voyage profile row (Current / Recommended / Other / Actual).
 *
 * Renders the profile row with the standard 7-column grid. Expandable when
 * the profile carries `predictions` and/or `speedSchedule` payload. Visual
 * variants:
 *   - isCurrent: tinted background (baseline)
 *   - isRecommended: 1.5px info border
 *   - isActual: tinted background, "What happened" tag (used on voyage detail)
 */
export default function ProfileCard({
  profile,
  expanded: expandedProp,
  defaultExpanded = false,
  showActions = true,
}) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const expanded = expandedProp !== undefined ? expandedProp : internalExpanded;

  const bg = profile.isCurrent || profile.isActual
    ? 'var(--color-background-secondary)'
    : 'var(--color-background-primary)';
  const border = profile.isRecommended
    ? '1.5px solid var(--color-border-info)'
    : '0.5px solid var(--color-border-tertiary)';

  return (
    <div
      style={{
        background: bg,
        border,
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: 8,
        overflow: 'hidden',
      }}
    >
      <div
        onClick={() => setInternalExpanded(!internalExpanded)}
        style={{
          display: 'grid',
          gridTemplateColumns:
            'minmax(0, 1.55fr) minmax(0, 1.45fr) 88px 88px 88px 90px 16px',
          gap: 12,
          padding: profile.isRecommended ? '13.5px 15.5px' : '14px 16px',
          alignItems: 'center',
          cursor: showActions ? 'pointer' : 'default',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <p style={{ fontSize: 14, fontWeight: 500, margin: 0 }}>{profile.name}</p>
            {profile.isCurrent && <Pill size="sm">Active</Pill>}
            {profile.isRecommended && (
              <Pill size="sm" tone="info" selected>
                Recommended
              </Pill>
            )}
            {profile.isActual && <Pill size="sm">What happened</Pill>}
          </div>
          {profile.category && (
            <p
              style={{
                fontSize: 11,
                color: 'var(--color-text-tertiary)',
                margin: 0,
                lineHeight: 1.3,
              }}
            >
              {profile.category}
            </p>
          )}
        </div>

        <div style={{ minWidth: 0 }}>
          <p
            className="tabular"
            style={{
              fontSize: 14,
              fontWeight: profile.actionTone === 'neutral' ? 400 : 500,
              color:
                profile.actionTone === 'neutral'
                  ? 'var(--color-text-secondary)'
                  : 'var(--color-text-primary)',
              margin: '0 0 3px',
              lineHeight: 1.3,
            }}
          >
            {profile.action}
          </p>
          <p
            className="tabular"
            style={{
              fontSize: 11,
              margin: 0,
              lineHeight: 1.3,
              color:
                profile.actionTone === 'gain'
                  ? 'var(--color-text-success)'
                  : profile.actionTone === 'loss'
                  ? 'var(--color-text-danger)'
                  : 'var(--color-text-secondary)',
            }}
          >
            {profile.actionDelta}
          </p>
        </div>

        <DeltaText
          value={profile.eta}
          delta={profile.etaDelta}
          tone={profile.etaTone || 'neutral'}
          align="left"
        />
        <DeltaText
          value={profile.anchorage}
          delta={profile.anchorageDelta}
          tone={profile.anchorageTone || 'neutral'}
          align="left"
        />
        <DeltaText
          value={profile.berth}
          delta={profile.berthDelta}
          tone={profile.berthTone || 'neutral'}
          align="left"
        />
        <DeltaText
          value={profile.cost}
          delta={profile.costDelta}
          tone={profile.costTone || 'neutral'}
          align="left"
        />

        <span style={{ color: 'var(--color-text-tertiary)', textAlign: 'center' }}>
          {expanded ? '⌃' : '›'}
        </span>
      </div>

      {expanded && (profile.speedSchedule || profile.predictions) && (
        <div style={{ padding: 16, borderTop: '0.5px solid var(--color-border-tertiary)' }}>
          {profile.speedSchedule && (
            <div style={{ marginBottom: 16 }}>
              <SectionTitle>Speed schedule</SectionTitle>
              <div style={{ marginTop: 8 }}>
                <SpeedScheduleStrip segments={profile.speedSchedule} />
              </div>
              <RefreshMeta />
            </div>
          )}

          {profile.predictions && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <SectionTitle>
                  {profile.isActual ? 'Counterfactual outcomes' : 'Predictions at arrival'}
                </SectionTitle>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '8px 16px',
                    marginTop: 8,
                  }}
                >
                  {Object.entries(profile.predictions).map(([k, v]) => (
                    <Metric key={k} label={prettyKey(k)} value={v} />
                  ))}
                </div>
              </div>
              {profile.portContext && (
                <div>
                  <SectionTitle>Port context at arrival</SectionTitle>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 12,
                      marginTop: 8,
                    }}
                  >
                    <PortMetric label="cargo ships expected" value={profile.portContext.ships} />
                    <PortMetric label="avg wait, last 24h" value={profile.portContext.avgWait} />
                    <PortMetric label="queue trend, 36h" value={profile.portContext.queueTrend} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SectionTitle({ children }) {
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

function Metric({ label, value }) {
  return (
    <div>
      <p style={{ fontSize: 11, color: 'var(--color-text-secondary)', margin: '0 0 2px' }}>
        {label}
      </p>
      <p
        className="tabular"
        style={{ fontSize: 13, fontWeight: 500, margin: 0, color: 'var(--color-text-primary)' }}
      >
        {value}
      </p>
    </div>
  );
}

function PortMetric({ label, value }) {
  return (
    <div>
      <p
        className="tabular"
        style={{ fontSize: 14, fontWeight: 500, margin: 0, lineHeight: 1.2 }}
      >
        {value}
      </p>
      <p
        style={{
          fontSize: 11,
          color: 'var(--color-text-secondary)',
          margin: '4px 0 0',
          lineHeight: 1.3,
        }}
      >
        {label}
      </p>
    </div>
  );
}

function RefreshMeta() {
  return (
    <div
      style={{
        display: 'flex',
        gap: 18,
        marginTop: 10,
        fontSize: 11,
        color: 'var(--color-text-secondary)',
      }}
      className="tabular"
    >
      <span>
        Generated <b style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>13:48 today</b>
      </span>
      <span>
        Next refresh <b style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>16:30 today</b>
      </span>
      <span>
        Refresh cadence <b style={{ color: 'var(--color-text-primary)', fontWeight: 500 }}>2h 42m</b>
      </span>
    </div>
  );
}

function prettyKey(k) {
  const map = { eta: 'ETA', fuel: 'Fuel' };
  return map[k] || k.charAt(0).toUpperCase() + k.slice(1);
}
