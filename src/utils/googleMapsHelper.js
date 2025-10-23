/* eslint-disable no-undef */
/**
 * Google Maps 3D Helper - For AIS ship tracking visualization
 * 
 * IMPORTANT: You need a Google Maps API key with Maps JavaScript API enabled
 * Get your key from: https://console.cloud.google.com/google/maps-apis
 * 
 * Note: 'google' is a global variable loaded from Google Maps script
 */

// Track overlays for cleanup
let currentOverlays = [];

/**
 * Initialize Google Maps viewer with satellite view for AIS ship tracking
 * @param {HTMLElement} containerRef - The container element for the map
 * @param {string} apiKey - Your Google Maps API key
 * @returns {google.maps.Map|null} The map instance or null if failed
 */
export const initializeGoogleMapsViewer = async (containerRef, apiKey) => {
  if (!containerRef) {
    console.warn('Container reference not provided');
    return null;
  }

  try {
    // Check if Google Maps is already loaded
    if (!window.google || !window.google.maps) {
      console.warn('Google Maps library not loaded. Loading now...');
      await loadGoogleMapsScript(apiKey);
    }

    // Wait a bit for the API to fully initialize
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify google.maps is available
    if (!window.google || !window.google.maps || !window.google.maps.Map) {
      throw new Error('Google Maps API failed to load properly');
    }

    // Create map with satellite view (best for AIS ship tracking)
    const map = new google.maps.Map(containerRef, {
      center: { lat: 1.3521, lng: 103.8198 }, // Singapore as default
      zoom: 3,
      mapTypeId: 'satellite', // Satellite view for ship tracking
      tilt: 45, // Enable 3D tilt
      
      // UI Controls
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: google.maps.MapTypeControlStyle.DEFAULT,
        position: google.maps.ControlPosition.TOP_RIGHT,
        mapTypeIds: ['satellite', 'roadmap', 'hybrid', 'terrain']
      },
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: 'greedy',
    });

    console.log('✅ Google Maps viewer initialized successfully with satellite view');
    return map;

  } catch (error) {
    console.error('❌ Failed to initialize Google Maps viewer:', error);
    return null;
  }
};

/**
 * Load Google Maps script dynamically
 * @param {string} apiKey - Your Google Maps API key
 */
