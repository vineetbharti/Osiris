import React, { useState } from 'react';
import { Card, Input, Button } from '../../design-system/primitives';
import { CoverageBadge, VesselImage } from '../../design-system/patterns';

/**
 * AddVesselModal — IMO search + confirm-and-add flow.
 * Reuses the search/add capability from the existing app, refactored to
 * the new design language. Calls the repository through props (passed
 * down from FleetPage).
 */
export default function AddVesselModal({ onClose, searchByImo, addVessel, existingImos }) {
  const [imo, setImo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const onSearch = async (e) => {
    e.preventDefault();
    setError(null);
    setSearchResult(null);
    if (!/^\d{6,7}$/.test(imo.trim())) {
      setError('Enter a valid 7-digit IMO number');
      return;
    }
    setIsSearching(true);
    try {
      const result = await searchByImo(imo.trim());
      if (!result) {
        setError('No vessel found with this IMO');
      } else {
        setSearchResult(result);
      }
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setIsSearching(false);
    }
  };

  const onAdd = async () => {
    if (!searchResult) return;
    if (existingImos.includes(searchResult.imo)) {
      setError('This vessel is already in your fleet');
      return;
    }
    setIsAdding(true);
    try {
      await addVessel(searchResult);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add vessel');
      setIsAdding(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: 20,
      }}
      onClick={onClose}
    >
      <div style={{ width: '100%', maxWidth: 480 }} onClick={(e) => e.stopPropagation()}>
        <Card padding={24}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <h2 style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Add vessel to fleet</h2>
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                fontSize: 18,
                color: 'var(--color-text-tertiary)',
                cursor: 'pointer',
                padding: 0,
                lineHeight: 1,
              }}
            >
              ×
            </button>
          </div>
          <p
            style={{
              fontSize: 12,
              color: 'var(--color-text-secondary)',
              margin: '0 0 18px',
            }}
          >
            Look up a vessel by IMO number. Once added, predictions begin
            generating on the next data refresh.
          </p>

          <form onSubmit={onSearch} style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
            <Input
              type="text"
              value={imo}
              onChange={(e) => setImo(e.target.value)}
              placeholder="IMO number (e.g., 9434728)"
              style={{ flex: 1 }}
              autoFocus
            />
            <Button type="submit" variant="primary" disabled={isSearching}>
              {isSearching ? 'Searching…' : 'Search'}
            </Button>
          </form>

          {error && (
            <div
              style={{
                padding: '8px 10px',
                background: 'var(--color-background-danger)',
                color: 'var(--color-text-danger)',
                borderRadius: 'var(--border-radius-md)',
                fontSize: 12,
                marginBottom: 14,
              }}
            >
              {error}
            </div>
          )}

          {searchResult && (
            <div
              style={{
                padding: 14,
                border: '0.5px solid var(--color-border-tertiary)',
                borderRadius: 'var(--border-radius-md)',
                marginBottom: 14,
              }}
            >
              <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                <VesselImage url={searchResult.imageUrl} name={searchResult.name} size={64} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 500, margin: '0 0 4px' }}>
                    {searchResult.name}
                  </p>
                  <p
                    className="tabular"
                    style={{
                      fontSize: 12,
                      color: 'var(--color-text-secondary)',
                      margin: '0 0 6px',
                    }}
                  >
                    IMO {searchResult.imo} · {searchResult.type}
                    {searchResult.flag && ` · Flag ${searchResult.flag}`}
                    {searchResult.yearBuilt && ` · Built ${searchResult.yearBuilt}`}
                  </p>
                  <CoverageBadge status={searchResult.coverage || 'available'} />
                </div>
              </div>
              <Button
                onClick={onAdd}
                variant="primary"
                size="sm"
                disabled={isAdding}
                style={{ marginTop: 4, width: '100%' }}
              >
                {isAdding ? 'Adding…' : 'Add to fleet'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
