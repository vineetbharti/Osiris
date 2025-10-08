import React from 'react';
import { MapPin } from 'lucide-react';

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

export default CesiumMapPanel;
