import React from 'react';
import { Plus, Search, ListTodo, Grid, Calendar } from 'lucide-react';

const TodoHeader = ({ 
  searchQuery, 
  setSearchQuery, 
  filters, 
  setFilters, 
  projects, 
  sortBy, 
  setSortBy, 
  viewMode, 
  setViewMode, 
  onNewTask 
}) => {
  return (
    <div className="border-b border-slate-700/50 bg-slate-900/60 backdrop-blur-3xl sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/30">
              <ListTodo size={24} className="text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Mission Control</h1>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1">Operational Directives</p>
            </div>
          </div>
          <button
            onClick={onNewTask}
            className="flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-900/40 group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" />
            Initialize Objective
          </button>
        </div>

        {/* Intelligence Filter Matrix */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[300px] relative group">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 group-hover:text-blue-400 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Query objectives..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-5 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'status', options: [
                { val: 'all', label: 'All Status' },
                { val: 'pending', label: 'Phase: Queue' },
                { val: 'in_progress', label: 'Phase: Active' },
                { val: 'completed', label: 'Phase: Archive' },
                { val: 'backlog', label: 'Phase: Staging' },
                { val: 'review', label: 'Phase: Vision' },
                { val: 'blocked', label: 'State: Locked' }
              ]},
              { id: 'priority', options: [
                { val: 'all', label: 'All Urgency' },
                { val: 'HIGH', label: 'Level 1: Fatal' },
                { val: 'MEDIUM', label: 'Level 2: Urgent' },
                { val: 'NORMAL', label: 'Level 3: Operational' },
                { val: 'LOW', label: 'Level 4: Routine' }
              ]},
              { id: 'date', options: [
                { val: 'all', label: 'Temporal Scope' },
                { val: 'today', label: 'Window: Today' },
                { val: 'tomorrow', label: 'Window: T+1' },
                { val: 'week', label: 'Block: Current Week' },
                { val: 'overdue', label: 'State: Breach' }
              ]}
            ].map(filter => (
              <select
                key={filter.id}
                value={filters[filter.id]}
                onChange={(e) => setFilters({ ...filters, [filter.id]: e.target.value })}
                className="px-4 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer hover:bg-slate-900"
              >
                {filter.options.map(opt => (
                  <option key={opt.val} value={opt.val} className="bg-slate-900">{opt.label}</option>
                ))}
              </select>
            ))}

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3.5 bg-slate-950/50 border border-slate-700/50 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 cursor-pointer hover:bg-slate-900"
            >
              <option value="dueDate">Vector: Timeline</option>
              <option value="priority">Vector: Magnitude</option>
              <option value="status">Vector: Phase</option>
              <option value="created">Vector: Origin</option>
            </select>

            <div className="flex bg-slate-950/50 p-1 rounded-xl border border-slate-700/50">
              {[
                { id: 'list', icon: ListTodo },
                { id: 'grid', icon: Grid },
                { id: 'calendar', icon: Calendar }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setViewMode(mode.id)}
                  className={`p-2.5 rounded-lg transition-all ${
                    viewMode === mode.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <mode.icon size={18} strokeWidth={3} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodoHeader;
