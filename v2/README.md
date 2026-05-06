# Osiris

Marine analytics platform — frontend application.

## Quick start

```bash
npm install
npm start
```

The app runs against mock data by default. To wire in your existing `vessel-backend` (VesselFinder scrape):

```bash
# In a separate terminal
cd ../vessel-backend
node vessel-api.js
# Listens on http://localhost:3001
```

Then set the env var to enable API-backed vessel lookups (other repositories remain on mock until you build their backends):

```bash
REACT_APP_USE_API_VESSEL=true npm start
```

## What's here

This is a complete UI implementation of the locked v1 design across all five tabs:

- **Dashboard** — executive view (fleet KPIs, savings trend, leaderboard, recent voyages)
- **Fleet** — operational vessel list with IMO search and add-to-fleet
- **Vessel Intelligence** — single-vessel decision support with profile comparison
- **Port Intelligence** — port selector + port detail with time slider
- **Historical Analytics** — three-level drill-down (landing → vessel summary → voyage detail)

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design. TL;DR:

- **3-tier system**: React frontend → Node API → Data (DB + ML)
- **Layered frontend**: components → hooks → repositories → API client
- **Repository pattern**: data layer is hot-swappable (mock today, API tomorrow)
- **Feature-based folders**: code that changes together stays together

## Tour of the code

Start here, in this order:

1. **`src/App.jsx`** — top-level shell. See where the route map lives.
2. **`src/data/repositories/index.js`** — the repository factory. This is THE seam between UI and data layer. Flip a flag here, hit a different backend.
3. **`src/data/repositories/interfaces/IFleetRepository.js`** — read one interface to understand the contract pattern. Others follow the same shape.
4. **`src/design-system/`** — tokens, primitives, layout, patterns. Everything visual is composed from these.
5. **`src/features/fleet/FleetPage.jsx`** — a complete feature, end to end. Most other features follow this pattern.
6. **`src/features/historical-analytics/VoyageDetailPage.jsx`** — the most complex screen, demonstrates how heavy patterns compose.

## How to extend

### Add a new screen

```bash
mkdir src/features/my-feature
# Create MyFeaturePage.jsx, components/, etc.
```

Then wire into `App.jsx`:

```jsx
<Route path="/my-feature" element={<MyFeaturePage />} />
```

### Replace a mock with a real API

In `src/data/repositories/index.js`:

```js
// Before:
export const portRepo = new MockPortRepository();

// After:
export const portRepo = new ApiPortRepository(apiClient);
```

Implement `ApiPortRepository` in `src/data/repositories/api/`. Components don't change.

### Add a new design pattern

Patterns are reused composites (CoverageBadge, ProfileRow, SpeedScheduleStrip, etc.). Add to `src/design-system/patterns/` and export from `index.js`.

### Add data persistence

Today mock repositories use module-level state and localStorage. When you add Postgres:

1. Define your schema (see `ARCHITECTURE.md` for the persistence section).
2. Build API endpoints in your Node service.
3. Implement `Api*Repository` classes calling those endpoints.
4. Flip the factory.

Mock repos stick around for local dev and tests.

## What's deliberately not here

See ARCHITECTURE.md "What this codebase does NOT include yet". Recommendation engine, real Google Maps, real ML inference — all live on the backend side and have clear plug-in points in this codebase.
