import React from 'react';
import { Settings as SettingsIcon, Eye, EyeOff, Save, RefreshCw, Loader } from 'lucide-react';

const SettingsHeader = ({ 
  previewMode, 
  togglePreviewMode, 
  hasChanges, 
  saveSettings, 
  resetSettings, 
  loading 
}) => {
  return (
    <div className="border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-3xl sticky top-0 z-20 transition-all">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-blue-600/20 rounded-3xl border border-blue-500/30 shadow-2xl shadow-blue-900/20">
              <SettingsIcon size={32} className="text-blue-400 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-2">Systems</h1>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                Control & Preferences
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Preview Toggle */}
            <button
              onClick={togglePreviewMode}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all font-black text-[10px] uppercase tracking-widest ${
                previewMode
                  ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                  : 'bg-slate-800/80 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {previewMode ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>Preview: {previewMode ? 'Active' : 'Offline'}</span>
            </button>

            {/* Save Action */}
            <div className="flex items-center gap-2">
              {hasChanges && (
                <button
                  onClick={saveSettings}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-xl shadow-blue-900/30 font-black text-[10px] uppercase tracking-widest disabled:opacity-50"
                >
                  {loading ? <Loader size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{loading ? 'Committing...' : 'Commit Changes'}</span>
                </button>
              )}

              <button
                onClick={resetSettings}
                className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-400 hover:text-white transition-all hover:rotate-180 duration-500"
                title="Reset Parameters"
              >
                <RefreshCw size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsHeader;
