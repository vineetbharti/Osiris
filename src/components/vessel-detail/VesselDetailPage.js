import React, { useState, useEffect } from 'react';
import VesselDetailNav from './VesselDetailNav';
import VesselWidgets from './VesselWidgets';
import GoogleMapsPanel from './GoogleMapsPanel';
import HistoricalTripsSection from './HistoricalTripsSection';
import { mockCurrentJourney, mockHistoricalTrips } from '../../utils/mockData';
import { getHistoricalTrips } from '../../services/voyageApiService';

const VesselDetailPage = ({ 
  selectedVessel, 
  handleBackToFleet, 
  handleLogout
}) => {
  const [activeWidget, setActiveWidget] = useState('current');
  const [showHistoricalTrips, setShowHistoricalTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [historicalTripsData, setHistoricalTripsData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch historical trips from database or use mock data as fallback
  useEffect(() => {
    const fetchHistoricalTrips = async () => {
      if (!selectedVessel || !selectedVessel.imo) {
        setHistoricalTripsData(mockHistoricalTrips);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const trips = await getHistoricalTrips(selectedVessel.imo);
        
        if (trips && trips.length > 0) {
          console.log(`✓ Loaded ${trips.length} voyages from database for IMO: ${selectedVessel.imo}`);
          setHistoricalTripsData(trips);
        } else {
          console.warn(`⚠ No voyages found for IMO: ${selectedVessel.imo}, using mock data`);
          setHistoricalTripsData(mockHistoricalTrips);
        }
      } catch (error) {
        console.error('❌ Error fetching voyage data:', error);
        console.log('⚠ Falling back to mock data');
        setHistoricalTripsData(mockHistoricalTrips);
      } finally {
        setLoading(false);
      }
    };

    fetchHistoricalTrips();
  }, [selectedVessel]);

  // Handle viewing current journey
  const handleViewCurrentJourney = () => {
    console.log('📍 Viewing current journey');
    setSelectedTrip(null);
    setActiveWidget('current');
  };

  // Handle viewing historical trip
  const handleViewHistoricalTrip = (trip) => {
    console.log('📍 Viewing historical trip:', trip.from, '→', trip.to);
    setSelectedTrip(trip);
    setShowHistoricalTrips(false);
    setActiveWidget('historical');
  };

  // Determine which data to show on map
  const currentJourneyData = selectedTrip ? null : mockCurrentJourney;
  const historicalTripsForMap = selectedTrip ? [selectedTrip] : [];

  // Don't render until data is loaded
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading voyage data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <VesselDetailNav 
        selectedVessel={selectedVessel}
        handleBackToFleet={handleBackToFleet}
        handleLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Widgets */}
          <VesselWidgets
            selectedVessel={selectedVessel}
            activeWidget={activeWidget}
            setActiveWidget={setActiveWidget}
            setShowHistoricalTrips={setShowHistoricalTrips}
            handleViewCurrentJourney={handleViewCurrentJourney}
            mockCurrentJourney={mockCurrentJourney}
            mockHistoricalTrips={historicalTripsData}
            currentJourney={mockCurrentJourney}
            loading={loading}
          />

          {/* Right Panel - Google Maps 3D */}
          <GoogleMapsPanel 
            currentJourney={currentJourneyData}
            historicalTrips={historicalTripsForMap}
          />
        </div>

        {/* Historical Trips Section (Expandable) */}
        {showHistoricalTrips && (
          <HistoricalTripsSection
            mockHistoricalTrips={historicalTripsData}
            handleViewHistoricalTrip={handleViewHistoricalTrip}
            setShowHistoricalTrips={setShowHistoricalTrips}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
};

export default VesselDetailPage;
