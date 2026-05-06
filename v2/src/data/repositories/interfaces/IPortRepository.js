/**
 * IPortRepository — contract for port data access.
 *
 * Static port info (name, code, profile, scale, berths) +
 * dynamic congestion data (per 6h bucket, observed and predicted) +
 * feature attribution.
 */
export class IPortRepository {
  /**
   * List all modeled ports.
   * @returns {Promise<Port[]>}
   */
  async listPorts() {
    throw new Error('Not implemented');
  }

  /**
   * Look up a port by UN/LOCODE.
   * @param {string} code
   * @returns {Promise<Port | null>}
   */
  async getByCode(code) {
    throw new Error('Not implemented');
  }

  /**
   * Get the congestion timeline for a port.
   * Returns past-N + future-M buckets at 6h granularity.
   * Past buckets have both observed and predicted; future have predicted only.
   * @param {string} code
   * @param {{ pastDays?: number, futureDays?: number, shipType?: string }} options
   * @returns {Promise<CongestionBucket[]>}
   */
  async getCongestionTimeline(code, options = {}) {
    throw new Error('Not implemented');
  }

  /**
   * Get features and feature attribution for a single bucket.
   * @param {string} code
   * @param {string} bucketStart   ISO datetime
   * @param {string} [shipType]    Filter
   * @returns {Promise<PortFeatures>}
   */
  async getFeaturesAt(code, bucketStart, shipType) {
    throw new Error('Not implemented');
  }
}
