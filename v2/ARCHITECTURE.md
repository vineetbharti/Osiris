# Osiris — Architecture

This document describes the architecture of the Osiris frontend application and how it composes with the broader system.

## System architecture (3-tier)

```
┌─────────────────────────────────────────────────────────────┐
│  Tier 1 — Presentation                                      │
│  React SPA (this codebase)                                  │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP / JSON
┌────────────────────────▼────────────────────────────────────┐
│  Tier 2 — API / Business Logic                              │
│  Node Express services:                                     │
│    • vessel-backend  — VesselFinder scrape (existing)       │
│    • port-service    — port intelligence (to build)         │
│    • backtest-service — historical analytics (to build)     │
│    • recommendation-service — voyage profiles (to build)    │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│  Tier 3 — Data                                              │
│  TimescaleDB (AIS, port congestion, historical voyages)     │
│  Redis (cache, voyage list, trajectory)                     │
│  Python ML services (TrAISformer, LightGBM, exposed via MCP)│
└─────────────────────────────────────────────────────────────┘
```

The frontend is intentionally agnostic about the data layer beneath the API. Anything that talks to ML models, databases, or external APIs is hidden behind tier 2.

## Frontend architecture (layered)

```
┌─────────────────────────────────────────────────────────────┐
│  Components (presentational)                                │
│  Pure functions of props. No state, no side-effects, no    │
│  knowledge of where data comes from.                        │
└────────────────────────┬────────────────────────────────────┘
                         │ props
┌────────────────────────▼────────────────────────────────────┐
│  Hooks / Containers                                         │
│  Compose components, manage local state, dispatch actions. │
│  Talk to repositories via custom hooks (useFleet, etc.)    │
└────────────────────────┬────────────────────────────────────┘
                         │ method calls
┌────────────────────────▼────────────────────────────────────┐
│  Repositories (interfaces + implementations)                │
│  IFleetRepository, IPortRepository, ...                     │
│  Mock implementations today, API-backed tomorrow.           │
│  This is the seam where the data layer is hot-swapped.      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼────────────────────────────────────┐
│  API client + endpoint definitions                          │
│  Single axios instance, error handling, auth headers.       │
└─────────────────────────────────────────────────────────────┘
```

### Why repositories with interfaces

The contract that repositories define is the only thing components and hooks know about the data layer. Today:

```js
// data/repositories/index.js
export const fleetRepo = USE_MOCK
  ? new MockFleetRepository()
  : new ApiFleetRepository(apiClient);
```

To swap mock for real, change one line. To add an offline mode, add a third implementation. To test, inject a fake. Components don't change.

### Why feature-based folders

Code that changes together stays together. When you redesign Fleet, you touch `features/fleet/*`. You don't have to chase down `components/FleetRow.jsx`, `services/fleetService.js`, `hooks/useFleet.js`, `pages/FleetPage.jsx`. Everything that's specifically about Fleet lives in one place.

Cross-cutting code lives in shared folders (`design-system/`, `data/`, `hooks/` for hooks shared across features).

## Folder structure

```
src/
├── design-system/         # All visual primitives, layout, reused patterns
│   ├── tokens.css         # Design tokens (colors, spacing, type scale)
│   ├── globals.css        # Global resets, body styles
│   ├── primitives/        # Atomic components (Card, Pill, Badge, KpiCard, ...)
│   ├── layout/            # Page chrome (TopNav, PageShell, Breadcrumb)
│   └── patterns/          # Reused across screens (CoverageBadge, ProfileRow, ...)
│
├── features/              # One folder per top-level feature
│   ├── auth/              # Login + register (carries over from existing code)
│   ├── dashboard/         # Executive dashboard
│   ├── fleet/             # Fleet operational view
│   ├── vessel-intelligence/
│   ├── port-intelligence/ # Selector + detail
│   └── historical-analytics/  # Landing + vessel summary + voyage detail
│
├── data/                  # Data layer (THE seam between UI and backend)
│   ├── repositories/
│   │   ├── interfaces/    # Contract definitions (one per domain)
│   │   ├── mock/          # Mock implementations using fixtures
│   │   ├── api/           # API-backed implementations (skeletons today)
│   │   └── index.js       # Factory: pick mock or api based on env
│   ├── fixtures/          # Mock data (vessels, ports, backtests, ...)
│   └── client/            # API client (axios), endpoint definitions
│
├── context/               # React contexts (AuthContext)
├── hooks/                 # Cross-feature hooks (useDebounce, useDateFormat)
├── utils/                 # Pure helpers (formatters, color computations)
│
├── App.jsx                # Top-level shell, providers, routes
└── main.jsx               # Entry point
```

