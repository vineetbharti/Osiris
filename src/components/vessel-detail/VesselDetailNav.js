import React from 'react';
import { Ship, ArrowLeft, LogOut } from 'lucide-react';

const VesselDetailNav = ({ selectedVessel, handleBackToFleet, handleLogout }) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToFleet}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Fleet</span>
            </button>
            <div className="flex items-center space-x-3">
              <Ship className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{selectedVessel.name}</h1>
                <p className="text-sm text-gray-600">IMO: {selectedVessel.imo}</p>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default VesselDetailNav;
