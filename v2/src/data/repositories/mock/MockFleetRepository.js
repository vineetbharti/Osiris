import { IFleetRepository } from '../interfaces/IFleetRepository';
import { FIXTURE_VESSELS } from '../../fixtures/vessels';

const STORAGE_KEY = 'osiris.fleet';

/**
 * MockFleetRepository — in-memory + localStorage fleet management.
 * Uses fixtures as the seed dataset.
 *
 * Read APIs simulate real network latency with a small delay so loading
 * states get exercised in development.
 */
export class MockFleetRepository extends IFleetRepository {
  constructor() {
    super();
    this._delayMs = 200;
  }

  async _delay() {
    return new Promise((r) => setTimeout(r, this._delayMs));
  }

  _read() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      // ignore
    }
    return FIXTURE_VESSELS;
  }

  _write(vessels) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vessels));
    } catch (e) {
      // ignore
    }
  }

  async listVessels() {
    await this._delay();
    return this._read();
  }

  async getByImo(imo) {
    await this._delay();
    const fleet = this._read();
    return fleet.find((v) => v.imo === imo) || null;
  }

  async searchByImo(imo) {
    await this._delay();
    // First check the fixture set; in the API impl, this would call vessel-backend
    const found = FIXTURE_VESSELS.find((v) => v.imo === imo);
    if (found) return { ...found };

    // Synthesize a result for any 6-7 digit IMO so the demo doesn't dead-end
    if (/^\d{6,7}$/.test(imo)) {
      return {
        imo,
        name: `Vessel ${imo}`,
        type: 'Cargo',
        flag: 'XX',
        coverage: 'limited',
      };
    }
    return null;
  }

  async addVessel(vessel) {
    await this._delay();
    const fleet = this._read();
    if (fleet.find((v) => v.imo === vessel.imo)) {
      throw new Error('Vessel already in fleet');
    }
    const updated = [...fleet, vessel];
    this._write(updated);
    return vessel;
  }

  async removeVessel(imo) {
    await this._delay();
    const fleet = this._read();
    this._write(fleet.filter((v) => v.imo !== imo));
  }
}
