/**
 * Port fixtures — eight representative ports from the 88 modeled.
 */
export const FIXTURE_PORTS = [
  {
    code: 'DKAAL',
    name: 'Aalborg',
    country: 'Denmark',
    coords: [57.05, 9.92],
    profile: 'Multi-purpose',
    scale: 'Medium',
    berths: 18,
    quayKm: 4.2,
    maxDraft: 9.5,
    anchorages: 2,
    avgTurnaround: '11h 40m',
    currentCongestion: 'light',
  },
  {
    code: 'DKAAR',
    name: 'Aarhus',
    country: 'Denmark',
    coords: [56.16, 10.21],
    profile: 'Container, cargo',
    scale: 'Large',
    berths: 24,
    quayKm: 5.8,
    maxDraft: 13.5,
    anchorages: 2,
    avgTurnaround: '13h 20m',
    currentCongestion: 'moderate',
  },
  {
    code: 'DEBRV',
    name: 'Bremerhaven',
    country: 'Germany',
    coords: [53.55, 8.58],
    profile: 'Container, cargo, RoRo',
    scale: 'Very large',
    berths: 38,
    quayKm: 8.4,
    maxDraft: 14.5,
    anchorages: 3,
    avgTurnaround: '14h 20m',
    currentCongestion: 'heavy',
  },
  {
    code: 'SEGOT',
    name: 'Goteborg',
    country: 'Sweden',
    coords: [57.71, 11.97],
    profile: 'Container, tanker, bulk',
    scale: 'Very large',
    berths: 42,
    quayKm: 9.1,
    maxDraft: 15.0,
    anchorages: 4,
    avgTurnaround: '15h 30m',
    currentCongestion: 'moderate',
  },
  {
    code: 'DEHAM',
    name: 'Hamburg',
    country: 'Germany',
    coords: [53.55, 9.99],
    profile: 'Container, cargo, bulk',
    scale: 'Very large',
    berths: 50,
    quayKm: 12.8,
    maxDraft: 15.5,
    anchorages: 4,
    avgTurnaround: '16h 10m',
    currentCongestion: 'heavy',
  },
  {
    code: 'FIHEL',
    name: 'Helsinki',
    country: 'Finland',
    coords: [60.17, 24.94],
    profile: 'Multi-purpose',
    scale: 'Large',
    berths: 22,
    quayKm: 5.2,
    maxDraft: 11.0,
    anchorages: 2,
    avgTurnaround: '12h 50m',
    currentCongestion: 'light',
  },
  {
    code: 'DEKEL',
    name: 'Kiel',
    country: 'Germany',
    coords: [54.32, 10.14],
    profile: 'Cargo, ferry',
    scale: 'Medium',
    berths: 16,
    quayKm: 3.8,
    maxDraft: 9.8,
    anchorages: 2,
    avgTurnaround: '10h 30m',
    currentCongestion: 'light',
  },
  {
    code: 'NLRTM',
    name: 'Rotterdam',
    country: 'Netherlands',
    coords: [51.92, 4.48],
    profile: 'Container, tanker, bulk',
    scale: 'Very large',
    berths: 60,
    quayKm: 16.2,
    maxDraft: 17.0,
    anchorages: 5,
    avgTurnaround: '17h 20m',
    currentCongestion: 'heavy',
  },
];

/**
 * Generate a 28-bucket congestion timeline for a port.
 * 20 past buckets with both observed and predicted, 8 future with predicted only.
 *
 * In a real implementation this would query TimescaleDB. We synthesize a
 * pattern that demos well — observed and predicted mostly agree (the trust
 * loop), with occasional minor disagreements.
 */
export function generateCongestionTimeline(portCode) {
  // Different ports get different patterns; deterministic so demo is stable
  const seedByPort = {
    DEBRV: ['moderate', 'moderate', 'heavy', 'heavy', 'heavy', 'heavy', 'moderate', 'moderate', 'light', 'light', 'moderate', 'moderate', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'moderate', 'moderate', 'moderate', 'light', 'light', 'light'],
    DEHAM: ['heavy', 'heavy', 'heavy', 'moderate', 'moderate', 'moderate', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'moderate', 'moderate', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'heavy', 'moderate', 'moderate', 'moderate', 'moderate'],
  };
  const observed = seedByPort[portCode] || ['light', 'light', 'moderate', 'moderate', 'light', 'light', 'light', 'moderate', 'moderate', 'moderate', 'light', 'light', 'light', 'light', 'moderate', 'moderate', 'light', 'light', 'moderate', 'moderate', 'light', 'light', 'light', 'light', 'light', 'moderate', 'moderate', 'light'];

  const predicted = observed.map((c, i) => {
    // Inject occasional disagreement into past observations to demonstrate calibration
    if (i === 6 && observed[i] === 'moderate') return 'light';
    if (i === 11) return c;
    return c;
  });

  // Observed only available for past 20 buckets; future is null
  const observedWithFuture = observed.map((c, i) => (i < 20 ? c : null));

  // Generate timestamps backward from now in 6h intervals
  const now = new Date();
  now.setHours(Math.floor(now.getHours() / 6) * 6, 0, 0, 0);

  return observedWithFuture.map((obs, i) => {
    const offsetHours = (i - 20) * 6;
    const bucketStart = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
    return {
      bucketStart: bucketStart.toISOString(),
      observed: obs,
      predicted: predicted[i],
    };
  });
}
