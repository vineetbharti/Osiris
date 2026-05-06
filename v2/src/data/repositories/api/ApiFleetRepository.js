import { IFleetRepository } from '../interfaces/IFleetRepository';

/**
 * ApiFleetRepository — API-backed fleet repository.
 *
 * Uses the existing `vessel-backend` (vessel-api.js) for IMO search via
 * `GET /api/vessel/:imo`, and persists the user's curated fleet in
 * localStorage for now. When backend fleet endpoints exist, the persistence
 * methods (listVessels, addVessel, removeVessel) can be swapped to API calls
 * without changing this file's contract.
 *
 * The response shape from vessel-api.js:
 *   {
 *     imo, name, mmsi, type, flag,
 *     length, beam, grossTonnage,    // strings, may be "N/A"
 *     image,                         // URL or null
 *     allData: { ... }               // full table dump
 *   }
 *
 * We pull additional fields (yearBuilt, draft, dwt) from `allData` since
 * they aren't in the top-level response.
 */

const STORAGE_KEY = 'osiris.fleet.api';

export class ApiFleetRepository extends IFleetRepository {
  constructor(apiClient) {
    super();
    this.api = apiClient;
  }

  // ---------------------------------------------------------------------------
  // Local persistence (today). Swap to API calls when backend endpoints exist.
  // ---------------------------------------------------------------------------

  _readLocal() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  _writeLocal(vessels) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(vessels));
    } catch (e) {
      // ignore
    }
  }

  async listVessels() {
    return this._readLocal();
  }

  async getByImo(imo) {
    return this._readLocal().find((v) => v.imo === imo) || null;
  }

  async addVessel(vessel) {
    const fleet = this._readLocal();
    if (fleet.find((v) => v.imo === vessel.imo)) {
      throw new Error('Vessel already in fleet');
    }
    const updated = [...fleet, vessel];
    this._writeLocal(updated);
    return vessel;
  }

  async removeVessel(imo) {
    const fleet = this._readLocal();
    this._writeLocal(fleet.filter((v) => v.imo !== imo));
  }

  // ---------------------------------------------------------------------------
  // Real API call — search by IMO via vessel-backend scrape.
  // ---------------------------------------------------------------------------

  async searchByImo(imo) {
    const trimmed = String(imo || '').trim();
    if (!/^\d{6,7}$/.test(trimmed)) return null;
    try {
      const res = await this.api.get(`/api/vessel/${trimmed}`);
      return this._normalize(res.data);
    } catch (err) {
      if (err.response?.status === 404) return null;
      throw err;
    }
  }

  // ---------------------------------------------------------------------------
  // Normalization: convert vessel-api.js response shape into our domain Vessel.
  // ---------------------------------------------------------------------------

  _normalize(raw) {
    if (!raw) return null;
    const all = raw.allData || {};

    return {
      imo: raw.imo,
      name: raw.name,
      type: raw.type,
      flag: raw.flag,

      // Pulled from allData when available
      yearBuilt: pickInt(all['Year of Build']),
      length: pickFloat(raw.length || all['Length Overall (m)']),
      beam: pickFloat(raw.beam || all['Beam (m)']),
      draft: pickFloat(all['Draught (m)']),
      grossTonnage: pickInt(raw.grossTonnage || all['Gross Tonnage']),
      deadweight: pickInt(all['Deadweight (t)']),

      mmsi: raw.mmsi && raw.mmsi !== 'N/A' ? raw.mmsi : null,

      // Image URL — may be null. Components handle the fallback.
      imageUrl: raw.image || null,

      // Newly added vessels start without operational status; coverage starts limited.
      coverage: 'limited',

      // Preserve the full scrape payload for any future use (e.g., a raw-data
      // panel on Vessel Intelligence). Components can ignore this safely.
      _raw: all,
    };
  }
}

// ---------------------------------------------------------------------------
// Internal helpers — unit-stripping and N/A handling.
// ---------------------------------------------------------------------------

function pickFloat(v) {
  if (v == null || v === '' || v === 'N/A' || v === '-') return null;
  // strip non-numeric trailing characters (units like "m", "kn")
  const num = parseFloat(String(v).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(num) ? num : null;
}

function pickInt(v) {
  if (v == null || v === '' || v === 'N/A' || v === '-') return null;
  // strip commas in numbers like "232,618"
  const num = parseInt(String(v).replace(/[^0-9-]/g, ''), 10);
  return Number.isFinite(num) ? num : null;
}
