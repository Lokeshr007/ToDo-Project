import React from 'react';
import { Calendar, Sparkles } from 'lucide-react';

const SettingsTimeline = ({ timelineItems }) => {
  return (
    <div className="mt-8 p-8 bg-slate-800/30 backdrop-blur-3xl rounded-3xl border border-slate-700/50 shadow-2xl">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
          <Calendar size={20} className="text-blue-400" />
        </div>
        <h3 className="text-xl font-black text-white uppercase tracking-tighter">Engine Roadmap</h3>
      </div>
      
      <div className="space-y-6">
        {timelineItems.map((item, index) => (
          <div key={index} className="flex flex-col sm:flex-row sm:items-start gap-4 group">
            <div className="w-28 flex-shrink-0 pt-1">
              <span className="text-xs font-black text-blue-400 uppercase tracking-widest">{item.phase}</span>
            </div>
            <div className="flex-1 relative pl-6 before:absolute before:left-0 before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-slate-700/50 group-last:before:hidden">
              <div className="absolute left-[-5px] top-1.5 w-[12px] h-[12px] rounded-full bg-slate-800 border-2 border-slate-600 z-10 group-hover:border-blue-500 transition-colors" />
              
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-1.5 h-1.5 rounded-full ${
                  item.status === 'completed' ? 'bg-emerald-500' :
                  item.status === 'in-progress' ? 'bg-yellow-500 animate-pulse' :
                  'bg-slate-600'
                }`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${
                  item.status === 'completed' ? 'text-emerald-500' :
                  item.status === 'in-progress' ? 'text-yellow-500' :
                  'text-slate-500'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.features.map((feature, i) => (
                  <span key={i} className="px-3 py-1.5 bg-slate-900/60 rounded-xl text-[10px] font-bold text-slate-300 border border-slate-700/50 uppercase tracking-tighter hover:border-blue-500/30 transition-colors">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsTimeline;
