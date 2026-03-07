import React from 'react';
import { Target, Calendar, CheckCircle, Award, Edit2, Trash2, Flame } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const GoalItem = ({ goal, todos, onEdit, onDelete, getGoalTypeColor }) => {
  return (
    <div
      className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3 flex-1">
          <div
            className="w-1 h-12 rounded-full"
            style={{ backgroundColor: goal.color }}
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-medium text-white">{goal.title}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${getGoalTypeColor(goal.type)}`}>
                {goal.type}
              </span>
              {goal.progress >= 100 && (
                <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full flex items-center gap-1">
                  <Award size={12} />
                  Achieved
                </span>
              )}
            </div>
            
            {goal.description && (
              <p className="text-sm text-slate-400 mb-3 line-clamp-2">{goal.description}</p>
            )}

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className="text-white font-medium">{goal.progress}%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${goal.progress}%`,
                    backgroundColor: goal.color
                  }}
                />
              </div>
            </div>

            {/* Goal Details */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              <div className="flex items-center gap-1 text-slate-400">
                <Target size={14} />
                Target: {goal.target} {goal.unit}
              </div>
              <div className="flex items-center gap-1 text-slate-400">
                <Calendar size={14} />
                {format(parseISO(goal.startDate), 'MMM d')} - {format(parseISO(goal.endDate), 'MMM d')}
              </div>
              {goal.linkedTasks?.length > 0 && (
                <div className="flex items-center gap-1 text-slate-400">
                  <CheckCircle size={14} />
                  {goal.linkedTasks.length} linked tasks
                </div>
              )}
            </div>

            {/* Linked Tasks Progress */}
            {goal.linkedTasks?.length > 0 && (
              <div className="mt-3 space-y-1">
                {goal.linkedTasks.map(taskId => {
                  const task = todos.find(t => String(t.id) === String(taskId));
                  if (!task) return null;
                  
                  return (
                    <div key={taskId} className="flex items-center gap-2 text-xs">
                      <div className={`w-2 h-2 rounded-full ${
                        task.status === 'COMPLETED' ? 'bg-green-400' : 'bg-yellow-400'
                      }`} />
                      <span className={task.status === 'COMPLETED' ? 'text-green-400' : 'text-slate-300 truncate'}>
                        {task.title || task.item}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(goal)}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(goal.id)}
            className="p-2 hover:bg-slate-700 rounded-lg text-red-400 hover:text-red-300 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Daily Streak Indicator (for daily goals) */}
      {goal.type === 'daily' && goal.completedDates?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm text-slate-300">
              Completed {goal.completedDates.length} days
            </span>
            <div className="flex gap-1 ml-2">
              {goal.completedDates.slice(-7).map((date, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded bg-green-500/20 border border-green-500/30 flex items-center justify-center"
                  title={format(parseISO(date), 'MMM d')}
                >
                  <CheckCircle size={12} className="text-green-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalItem;
