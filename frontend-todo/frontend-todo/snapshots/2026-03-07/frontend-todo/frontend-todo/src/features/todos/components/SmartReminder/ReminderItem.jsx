import React from 'react';
import { Bell, Clock, ChevronRight, Trash2 } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';

const ReminderItem = ({ reminder, onSnooze, onDelete }) => {
  const reminderTime = new Date(reminder.scheduledFor);
  const isSoon = differenceInMinutes(reminderTime, new Date()) <= 30;

  return (
    <div
      className={`p-4 bg-slate-800/40 rounded-xl border ${
        isSoon ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-slate-700/50'
      } hover:border-slate-600 transition-all group`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className={`p-2 rounded-lg ${isSoon ? 'bg-yellow-500/20' : 'bg-slate-700/50'}`}>
            <Bell
              size={18}
              className={isSoon ? 'text-yellow-400 animate-pulse' : 'text-slate-400'}
            />
          </div>
          <div className="flex-1">
            <h4 className="text-white font-bold text-base">{reminder.title}</h4>
            {reminder.description && (
              <p className="text-sm text-slate-400 mt-1 line-clamp-1">{reminder.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-xs">
              <span className={`flex items-center gap-1.5 font-medium ${isSoon ? 'text-yellow-400' : 'text-slate-400'}`}>
                <Clock size={14} />
                {format(reminderTime, 'MMM d, h:mm a')}
              </span>
              {reminder.todo && (
                <span className="flex items-center gap-1.5 text-purple-400 font-bold max-w-[150px] truncate">
                  <ChevronRight size={14} />
                  {reminder.todo.title || reminder.todo.item}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-10 sm:opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onSnooze(reminder.id, 15)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            title="Snooze 15 minutes"
          >
            <Clock size={16} />
          </button>
          <button
            onClick={() => onDelete(reminder.id)}
            className="p-2 hover:bg-slate-700 rounded-lg text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReminderItem;