const loadGoogleMapsScript = (apiKey) => {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry&v=weekly`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      console.log('✅ Google Maps script loaded');
      
      // Inject CSS to hide info window close button
      const style = document.createElement('style');
      style.textContent = `
        .gm-style-iw button[title="Close"] {
          display: none !important;
        }
        .gm-style-iw-c button[aria-label="Close"] {
          display: none !important;
        }
        .gm-ui-hover-effect {
          display: none !important;
        }
      `;
      document.head.appendChild(style);
      
      resolve();
    };
    
    script.onerror = (error) => {
      console.error('❌ Failed to load Google Maps script:', error);
      reject(error);
    };
    
    document.head.appendChild(script);
  });
};

/**
 * Plot a route on the Google Maps viewer (for ship AIS data)
 * @param {google.maps.Map} map - The map instance
 * @param {Array} route - Array of waypoints [{name, lat, lon, timestamp}, ...]
 * @param {string} color - Color for the route line (hex color)
 */
export const plotRouteOnGoogleMaps = (map, route, color = '#0066FF') => {
  if (!map) {
    console.error('❌ Map instance is required');
    return;
  }

  if (!route || route.length === 0) {
    console.warn('⚠️ No route data provided');
    return;
  }

  console.log(`\n🗺️ PLOTING ROUTE ON GOOGLE MAPS`);
  console.log(`📍 Waypoints: ${route.length}`);
  console.log(`🎨 Color: ${color}`);

  try {
    // Clear previous overlays before plotting new route
    clearMapOverlays(map);

    // Check if google.maps.Polyline is available
    if (!google.maps.Polyline) {
      console.error('❌ Google Maps Polyline not available');
      return;
    }

    // Prepare coordinates
    const coordinates = [];
    const bounds = new google.maps.LatLngBounds();

    for (let i = 0; i < route.length; i++) {
      const pt = route[i];
      const lat = parseFloat(pt.lat);
      const lon = parseFloat(pt.lon);

      if (isNaN(lat) || isNaN(lon)) {
        console.warn(`⚠️ Invalid coordinates at waypoint ${i}: ${pt.name}`);
        continue;
      }

      console.log(`  ${i + 1}. ${pt.name} [${lat}, ${lon}]`);
      
      const position = { lat, lng: lon };
      coordinates.push(position);
      bounds.extend(position);
    }

    console.log(`✅ ${coordinates.length} valid positions created`);

    if (coordinates.length === 0) {
      console.error('❌ No valid coordinates to plot');
      return;
    }

    // Draw the route line (polyline) - ship path
    const polyline = new google.maps.Polyline({
      path: coordinates,
      geodesic: true, // Follow Earth's curvature (important for ship routes)
      strokeColor: color,
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: map
    });

    // Track for cleanup
    currentOverlays.push(polyline);

    console.log('✅ Route line drawn');

    // Add markers for each waypoint (ports/waypoints)
    for (let i = 0; i < route.length; i++) {
      const pt = route[i];
      const lat = parseFloat(pt.lat);
      const lon = parseFloat(pt.lon);

      if (isNaN(lat) || isNaN(lon)) continue;

      const isFirst = i === 0;
      const isLast = i === route.length - 1;

      // Professional color scheme
      let markerColor = color; // Match route color for intermediate points
      let markerLabel = '';
      let markerScale = 4; // Small dots for intermediate waypoints

      if (isFirst) {
        markerColor = '#10B981'; // Professional green for start
        markerLabel = 'S';
        markerScale = 10;
      } else if (isLast) {
        markerColor = '#EF4444'; // Professional red for end
        markerLabel = 'E';
        markerScale = 10;
      }

      // Create marker
      const marker = new google.maps.Marker({
        position: { lat, lng: lon },
        map: map,
        title: pt.name,
        label: markerLabel ? {
          text: markerLabel,
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold'
        } : undefined,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: markerScale,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });

      // Track for cleanup
      currentOverlays.push(marker);

      // Create hover tooltip content
      const tooltipContent = createTooltipContent(pt, lat, lon, isFirst, isLast);

      // Create info window for hover (no close button)
      const infoWindow = new google.maps.InfoWindow({
        content: tooltipContent,
        disableAutoPan: true // Prevent map from panning when tooltip shows
      });

      // Show on hover, hide on mouseout
      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker);
      });

      marker.addListener('mouseout', () => {
        infoWindow.close();
      });

      // Track info window for cleanup
      currentOverlays.push(infoWindow);
    }

    console.log('✅ Markers added');

    // Fit map to show entire route with padding
    map.fitBounds(bounds, {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100
    });

    console.log('✅ PLOTTING COMPLETE!\n');

    // Return references for cleanup if needed
    return {
      polyline,
      bounds
    };

  } catch (error) {
    console.error('❌ PLOT ERROR:', error.message);
    throw error;
  }
};

/**
 * Create tooltip content for hover
 * @param {Object} pt - Point data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {boolean} isFirst - Is first point
 * @param {boolean} isLast - Is last point
 * @returns {string} HTML content for tooltip
 */
const createTooltipContent = (pt, lat, lon, isFirst, isLast) => {
  let pointType = '📍 Waypoint';
  if (isFirst) pointType = '🟢 Start Port';
  if (isLast) pointType = '🔴 End Port';

  // Format timestamp if available
  let timestampStr = 'N/A';
  if (pt.timestamp) {
    try {
      const date = new Date(pt.timestamp);
      timestampStr = date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      timestampStr = pt.timestamp;
    }
  }

  return `
    <div style="
      padding: 12px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      min-width: 200px;
    ">
      <div style="
        font-weight: 600;
        font-size: 13px;
        color: #1f2937;
        margin-bottom: 8px;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 6px;
      ">
        ${pointType}
      </div>
      
      ${pt.name ? `
        <div style="
          font-weight: 500;
          font-size: 12px;
          color: #374151;
          margin-bottom: 6px;
        ">
          ${pt.name}
        </div>
      ` : ''}
      
      <div style="
        font-size: 11px;
        color: #6b7280;
        line-height: 1.6;
      ">
        <div style="margin-bottom: 3px;">
          <strong>Time:</strong> ${timestampStr}
        </div>
        <div style="margin-bottom: 3px;">
          <strong>Lat:</strong> ${lat.toFixed(6)}°
        </div>
        <div>
          <strong>Lon:</strong> ${lon.toFixed(6)}°
        </div>
      </div>
    </div>
  `;
};

/**
 * Clear all overlays from the map
 * @param {google.maps.Map} map - The map instance
 */
export const clearMapOverlays = (map) => {
  if (!map) return;
  
  console.log(`🗑️ Clearing ${currentOverlays.length} overlays from map`);
  
  // Remove all tracked overlays
  currentOverlays.forEach(overlay => {
    if (overlay.setMap) {
      overlay.setMap(null);
    } else if (overlay.close) {
      overlay.close();
    }
  });
  
  // Clear the array
  currentOverlays = [];
  
  console.log('✅ Map overlays cleared');
};

/**
 * Destroy the map instance
 * @param {google.maps.Map} map - The map instance
 */
export const destroyGoogleMapsViewer = (map) => {
  if (map) {
    try {
      // Clear overlays first
      clearMapOverlays(map);
      
      // Google Maps doesn't have a destroy method
      // Clear the container instead
      if (google && google.maps && google.maps.event) {
        google.maps.event.clearInstanceListeners(map);
        console.log('✅ Map listeners cleared');
      }
    } catch (error) {
      console.error('❌ Destroy error:', error);
    }
  }
};

/**
 * Enable/disable 3D mode (tilt) - useful for satellite view
 * @param {google.maps.Map} map - The map instance
 * @param {boolean} enable - Whether to enable 3D mode
 */
export const toggle3DMode = (map, enable = true) => {
  if (!map) return;
  
  try {
    map.setTilt(enable ? 45 : 0);
    console.log(`✅ 3D mode ${enable ? 'enabled' : 'disabled'}`);
  } catch (error) {
    console.warn('⚠️ 3D tilt not available (requires satellite view)');
  }
};

/**
 * Set map view to a specific location (useful for focusing on ship position)
 * @param {google.maps.Map} map - The map instance
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Zoom level (0-21)
 */
export const setMapView = (map, lat, lng, zoom = 10) => {
  if (!map) return;
  
  map.setCenter({ lat, lng });
  map.setZoom(zoom);
  console.log(`✅ Map view set to [${lat}, ${lng}] at zoom ${zoom}`);
};