## Data flow example: "Show me Fleet"

1. User navigates to `/fleet`.
2. Router renders `features/fleet/FleetPage.jsx`.
3. `FleetPage` calls `useFleet()` hook.
4. `useFleet()` reads from `fleetRepo` (a singleton from `data/repositories/index.js`).
5. Today: `fleetRepo` is a `MockFleetRepository` that returns fixtures.
6. Tomorrow: change one line to `new ApiFleetRepository(apiClient)`.
7. `FleetPage` passes vessels into `<FleetRow />` components.

`FleetRow` is a primitive — it knows how to render a vessel given props. It doesn't know what a fleet is, where the data came from, or whether the user is authenticated. That's the layered separation working.

## Repository contracts

Each repository defines a clear contract via JSDoc. Example:

```js
// data/repositories/interfaces/IFleetRepository.js
export class IFleetRepository {
  /** @returns {Promise<Vessel[]>} */
  async listVessels() { throw new Error('Not implemented'); }

  /** @param {string} imo @returns {Promise<Vessel | null>} */
  async getByImo(imo) { throw new Error('Not implemented'); }

  /** @param {Vessel} vessel @returns {Promise<Vessel>} */
  async addVessel(vessel) { throw new Error('Not implemented'); }

  /** @param {string} vesselId @returns {Promise<void>} */
  async removeVessel(vesselId) { throw new Error('Not implemented'); }
}
```

Mock and API implementations both extend this base. Type checking via JSDoc gives you good IDE hints without forcing TypeScript today.

## Auth handling

`AuthContext` provides the current user across the app. The auth repository today is in-memory (matching your existing app); tomorrow it becomes API-backed.

On real backend integration, swap `MockAuthRepository` for `ApiAuthRepository` and the auth context picks up tokens from localStorage, attaches them to API client requests, etc. No component changes.

## Reuse from existing code

Two things from your existing codebase carry over directly:

1. **`vessel-backend/` scrape API** is reused as-is. The `ApiVesselRepository` (when you flip the switch) calls `GET /api/vessel/:imo` against your existing service. No changes to the scrape backend.

2. **Auth flow** (login/register screens) keeps its current mechanics. The components are rewritten to match the new design language, but the in-memory user storage carries over until you build a real auth backend.

Things being **replaced**:

- The current Dashboard page (IMO search + vessel grid) becomes the new Fleet page.
- `VesselDetailPage` (with widgets and Google Maps) becomes the new Vessel Intelligence page.
- The Cesium → Google Maps migration carries forward — Google Maps integration is reused on Vessel Intelligence (voyage track) and Voyage Detail (actual + predicted track) screens.

## Persistence layer placeholder

Today the mock repositories store data in module-level variables (and `localStorage` for fleet). When the persistence layer comes:

1. Define database schema (Postgres tables for users, fleet, port_static, etc.).
2. Build API endpoints in tier 2 that talk to the database.
3. Implement `Api*Repository` classes that call those endpoints.
4. Flip the factory in `data/repositories/index.js` to use API repos.

Components, hooks, and contexts don't change. The mock implementations stay around for tests and local development without backend dependency.

## Routing

React Router v6. Routes are declared centrally in `App.jsx`:

```
/              -> redirect to /dashboard if authed, /login otherwise
/login         -> AuthPage (login mode)
/register      -> AuthPage (register mode)
/dashboard     -> DashboardPage
/fleet         -> FleetPage
/fleet/:imo    -> VesselIntelligencePage
/ports         -> PortSelectorPage
/ports/:code   -> PortDetailPage
/history       -> HistoricalAnalyticsPage
/history/:imo  -> VesselSummaryPage
/history/:imo/:voyageId -> VoyageDetailPage
```

A `<RequireAuth>` wrapper protects authed routes.

## What this codebase does NOT include yet

These are intentionally deferred:

- **Real backend integration** — repositories return mock data. Skeletons of API repositories exist with TODO markers.
- **Recommendation engine** — UI is wired, but the backend that generates profiles is mocked.
- **Time slider state synchronization** — UI scaffolding exists; live wiring to actual port congestion data is a backend integration task.
- **Real Google Maps integration** — voyage and port maps render schematic SVG today; production would replace these with `<GoogleMap />` components reading the same coordinate data.
- **Persistence** — fleet additions persist via `localStorage` for demo continuity, but there's no schema, migrations, or real database.

Each gap has a clear place in the architecture where it lands when ready.
