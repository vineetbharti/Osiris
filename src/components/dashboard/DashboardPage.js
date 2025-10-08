import React from 'react';
import { Anchor, LogOut } from 'lucide-react';
import VesselSearchSection from './VesselSearchSection';
import FleetSection from './FleetSection';

const DashboardPage = ({
  currentUser,
  vessels,
  imoSearch,
  setImoSearch,
  searchResult,
  fleetSearch,
  setFleetSearch,
  error,
  success,
  isSearching,
  handleIMOSearch,
  handleAddVessel,
  handleKeyPress,
  handleVesselClick,
  handleLogout
}) => {
  const userVessels = vessels[currentUser.id] || [];
  
  const filteredVessels = userVessels.filter(vessel => {
    const searchLower = fleetSearch.toLowerCase();
    return (
      vessel.name.toLowerCase().includes(searchLower) ||
      vessel.imo.includes(searchLower) ||
      vessel.type.toLowerCase().includes(searchLower) ||
      vessel.flag.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Anchor className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Marine Analytics</h1>
                <p className="text-sm text-gray-600">{currentUser.companyName}</p>
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

      <div className="max-w-7xl mx-auto px-6 py-8">
        <VesselSearchSection
          imoSearch={imoSearch}
          setImoSearch={setImoSearch}
          searchResult={searchResult}
          error={error}
          success={success}
          isSearching={isSearching}
          handleIMOSearch={handleIMOSearch}
          handleAddVessel={handleAddVessel}
          handleKeyPress={handleKeyPress}
        />

        <FleetSection
          userVessels={userVessels}
          filteredVessels={filteredVessels}
          fleetSearch={fleetSearch}
          setFleetSearch={setFleetSearch}
          handleVesselClick={handleVesselClick}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
