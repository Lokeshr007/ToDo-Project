// frontend/src/features/profile/components/sidebar/StatsCard.jsx
import React from 'react';

const StatsCard = ({ stats }) => {
  if (!stats) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistics</h3>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tasks Completed</span>
          <span className="text-2xl font-bold text-gray-900">{stats.tasksCompleted || 0}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Projects Created</span>
          <span className="text-2xl font-bold text-gray-900">{stats.projectsCreated || 0}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Days Active</span>
          <span className="text-2xl font-bold text-gray-900">{stats.daysActive || 0}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Current Streak</span>
          <span className="text-2xl font-bold text-gray-900">{stats.currentStreak || 0} days</span>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Productivity Score</span>
            <span className="text-lg font-bold text-green-600">{stats.productivityScore || 0}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              style={{ width: `${stats.productivityScore || 0}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Completion Rate</p>
            <p className="text-lg font-semibold text-gray-900">{stats.completionRate?.toFixed(1) || 0}%</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-500">Focus Time</p>
            <p className="text-lg font-semibold text-gray-900">{Math.round((stats.focusTime || 0) / 60)}h</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
