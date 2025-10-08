/**
 * Test if Cesium is available
 */
const testCesiumAvailable = () => {
  console.log('=== CESIUM AVAILABILITY TEST ===');
  console.log('window.Cesium exists:', typeof window.Cesium !== 'undefined');
  
  if (typeof window.Cesium !== 'undefined') {
    console.log('✅ Cesium is loaded');
    console.log('   Version:', window.Cesium.VERSION || 'Unknown');
    return true;
  } else {
    console.error('❌ Cesium is NOT loaded!');
    return false;
  }
};

/**
 * Initialize Cesium viewer with OpenStreetMap (no token needed!)
 */
export const initializeCesiumViewer = (containerRef) => {
  console.log('\n🚀 CESIUM INITIALIZATION START');
  
  if (!testCesiumAvailable()) {
    alert('ERROR: Cesium library not loaded!');
    return null;
  }

  console.log('Container:', containerRef?.tagName, containerRef?.offsetWidth, 'x', containerRef?.offsetHeight);

  if (!containerRef || containerRef.offsetWidth === 0 || containerRef.offsetHeight === 0) {
    console.error('❌ Invalid container!');
    return null;
  }

  try {
    console.log('📦 Creating Cesium.Viewer with OpenStreetMap...');
    
    // Use OpenStreetMap - no token required, no workers!
    const viewer = new window.Cesium.Viewer(containerRef, {
      imageryProvider: new window.Cesium.OpenStreetMapImageryProvider({
        url: 'https://a.tile.openstreetmap.org/'
      }),
      baseLayerPicker: false,
      geocoder: false,
      homeButton: true,
      sceneModePicker: false,
      timeline: false,
      animation: false,
      navigationHelpButton: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false
    });

    console.log('✅ Viewer created with OpenStreetMap');
    console.log('   Imagery layers:', viewer.imageryLayers.length);

    // Configure scene
    viewer.scene.globe.show = true;
    viewer.scene.globe.enableLighting = false;
    viewer.scene.skyBox.show = false; // Disable skybox to avoid worker issues
    viewer.scene.sun.show = false;
    viewer.scene.moon.show = false;
    viewer.scene.backgroundColor = window.Cesium.Color.fromCssColorString('#87CEEB');

    // Force imagery to load
    viewer.scene.globe.maximumScreenSpaceError = 2;
    
    console.log('✅ Scene configured');
    console.log('✅ CESIUM VIEWER READY!\n');
    
    return viewer;

  } catch (error) {
    console.error('❌ FAILED:', error.message);
    alert('Failed to create viewer: ' + error.message);
    return null;
  }
};

/**
 * Plot route on map
 */
export const plotRouteOnMap = (viewer, route, color = '#FF0000', isCurrentJourney = false) => {
  console.log('\n🗺️  PLOTTING ROUTE');

  if (!viewer) {
    console.error('❌ No viewer!');
    return;
  }

  if (!route || route.length === 0) {
    console.error('❌ No route!');
    return;
  }

  console.log('✅', route.length, 'waypoints, color:', color);

  try {
    viewer.entities.removeAll();
    console.log('🧹 Cleared old entities');

    const positions = [];
    
    for (let i = 0; i < route.length; i++) {
      const pt = route[i];
      const lon = parseFloat(pt.lon);
      const lat = parseFloat(pt.lat);
      
      if (isNaN(lon) || isNaN(lat)) {
        console.error(`   ❌ Invalid: ${pt.name}`);
        continue;
      }
      
      console.log(`   ${i+1}. ${pt.name} [${lat}, ${lon}]`);
      positions.push(window.Cesium.Cartesian3.fromDegrees(lon, lat));
    }

    console.log('✅', positions.length, 'positions created');

    if (positions.length === 0) {
      alert('No valid coordinates!');
      return;
    }

    // Draw line
    viewer.entities.add({
      name: 'Route',
      polyline: {
        positions: positions,
        width: 10,
        material: window.Cesium.Color.fromCssColorString(color)
      }
    });
    console.log('✅ Line drawn');

    // Add markers
    for (let i = 0; i < route.length; i++) {
      const pt = route[i];
      const lon = parseFloat(pt.lon);
      const lat = parseFloat(pt.lat);
      
      if (isNaN(lon) || isNaN(lat)) continue;

      const isFirst = i === 0;
      const isLast = i === route.length - 1;
      
      let col = window.Cesium.Color.YELLOW;
      let size = 15;
      
      if (isFirst) {
        col = window.Cesium.Color.GREEN;
        size = 25;
      } else if (isLast) {
        col = window.Cesium.Color.RED;
        size = 25;
      }

      viewer.entities.add({
        name: pt.name,
        position: window.Cesium.Cartesian3.fromDegrees(lon, lat),
        point: {
          pixelSize: size,
          color: col,
          outlineColor: window.Cesium.Color.WHITE,
          outlineWidth: 4
        },
        label: {
          text: pt.name,
          font: 'bold 16px Arial',
          fillColor: window.Cesium.Color.WHITE,
          outlineColor: window.Cesium.Color.BLACK,
          outlineWidth: 3,
          style: window.Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new window.Cesium.Cartesian2(0, -30),
          verticalOrigin: window.Cesium.VerticalOrigin.BOTTOM
        }
      });
    }
    console.log('✅ Markers added');

    // Move camera
    const bounds = window.Cesium.BoundingSphere.fromPoints(positions);
    viewer.camera.flyToBoundingSphere(bounds, {
      duration: 3,
      offset: new window.Cesium.HeadingPitchRange(0, -0.35, bounds.radius * 2.5)
    });
    console.log('✅ Camera moving');
    console.log('✅ PLOTTING COMPLETE!\n');

  } catch (error) {
    console.error('❌ PLOT ERROR:', error.message);
    alert('Plotting failed: ' + error.message);
  }
};

/**
 * Destroy viewer
 */
export const destroyCesiumViewer = (viewer) => {
  if (viewer) {
    try {
      viewer.destroy();
      console.log('✅ Viewer destroyed');
    } catch (e) {
      console.error('❌ Destroy error:', e);
    }
  }
};
