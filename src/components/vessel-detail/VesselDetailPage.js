import React, { useState } from 'react';
import VesselDetailNav from './VesselDetailNav';
import VesselWidgets from './VesselWidgets';
import GoogleMapsPanel from './GoogleMapsPanel';
import HistoricalTripsSection from './HistoricalTripsSection';
import { mockCurrentJourney, mockHistoricalTrips } from '../../utils/mockData';

const VesselDetailPage = ({ 
  selectedVessel, 
  handleBackToFleet, 
  handleLogout
}) => {
  const [activeWidget, setActiveWidget] = useState('current');
  const [showHistoricalTrips, setShowHistoricalTrips] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);

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
  const historicalTripsData = selectedTrip ? [selectedTrip] : [];

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
            mockHistoricalTrips={mockHistoricalTrips}
            currentJourney={mockCurrentJourney}
          />

          {/* Right Panel - Google Maps 3D */}
          <GoogleMapsPanel 
            currentJourney={currentJourneyData}
            historicalTrips={historicalTripsData}
          />
        </div>

        {/* Historical Trips Section (Expandable) */}
        {showHistoricalTrips && (
          <HistoricalTripsSection
            mockHistoricalTrips={mockHistoricalTrips}
            handleViewHistoricalTrip={handleViewHistoricalTrip}
            setShowHistoricalTrips={setShowHistoricalTrips}
          />
        )}
      </div>
    </div>
  );
};

export default VesselDetailPage;
