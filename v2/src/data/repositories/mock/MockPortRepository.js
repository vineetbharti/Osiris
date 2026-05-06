import { IPortRepository } from '../interfaces/IPortRepository';
import { FIXTURE_PORTS, generateCongestionTimeline } from '../../fixtures/ports';

export class MockPortRepository extends IPortRepository {
  async listPorts() {
    await new Promise((r) => setTimeout(r, 150));
    return FIXTURE_PORTS;
  }

  async getByCode(code) {
    await new Promise((r) => setTimeout(r, 100));
    return FIXTURE_PORTS.find((p) => p.code === code) || null;
  }

  async getCongestionTimeline(code, options = {}) {
    await new Promise((r) => setTimeout(r, 200));
    return generateCongestionTimeline(code);
  }

  async getFeaturesAt(code, bucketStart, shipType) {
    await new Promise((r) => setTimeout(r, 100));
    // Synthesize features that drive a "Heavy" rating, matching the
    // Bremerhaven sample bucket from the locked mockup.
    return {
      shipsInPort: 23,
      typicalShipsInPort: 14,
      avgWait24h: '8h 40m',
      typicalAvgWait24h: '4h 10m',
      arrivals6h: 5,
      arrivals6hBreakdown: '2 cargo, 3 tanker',
      departures6h: 2,
      netFlow: '+3 ships',
      berthOccupancy: 78,
      typicalBerthOccupancy: 55,
      regionalSpillover: 'high',
      regionalSpilloverDetail: 'Hamburg also Heavy (+45 nmi)',
      features: [
        { name: 'Ships in port: 23', sub: 'typical for this hour: 14', trend: '+64%', tone: 'up' },
        { name: 'Berth occupancy: 78%', sub: 'typical: 55%', trend: '+23pp', tone: 'up' },
        { name: 'Avg wait, last 24h: 8h 40m', sub: 'typical: 4h 10m', trend: '+108%', tone: 'up' },
        { name: 'Net flow, last 6h: +3 ships', sub: '5 arrivals, 2 departures', trend: 'filling', tone: 'up' },
        { name: 'Regional spillover: high', sub: 'Hamburg also Heavy (+45 nmi)', trend: 'amplifies', tone: 'up' },
      ],
      // Spatial heatmap data — berth zones and anchorage occupancy
      spatial: {
        berths: [
          { name: 'Berth A1', occupied: 8, capacity: 8, fillTone: 'heavy' },
          { name: 'Berth A2', occupied: 7, capacity: 7, fillTone: 'heavy' },
          { name: 'Berth B', occupied: 5, capacity: 8, fillTone: 'moderate' },
          { name: 'Berth C', occupied: 3, capacity: 6, fillTone: 'moderate' },
          { name: 'Berth D', occupied: 0, capacity: 9, fillTone: 'light' },
        ],
        anchorages: [
          { name: 'Anchorage 1', ships: 12, fillTone: 'heavy' },
          { name: 'Anchorage 2', ships: 5, fillTone: 'moderate' },
          { name: 'Anchorage 3', ships: 1, fillTone: 'light' },
        ],
      },
    };
  }
}
