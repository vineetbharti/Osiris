import React from 'react';
import { Navigation } from 'lucide-react';

const CurrentJourneyWidget = ({ 
  activeWidget, 
  setActiveWidget, 
  mockCurrentJourney, 
  handleViewCurrentJourney, 
  selectedRoute 
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-5 cursor-pointer transition-all ${
        activeWidget === 'current' ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setActiveWidget('current')}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Navigation className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="font-bold text-gray-800">Current Journey</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">From:</span>
          <p className="font-semibold text-gray-800">{mockCurrentJourney.from}</p>
        </div>
        <div>
          <span className="text-gray-600">To:</span>
          <p className="font-semibold text-gray-800">{mockCurrentJourney.to}</p>
        </div>
        <div>
          <span className="text-gray-600">Status:</span>
          <p className="font-semibold text-green-600">{mockCurrentJourney.status}</p>
        </div>
        <div>
          <span className="text-gray-600">Speed:</span>
          <p className="font-semibold text-gray-800">{mockCurrentJourney.speed}</p>
        </div>
        <div>
          <span className="text-gray-600">ETA:</span>
          <p className="font-semibold text-gray-800">{mockCurrentJourney.eta}</p>
        </div>
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          handleViewCurrentJourney();
        }}
        className={`w-full mt-4 px-4 py-2 rounded-lg transition-colors text-sm font-semibold ${
          selectedRoute === 'current'
            ? 'bg-green-600 text-white hover:bg-green-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {selectedRoute === 'current' ? '✓ Route Displayed' : 'View Voyage'}
      </button>
    </div>
  );
};

export default CurrentJourneyWidget;
