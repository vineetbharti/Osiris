import React, { useMemo, useState } from 'react';

import { PageShell, PageHeader } from '../../design-system/layout';
import { Pill, Input, Button } from '../../design-system/primitives';
import { ColumnHeader } from '../../design-system/patterns';

import FleetRow from './FleetRow';
import AddVesselModal from './AddVesselModal';
import { useFleet } from './useFleet';

/**
 * FleetPage — Tab 2.
 * Operational view of the user's curated vessel fleet.
 */
export default function FleetPage() {
  const { vessels, isLoading, searchByImo, addVessel } = useFleet();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = useMemo(() => {
    let list = vessels;
    if (statusFilter !== 'all') {
      list = list.filter((v) => v.status?.state === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.imo.toLowerCase().includes(q) ||
          v.name.toLowerCase().includes(q)
      );
    }
    return list;
  }, [vessels, search, statusFilter]);

  const counts = useMemo(() => {
    const c = { 'in-transit': 0, 'at-port': 0, anchored: 0 };
    vessels.forEach((v) => {
      if (c[v.status?.state] !== undefined) c[v.status.state] += 1;
    });
    return c;
  }, [vessels]);

  const subtitle = `${vessels.length} vessels · ${counts['in-transit']} in transit · ${counts['at-port']} at port · ${counts.anchored} anchored`;

  return (
    <PageShell>
      <div style={{ padding: '24px 20px 28px' }}>
        <PageHeader title="Fleet" subtitle={subtitle} />

        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <Input
            type="text"
            placeholder="Search by IMO number or vessel name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <Button onClick={() => setShowAddModal(true)}>Add vessel</Button>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 14,
          }}
        >
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'all', label: 'All' },
              { id: 'in-transit', label: 'In transit' },
              { id: 'at-port', label: 'At port' },
              { id: 'anchored', label: 'Anchored' },
            ].map((f) => (
              <span
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                style={{ cursor: 'pointer' }}
              >
                <Pill selected={statusFilter === f.id}>{f.label}</Pill>
              </span>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
            Sort: ETA ▾
          </span>
        </div>

        <ColumnHeader
          gridTemplate="minmax(0, 1.4fr) minmax(0, 1.25fr) 150px 16px"
          columns={[
            { label: 'Vessel' },
            { label: 'Status' },
            { label: 'ETA / Coverage', align: 'right' },
            { label: '' },
          ]}
        />

        {isLoading ? (
          <p style={{ color: 'var(--color-text-secondary)', padding: 20 }}>Loading fleet…</p>
        ) : filtered.length === 0 ? (
          <EmptyState onAddClick={() => setShowAddModal(true)} />
        ) : (
          filtered.map((v) => <FleetRow key={v.imo} vessel={v} />)
        )}
      </div>

      {showAddModal && (
        <AddVesselModal
          onClose={() => setShowAddModal(false)}
          searchByImo={searchByImo}
          addVessel={addVessel}
          existingImos={vessels.map((v) => v.imo)}
        />
      )}
    </PageShell>
  );
}

function EmptyState({ onAddClick }) {
  return (
    <div
      style={{
        padding: '40px 20px',
        textAlign: 'center',
        border: '0.5px dashed var(--color-border-tertiary)',
        borderRadius: 'var(--border-radius-lg)',
        color: 'var(--color-text-secondary)',
      }}
    >
      <p style={{ fontSize: 14, margin: '0 0 12px' }}>No vessels match your search.</p>
      <Button onClick={onAddClick} variant="primary">
        Add your first vessel
      </Button>
    </div>
  );
}
