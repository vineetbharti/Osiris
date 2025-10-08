// App.js - Main Application File
import React, { useState, useEffect, useRef } from 'react';
import { Ship, Search, Plus, LogOut, User, Lock, Building2, Anchor, ArrowLeft, MapPin, Clock, Navigation } from 'lucide-react';

// ============================================================================
// AUTHENTICATION COMPONENT
// ============================================================================
const AuthPage = ({ 
  currentPage, 
  setCurrentPage, 
  loginForm, 
  setLoginForm, 
  registerForm, 
  setRegisterForm,
  error,
  success,
  handleLogin,
  handleRegister,
  handleKeyPress
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-20"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-cyan-500 p-4 rounded-full">
              <Anchor className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Marine Analytics</h1>
          <p className="text-cyan-200">Intelligent Shipping Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex border-b">
            <button
              onClick={() => setCurrentPage('login')}
              className={`flex-1 py-4 font-semibold transition-colors ${
                currentPage === 'login' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => setCurrentPage('register')}
              className={`flex-1 py-4 font-semibold transition-colors ${
                currentPage === 'register' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Register
            </button>
          </div>

          <div className="p-8">
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

            {currentPage === 'login' ? (
              <LoginForm 
                loginForm={loginForm}
                setLoginForm={setLoginForm}
                handleLogin={handleLogin}
                handleKeyPress={handleKeyPress}
              />
            ) : (
              <RegisterForm 
                registerForm={registerForm}
                setRegisterForm={setRegisterForm}
                handleRegister={handleRegister}
                handleKeyPress={handleKeyPress}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// LOGIN FORM COMPONENT
// ============================================================================
const LoginForm = ({ loginForm, setLoginForm, handleLogin, handleKeyPress }) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
            onKeyPress={(e) => handleKeyPress(e, handleLogin)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
            onKeyPress={(e) => handleKeyPress(e, handleLogin)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
      >
        Sign In
      </button>
    </div>
  );
};

// ============================================================================
// REGISTER FORM COMPONENT
// ============================================================================
const RegisterForm = ({ registerForm, setRegisterForm, handleRegister, handleKeyPress }) => {
  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={registerForm.companyName}
            onChange={(e) => setRegisterForm({...registerForm, companyName: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your Shipping Company"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="password"
            value={registerForm.confirmPassword}
            onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
            onKeyPress={(e) => handleKeyPress(e, handleRegister)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button
        onClick={handleRegister}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
      >
        Register Company
      </button>
    </div>
  );
};

// ============================================================================
// DASHBOARD/FLEET PAGE COMPONENT
// ============================================================================
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

// ============================================================================
// VESSEL SEARCH SECTION
// ============================================================================
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

// ============================================================================
// VESSEL SEARCH RESULT CARD
// ============================================================================
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

// ============================================================================
// FLEET SECTION
// ============================================================================
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
        <EmptyFleetMessage />
      ) : filteredVessels.length === 0 ? (
        <NoSearchResultsMessage />
      ) : (
        <VesselGrid vessels={filteredVessels} onVesselClick={handleVesselClick} />
      )}
    </div>
  );
};

// ============================================================================
// VESSEL GRID
// ============================================================================
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

// ============================================================================
// VESSEL CARD
// ============================================================================
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

// ============================================================================
// EMPTY STATE MESSAGES
// ============================================================================
const EmptyFleetMessage = () => (
  <div className="text-center py-12">
    <Ship className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500 text-lg">No vessels added yet</p>
    <p className="text-gray-400 text-sm">Search and add vessels using the form above</p>
  </div>
);

const NoSearchResultsMessage = () => (
  <div className="text-center py-12">
    <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
    <p className="text-gray-500 text-lg">No vessels match your search</p>
    <p className="text-gray-400 text-sm">Try different keywords</p>
  </div>
);

// ============================================================================
// VESSEL DETAIL PAGE COMPONENT
// ============================================================================
const VesselDetailPage = ({ 
  selectedVessel, 
  handleBackToFleet, 
  handleLogout,
  cesiumViewerRef 
}) => {
  const [activeWidget, setActiveWidget] = useState('current');
  const [showHistoricalTrips, setShowHistoricalTrips] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const cesiumContainerRef = useRef(null);

  // Mock data for demonstration - Replace with API calls
  const mockCurrentJourney = {
    from: 'Singapore',
    to: 'Rotterdam',
    departureDate: '2025-10-01',
    eta: '2025-10-25',
    currentPosition: { lat: 1.3521, lon: 103.8198 },
    speed: '18.5 knots',
    status: 'In Transit',
    route: [
      { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
      { lat: 8.5594, lon: 76.8806, name: 'Indian Ocean' },
      { lat: 12.9716, lon: 77.5946, name: 'Arabian Sea' },
      { lat: 29.3759, lon: 47.9774, name: 'Persian Gulf' },
      { lat: 30.0444, lon: 31.2357, name: 'Suez Canal' },
      { lat: 36.1408, lon: 5.3471, name: 'Mediterranean' },
      { lat: 51.9225, lon: 4.47917, name: 'Rotterdam' }
    ]
  };

  const mockHistoricalTrips = [
    { 
      id: 1, 
      from: 'Shanghai', 
      to: 'Los Angeles', 
      date: '2025-09-15', 
      duration: '14 days',
      route: [
        { lat: 31.2304, lon: 121.4737, name: 'Shanghai' },
        { lat: 35.6762, lon: 139.6503, name: 'Tokyo Bay' },
        { lat: 40.7128, lon: -174.0060, name: 'Pacific Ocean' },
        { lat: 34.0522, lon: -118.2437, name: 'Los Angeles' }
      ]
    },
    { 
      id: 2, 
      from: 'Los Angeles', 
      to: 'Singapore', 
      date: '2025-08-28', 
      duration: '18 days',
      route: [
        { lat: 34.0522, lon: -118.2437, name: 'Los Angeles' },
        { lat: 21.3099, lon: -157.8581, name: 'Honolulu' },
        { lat: 13.7563, lon: 100.5018, name: 'Bangkok' },
        { lat: 1.3521, lon: 103.8198, name: 'Singapore' }
      ]
    },
    { 
      id: 3, 
      from: 'Singapore', 
      to: 'Mumbai', 
      date: '2025-08-10', 
      duration: '7 days',
      route: [
        { lat: 1.3521, lon: 103.8198, name: 'Singapore' },
        { lat: 6.9271, lon: 79.8612, name: 'Colombo' },
        { lat: 19.0760, lon: 72.8777, name: 'Mumbai' }
      ]
    },
    { 
      id: 4, 
      from: 'Mumbai', 
      to: 'Dubai', 
      date: '2025-07-25', 
      duration: '5 days',
      route: [
        { lat: 19.0760, lon: 72.8777, name: 'Mumbai' },
        { lat: 23.6850, lon: 68.1576, name: 'Arabian Sea' },
        { lat: 25.2048, lon: 55.2708, name: 'Dubai' }
      ]
    }
  ];

  // Plot route on Cesium map
  const plotRouteOnMap = (route, color = '#FF0000', isCurrentJourney = false) => {
    if (!cesiumViewerRef.current || !route || route.length === 0) return;

    const viewer = cesiumViewerRef.current;

    // Clear existing entities if plotting a new route
    viewer.entities.removeAll();

    // Create positions array for the polyline
    const positions = route.map(point =>
      window.Cesium.Cartesian3.fromDegrees(point.lon, point.lat)
    );

    // Add polyline for the route
    viewer.entities.add({
      polyline: {
        positions: positions,
        width: 3,
        material: window.Cesium.Color.fromCssColorString(color),
        clampToGround: true
      }
    });

    // Add markers for each waypoint
    route.forEach((point, index) => {
      const isStart = index === 0;
      const isEnd = index === route.length - 1;
      const isCurrent = isCurrentJourney && index === 0;

      viewer.entities.add({
        position: window.Cesium.Cartesian3.fromDegrees(point.lon, point.lat),
        point: {
          pixelSize: isCurrent ? 15 : 10,
          color: isCurrent 
            ? window.Cesium.Color.BLUE
            : isStart 
            ? window.Cesium.Color.GREEN 
            : isEnd 
            ? window.Cesium.Color.RED 
            : window.Cesium.Color.YELLOW,
          outlineColor: window.Cesium.Color.WHITE,
          outlineWidth: 2
        },
        label: {
          text: point.name,
          font: '12pt sans-serif',
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          outlineWidth: 2,
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM,
          pixelOffset: new window.Cesium.Cartesian2(0, -10)
        }
      });
    });

    // Fly to show the entire route
    viewer.camera.flyTo({
      destination: window.Cesium.Cartesian3.fromDegrees(
        route[0].lon,
        route[0].lat,
        5000000
      ),
      duration: 2
    });
  };

  // Handle viewing current journey
  const handleViewCurrentJourney = () => {
    setSelectedRoute('current');
    plotRouteOnMap(mockCurrentJourney.route, '#0066FF', true);
  };

  // Handle viewing historical trip
  const handleViewHistoricalTrip = (trip) => {
    setSelectedRoute(trip.id);
    setShowHistoricalTrips(false);
    plotRouteOnMap(trip.route, '#9333EA');
  };

  // Initialize CesiumJS
  useEffect(() => {
    if (cesiumContainerRef.current && !cesiumViewerRef.current) {
      try {
        if (typeof window.Cesium !== 'undefined') {
          // Create viewer with OpenStreetMap (no token required)
          const viewer = new window.Cesium.Viewer(cesiumContainerRef.current, {
            imageryProvider: new window.Cesium.OpenStreetMapImageryProvider({
              url: 'https://a.tile.openstreetmap.org/'
            }),
            baseLayerPicker: false,
            geocoder: false,
            homeButton: true,
            sceneModePicker: true,
            timeline: false,
            animation: false,
            navigationHelpButton: false,
            fullscreenButton: false
          });

          cesiumViewerRef.current = viewer;

          // Plot initial current journey route
          plotRouteOnMap(mockCurrentJourney.route, '#0066FF', true);
        } else {
          console.warn('Cesium library not loaded');
        }
      } catch (error) {
        console.error('Error initializing Cesium:', error);
      }
    }

    return () => {
      if (cesiumViewerRef.current) {
        try {
          cesiumViewerRef.current.destroy();
          cesiumViewerRef.current = null;
        } catch (error) {
          console.error('Error destroying Cesium viewer:', error);
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <VesselDetailNav 
        selectedVessel={selectedVessel}
        handleBackToFleet={handleBackToFleet}
        handleLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Widgets */}
          <VesselWidgets
            selectedVessel={selectedVessel}
            activeWidget={activeWidget}
            setActiveWidget={setActiveWidget}
            setShowHistoricalTrips={setShowHistoricalTrips}
            mockCurrentJourney={mockCurrentJourney}
            mockHistoricalTrips={mockHistoricalTrips}
            handleViewCurrentJourney={handleViewCurrentJourney}
            selectedRoute={selectedRoute}
          />

          {/* Right Panel - Cesium Map */}
          <CesiumMapPanel cesiumContainerRef={cesiumContainerRef} />
        </div>

        {/* Historical Trips Section */}
        {showHistoricalTrips && (
          <HistoricalTripsSection 
            mockHistoricalTrips={mockHistoricalTrips}
            setShowHistoricalTrips={setShowHistoricalTrips}
            handleViewHistoricalTrip={handleViewHistoricalTrip}
          />
        )}
      </div>
    </div>
  );
};

// ============================================================================
// VESSEL DETAIL NAVIGATION
// ============================================================================
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

// ============================================================================
// VESSEL WIDGETS PANEL
// ============================================================================
const VesselWidgets = ({
  selectedVessel,
  activeWidget,
  setActiveWidget,
  setShowHistoricalTrips,
  mockCurrentJourney,
  mockHistoricalTrips,
  handleViewCurrentJourney,
  selectedRoute
}) => {
  return (
    <div className="lg:col-span-1 space-y-4">
      {/* Current Journey Widget */}
      <CurrentJourneyWidget
        activeWidget={activeWidget}
        setActiveWidget={setActiveWidget}
        mockCurrentJourney={mockCurrentJourney}
        handleViewCurrentJourney={handleViewCurrentJourney}
        selectedRoute={selectedRoute}
      />

      {/* Historical Trips Widget */}
      <HistoricalTripsWidget
        activeWidget={activeWidget}
        setActiveWidget={setActiveWidget}
        setShowHistoricalTrips={setShowHistoricalTrips}
        mockHistoricalTrips={mockHistoricalTrips}
      />

      {/* Vessel Info Widget */}
      <VesselInfoWidget selectedVessel={selectedVessel} />
    </div>
  );
};

// ============================================================================
// CURRENT JOURNEY WIDGET
// ============================================================================
const CurrentJourneyWidget = ({ activeWidget, setActiveWidget, mockCurrentJourney, handleViewCurrentJourney, selectedRoute }) => {
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

// ============================================================================
// HISTORICAL TRIPS WIDGET
// ============================================================================
const HistoricalTripsWidget = ({ 
  activeWidget, 
  setActiveWidget, 
  setShowHistoricalTrips, 
  mockHistoricalTrips 
}) => {
  return (
    <div 
      className={`bg-white rounded-xl shadow-lg p-5 cursor-pointer transition-all ${
        activeWidget === 'historical' ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => {
        setActiveWidget('historical');
        setShowHistoricalTrips(true);
      }}
    >
      <div className="flex items-center space-x-3 mb-4">
        <div className="bg-purple-100 p-2 rounded-lg">
          <Clock className="w-6 h-6 text-purple-600" />
        </div>
        <h3 className="font-bold text-gray-800">Historical Trips</h3>
      </div>
      <div className="text-center py-2">
        <p className="text-3xl font-bold text-purple-600">{mockHistoricalTrips.length}</p>
        <p className="text-sm text-gray-600">Past Voyages</p>
      </div>
      <button className="w-full mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-semibold">
        View All
      </button>
    </div>
  );
};

// ============================================================================
// VESSEL INFO WIDGET
// ============================================================================
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

// ============================================================================
// CESIUM MAP PANEL
// ============================================================================
const CesiumMapPanel = ({ cesiumContainerRef }) => {
  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Live Tracking Map
          </h2>
          <p className="text-blue-100 text-sm">Real-time vessel position and route visualization</p>
        </div>
        <div 
          ref={cesiumContainerRef}
          className="w-full h-[600px] bg-gray-900"
          style={{ position: 'relative' }}
        >
          {typeof window.Cesium === 'undefined' && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
              <div className="text-center">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-lg font-semibold mb-2">CesiumJS Not Loaded</p>
                <p className="text-sm text-gray-400">Please include Cesium library to view the map</p>
                <p className="text-xs text-gray-500 mt-4">
                  Add Cesium script tag to your HTML head section
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HISTORICAL TRIPS SECTION
// ============================================================================
const HistoricalTripsSection = ({ mockHistoricalTrips, setShowHistoricalTrips, handleViewHistoricalTrip }) => {
  return (
    <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <Clock className="w-6 h-6 mr-2 text-purple-600" />
          Historical Voyages
        </h2>
        <button
          onClick={() => setShowHistoricalTrips(false)}
          className="text-gray-500 hover:text-gray-700 font-semibold"
        >
          Close
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockHistoricalTrips.map((trip) => (
          <HistoricalTripCard key={trip.id} trip={trip} onViewRoute={handleViewHistoricalTrip} />
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// HISTORICAL TRIP CARD
// ============================================================================
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

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [vessels, setVessels] = useState({});
  const [selectedVessel, setSelectedVessel] = useState(null);
  const cesiumViewerRef = useRef(null);
  
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [imoSearch, setImoSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [fleetSearch, setFleetSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const mockVesselDatabase = {
    '9739368': {
      name: 'EVER GIVEN',
      mmsi: '353136000',
      type: 'Container Ship',
      flag: 'Panama',
      length: '399.94 m',
      beam: '58.8 m',
      grossTonnage: '220,940',
      image: 'https://images.vesseltracker.com/images/vessels/mid/Ever-Given-9739368.jpg'
    }
  };

  // ============================================================================
  // API FUNCTION: Fetch Vessel Details
  // ============================================================================
  const fetchVesselDetails = async (imo) => {
    try {
      setIsSearching(true);
      setError('');
      
      try {
        const response = await fetch(`http://localhost:3001/api/vessel/${imo}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched from backend API:', data);
          return data;
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Vessel not found');
        }
      } catch (apiError) {
        console.log('Backend API error:', apiError.message);
        
        // Fallback to mock database
        if (mockVesselDatabase[imo]) {
          console.log('Using mock database');
          return {
            imo: imo,
            ...mockVesselDatabase[imo]
          };
        }
        
        throw new Error(`Unable to fetch vessel. Make sure the backend server is running on http://localhost:3001`);
      }
      
    } catch (err) {
      console.error('Error fetching vessel:', err);
      throw err;
    } finally {
      setIsSearching(false);
    }
  };

  // ============================================================================
  // HANDLER: Register
  // ============================================================================
  const handleRegister = () => {
    setError('');
    setSuccess('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (registerForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (users.find(u => u.email === registerForm.email)) {
      setError('Email already registered');
      return;
    }

    const newUser = {
      id: Date.now(),
      companyName: registerForm.companyName,
      email: registerForm.email,
      password: registerForm.password
    };

    setUsers([...users, newUser]);
    setVessels({ ...vessels, [newUser.id]: [] });
    setSuccess('Registration successful! Please login.');
    setRegisterForm({ companyName: '', email: '', password: '', confirmPassword: '' });
    
    setTimeout(() => {
      setCurrentPage('login');
      setSuccess('');
    }, 2000);
  };

  // ============================================================================
  // HANDLER: Login
  // ============================================================================
  const handleLogin = () => {
    setError('');

    const user = users.find(u => u.email === loginForm.email && u.password === loginForm.password);
    
    if (user) {
      setCurrentUser(user);
      setCurrentPage('dashboard');
      setLoginForm({ email: '', password: '' });
    } else {
      setError('Invalid email or password');
    }
  };

  // ============================================================================
  // HANDLER: Logout
  // ============================================================================
  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    setSelectedVessel(null);
    setImoSearch('');
    setSearchResult(null);
    setFleetSearch('');
  };

  // ============================================================================
  // HANDLER: IMO Search
  // ============================================================================
  const handleIMOSearch = async () => {
    setError('');
    setSearchResult(null);
    
    const trimmedIMO = imoSearch.trim();
    
    if (!trimmedIMO || trimmedIMO.length < 6) {
      setError('Please enter a valid IMO number (6-7 digits)');
      return;
    }
    
    try {
      const vesselData = await fetchVesselDetails(trimmedIMO);
      setSearchResult(vesselData);
    } catch (err) {
      setError(err.message || 'Vessel not found. Please check the IMO number and try again.');
      setSearchResult(null);
    }
  };

  // ============================================================================
  // HANDLER: Add Vessel to Fleet
  // ============================================================================
  const handleAddVessel = () => {
    if (!searchResult) return;

    const userVessels = vessels[currentUser.id] || [];
    
    if (userVessels.find(v => v.imo === searchResult.imo)) {
      setError('Vessel already added to your fleet');
      return;
    }

    const updatedVessels = {
      ...vessels,
      [currentUser.id]: [...userVessels, { ...searchResult, addedDate: new Date().toISOString() }]
    };
    
    setVessels(updatedVessels);
    setSuccess('Vessel added successfully!');
    setImoSearch('');
    setSearchResult(null);
    
    setTimeout(() => setSuccess(''), 3000);
  };

  // ============================================================================
  // HANDLER: Key Press (Enter)
  // ============================================================================
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  // ============================================================================
  // HANDLER: Vessel Click
  // ============================================================================
  const handleVesselClick = (vessel) => {
    setSelectedVessel(vessel);
    setCurrentPage('vessel-detail');
  };

  // ============================================================================
  // HANDLER: Back to Fleet
  // ============================================================================
  const handleBackToFleet = () => {
    setSelectedVessel(null);
    setCurrentPage('dashboard');
  };

  // ============================================================================
  // RENDER: Route to appropriate page
  // ============================================================================
  if (currentPage === 'vessel-detail' && selectedVessel) {
    return (
      <VesselDetailPage
        selectedVessel={selectedVessel}
        handleBackToFleet={handleBackToFleet}
        handleLogout={handleLogout}
        cesiumViewerRef={cesiumViewerRef}
      />
    );
  }

  if (currentUser) {
    return (
      <DashboardPage
        currentUser={currentUser}
        vessels={vessels}
        imoSearch={imoSearch}
        setImoSearch={setImoSearch}
        searchResult={searchResult}
        fleetSearch={fleetSearch}
        setFleetSearch={setFleetSearch}
        error={error}
        success={success}
        isSearching={isSearching}
        handleIMOSearch={handleIMOSearch}
        handleAddVessel={handleAddVessel}
        handleKeyPress={handleKeyPress}
        handleVesselClick={handleVesselClick}
        handleLogout={handleLogout}
      />
    );
  }

  return (
    <AuthPage
      currentPage={currentPage}
      setCurrentPage={setCurrentPage}
      loginForm={loginForm}
      setLoginForm={setLoginForm}
      registerForm={registerForm}
      setRegisterForm={setRegisterForm}
      error={error}
      success={success}
      handleLogin={handleLogin}
      handleRegister={handleRegister}
      handleKeyPress={handleKeyPress}
    />
  );
}
