import React from 'react';
import { Ship } from 'lucide-react';

const VesselCard = ({ vessel, onClick }) => {
  return (
    <div 
      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white cursor-pointer"
      onClick={onClick}
    >
      {vessel.image && (
        <div className="mb-3 overflow-hidden rounded-lg bg-gray-100">
          <img 
            src={vessel.image} 
            alt={vessel.name}
            className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      <div className="flex items-start justify-between mb-3">
        <Ship className="w-6 h-6 text-blue-600 flex-shrink-0" />
        <span className="text-xs text-gray-500">
          {new Date(vessel.addedDate).toLocaleDateString()}
        </span>
      </div>
      <h3 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">{vessel.name}</h3>
      <p className="text-sm text-gray-600 mb-3">IMO: {vessel.imo}</p>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Type:</span>
          <span className="font-medium text-gray-800 text-right truncate ml-2">{vessel.type}</span>
        </div>
        {vessel.length && vessel.length !== 'N/A' && (
          <div className="flex justify-between">
            <span className="text-gray-600">Length:</span>
            <span className="font-medium text-gray-800">{vessel.length}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-gray-600">Flag:</span>
          <span className="font-medium text-gray-800 text-right truncate ml-2">{vessel.flag}</span>
        </div>
        {vessel.grossTonnage && vessel.grossTonnage !== 'N/A' && (
          <div className="flex justify-between">
            <span className="text-gray-600">GT:</span>
            <span className="font-medium text-gray-800">{vessel.grossTonnage}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VesselCard;
