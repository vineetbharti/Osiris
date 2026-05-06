import { IVesselIntelligenceRepository } from '../interfaces/IVesselIntelligenceRepository';
import { FIXTURE_VESSELS } from '../../fixtures/vessels';
import { FIXTURE_VOYAGE_PROFILES_BY_IMO } from '../../fixtures/voyageProfiles';

export class MockVesselIntelligenceRepository extends IVesselIntelligenceRepository {
  async getCurrentState(imo) {
    await new Promise((r) => setTimeout(r, 200));
    const vessel = FIXTURE_VESSELS.find((v) => v.imo === imo);
    if (!vessel) return null;

    const profiles = FIXTURE_VOYAGE_PROFILES_BY_IMO[imo] || [];
    return {
      vessel,
      currentVoyage: vessel.status,
      profiles,
    };
  }

  async getTrack(imo) {
    await new Promise((r) => setTimeout(r, 100));
    // Synthetic AIS track for demo. Replace with real data via TimescaleDB query.
    return {
      observed: [
        [56.16, 10.21], // Aarhus
        [55.5, 10.5],
        [54.8, 10.0],
        [54.0, 9.5],
        [53.7, 8.9], // current position
      ],
      predicted: [
        [53.7, 8.9],
        [53.6, 8.7],
        [53.55, 8.58], // Bremerhaven
      ],
    };
  }
}
