import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TodoCalendarView = ({ tasks, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const getTasksForDate = (date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  return (
    <div className="bg-slate-900/60 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800/50 p-8 shadow-2xl">
      <div className="flex items-center justify-between mb-10">
        <div>
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter">
            {monthName} <span className="text-blue-500">{year}</span>
          </h2>
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Temporal Grid Alignment</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => changeMonth(-1)}
            className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-xl transition-all border border-slate-700/50"
          >
            <ChevronDown size={18} className="text-slate-400 rotate-90" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-6 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-3 bg-slate-800/50 hover:bg-slate-700 rounded-xl transition-all border border-slate-700/50"
          >
            <ChevronDown size={18} className="text-slate-400 -rotate-90" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] py-4">
            {day}
          </div>
        ))}

        {Array.from({ length: firstDayOfMonth }).map((_, i) => (
          <div key={`empty-${i}`} className="h-32 bg-slate-950/20 rounded-2xl border border-slate-800/20 opacity-30" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, i) => {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i + 1);
          const dayTasks = getTasksForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();

          return (
            <div
              key={i}
              className={`h-32 p-3 rounded-2xl border transition-all cursor-pointer group ${
                isToday 
                  ? 'border-blue-500/50 bg-blue-500/5' 
                  : 'border-slate-800 bg-slate-950/40 hover:bg-slate-800/40 hover:border-slate-700'
              } overflow-hidden`}
              onClick={() => {
                if (dayTasks.length > 0) {
                  onTaskClick(dayTasks[0]);
                }
              }}
            >
              <div className={`text-xs font-black mb-3 ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>{i + 1}</div>
              <div className="space-y-1.5">
                {dayTasks.slice(0, 2).map(task => (
                  <div
                    key={task.id}
                    className={`text-[9px] px-2 py-1 font-black uppercase rounded-lg border truncate ${
                      task.status === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-500/60 border-emerald-500/20 line-through'
                        : 'bg-blue-600/10 text-blue-400 border-blue-500/20'
                    }`}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 2 && (
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-tighter pl-1">
                    +{dayTasks.length - 2} More Modules
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TodoCalendarView;
