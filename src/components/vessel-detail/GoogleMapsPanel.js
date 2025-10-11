import React, { useEffect, useRef, useState } from 'react';
import { Globe, RefreshCw, Maximize2 } from 'lucide-react';
import {
  initializeGoogleMapsViewer,
  plotRouteOnGoogleMaps,
  toggle3DMode,
  destroyGoogleMapsViewer
} from '../../utils/googleMapsHelper';

/**
 * Google Maps Panel Component - Replaces CesiumMapPanel
 * Displays vessel routes on an interactive 3D Google Maps view
 */
const GoogleMapsPanel = ({ currentJourney, historicalTrips }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [is3DEnabled, setIs3DEnabled] = useState(true);
  
  // ⭐ IMPORTANT: Set your Google Maps API key here
  // Get it from: https://console.cloud.google.com/google/maps-apis
  const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'AIzaSyAc7lwB59Oh10F1hnco5Gby35gCVNnH3Rw';

  // Initialize Google Maps on component mount
  useEffect(() => {
    const initializeMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        setIsLoading(true);
        setError(null);

        // Check if API key is set
        if (!GOOGLE_MAPS_API_KEY || GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
          throw new Error('Google Maps API key not configured. Please set REACT_APP_GOOGLE_MAPS_API_KEY in your .env file or update the component.');
        }

        // Initialize the map
        const map = await initializeGoogleMapsViewer(
          mapContainerRef.current,
          GOOGLE_MAPS_API_KEY
        );

        if (!map) {
          throw new Error('Failed to initialize Google Maps');
        }

        mapInstanceRef.current = map;
        setIsLoading(false);

        console.log('✅ Google Maps initialized in panel');
      } catch (err) {
        console.error('❌ Map initialization error:', err);
        setError(err.message || 'Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initializeMap();

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        destroyGoogleMapsViewer(mapInstanceRef.current);
        mapInstanceRef.current = null;
      }
    };
  }, [GOOGLE_MAPS_API_KEY]);

  // Plot current journey when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !currentJourney || !currentJourney.route) return;

    try {
      console.log('📍 Plotting current journey...');
      plotRouteOnGoogleMaps(
        mapInstanceRef.current,
        currentJourney.route,
        '#0066FF' // Blue color for current journey
      );
    } catch (err) {
      console.error('❌ Error plotting route:', err);
    }
  }, [currentJourney]);

  // Plot historical trips when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !historicalTrips || historicalTrips.length === 0) return;

    try {
      console.log('📍 Plotting historical trips...');
      
      // Plot each historical trip with a different color
      historicalTrips.forEach((trip, index) => {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        const color = colors[index % colors.length];
        
        if (trip.route) {
          plotRouteOnGoogleMaps(
            mapInstanceRef.current,
            trip.route,
            color
          );
        }
      });
    } catch (err) {
      console.error('❌ Error plotting historical trips:', err);
    }
  }, [historicalTrips]);

  // Toggle 3D mode
  const handle3DToggle = () => {
    if (!mapInstanceRef.current) return;
    
    const newState = !is3DEnabled;
    toggle3DMode(mapInstanceRef.current, newState);
    setIs3DEnabled(newState);
  };

  // Refresh/reset map view
  const handleRefresh = () => {
    if (!mapInstanceRef.current || !currentJourney || !currentJourney.route) return;
    
    // Re-plot the current journey to reset the view
    plotRouteOnGoogleMaps(
      mapInstanceRef.current,
      currentJourney.route,
      '#0066FF'
    );
  };

  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Globe className="w-5 h-5 mr-2" />
            Live Tracking Map
          </h2>
          <p className="text-blue-100 text-sm">Real-time vessel position and route visualization</p>
        </div>
        
        <div className="relative w-full h-[600px] bg-gray-900">
          {/* Map Container */}
          <div
            ref={mapContainerRef}
            className="w-full h-full"
          />

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">Loading Google Maps...</p>
                <p className="text-sm text-gray-400 mt-2">Initializing 3D view</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90">
              <div className="text-center text-white max-w-md px-6">
                <div className="text-red-500 text-5xl mb-4">⚠️</div>
                <h3 className="text-xl font-bold mb-2">Map Loading Error</h3>
                <p className="text-gray-300 mb-4">{error}</p>
                <div className="text-sm text-gray-400 bg-gray-800 p-4 rounded-lg mt-4 text-left">
                  <p className="font-semibold mb-2">To fix this:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Get an API key from <a href="https://console.cloud.google.com/google/maps-apis" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Google Cloud Console</a></li>
                    <li>Enable "Maps JavaScript API"</li>
                    <li>Create a <code className="bg-gray-700 px-1 rounded">.env</code> file in project root</li>
                    <li>Add: <code className="bg-gray-700 px-1 rounded">REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here</code></li>
                    <li>Restart the development server</li>
                  </ol>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  Reload Page
                </button>
              </div>
            </div>
          )}

          {/* Control Panel */}
          {!isLoading && !error && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {/* 3D Toggle Button */}
              <button
                onClick={handle3DToggle}
                className={`p-3 rounded-lg shadow-lg transition-all ${
                  is3DEnabled
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
                title={is3DEnabled ? 'Disable 3D View' : 'Enable 3D View'}
              >
                <Globe size={20} />
              </button>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                className="p-3 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                title="Reset View"
              >
                <RefreshCw size={20} />
              </button>

              {/* Fullscreen Button */}
              <button
                onClick={() => {
                  const elem = mapContainerRef.current?.parentElement;
                  if (elem?.requestFullscreen) {
                    elem.requestFullscreen();
                  }
                }}
                className="p-3 bg-white text-gray-700 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
                title="Fullscreen"
              >
                <Maximize2 size={20} />
              </button>
            </div>
          )}

          {/* Info Badge */}
          {!isLoading && !error && (
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
              <div className="flex items-center gap-2">
                <Globe size={16} />
                <span>Google Maps 3D | {is3DEnabled ? '3D View' : '2D View'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsPanel;
