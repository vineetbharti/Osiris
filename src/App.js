import React, { useState } from 'react';
import { Ship, Search, Plus, LogOut, User, Lock, Building2, Anchor } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [vessels, setVessels] = useState({});
  
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

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentPage('login');
    setImoSearch('');
    setSearchResult(null);
    setFleetSearch('');
  };

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

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  const renderAuth = () => (
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
            ) : (
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
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => {
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
                    placeholder="Enter IMO Number (e.g., 1002756)"
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
                          e.target.parentElement.innerHTML = '<div class="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center"><svg class="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
                        }}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{searchResult.name}</h3>
                        <p className="text-gray-600 text-sm">IMO: {searchResult.imo} {searchResult.mmsi !== 'N/A' && `| MMSI: ${searchResult.mmsi}`}</p>
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
            )}
          </div>

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
              <div className="text-center py-12">
                <Ship className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No vessels added yet</p>
                <p className="text-gray-400 text-sm">Search and add vessels using the form above</p>
              </div>
            ) : filteredVessels.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No vessels match your search</p>
                <p className="text-gray-400 text-sm">Try different keywords</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVessels.map((vessel, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
                    {vessel.image && (
                      <div className="mb-3 overflow-hidden rounded-lg bg-gray-100">
                        <img 
                          src={vessel.image} 
                          alt={vessel.name}
                          className="w-full h-40 object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<div class="w-full h-40 bg-gray-200 flex items-center justify-center"><svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></div>';
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
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return currentUser ? renderDashboard() : renderAuth();
}
