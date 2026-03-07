import React from 'react';
import { Target, Award, CheckCircle, Flame, BarChart3 } from 'lucide-react';

const GoalStats = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-700/50">
        <p className="text-xs text-slate-400">Active Goals</p>
        <p className="text-2xl font-bold text-white">{stats.totalGoals}</p>
      </div>
      <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-700/50">
        <p className="text-xs text-slate-400">Completed</p>
        <p className="text-2xl font-bold text-green-400">{stats.completedGoals}</p>
      </div>
      <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-700/50">
        <p className="text-xs text-slate-400">In Progress</p>
        <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
      </div>
      <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-700/50">
        <div className="flex items-center gap-1">
          <Flame size={14} className="text-orange-400" />
          <p className="text-xs text-slate-400">Streak</p>
        </div>
        <p className="text-2xl font-bold text-orange-400">{stats.streak} days</p>
      </div>
      <div className="bg-slate-700/30 rounded-xl p-3 border border-slate-700/50">
        <p className="text-xs text-slate-400">Consistency</p>
        <p className="text-2xl font-bold text-purple-400">{stats.consistency}%</p>
      </div>
    </div>
  );
};

export default GoalStats;
