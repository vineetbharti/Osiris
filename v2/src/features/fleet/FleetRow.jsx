import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatusDot } from '../../design-system/primitives';
import { CoverageBadge, DataRow, Chevron, VesselImage } from '../../design-system/patterns';
import { statusLabel, statusTone } from '../../utils/format';

/**
 * FleetRow — one vessel in the Fleet list. Renders compact for in-transit,
 * taller for at-port/anchored to fit waiting time + ETD.
 */
export default function FleetRow({ vessel }) {
  const navigate = useNavigate();
  const status = vessel.status || {};
  const inTransit = status.state === 'in-transit';

  const onClick = () => navigate(`/fleet/${vessel.imo}`);

  return (
    <DataRow onClick={onClick}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.25fr) 150px 16px',
          gap: 14,
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <VesselImage url={vessel.imageUrl} name={vessel.name} size={40} />
          <div style={{ minWidth: 0 }}>
            <p
              style={{
                fontSize: 14,
                fontWeight: 500,
                margin: '0 0 3px',
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
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
              IMO {vessel.imo} · {vessel.type}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <StatusDot tone={statusTone(status.state)} />
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 13, margin: '0 0 2px', lineHeight: 1.3 }}>
              {statusLabel(status.state)}
            </p>
            <p
              style={{
                fontSize: 12,
                color: 'var(--color-text-secondary)',
                margin: 0,
                lineHeight: 1.3,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {inTransit
                ? status.destination
                  ? `to ${status.destination}`
                  : ''
                : status.port}
            </p>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          {inTransit ? (
            <p
              className="tabular"
              style={{
                fontSize: 13,
                fontWeight: 500,
                margin: '0 0 5px',
                color: status.eta ? 'var(--color-text-primary)' : 'var(--color-text-tertiary)',
                lineHeight: 1.3,
              }}
            >
              ETA {status.eta || 'pending'}
            </p>
          ) : (
            <>
              <p
                className="tabular"
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  margin: '0 0 3px',
                  lineHeight: 1.3,
                }}
              >
                Waiting {status.waitingTime || '—'}
              </p>
              <p
                className="tabular"
                style={{
                  fontSize: 12,
                  color: status.etd ? 'var(--color-text-secondary)' : 'var(--color-text-tertiary)',
                  margin: '0 0 5px',
                  lineHeight: 1.3,
                }}
              >
                ETD {status.etd || 'pending'}
              </p>
            </>
          )}
          <CoverageBadge status={vessel.coverage} />
        </div>

        <Chevron />
      </div>
    </DataRow>
  );
}
