import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const ProjectCalendarView = ({ tasks, themeStyles, onTaskClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const days = [];
    
    // Previous month days
    for (let i = 0; i < firstDay.getDay(); i++) {
      const date = new Date(year, month, -i);
      days.unshift({ date, isCurrentMonth: false });
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    
    setCalendarDays(days);
  };

  const changeMonth = (increment) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + increment, 1));
  };

  const getTasksForDate = (date) => {
    return tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate).toDateString() === date.toDateString()
    );
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-slate-900/40 p-4 rounded-2xl border border-slate-700/50">
        <h2 className={`text-xl font-bold ${themeStyles.text} tracking-tight`}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className={`p-2 rounded-xl ${themeStyles.hover} transition-all border border-transparent hover:border-slate-700`}
          >
            <ChevronRight size={20} className={`${themeStyles.textSecondary} rotate-180`} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className={`px-5 py-2 rounded-xl ${themeStyles.hover} ${themeStyles.textSecondary} text-xs font-bold uppercase tracking-widest transition-all border border-transparent hover:border-slate-700`}
          >
            Present
          </button>
          <button
            onClick={() => changeMonth(1)}
            className={`p-2 rounded-xl ${themeStyles.hover} transition-all border border-transparent hover:border-slate-700`}
          >
            <ChevronRight size={20} className={themeStyles.textSecondary} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-slate-700/50 rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl">
        {weekDays.map(day => (
          <div key={day} className={`p-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 bg-slate-900`}>
            {day}
          </div>
        ))}

        {calendarDays.map(({ date, isCurrentMonth }, index) => {
          const dayTasks = getTasksForDate(date);
          const isToday = date.toDateString() === new Date().toDateString();
          
          return (
            <div
              key={index}
              className={`min-h-[120px] sm:min-h-[150px] p-2 transition-colors ${
                isCurrentMonth ? 'bg-slate-900/80 hover:bg-slate-800/80' : 'bg-slate-950/50 opacity-30 select-none'
              } ${isToday ? 'bg-blue-600/5 ring-inset ring-2 ring-blue-500/30' : ''}`}
            >
              <div className="flex items-center justify-between px-1.5 pt-1.5 mb-3">
                <span className={`text-xs font-bold leading-none ${isToday ? 'text-blue-400' : 'text-slate-500'}`}>
                  {date.getDate().toString().padStart(2, '0')}
                </span>
                {dayTasks.length > 0 && (
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/20`}>
                    {dayTasks.length}
                  </span>
                )}
              </div>
              
              <div className="space-y-1.5 max-h-[80px] sm:max-h-[100px] overflow-y-auto scrollbar-none px-1">
                {dayTasks.map(task => (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full text-left text-[10px] p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-700/50 transition-all truncate font-bold text-slate-200 shadow-sm"
                    title={task.item}
                  >
                    <span className="opacity-50 mr-1.5">●</span>
                    {task.item}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectCalendarView;
