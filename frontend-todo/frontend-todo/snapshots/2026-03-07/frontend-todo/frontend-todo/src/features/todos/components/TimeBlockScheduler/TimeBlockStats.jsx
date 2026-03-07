import React from 'react';

const TimeBlockStats = ({ stats, blockCount }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-8 mb-8">
      <div className="bg-slate-700/20 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Time Planned</p>
        <p className="text-xl font-bold text-white">
          {Math.floor(stats.totalPlanned / 60)}h <span className="text-slate-500 text-sm font-medium">{stats.totalPlanned % 60}m</span>
        </p>
      </div>
      <div className="bg-slate-700/20 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Execution</p>
        <p className="text-xl font-bold text-green-400">
          {stats.totalCompleted}<span className="text-slate-500 text-sm font-medium">/{blockCount}</span>
        </p>
      </div>
      <div className="bg-slate-700/20 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Focus Score</p>
        <p className="text-xl font-bold text-purple-400">{stats.focusScore}<span className="text-slate-500 text-sm font-medium">%</span></p>
      </div>
      <div className="bg-slate-700/20 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Productivity</p>
        <p className="text-xl font-bold text-blue-400">{stats.productivity}<span className="text-slate-500 text-sm font-medium">%</span></p>
      </div>
    </div>
  );
};

export default TimeBlockStats;
