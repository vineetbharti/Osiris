import React from 'react';
import { Plus } from 'lucide-react';
import VesselSearchResult from './VesselSearchResult';
import { Search } from 'lucide-react';

const VesselSearchSection = ({
  imoSearch,
  setImoSearch,
  searchResult,
  error,
  success,
  isSearching,
  handleIMOSearch,
  handleAddVessel,
  handleKeyPress
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <Plus className="w-6 h-6 mr-2 text-blue-600" />
        Add New Vessel
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
          {success}
        </div>
      )}

      <div className="mb-6">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={imoSearch}
              onChange={(e) => setImoSearch(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, handleIMOSearch)}
              placeholder="Enter IMO Number (e.g., 9739368)"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleIMOSearch}
            disabled={isSearching}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {searchResult && (
        <VesselSearchResult 
          searchResult={searchResult}
          handleAddVessel={handleAddVessel}
        />
      )}
    </div>
  );
};

export default VesselSearchSection;
