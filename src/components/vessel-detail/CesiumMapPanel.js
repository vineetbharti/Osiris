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
          style={{ 
            width: '100%', 
            height: '600px',
            position: 'relative',
            minHeight: '600px'
          }}
        >
          {typeof window.Cesium === 'undefined' && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1e293b',
              color: 'white'
            }}>
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <MapPin style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#94a3b8' }} />
                <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>CesiumJS Not Loaded</p>
                <p style={{ fontSize: '14px', color: '#94a3b8' }}>Please include Cesium library to view the map</p>
                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '16px' }}>
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
