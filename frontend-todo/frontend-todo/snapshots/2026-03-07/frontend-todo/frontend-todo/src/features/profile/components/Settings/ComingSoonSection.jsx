import React from 'react';
import { Sparkles } from 'lucide-react';

const ComingSoonBadge = ({ feature, previewMode, onFeatureClick }) => (
  <div className="relative group">
    <button
      onClick={() => onFeatureClick?.(feature)}
      className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-500/30 hover:border-blue-500/50 transition-all"
    >
      <Sparkles size={12} className="text-blue-400" />
      Coming Soon
    </button>
    {previewMode && (
      <div className="absolute inset-0 bg-blue-500/10 rounded-xl animate-pulse pointer-events-none" />
    )}
  </div>
);

const ComingSoonSection = ({ title, description, icon: Icon, features = [], previewMode, onFeatureClick }) => {
  return (
    <div className="relative bg-slate-800/40 backdrop-blur-3xl rounded-3xl border border-slate-700/50 p-8 mb-8 overflow-hidden group shadow-2xl">
      {/* Dynamic Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.3) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />
      </div>

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center gap-6 mb-10">
          <div className="p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-2xl shadow-blue-500/20">
            <Icon size={28} className="text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{title}</h3>
            <p className="text-sm font-medium text-slate-400 max-w-xl">{description}</p>
          </div>
          <ComingSoonBadge feature={title} previewMode={previewMode} onFeatureClick={onFeatureClick} />
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <button
              key={index}
              onClick={() => onFeatureClick?.(feature.name)}
              className="group/feature relative w-full text-left p-4 bg-slate-900/40 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/60 transition-all duration-300"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${feature.color || 'bg-blue-500/10'} transition-transform group-hover/feature:scale-110`}>
                  {feature.icon && <feature.icon size={18} className={feature.iconColor || 'text-blue-400'} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-white uppercase tracking-tight truncate">{feature.name}</p>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter truncate opacity-70 group-hover/feature:opacity-100 transition-opacity">
                    {feature.description}
                  </p>
                </div>
                <Sparkles size={14} className="text-blue-400 opacity-0 group-hover/feature:opacity-100 transition-opacity" />
              </div>

              {previewMode && (
                <div className="absolute inset-0 bg-blue-500/5 rounded-2xl pointer-events-none" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export { ComingSoonSection, ComingSoonBadge };
