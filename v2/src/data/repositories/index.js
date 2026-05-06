/**
 * Repository factory — THE seam between UI and data layer.
 *
 * Per-domain env flags control whether to use mock or API implementations.
 * Set REACT_APP_USE_API_<DOMAIN>=true to flip a domain to its API impl.
 *
 * Currently:
 *   REACT_APP_USE_API_VESSEL=true  → ApiFleetRepository (uses vessel-backend)
 *
 * Other domains stay on mock until their API endpoints are built.
 *
 * To swap a repository globally during a refactor, change the line below.
 * Components and hooks don't need to change.
 */

import apiClient from '../client/apiClient';

import { MockFleetRepository } from './mock/MockFleetRepository';
import { MockPortRepository } from './mock/MockPortRepository';
import { MockVesselIntelligenceRepository } from './mock/MockVesselIntelligenceRepository';
import { MockHistoricalRepository } from './mock/MockHistoricalRepository';
import { MockAuthRepository } from './mock/MockAuthRepository';

import { ApiFleetRepository } from './api/ApiFleetRepository';

const useApiVessel = process.env.REACT_APP_USE_API_VESSEL === 'true';
const useApiPort = process.env.REACT_APP_USE_API_PORT === 'true';
const useApiHistorical = process.env.REACT_APP_USE_API_HISTORICAL === 'true';
const useApiAuth = process.env.REACT_APP_USE_API_AUTH === 'true';

// ---------- Fleet ----------
export const fleetRepo = useApiVessel
  ? new ApiFleetRepository(apiClient)
  : new MockFleetRepository();

// ---------- Port ----------
export const portRepo = useApiPort
  ? // TODO: new ApiPortRepository(apiClient)
    new MockPortRepository()
  : new MockPortRepository();

// ---------- Vessel Intelligence ----------
export const vesselIntelRepo = useApiVessel
  ? // TODO: new ApiVesselIntelligenceRepository(apiClient)
    new MockVesselIntelligenceRepository()
  : new MockVesselIntelligenceRepository();

// ---------- Historical Analytics ----------
export const historicalRepo = useApiHistorical
  ? // TODO: new ApiHistoricalRepository(apiClient)
    new MockHistoricalRepository()
  : new MockHistoricalRepository();

// ---------- Auth ----------
export const authRepo = useApiAuth
  ? // TODO: new ApiAuthRepository(apiClient)
    new MockAuthRepository()
  : new MockAuthRepository();
