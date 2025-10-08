import React from 'react';

const EmptyState = ({ icon: Icon, title, subtitle }) => {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500 text-lg">{title}</p>
      <p className="text-gray-400 text-sm">{subtitle}</p>
    </div>
  );
};

export default EmptyState;
