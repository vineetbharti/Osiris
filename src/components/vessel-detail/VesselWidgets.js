import React from 'react';
import CurrentJourneyWidget from './CurrentJourneyWidget';
import HistoricalTripsWidget from './HistoricalTripsWidget';
import VesselInfoWidget from './VesselInfoWidget';

const VesselWidgets = ({
  selectedVessel,
  activeWidget,
  setActiveWidget,
  setShowHistoricalTrips,
  mockCurrentJourney,
  mockHistoricalTrips,
  handleViewCurrentJourney,
  selectedRoute
}) => {
  return (
    <div className="lg:col-span-1 space-y-4">
      <CurrentJourneyWidget
        activeWidget={activeWidget}
        setActiveWidget={setActiveWidget}
        mockCurrentJourney={mockCurrentJourney}
        handleViewCurrentJourney={handleViewCurrentJourney}
        selectedRoute={selectedRoute}
      />

      <HistoricalTripsWidget
        activeWidget={activeWidget}
        setActiveWidget={setActiveWidget}
        setShowHistoricalTrips={setShowHistoricalTrips}
        mockHistoricalTrips={mockHistoricalTrips}
      />

      <VesselInfoWidget selectedVessel={selectedVessel} />
    </div>
  );
};

export default VesselWidgets;
