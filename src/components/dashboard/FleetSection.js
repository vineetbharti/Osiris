import React from 'react';
import { Ship, Search } from 'lucide-react';
import VesselGrid from './VesselGrid';
import EmptyState from '../common/EmptyState';

const FleetSection = ({
  userVessels,
  filteredVessels,
  fleetSearch,
  setFleetSearch,
  handleVesselClick
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Ship className="w-6 h-6 mr-2 text-blue-600" />
        My Fleet ({userVessels.length})
      </h2>

      {userVessels.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={fleetSearch}
              onChange={(e) => setFleetSearch(e.target.value)}
              placeholder="Search by vessel name, IMO, type, or flag..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {fleetSearch && (
            <p className="text-sm text-gray-600 mt-2">
              Showing {filteredVessels.length} of {userVessels.length} vessels
            </p>
          )}
        </div>
      )}

      {userVessels.length === 0 ? (
        <EmptyState 
          icon={Ship}
          title="No vessels added yet"
          subtitle="Search and add vessels using the form above"
        />
      ) : filteredVessels.length === 0 ? (
        <EmptyState 
          icon={Search}
          title="No vessels match your search"
          subtitle="Try different keywords"
        />
      ) : (
        <VesselGrid vessels={filteredVessels} onVesselClick={handleVesselClick} />
      )}
    </div>
  );
};

export default FleetSection;
