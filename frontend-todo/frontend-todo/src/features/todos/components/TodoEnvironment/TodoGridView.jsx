import React from 'react';
import { Clock, Flag, FolderKanban, Edit2, Trash2CheckCircle, CheckCircle, Hash } from 'lucide-react';
import { format } from 'date-fns';

const TodoGridView = ({ tasks, onToggleStatus, onEdit, onDelete, getPriorityBadge, getStatusBadge }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map(task => (
        <div
          key={task.id}
          className="bg-slate-900/60 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-slate-800/50 hover:border-blue-500/30 hover:bg-slate-800/40 transition-all group shadow-2xl relative overflow-hidden"
        >
          {/* Subtle Priority Decoration */}
          <div className={`absolute top-0 right-0 w-24 h-1 bg-gradient-to-r ${
            task.priority === 'HIGH' ? 'from-red-500' : 
            task.priority === 'MEDIUM' ? 'from-amber-500' : 'from-blue-500'
          } to-transparent opacity-20`} />

          <div className="flex items-start justify-between mb-6">
            <button
               onClick={() => onToggleStatus(task.id, task.status)}
               className={`w-7 h-7 rounded-xl border-2 transition-all flex items-center justify-center ${
                 task.status === 'COMPLETED' 
                   ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' 
                   : 'border-slate-800'
               }`}
             >
               {task.status === 'COMPLETED' && <CheckCircle size={14} strokeWidth={3} />}
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(task)}
                className="p-2.5 bg-slate-800/50 text-slate-500 hover:text-white hover:bg-slate-700 rounded-xl transition-all border border-slate-700/50"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="p-2.5 bg-red-500/5 text-red-500/50 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/10"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          <h3 className={`text-xl font-black uppercase tracking-tight mb-4 ${
            task.status === 'COMPLETED' ? 'line-through text-slate-600' : 'text-white'
          }`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className="text-sm font-bold text-slate-500 mb-8 line-clamp-3 italic leading-relaxed opacity-80">{task.description}</p>
          )}

          <div className="space-y-4">
             <div className="flex flex-wrap gap-2">
                {task.priority && (
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg border ${getPriorityBadge(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg ${getStatusBadge(task.status)} uppercase`}>
                  {task.status || 'PENDING'}
                </span>
             </div>
             
             <div className="flex flex-col gap-2 pt-4 border-t border-slate-800/50">
                {task.dueDate && (
                  <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${
                    new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                      ? 'text-red-400'
                      : 'text-slate-600'
                  }`}>
                    <Clock size={12} />
                    {format(new Date(task.dueDate), 'MMM dd | HH:mm')}
                  </div>
                )}

                {task.project && (
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-indigo-400 opacity-60">
                    <FolderKanban size={12} />
                    {task.project.name}
                  </div>
                )}
             </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoGridView;
