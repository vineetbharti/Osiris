import React, { useState, useEffect, useRef } from 'react';
import VesselDetailNav from './VesselDetailNav';
import VesselWidgets from './VesselWidgets';
import CesiumMapPanel from './CesiumMapPanel';
import HistoricalTripsSection from './HistoricalTripsSection';
import { mockCurrentJourney, mockHistoricalTrips } from '../../utils/mockData';
import { initializeCesiumViewer, plotRouteOnMap, destroyCesiumViewer } from '../../utils/cesiumHelper';

const VesselDetailPage = ({ 
  selectedVessel, 
  handleBackToFleet, 
  handleLogout,
  cesiumViewerRef 
}) => {
  const [activeWidget, setActiveWidget] = useState('current');
  const [showHistoricalTrips, setShowHistoricalTrips] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const cesiumContainerRef = useRef(null);

  // Plot route on Cesium map
  const plotRoute = (route, color = '#FF0000', isCurrentJourney = false) => {
    if (cesiumViewerRef.current) {
      plotRouteOnMap(cesiumViewerRef.current, route, color, isCurrentJourney);
    }
  };

  // Handle viewing current journey
  const handleViewCurrentJourney = () => {
    setSelectedRoute('current');
    plotRoute(mockCurrentJourney.route, '#0066FF', true);
  };

  // Handle viewing historical trip
  const handleViewHistoricalTrip = (trip) => {
    setSelectedRoute(trip.id);
    setShowHistoricalTrips(false);
    plotRoute(trip.route, '#9333EA');
  };

  // Initialize CesiumJS
  useEffect(() => {
    if (cesiumContainerRef.current && !cesiumViewerRef.current) {
      const viewer = initializeCesiumViewer(cesiumContainerRef.current);
      if (viewer) {
        cesiumViewerRef.current = viewer;
        // Plot initial current journey route
        plotRoute(mockCurrentJourney.route, '#0066FF', true);
      }
    }

    return () => {
      if (cesiumViewerRef.current) {
        destroyCesiumViewer(cesiumViewerRef.current);
        cesiumViewerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
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
            mockCurrentJourney={mockCurrentJourney}
            mockHistoricalTrips={mockHistoricalTrips}
            handleViewCurrentJourney={handleViewCurrentJourney}
            selectedRoute={selectedRoute}
          />

          {/* Right Panel - Cesium Map */}
          <CesiumMapPanel cesiumContainerRef={cesiumContainerRef} />
        </div>

        {/* Historical Trips Section */}
        {showHistoricalTrips && (
          <HistoricalTripsSection 
            mockHistoricalTrips={mockHistoricalTrips}
            setShowHistoricalTrips={setShowHistoricalTrips}
            handleViewHistoricalTrip={handleViewHistoricalTrip}
          />
        )}
      </div>
    </div>
  );
};

export default VesselDetailPage;

