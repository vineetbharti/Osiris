/**
 * IFleetRepository — contract for fleet data access.
 *
 * The fleet is the user's curated set of vessels (added by IMO).
 * Today: in-memory + localStorage.
 * Tomorrow: Postgres-backed via the API.
 */
export class IFleetRepository {
  /**
   * Return all vessels in the current user's fleet.
   * @returns {Promise<Vessel[]>}
   */
  async listVessels() {
    throw new Error('Not implemented');
  }

  /**
   * Look up a vessel by IMO. Used to render Vessel Intelligence.
   * @param {string} imo
   * @returns {Promise<Vessel | null>}
   */
  async getByImo(imo) {
    throw new Error('Not implemented');
  }

  /**
   * Search the master vessel database by IMO. This calls the
   * VesselFinder scrape backend. Used by the "Add vessel" flow on Fleet.
   * @param {string} imo
   * @returns {Promise<Vessel | null>}
   */
  async searchByImo(imo) {
    throw new Error('Not implemented');
  }

  /**
   * Add a vessel to the current fleet.
   * @param {Vessel} vessel
   * @returns {Promise<Vessel>}
   */
  async addVessel(vessel) {
    throw new Error('Not implemented');
  }

  /**
   * Remove a vessel from the current fleet.
   * @param {string} imo
   * @returns {Promise<void>}
   */
  async removeVessel(imo) {
    throw new Error('Not implemented');
  }
}
