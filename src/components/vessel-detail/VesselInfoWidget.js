import React from 'react';
import { MapPin } from 'lucide-react';

const VesselInfoWidget = ({ selectedVessel }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5">
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-cyan-100 p-2 rounded-lg">
          <MapPin className="w-6 h-6 text-cyan-600" />
        </div>
        <h3 className="font-bold text-gray-800">Vessel Info</h3>
      </div>
      <div className="space-y-2 text-sm">
        <div>
          <span className="text-gray-600">Type:</span>
          <p className="font-semibold text-gray-800">{selectedVessel.type}</p>
        </div>
        <div>
          <span className="text-gray-600">Flag:</span>
          <p className="font-semibold text-gray-800">{selectedVessel.flag}</p>
        </div>
        {selectedVessel.length && selectedVessel.length !== 'N/A' && (
          <div>
            <span className="text-gray-600">Length:</span>
            <p className="font-semibold text-gray-800">{selectedVessel.length}</p>
          </div>
        )}
        {selectedVessel.grossTonnage && selectedVessel.grossTonnage !== 'N/A' && (
          <div>
            <span className="text-gray-600">Gross Tonnage:</span>
            <p className="font-semibold text-gray-800">{selectedVessel.grossTonnage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselInfoWidget;
