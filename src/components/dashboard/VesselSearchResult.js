import React from 'react';

const VesselSearchResult = ({ searchResult, handleAddVessel }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex flex-col md:flex-row gap-6">
        {searchResult.image && (
          <div className="md:w-64 flex-shrink-0">
            <img 
              src={searchResult.image} 
              alt={searchResult.name}
              className="w-full h-48 object-cover rounded-lg shadow-md"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="flex-1">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">{searchResult.name}</h3>
              <p className="text-gray-600 text-sm">
                IMO: {searchResult.imo} 
                {searchResult.mmsi !== 'N/A' && ` | MMSI: ${searchResult.mmsi}`}
              </p>
            </div>
            <button
              onClick={handleAddVessel}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold whitespace-nowrap shadow-md"
            >
              Add to Fleet
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Type:</span>
              <p className="font-semibold text-gray-800">{searchResult.type}</p>
            </div>
            <div>
              <span className="text-gray-600">Flag:</span>
              <p className="font-semibold text-gray-800">{searchResult.flag}</p>
            </div>
            <div>
              <span className="text-gray-600">Length:</span>
              <p className="font-semibold text-gray-800">{searchResult.length}</p>
            </div>
            <div>
              <span className="text-gray-600">Beam:</span>
              <p className="font-semibold text-gray-800">{searchResult.beam}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600">Gross Tonnage:</span>
              <p className="font-semibold text-gray-800">{searchResult.grossTonnage}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VesselSearchResult;
