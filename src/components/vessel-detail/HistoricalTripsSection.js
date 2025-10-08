import React from 'react';
import { Clock } from 'lucide-react';
import HistoricalTripCard from './HistoricalTripCard';

const HistoricalTripsSection = ({ mockHistoricalTrips, setShowHistoricalTrips, handleViewHistoricalTrip }) => {
  return (
    <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-purple-600" />
          Historical Voyages
        </h2>
        <button
          onClick={() => setShowHistoricalTrips(false)}
          className="text-gray-500 hover:text-gray-700 font-semibold"
        >
          Close
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockHistoricalTrips.map((trip) => (
          <HistoricalTripCard key={trip.id} trip={trip} onViewRoute={handleViewHistoricalTrip} />
        ))}
      </div>
    </div>
  );
};

export default HistoricalTripsSection;
