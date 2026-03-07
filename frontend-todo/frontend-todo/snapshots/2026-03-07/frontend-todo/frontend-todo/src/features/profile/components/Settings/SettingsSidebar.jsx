import React from 'react';

const SettingsSidebar = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full md:w-80 flex-shrink-0">
      <div className="bg-slate-800/40 backdrop-blur-3xl rounded-3xl border border-slate-700/50 overflow-hidden shadow-2xl">
        <div className="p-8 border-b border-slate-700/50">
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Command Center</h2>
          <p className="text-xs font-bold text-slate-500 uppercase mt-1 tracking-widest">System Configuration</p>
        </div>
        <nav className="p-4 space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all group ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20 translate-x-2'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className={`p-2.5 rounded-xl transition-colors ${
                  isActive ? 'bg-white/20' : 'bg-slate-900 group-hover:bg-slate-700'
                }`}>
                  <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-black uppercase tracking-tight truncate">{tab.label}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-tighter truncate opacity-70 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                    {tab.id.replace('_', ' ')}
                  </span>
                </div>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SettingsSidebar;
