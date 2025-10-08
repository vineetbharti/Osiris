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

  // Plot route function
  const plotRoute = (route, color = '#FF0000', isCurrentJourney = false) => {
    console.log('🎯 plotRoute called with:', {
      routeLength: route?.length,
      color,
      isCurrentJourney,
      viewerExists: !!cesiumViewerRef.current
    });

    if (!cesiumViewerRef.current) {
      console.error('❌ Viewer not initialized yet!');
      return;
    }

    plotRouteOnMap(cesiumViewerRef.current, route, color, isCurrentJourney);
  };

  // Handle viewing current journey
  const handleViewCurrentJourney = () => {
    console.log('👉 View Current Journey button clicked');
    setSelectedRoute('current');
    plotRoute(mockCurrentJourney.route, '#0066FF', true);
  };

  // Handle viewing historical trip
  const handleViewHistoricalTrip = (trip) => {
    console.log('👉 View Historical Trip clicked:', trip.from, '→', trip.to);
    setSelectedRoute(trip.id);
    setShowHistoricalTrips(false);
    plotRoute(trip.route, '#9333EA', false);
  };

  // Initialize Cesium
  useEffect(() => {
    console.log('🔧 VesselDetailPage mounted');
    console.log('   Container ref:', cesiumContainerRef.current);
    console.log('   Viewer ref:', cesiumViewerRef.current);

    if (cesiumContainerRef.current && !cesiumViewerRef.current) {
      console.log('📦 Creating new Cesium viewer...');
      
      const viewer = initializeCesiumViewer(cesiumContainerRef.current);
      
      if (viewer) {
        cesiumViewerRef.current = viewer;
        console.log('✅ Viewer stored in ref');
        
        // Plot initial route after a short delay
        setTimeout(() => {
          console.log('⏱️  Plotting initial current journey route...');
          plotRoute(mockCurrentJourney.route, '#0066FF', true);
          setSelectedRoute('current');
        }, 500);
      } else {
        console.error('❌ Failed to create viewer');
      }
    } else if (cesiumViewerRef.current) {
      console.log('ℹ️  Viewer already exists, skipping creation');
    }

    return () => {
      console.log('🧹 VesselDetailPage unmounting');
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

          <CesiumMapPanel cesiumContainerRef={cesiumContainerRef} />
        </div>

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
