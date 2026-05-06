import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { PageShell, PageHeader } from '../../design-system/layout';
import { Input } from '../../design-system/primitives';
import { ColumnHeader, DataRow, Chevron, CongestionBadge } from '../../design-system/patterns';
import { portRepo } from '../../data/repositories';

/**
 * PortSelectorPage — Tab 4 (level 1).
 * Searchable list of all modeled ports with current congestion at a glance.
 */
export default function PortSelectorPage() {
  const navigate = useNavigate();
  const [ports, setPorts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    portRepo.listPorts().then((p) => {
      setPorts(p);
      setIsLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return ports;
    const q = search.trim().toLowerCase();
    return ports.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.country.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q)
    );
  }, [ports, search]);

  return (
    <PageShell>
      <div style={{ padding: '24px 20px 28px' }}>
        <PageHeader
          title="Port Intelligence"
          subtitle="88 ports modeled · Baltic, North Sea and German Bight regions · updated every 6h"
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Input
            type="text"
            placeholder="Search by port name or country"
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
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Sort: Name ▾</span>
        </div>

        <ColumnHeader
          gridTemplate="minmax(0, 1.4fr) minmax(0, 1.1fr) 90px 130px 16px"
          columns={[
            { label: 'Port' },
            { label: 'Profile' },
            { label: 'Scale', align: 'right' },
            { label: 'Congestion now', align: 'right' },
            { label: '' },
          ]}
        />

        {isLoading ? (
          <p style={{ color: 'var(--color-text-secondary)', padding: 20 }}>Loading ports…</p>
        ) : (
          filtered.map((p) => (
            <DataRow key={p.code} onClick={() => navigate(`/ports/${p.code}`)}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1.1fr) 90px 130px 16px',
                  gap: 14,
                  alignItems: 'center',
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 3px', lineHeight: 1.3 }}>
                    {p.name}
                  </p>
                  <p
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                      lineHeight: 1.3,
                    }}
                  >
                    {p.country} · UN/LOCODE {p.code}
                  </p>
                </div>
                <p style={{ fontSize: 13, margin: 0, lineHeight: 1.3 }}>{p.profile}</p>
                <p
                  className="tabular"
                  style={{
                    textAlign: 'right',
                    fontSize: 13,
                    color: 'var(--color-text-secondary)',
                    margin: 0,
                  }}
                >
                  {p.scale}
                </p>
                <div style={{ textAlign: 'right' }}>
                  <CongestionBadge level={p.currentCongestion} />
                </div>
                <Chevron />
              </div>
            </DataRow>
          ))
        )}
      </div>
    </PageShell>
  );
}
