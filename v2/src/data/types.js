/**
 * Domain model definitions, expressed as JSDoc typedefs.
 *
 * These are the only shapes that flow between repositories and the rest of
 * the app. When adding a new field, update here first, then update the
 * fixtures and any repository implementations that produce it.
 *
 * Convert to TypeScript later for stronger guarantees.
 */

/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} companyName
 * @property {string} email
 */

/**
 * @typedef {Object} Vessel
 * @property {string} imo                    IMO number, primary key
 * @property {string} name
 * @property {'Cargo'|'Tanker'|'Container'|string} type
 * @property {string} [flag]                 Country code or full name
 * @property {number} [yearBuilt]
 * @property {number} [length]               Meters
 * @property {number} [beam]
 * @property {number} [draft]
 * @property {number} [grossTonnage]
 * @property {number} [deadweight]
 * @property {string} [imageUrl]             From vessel-backend scrape
 * @property {VesselStatus} [status]         Current operational state
 * @property {'available'|'limited'|'unsupported'} coverage  Prediction availability
 */

/**
 * @typedef {Object} VesselStatus
 * @property {'in-transit'|'at-port'|'anchored'} state
 * @property {string} [destination]          Port name (in-transit only)
 * @property {string} [port]                 Current port (at-port/anchored)
 * @property {number} [speed]                Current speed in knots
 * @property {number} [heading]              Degrees
 * @property {string} [eta]                  ISO datetime or relative ("Tomorrow 14:30")
 * @property {string} [etaRange]             "± 2h"
 * @property {string} [etd]                  Departure time
 * @property {string} [waitingTime]          For at-port/anchored vessels
 */

/**
 * @typedef {Object} Port
 * @property {string} code                   UN/LOCODE, primary key
 * @property {string} name
 * @property {string} country
 * @property {[number, number]} [coords]     [lat, lon]
 * @property {string} [profile]              "Container, cargo, RoRo"
 * @property {'Small'|'Medium'|'Large'|'Very large'} scale
 * @property {number} [berths]
 * @property {number} [quayKm]
 * @property {number} [maxDraft]
 * @property {number} [anchorages]
 * @property {string} [avgTurnaround]
 * @property {'light'|'moderate'|'heavy'} currentCongestion
 */

/**
 * @typedef {Object} CongestionBucket
 * @property {string} bucketStart            ISO datetime, 6h boundary
 * @property {'light'|'moderate'|'heavy'|null} observed   null in future
 * @property {'light'|'moderate'|'heavy'} predicted
 */

/**
 * @typedef {Object} PortFeatures
 * @property {number} shipsInPort
 * @property {number} typicalShipsInPort
 * @property {string} avgWait24h            Formatted "8h 40m"
 * @property {string} typicalAvgWait24h
 * @property {number} arrivals6h
 * @property {number} departures6h
 * @property {number} berthOccupancy        Percentage
 * @property {string} regionalSpillover     Description
 * @property {Array<{name: string, value: string, sub: string, trend: string}>} features
 *   Feature attribution for "why this rating"
 */

/**
 * @typedef {Object} VoyageProfile
 * @property {string} id
 * @property {string} name                   "Fuel-saver", "Avoid congestion"
 * @property {string} category
 * @property {boolean} isCurrent             True for the active baseline
 * @property {boolean} isRecommended         True for the engine-selected option
 * @property {string} action                 "Reduce to avg 10.8 kn"
 * @property {string} actionDelta            "−13% vs current"
 * @property {'gain'|'loss'|'neutral'} actionTone
 * @property {string} eta
 * @property {string} etaDelta
 * @property {string} anchorage
 * @property {string} anchorageDelta
 * @property {string} berth
 * @property {string} berthDelta
 * @property {string} cost
 * @property {string} costDelta
 * @property {Array<SpeedSegment>} [speedSchedule]
 * @property {Object} [predictions]          { eta, anchorage, berth, fuel }
 * @property {Object} [portContext]          { ships, avgWait, queueTrend }
 */

/**
 * @typedef {Object} SpeedSegment
 * @property {string} timeRange              "08:00 → now"
 * @property {string} duration               "5h 48m sailed"
 * @property {string} speed                  "12.4 kn"
 * @property {'observed'|'predicted'|'recommended'} source
 * @property {boolean} [isPast]
 * @property {boolean} [isNow]
 */

/**
 * @typedef {Object} BacktestSummary
 * @property {string} vesselImo
 * @property {number} voyagesAnalyzed
 * @property {string} dateRange              "Jan 2024 to Apr 2026"
 * @property {Object} costSaved              { value, pct, actual, counterfactual }
 * @property {Object} timeSaved
 * @property {Object} fuelSaved
 * @property {Object} outcomes               { improved, neutral, worsened }
 * @property {Object} perVoyage              { avg, median }
 */

/**
 * @typedef {Object} BacktestVoyage
 * @property {string} id
 * @property {string} vesselImo
 * @property {string} routeFrom
 * @property {string} routeTo
 * @property {string} dateRange              "Apr 18–20, 2026"
 * @property {string} departedAt             ISO
 * @property {string} arrivedAt              ISO
 * @property {number} distanceNmi
 * @property {string} recommendedProfile     "Fuel-saver"
 * @property {Object} timeSaved              { value, sub, tone }
 * @property {Object} fuelSaved
 * @property {Object} costSaved
 * @property {Object} [calibration]          predicted vs actual on arrival/anchor/berth
 * @property {Array<VoyageProfile>} [profiles]  Including actual outcome
 */

/**
 * @typedef {Object} FleetSummary
 * @property {number} costSavedUsd
 * @property {number} costSavedPct
 * @property {string} timeSaved              "512 h"
 * @property {string} fuelSaved              "128 t"
 * @property {number} voyagesAnalyzed
 * @property {Array<{month: string, value: number}>} savingsByMonth
 * @property {Array<LeaderboardEntry>} leaderboard
 * @property {Array<RecentVoyage>} recentVoyages
 * @property {{improved: number, neutral: number, worsened: number}} outcomes
 */

export {};
