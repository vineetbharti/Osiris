import React from 'react';

const HistoricalTripCard = ({ trip, onViewRoute }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-gray-800">{trip.from}</span>
          </div>
          <div className="pl-5 border-l-2 border-gray-300 my-2 py-1">
            <span className="text-sm text-gray-500">{trip.duration}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="font-semibold text-gray-800">{trip.to}</span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs text-gray-500">{trip.date}</span>
        </div>
      </div>
      <button 
        onClick={() => onViewRoute(trip)}
        className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
      >
        View Route
      </button>
    </div>
  );
};

export default HistoricalTripCard;
