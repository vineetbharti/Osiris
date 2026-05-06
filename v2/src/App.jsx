import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';

import AuthPage from './features/auth/AuthPage';
import DashboardPage from './features/dashboard/DashboardPage';
import FleetPage from './features/fleet/FleetPage';
import VesselIntelligencePage from './features/vessel-intelligence/VesselIntelligencePage';
import PortSelectorPage from './features/port-intelligence/PortSelectorPage';
import PortDetailPage from './features/port-intelligence/PortDetailPage';
import HistoricalLandingPage from './features/historical-analytics/HistoricalLandingPage';
import VesselSummaryPage from './features/historical-analytics/VesselSummaryPage';
import VoyageDetailPage from './features/historical-analytics/VoyageDetailPage';

/**
 * RequireAuth — wraps protected routes. If user not signed in, redirects
 * to /login while preserving the intended destination.
 */
function RequireAuth({ children }) {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ padding: 40, color: 'var(--color-text-secondary)' }}>
        Loading…
      </div>
    );
  }
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/register" element={<AuthPage mode="register" />} />

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Authenticated routes */}
        <Route
          path="/dashboard"
          element={<RequireAuth><DashboardPage /></RequireAuth>}
        />
        <Route
          path="/fleet"
          element={<RequireAuth><FleetPage /></RequireAuth>}
        />
        <Route
          path="/fleet/:imo"
          element={<RequireAuth><VesselIntelligencePage /></RequireAuth>}
        />
        <Route
          path="/ports"
          element={<RequireAuth><PortSelectorPage /></RequireAuth>}
        />
        <Route
          path="/ports/:code"
          element={<RequireAuth><PortDetailPage /></RequireAuth>}
        />
        <Route
          path="/history"
          element={<RequireAuth><HistoricalLandingPage /></RequireAuth>}
        />
        <Route
          path="/history/:imo"
          element={<RequireAuth><VesselSummaryPage /></RequireAuth>}
        />
        <Route
          path="/history/:imo/:voyageId"
          element={<RequireAuth><VoyageDetailPage /></RequireAuth>}
        />

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  );
}
