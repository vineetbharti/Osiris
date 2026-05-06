import { IVesselIntelligenceRepository } from '../interfaces/IVesselIntelligenceRepository';
import { FIXTURE_VESSELS } from '../../fixtures/vessels';
import { FIXTURE_VOYAGE_PROFILES_BY_IMO } from '../../fixtures/voyageProfiles';
import { fleetRepo } from '../index';

/**
 * MockVesselIntelligenceRepository — operational state + voyage profiles.
 *
 * Resolution order for the vessel itself:
 *   1. Demo fixtures (FIXTURE_VESSELS) — full operational data
 *   2. The current fleet repo (covers vessels added via API search)
 *
 * Vessels found via fallback path #2 won't have profiles or operational state
 * yet — the recommendation engine hasn't run for them. We return what we
 * have and an empty profile list. Components handle the empty state.
 */
export class MockVesselIntelligenceRepository extends IVesselIntelligenceRepository {
  async getCurrentState(imo) {
    await new Promise((r) => setTimeout(r, 200));

    // Demo fixture path
    let vessel = FIXTURE_VESSELS.find((v) => v.imo === imo);

    // Fallback to the user's fleet (catches API-added vessels)
    if (!vessel) {
      vessel = await fleetRepo.getByImo(imo);
    }

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
    // Synthetic AIS track for demo vessels only. Real implementation queries
    // TimescaleDB by IMO + time range. Returns null for vessels we have no
    // track data for.
    const hasTrack = FIXTURE_VOYAGE_PROFILES_BY_IMO[imo];
    if (!hasTrack) return null;
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
