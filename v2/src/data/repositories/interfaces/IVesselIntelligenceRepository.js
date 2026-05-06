/**
 * IVesselIntelligenceRepository — operational, forward-looking data for
 * a single vessel: current voyage state and recommended profiles.
 *
 * Distinct from IFleetRepository (which manages the curated set).
 */
export class IVesselIntelligenceRepository {
  /**
   * Get current voyage info for a vessel. If the vessel is at a port or
   * anchored, the response describes the wait. If in transit, the response
   * describes the leg and ETA.
   * @param {string} imo
   * @returns {Promise<{ vessel: Vessel, currentVoyage: Object, profiles: VoyageProfile[] }>}
   */
  async getCurrentState(imo) {
    throw new Error('Not implemented');
  }

  /**
   * Get the AIS track + predicted forward track for a vessel.
   * Used to render the voyage map.
   * @param {string} imo
   * @returns {Promise<{ observed: Array<[number, number]>, predicted: Array<[number, number]> }>}
   */
  async getTrack(imo) {
    throw new Error('Not implemented');
  }
}
