import React from 'react';
import { ChevronRight, Clock, Kanban, Table, Calendar as CalendarIcon, GanttChart, Filter, Share2, Settings, Search } from 'lucide-react';
import { format } from 'date-fns';

const ProjectHeader = ({ 
  project, 
  view, 
  setView, 
  hideEmptyColumns, 
  setHideEmptyColumns, 
  searchQuery, 
  setSearchQuery, 
  showFilters, 
  setShowFilters, 
  filters, 
  onBack,
  themeStyles,
  boards,
  activeBoardId,
  setActiveBoardId
}) => {
  return (
    <div className={`border-b ${themeStyles.border} ${themeStyles.header} sticky top-0 z-10 backdrop-blur-lg bg-opacity-90`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg ${themeStyles.hover} transition-colors`}
            >
              <ChevronRight size={20} className={`${themeStyles.textSecondary} rotate-180`} />
            </button>
            
            <div>
              <h1 className={`text-2xl font-bold ${themeStyles.text}`}>{project?.name}</h1>
              <p className={`text-sm ${themeStyles.textSecondary} mt-1 flex items-center gap-2 font-medium`}>
                <Clock size={14} className="text-blue-400" />
                Last activity {project?.updatedAt ? format(new Date(project.updatedAt), 'MMM dd, yyyy') : 'N/A'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Multi-Toggle */}
            <div className={`flex p-1 rounded-xl border ${themeStyles.border} bg-slate-900/50 shadow-inner`}>
              {[
                { id: 'board', icon: Kanban, label: 'Board' },
                { id: 'list', icon: Table, label: 'List' },
                { id: 'calendar', icon: CalendarIcon, label: 'Calendar' },
                { id: 'timeline', icon: GanttChart, label: 'Timeline' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
                    view === item.id 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : themeStyles.textSecondary + ' ' + themeStyles.hover
                  }`}
                  title={`${item.label} View`}
                >
                  <item.icon size={18} />
                  {view === item.id && <span className="text-xs font-bold uppercase tracking-wider hidden sm:inline">{item.label}</span>}
                </button>
              ))}
            </div>

            <div className="h-8 w-[1px] bg-slate-700 hidden sm:block mx-1" />

            <button 
              onClick={() => setHideEmptyColumns(!hideEmptyColumns)}
              className={`p-2 rounded-xl border transition-all flex items-center gap-2 ${
                hideEmptyColumns 
                  ? 'bg-blue-600/20 border-blue-500/50 text-blue-400' 
                  : 'border-transparent ' + themeStyles.textSecondary + ' ' + themeStyles.hover
              }`}
            >
              <Filter size={18} />
              <span className="text-xs font-bold uppercase tracking-wider hidden lg:inline">{hideEmptyColumns ? "Active only" : "All Columns"}</span>
            </button>
            
            <button className={`p-2 rounded-xl ${themeStyles.hover} transition-colors border border-transparent`}>
              <Share2 size={18} className={themeStyles.textSecondary} />
            </button>
            <button className={`p-2 rounded-xl ${themeStyles.hover} transition-colors border border-transparent`}>
              <Settings size={18} className={themeStyles.textSecondary} />
            </button>
          </div>
        </div>

        {/* Board Tabs */}
        {boards.length > 1 && (
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-hide">
            {boards.map(board => {
              const totalTasks = board.columns?.reduce((acc, col) => acc + (col.tasks?.length || 0), 0) || 0;
              const completedTasks = board.columns?.find(col => col.type === 'DONE')?.tasks?.length || 0;
              const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

              return (
                <button
                  key={board.id}
                  onClick={() => setActiveBoardId(board.id)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-2xl border transition-all flex flex-col items-start gap-1.5 ${
                    activeBoardId === board.id 
                      ? 'bg-blue-600/10 border-blue-500/40 text-white ring-1 ring-blue-500/20' 
                      : 'bg-slate-800/20 border-slate-700/50 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm font-bold whitespace-nowrap tracking-tight">{board.name}</span>
                  <div className="flex items-center gap-3 w-full min-w-[100px]">
                    <div className="flex-1 h-1 bg-slate-700/50 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-700 ease-out ${progress === 100 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]'}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold opacity-70 tracking-tighter">{progress}%</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Search & Global Filter Trigger */}
        <div className="flex items-center gap-3 mt-6">
          <div className={`flex-1 relative group`}>
            <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${themeStyles.textSecondary} group-focus-within:text-blue-400 transition-colors`} size={18} />
            <input
              type="text"
              placeholder="Deep search across project tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-12 pr-4 py-3 rounded-2xl ${themeStyles.input} border ${themeStyles.border} ${themeStyles.text} focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium text-sm placeholder:text-slate-600`}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-2xl border transition-all relative ${
              showFilters 
                ? 'bg-blue-600/10 border-blue-500/50 text-blue-400' 
                : themeStyles.border + ' ' + themeStyles.hover
            }`}
          >
            <Filter size={20} className={showFilters ? 'text-blue-400' : themeStyles.textSecondary} />
            {(filters.assignee !== 'all' || filters.priority !== 'all' || filters.status !== 'all') && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-slate-900 shadow-lg"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectHeader;
