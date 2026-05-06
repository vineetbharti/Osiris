import { IHistoricalRepository } from '../interfaces/IHistoricalRepository';
import {
  FIXTURE_FLEET_SUMMARY,
  FIXTURE_VESSEL_BACKTESTS,
  FIXTURE_VOYAGE_DETAILS,
} from '../../fixtures/backtests';

export class MockHistoricalRepository extends IHistoricalRepository {
  async getFleetSummary(options = {}) {
    await new Promise((r) => setTimeout(r, 200));
    return FIXTURE_FLEET_SUMMARY;
  }

  async getVesselBacktest(imo) {
    await new Promise((r) => setTimeout(r, 200));
    return FIXTURE_VESSEL_BACKTESTS[imo] || null;
  }

  async getVoyageDetail(voyageId) {
    await new Promise((r) => setTimeout(r, 200));
    return FIXTURE_VOYAGE_DETAILS[voyageId] || null;
  }
}
