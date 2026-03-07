import React from 'react';
import { CheckCircle, Clock, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const ProjectListView = ({ 
  boards, 
  filterTasks, 
  themeStyles, 
  getStatusColor, 
  getPriorityColor, 
  setSelectedTask, 
  setShowTaskModal 
}) => {
  return (
    <div className={`${themeStyles.card} rounded-3xl border ${themeStyles.border} overflow-hidden backdrop-blur-md bg-opacity-40 shadow-2xl`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-900/50 border-b border-slate-700/50">
            <tr>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Task Objective</th>
              <th className="px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Phase</th>
              <th className="hidden sm:table-cell px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Sensitivity</th>
              <th className="hidden md:table-cell px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ownership</th>
              <th className="hidden lg:table-cell px-6 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Deadline</th>
              <th className="px-6 py-5 text-right text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Ops</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {boards.flatMap(board => 
              filterTasks(board.todos)?.map(todo => (
                <tr 
                  key={todo.id} 
                  className="hover:bg-slate-800/40 cursor-pointer transition-colors group" 
                  onClick={() => {
                    setSelectedTask(todo);
                    setShowTaskModal(true);
                  }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className={`p-1 rounded-full ${todo.status === 'COMPLETED' ? 'bg-green-500/20' : 'bg-slate-700/50'}`}>
                        <CheckCircle size={14} className={todo.status === 'COMPLETED' ? 'text-green-400' : 'text-slate-500'} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold tracking-tight ${todo.status === 'COMPLETED' ? 'text-slate-500 line-through' : 'text-white'}`}>
                          {todo.item}
                        </span>
                        {todo.description && (
                          <span className="text-[10px] text-slate-500 font-medium truncate max-w-[200px]">
                            {todo.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusColor(todo.status)} border border-current opacity-70`}>
                      {todo.status || 'PENDING'}
                    </span>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4">
                    {todo.priority && (
                      <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getPriorityColor(todo.priority)}`}>
                        {todo.priority}
                      </span>
                    )}
                  </td>
                  <td className="hidden md:table-cell px-6 py-4">
                    {todo.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-white uppercase border border-slate-600">
                          {todo.assignedTo.name?.[0] || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-400">{todo.assignedTo.name || 'User'}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Unassigned</span>
                    )}
                  </td>
                  <td className="hidden lg:table-cell px-6 py-4">
                    {todo.dueDate ? (
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Clock size={12} className="text-slate-500" />
                        {format(new Date(todo.dueDate), 'MMM dd, yyyy')}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">TBD</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-white">
                        <Edit2 size={14} />
                      </button>
                      <button className="p-2 hover:bg-red-500/20 rounded-xl transition-all text-slate-500 hover:text-red-400">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProjectListView;
