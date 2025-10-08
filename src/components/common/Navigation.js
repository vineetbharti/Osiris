import React from 'react';
import { LogOut } from 'lucide-react';

const Navigation = ({ title, subtitle, icon: Icon, onLogout }) => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            {Icon && <Icon className="w-8 h-8 text-blue-600" />}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
              {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
