import React from 'react';
import { Activity, Users, Sparkles } from 'lucide-react';
import { ComingSoonBadge } from './ComingSoonSection';

const SettingsInfoCards = ({ previewMode }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Analytics Card */}
      <div className="bg-slate-800/20 backdrop-blur-3xl rounded-3xl border border-slate-700/50 p-8 group hover:border-blue-500/30 transition-all duration-500">
        <div className="flex items-start justify-between mb-6">
          <div className="p-4 bg-blue-600/20 rounded-2xl border border-blue-500/30 group-hover:scale-110 transition-transform">
            <Activity size={24} className="text-blue-400" />
          </div>
          <ComingSoonBadge feature="Neural Analytics" previewMode={previewMode} />
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Neural Analytics</h3>
        <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed opacity-70">
          Harness AI to decode your productivity vectors, visualize cognitive load, and optimize deep-work cycles.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/30">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Throughput</p>
            <p className="text-2xl font-black text-white tracking-tight">1.2k+</p>
          </div>
          <div className="p-4 bg-slate-900/60 rounded-2xl border border-slate-700/30">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Delta Variance</p>
            <p className="text-2xl font-black text-emerald-400 tracking-tight">+27%</p>
          </div>
        </div>
      </div>

      {/* Team Card */}
      <div className="bg-slate-800/20 backdrop-blur-3xl rounded-3xl border border-slate-700/50 p-8 group hover:border-purple-500/30 transition-all duration-500">
        <div className="flex items-start justify-between mb-6">
          <div className="p-4 bg-purple-600/20 rounded-2xl border border-purple-500/30 group-hover:scale-110 transition-transform">
            <Users size={24} className="text-purple-400" />
          </div>
          <ComingSoonBadge feature="Nexus Protocol" previewMode={previewMode} />
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Nexus Protocol</h3>
        <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed opacity-70">
          Orchestrate multi-tenant operations, synchronize cross-functional nodes, and manage permission matrices.
        </p>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 border-2 border-slate-900 flex items-center justify-center text-white text-[10px] font-black uppercase ring-2 ring-transparent group-hover:ring-purple-500/30 transition-all">
                U{i}
              </div>
            ))}
          </div>
          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 text-[10px] font-black border border-slate-700/50 shadow-inner">
            +5
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-2">Active Nodes</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsInfoCards;
