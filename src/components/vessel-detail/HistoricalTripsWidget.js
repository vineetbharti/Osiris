import React from 'react';
import { Clock } from 'lucide-react';

const HistoricalTripsWidget = ({ 
  activeWidget, 
  setActiveWidget, 
  setShowHistoricalTrips, 
  mockHistoricalTrips 
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-5 cursor-pointer transition-all ${
        activeWidget === 'historical' ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => {
        setActiveWidget('historical');
        setShowHistoricalTrips(true);
      }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Clock className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="font-bold text-gray-800">Historical Trips</h3>
      </div>
      <div className="text-center py-2">
        <p className="text-3xl font-bold text-purple-600">{mockHistoricalTrips.length}</p>
        <p className="text-sm text-gray-600">Past Voyages</p>
      </div>
      <button className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold">
        View All
      </button>
    </div>
  );
};

export default HistoricalTripsWidget;
