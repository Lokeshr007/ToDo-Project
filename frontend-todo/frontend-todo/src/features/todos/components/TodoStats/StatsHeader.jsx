import React from 'react';

const StatsHeader = ({ stats }) => {
  return (
    <div className="flex flex-wrap gap-3 mt-2 text-sm">
      <span className="text-gray-400">
        <span className="text-white font-medium">{stats.pending}</span> pending
      </span>
      <span className="text-gray-400">•</span>
      <span className="text-gray-400">
        <span className="text-green-400 font-medium">{stats.completed}</span> completed
      </span>
      <span className="text-gray-400">•</span>
      <span className="text-gray-400">
        <span className="text-red-400 font-medium">{stats.overdue}</span> overdue
      </span>
      {stats.dueToday > 0 && (
        <>
          <span className="text-gray-400">•</span>
          <span className="text-gray-400">
            <span className="text-yellow-400 font-medium">{stats.dueToday}</span> due today
          </span>
        </>
      )}
    </div>
  );
};

export default StatsHeader;