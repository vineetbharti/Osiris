import React from 'react';
import VesselCard from './VesselCard';

const VesselGrid = ({ vessels, onVesselClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {vessels.map((vessel, index) => (
        <VesselCard 
          key={index} 
          vessel={vessel} 
          onClick={() => onVesselClick(vessel)}
        />
      ))}
    </div>
  );
};

export default VesselGrid;
