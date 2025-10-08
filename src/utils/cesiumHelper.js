/**
 * Initialize Cesium viewer with OpenStreetMap
 */
export const initializeCesiumViewer = (containerRef) => {
  if (typeof window.Cesium === 'undefined') {
    console.warn('Cesium library not loaded');
    return null;
  }

  try {
    const viewer = new window.Cesium.Viewer(containerRef, {
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

    return viewer;
  } catch (error) {
    console.error('Error initializing Cesium:', error);
    return null;
  }
};

/**
 * Plot route on Cesium map
 */
export const plotRouteOnMap = (viewer, route, color = '#FF0000', isCurrentJourney = false) => {
  if (!viewer || !route || route.length === 0) return;

  // Clear existing entities
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

/**
 * Destroy Cesium viewer safely
 */
export const destroyCesiumViewer = (viewer) => {
  if (viewer) {
    try {
      viewer.destroy();
    } catch (error) {
      console.error('Error destroying Cesium viewer:', error);
    }
  }
};
