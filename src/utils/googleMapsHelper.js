/* eslint-disable no-undef */
/**
 * Google Maps 3D Helper - For AIS ship tracking visualization
 * 
 * IMPORTANT: You need a Google Maps API key with Maps JavaScript API enabled
 * Get your key from: https://console.cloud.google.com/google/maps-apis
 * 
 * Note: 'google' is a global variable loaded from Google Maps script
 */

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
 * @param {Array} route - Array of waypoints [{name, lat, lon}, ...]
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

  console.log(`\n🗺️ PLOTTING ROUTE ON GOOGLE MAPS`);
  console.log(`📍 Waypoints: ${route.length}`);
  console.log(`🎨 Color: ${color}`);

  try {
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

    console.log('✅ Route line drawn');

    // Add markers for each waypoint (ports/waypoints)
    for (let i = 0; i < route.length; i++) {
      const pt = route[i];
      const lat = parseFloat(pt.lat);
      const lon = parseFloat(pt.lon);

      if (isNaN(lat) || isNaN(lon)) continue;

      const isFirst = i === 0;
      const isLast = i === route.length - 1;

      // Determine marker color and size
      let markerColor = '#FFD700'; // Yellow for intermediate waypoints
      let markerLabel = '';

      if (isFirst) {
        markerColor = '#00FF00'; // Green for departure port
        markerLabel = 'S';
      } else if (isLast) {
        markerColor = '#FF0000'; // Red for arrival port
        markerLabel = 'E';
      }

      // Create custom marker for ports
      const marker = new google.maps.Marker({
        position: { lat, lng: lon },
        map: map,
        title: pt.name,
        label: markerLabel ? {
          text: markerLabel,
          color: 'white',
          fontSize: '14px',
          fontWeight: 'bold'
        } : undefined,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: isFirst || isLast ? 12 : 8,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: 'white',
          strokeWeight: 2
        }
      });

      // Add info window on click (port information)
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;">
          <strong>${pt.name}</strong><br/>
          <small>Lat: ${lat.toFixed(4)}, Lng: ${lon.toFixed(4)}</small>
        </div>`
      });

      marker.addListener('click', () => {
        infoWindow.open(map, marker);
      });
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
 * Clear all overlays from the map (call this before plotting new routes)
 * Note: This is a simple version. In production, you'd want to track overlays
 * @param {google.maps.Map} map - The map instance
 */
export const clearMapOverlays = (map) => {
  if (!map) return;
  
  // Note: Google Maps doesn't have a built-in "clear all" method
  // You need to keep track of your overlays and remove them individually
  // This is a placeholder - implement based on your needs
  console.log('⚠️ Clear overlays - implement overlay tracking for production use');
};

/**
 * Destroy the map instance
 * @param {google.maps.Map} map - The map instance
 */
export const destroyGoogleMapsViewer = (map) => {
  if (map) {
    try {
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
