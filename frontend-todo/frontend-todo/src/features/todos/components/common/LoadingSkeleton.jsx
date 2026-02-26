import React from 'react';

const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-4 sm:p-6">
      <div className="animate-pulse">
        <div className="h-10 bg-gray-800 rounded mb-6" />
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-24 bg-gray-800 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;