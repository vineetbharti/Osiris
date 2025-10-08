/**
 * Mock vessel database for testing
 */
export const mockVesselDatabase = {
  '9739368': {
    name: 'EVER GIVEN',
    mmsi: '353136000',
    type: 'Container Ship',
    flag: 'Panama',
    length: '399.94 m',
    beam: '58.8 m',
    grossTonnage: '220,940',
    image: 'https://images.vesseltracker.com/images/vessels/mid/Ever-Given-9739368.jpg'
  }
};

/**
 * Mock current journey data
 */
export const mockCurrentJourney = {
  from: 'Singapore',
  to: 'Rotterdam',
  departureDate: '2025-10-01',
  eta: '2025-10-25',
  currentPosition: { lat: 1.3521, lon: 103.8198 },
  speed: '18.5 knots',
  status: 'In Transit',
  route: [
    { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
    { lat: 8.5594, lon: 76.8806, name: 'Indian Ocean' },
    { lat: 12.9716, lon: 77.5946, name: 'Arabian Sea' },
    { lat: 29.3759, lon: 47.9774, name: 'Persian Gulf' },
    { lat: 30.0444, lon: 31.2357, name: 'Suez Canal' },
    { lat: 36.1408, lon: 5.3471, name: 'Mediterranean' },
    { lat: 51.9225, lon: 4.47917, name: 'Rotterdam' }
  ]
};

/**
 * Mock historical trips data
 */
export const mockHistoricalTrips = [
  { 
    id: 1, 
    from: 'Shanghai', 
    to: 'Los Angeles', 
    date: '2025-09-15', 
    duration: '14 days',
    route: [
      { lat: 31.2304, lon: 121.4737, name: 'Shanghai' },
      { lat: 35.6762, lon: 139.6503, name: 'Tokyo Bay' },
      { lat: 40.7128, lon: -174.0060, name: 'Pacific Ocean' },
      { lat: 34.0522, lon: -118.2437, name: 'Los Angeles' }
    ]
  },
  { 
    id: 2, 
    from: 'Los Angeles', 
    to: 'Singapore', 
    date: '2025-08-28', 
    duration: '18 days',
    route: [
      { lat: 34.0522, lon: -118.2437, name: 'Los Angeles' },
      { lat: 21.3099, lon: -157.8581, name: 'Honolulu' },
      { lat: 13.7563, lon: 100.5018, name: 'Bangkok' },
      { lat: 1.3521, lon: 103.8198, name: 'Singapore' }
    ]
  },
  { 
    id: 3, 
    from: 'Singapore', 
    to: 'Mumbai', 
    date: '2025-08-10', 
    duration: '7 days',
    route: [
      { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
      { lat: 6.9271, lon: 79.8612, name: 'Colombo' },
      { lat: 19.0760, lon: 72.8777, name: 'Mumbai' }
    ]
  },
  { 
    id: 4, 
    from: 'Mumbai', 
    to: 'Dubai', 
    date: '2025-07-25', 
    duration: '5 days',
    route: [
      { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
      { lat: 23.6850, lon: 68.1576, name: 'Arabian Sea' },
      { lat: 25.2048, lon: 55.2708, name: 'Dubai' }
    ]
  }
];
