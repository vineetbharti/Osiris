import { IFleetRepository } from '../interfaces/IFleetRepository';

/**
 * ApiFleetRepository — talks to the Node API.
 *
 * Reuses the existing `vessel-backend/` for IMO search (calls
 * `GET /api/vessel/:imo` against your VesselFinder scrape service).
 *
 * Listing/adding/removing vessels would require API endpoints that
 * don't exist yet — those are TODOs below.
 */
export class ApiFleetRepository extends IFleetRepository {
  constructor(apiClient) {
    super();
    this.api = apiClient;
  }

  async listVessels() {
    // TODO: GET /api/fleet  (auth-scoped to current user)
    throw new Error('listVessels not yet implemented in API');
  }

  async getByImo(imo) {
    // TODO: GET /api/fleet/:imo
    throw new Error('getByImo not yet implemented in API');
  }

  async searchByImo(imo) {
    // Reuses existing vessel-backend
    if (!/^\d{6,7}$/.test(imo)) return null;
    try {
      const res = await this.api.get(`/api/vessel/${imo}`);
      return this._normalize(res.data);
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  }

  async addVessel(vessel) {
    // TODO: POST /api/fleet { imo }
    throw new Error('addVessel not yet implemented in API');
  }

  async removeVessel(imo) {
    // TODO: DELETE /api/fleet/:imo
    throw new Error('removeVessel not yet implemented in API');
  }

  _normalize(raw) {
    // Convert vessel-backend response shape into our domain Vessel
    return {
      imo: raw.imo,
      name: raw.name,
      type: raw.type || 'Cargo',
      flag: raw.flag,
      yearBuilt: raw.yearBuilt,
      length: raw.length,
      beam: raw.beam,
      draft: raw.draft,
      grossTonnage: raw.grossTonnage,
      deadweight: raw.dwt,
      imageUrl: raw.image,
      coverage: 'available',
    };
  }
}
