// App.js - Main Application File (Refactored)
import React, { useState, useRef } from 'react';

// Components
import AuthPage from './components/auth/AuthPage';
import DashboardPage from './components/dashboard/DashboardPage';
import VesselDetailPage from './components/vessel-detail/VesselDetailPage';

// Services
import { fetchVesselDetails } from './services/vesselService';

export default function App() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [currentPage, setCurrentPage] = useState('login');
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [vessels, setVessels] = useState({});
  const [selectedVessel, setSelectedVessel] = useState(null);
  const cesiumViewerRef = useRef(null);
  
  // Form States
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // Search States
  const [imoSearch, setImoSearch] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [fleetSearch, setFleetSearch] = useState('');
  
  // UI States
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // ============================================================================
  // AUTHENTICATION HANDLERS
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
    setSelectedVessel(null);
    setImoSearch('');
    setSearchResult(null);
    setFleetSearch('');
  };

  // ============================================================================
  // VESSEL MANAGEMENT HANDLERS
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
      setIsSearching(true);
      const vesselData = await fetchVesselDetails(trimmedIMO);
      setSearchResult(vesselData);
    } catch (err) {
      setError(err.message || 'Vessel not found. Please check the IMO number and try again.');
      setSearchResult(null);
    } finally {
      setIsSearching(false);
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

  const handleVesselClick = (vessel) => {
    setSelectedVessel(vessel);
    setCurrentPage('vessel-detail');
  };

  const handleBackToFleet = () => {
    setSelectedVessel(null);
    setCurrentPage('dashboard');
  };

  // ============================================================================
  // UTILITY HANDLERS
  // ============================================================================
  
  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
  };

  // ============================================================================
  // RENDER LOGIC
  // ============================================================================
  
  // Vessel Detail Page
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

  // Dashboard Page
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

  // Authentication Page
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
