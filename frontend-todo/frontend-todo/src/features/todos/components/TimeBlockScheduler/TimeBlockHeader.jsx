import React from 'react';
import { Clock, ChevronLeft, ChevronRight, Calendar, Plus } from 'lucide-react';
import { format, addDays, subDays } from 'date-fns';

const TimeBlockHeader = ({ 
  currentDate, 
  viewMode, 
  setViewMode, 
  onPrevDate, 
  onNextDate, 
  onAddBlock 
}) => {
  return (
    <div className="p-6 border-b border-slate-700/50 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-600/20 rounded-2xl border border-purple-500/30">
            <Clock className="text-purple-400" size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Focus Timeline</h2>
            <p className="text-sm text-slate-400 font-medium">Schedule your deep work sessions</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1 bg-slate-900/50 rounded-xl border border-slate-700/50">
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'day'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'week'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between bg-slate-900/40 p-2 rounded-2xl border border-slate-700/50 mb-8">
        <button
          onClick={onPrevDate}
          className="p-2.5 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          <Calendar size={20} className="text-purple-400" />
          <span className="text-white font-bold tracking-tight">
            {viewMode === 'day' 
              ? format(currentDate, 'EEEE, MMMM d, yyyy')
              : `${format(currentDate, 'MMM d')} - ${format(addDays(currentDate, 7), 'MMM d, yyyy')}`}
          </span>
        </div>

        <button
          onClick={onNextDate}
          className="p-2.5 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      <button
        onClick={onAddBlock}
        className="w-full px-6 py-3.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
      >
        <Plus size={20} />
        Initialize Time Block
      </button>
    </div>
  );
};

export default TimeBlockHeader;
