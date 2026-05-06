/**
 * IHistoricalRepository — backtest data and historical analytics.
 *
 * Three levels of granularity:
 *   1. Fleet-wide aggregate (Dashboard, Historical landing)
 *   2. Per-vessel summary (Historical vessel summary)
 *   3. Per-voyage detail (Voyage detail)
 */
export class IHistoricalRepository {
  /**
   * Fleet-wide summary, used by Dashboard and the Historical landing page.
   * @param {{ rangeDays?: number }} [options]
   * @returns {Promise<FleetSummary>}
   */
  async getFleetSummary(options = {}) {
    throw new Error('Not implemented');
  }

  /**
   * Per-vessel backtest summary + voyage list.
   * @param {string} imo
   * @returns {Promise<{ summary: BacktestSummary, voyages: BacktestVoyage[] }>}
   */
  async getVesselBacktest(imo) {
    throw new Error('Not implemented');
  }

  /**
   * Single voyage detail with calibration, profiles, conclusion.
   * @param {string} voyageId
   * @returns {Promise<BacktestVoyage>}
   */
  async getVoyageDetail(voyageId) {
    throw new Error('Not implemented');
  }
}
