import React from 'react';
import { Clock, Flag, Users, FolderKanban, Edit2, Trash2, CheckCircle, Hash } from 'lucide-react';
import { format } from 'date-fns';

const TodoListView = ({ tasks, onToggleStatus, onEdit, onDelete, getPriorityBadge, getStatusBadge }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-800">
        <div className="p-6 bg-slate-800/50 rounded-full mb-6 text-slate-700 animate-pulse">
          <CheckCircle size={64} strokeWidth={1} />
        </div>
        <h3 className="text-xl font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Silence in the Wire</h3>
        <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">Awaiting new directives...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div
          key={task.id}
          className="bg-slate-900/60 backdrop-blur-2xl rounded-[2rem] p-6 border border-slate-800/50 hover:border-blue-500/30 hover:bg-slate-800/40 transition-all group shadow-2xl"
        >
          <div className="flex items-start gap-6">
            <button
              onClick={() => onToggleStatus(task.id, task.status)}
              className={`mt-1.5 w-6 h-6 rounded-xl border-2 transition-all flex items-center justify-center ${
                task.status === 'COMPLETED' 
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-900/20' 
                  : 'border-slate-700 hover:border-blue-500/50 hover:bg-blue-500/10'
              }`}
            >
              {task.status === 'COMPLETED' && <CheckCircle size={16} strokeWidth={3} />}
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className={`text-lg font-black uppercase tracking-tight truncate ${
                    task.status === 'COMPLETED' ? 'line-through text-slate-600' : 'text-white'
                  }`}>
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-sm font-medium text-slate-500 mt-2 line-clamp-2 leading-relaxed italic">{task.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                  <button
                    onClick={() => onEdit(task)}
                    className="p-3 bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all border border-slate-700/50"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(task.id)}
                    className="p-3 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                {task.priority && (
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${getPriorityBadge(task.priority)}`}>
                    <Flag size={10} className="inline-block mr-1.5 -translate-y-[1px]" />
                    {task.priority}
                  </span>
                )}

                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${getStatusBadge(task.status)}`}>
                  <Hash size={10} className="inline-block mr-1.5 -translate-y-[1px]" />
                  {task.status || 'PENDING'}
                </span>

                {task.dueDate && (
                  <span className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-widest ${
                    new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED'
                      ? 'text-red-400'
                      : 'text-slate-500'
                  }`}>
                    <Clock size={12} className="-translate-y-[1px]" />
                    {format(new Date(task.dueDate), 'MMM dd | HH:mm')}
                  </span>
                )}

                {task.assignedTo && (
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    <div className="w-5 h-5 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-400">
                      {task.assignedTo.name?.[0] || 'U'}
                    </div>
                    {task.assignedTo.name}
                  </div>
                )}

                {task.project && (
                  <span className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-slate-500">
                    <FolderKanban size={12} className="text-indigo-400 opacity-50" />
                    {task.project.name}
                  </span>
                )}
                
                <div className="flex flex-wrap gap-2">
                  {task.labels?.map(label => (
                    <span key={label} className="text-[9px] font-black uppercase tracking-tighter px-2.5 py-1 bg-slate-950/50 rounded-lg text-slate-600 border border-slate-800/80">
                      #{label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TodoListView;
