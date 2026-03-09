// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\components\LearningPathVisualizer.jsx
import { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  TrendingUp,
  Award,
  Target,
  Flag,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  Star,
  Share2,
  Download,
  Maximize2,
  Minimize2,
  Info
} from 'lucide-react';
import { format, addDays } from 'date-fns';

function LearningPathVisualizer({ path, tasks = [], onMilestoneClick, className = '' }) {
  const [expandedWeeks, setExpandedWeeks] = useState(new Set());
  const [selectedDay, setSelectedDay] = useState(null);
  const [viewMode, setViewMode] = useState('timeline'); // timeline, calendar, progress
  const [zoom, setZoom] = useState(1);

  const weeks = useMemo(() => {
    const weeksMap = {};
    tasks.forEach(task => {
      const week = task.weekNumber || Math.ceil((task.dayNumber || 1) / 7);
      if (!weeksMap[week]) {
        weeksMap[week] = {
          number: week,
          tasks: [],
          days: new Set(),
          completed: 0,
          total: 0
        };
      }
      weeksMap[week].tasks.push(task);
      weeksMap[week].days.add(task.dayNumber);
      if (task.status === 'COMPLETED') {
        weeksMap[week].completed++;
      }
      weeksMap[week].total++;
    });
    
    return Object.values(weeksMap).sort((a, b) => a.number - b.number);
  }, [tasks]);

  const milestones = useMemo(() => {
    return path?.milestones || [
      { day: 15, title: 'First Quarter', description: 'Complete first 25%' },
      { day: 30, title: 'Halfway Point', description: 'Review all material' },
      { day: 45, title: 'Three Quarters', description: 'Advanced topics' },
      { day: 60, title: 'Completion', description: 'Final review' }
    ];
  }, [path]);

  const toggleWeek = (weekNumber) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekNumber)) {
        newSet.delete(weekNumber);
      } else {
        newSet.add(weekNumber);
      }
      return newSet;
    });
  };

  const getWeekProgress = (week) => {
    return week.total > 0 ? (week.completed / week.total) * 100 : 0;
  };

  const getDayStatus = (day) => {
    const dayTasks = tasks.filter(t => t.dayNumber === day);
    if (dayTasks.length === 0) return 'empty';
    if (dayTasks.every(t => t.status === 'COMPLETED')) return 'completed';
    if (dayTasks.some(t => t.status === 'IN_PROGRESS')) return 'in-progress';
    return 'pending';
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return 'bg-green-500';
      case 'in-progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-slate-600';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return 'text-red-400 bg-red-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
      case 'LOW': return 'text-green-400 bg-green-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const calculateProgress = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    return total > 0 ? (completed / total) * 100 : 0;
  };

  const getEstimatedCompletion = () => {
    const progress = calculateProgress();
    if (progress === 0) return 'Not started';
    if (progress >= 100) return 'Completed';
    
    const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;
    const avgPerDay = completedTasks / (new Date() - new Date(path?.startDate)) * (1000 * 60 * 60 * 24);
    const remainingTasks = tasks.length - completedTasks;
    const daysRemaining = Math.ceil(remainingTasks / avgPerDay);
    
    return `${daysRemaining} days remaining`;
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">{path?.title || 'Learning Path'}</h3>
            <p className="text-sm text-slate-400">{path?.description}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'timeline' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp size={18} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'calendar' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar size={18} />
            </button>
            <button
              onClick={() => setViewMode('progress')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'progress' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Target size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-400">Overall Progress</span>
            <span className="text-white font-medium">{calculateProgress().toFixed(1)}%</span>
          </div>
          <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${calculateProgress()}%` }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{tasks.length}</div>
            <div className="text-xs text-slate-400">Total Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {tasks.filter(t => t.status === 'COMPLETED').length}
            </div>
            <div className="text-xs text-slate-400">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {tasks.filter(t => t.status === 'IN_PROGRESS').length}
            </div>
            <div className="text-xs text-slate-400">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-400">{getEstimatedCompletion()}</div>
            <div className="text-xs text-slate-400">Est. Completion</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {viewMode === 'timeline' && (
          <div className="space-y-4">
            {weeks.map(week => (
              <div key={week.number} className="border border-slate-700 rounded-lg overflow-hidden">
                {/* Week Header */}
                <div
                  onClick={() => toggleWeek(week.number)}
                  className="p-4 bg-slate-700/30 cursor-pointer hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {expandedWeeks.has(week.number) ? (
                        <ChevronDown size={18} className="text-slate-400" />
                      ) : (
                        <ChevronRight size={18} className="text-slate-400" />
                      )}
                      <div>
                        <h4 className="font-medium text-white">Week {week.number}</h4>
                        <p className="text-xs text-slate-400">{week.days.size} days • {week.tasks.length} tasks</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-white">{week.completed}/{week.total}</div>
                      <div className="w-24 bg-slate-600 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${getWeekProgress(week)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Week Days */}
                {expandedWeeks.has(week.number) && (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 7 }, (_, i) => {
                      const day = (week.number - 1) * 7 + i + 1;
                      if (day > (path?.durationDays || 60)) return null;
                      
                      const dayTasks = tasks.filter(t => t.dayNumber === day);
                      const status = getDayStatus(day);
                      
                      return (
                        <div
                          key={day}
                          className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                            selectedDay === day 
                              ? 'border-purple-500 bg-purple-500/10' 
                              : 'border-slate-700 hover:border-slate-600'
                          }`}
                          onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(status)}`} />
                              <span className="text-sm font-medium text-white">Day {day}</span>
                            </div>
                            <span className="text-xs text-slate-400">
                              {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                            </span>
                          </div>

                          {selectedDay === day && dayTasks.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {dayTasks.map((task, index) => (
                                <div key={index} className="p-2 bg-slate-700/30 rounded">
                                  <div className="flex items-start justify-between mb-1">
                                    <span className="text-sm text-white">{task.title}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                  </div>
                                  {task.description && (
                                    <p className="text-xs text-slate-400 mb-2">{task.description}</p>
                                  )}
                                  <div className="flex items-center gap-3 text-xs text-slate-400">
                                    {task.estimatedHours && (
                                      <span className="flex items-center gap-1">
                                        <Clock size={10} />
                                        {task.estimatedHours}h
                                      </span>
                                    )}
                                    {task.status && (
                                      <span className="flex items-center gap-1">
                                        {task.status === 'COMPLETED' ? (
                                          <CheckCircle size={10} className="text-green-400" />
                                        ) : task.status === 'IN_PROGRESS' ? (
                                          <Play size={10} className="text-blue-400" />
                                        ) : (
                                          <Circle size={10} />
                                        )}
                                        {task.status}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {viewMode === 'progress' && (
          <div className="space-y-6">
            {/* Milestones */}
            <div>
              <h4 className="text-sm font-medium text-white mb-3">Milestones</h4>
              <div className="space-y-3">
                {milestones.map((milestone, index) => {
                  const isReached = tasks
                    .filter(t => t.dayNumber <= milestone.day)
                    .every(t => t.status === 'COMPLETED');
                  
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        isReached 
                          ? 'bg-green-500/10 border-green-500/30' 
                          : 'bg-slate-700/30 border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          isReached ? 'bg-green-500/20' : 'bg-slate-600'
                        }`}>
                          <Flag size={16} className={isReached ? 'text-green-400' : 'text-slate-400'} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="text-white font-medium">{milestone.title}</h5>
                            <span className="text-xs text-slate-400">Day {milestone.day}</span>
                          </div>
                          <p className="text-sm text-slate-400">{milestone.description}</p>
                          {isReached && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
                              <CheckCircle size={12} />
                              Achieved
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Streak */}
            <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg p-4 border border-orange-500/30">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-500/20 rounded-lg">
                  <Award size={16} className="text-orange-400" />
                </div>
                <div>
                  <h4 className="text-white font-medium mb-1">Current Streak</h4>
                  <p className="text-2xl font-bold text-orange-400 mb-1">7 days</p>
                  <p className="text-xs text-slate-400">Keep up the great work!</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LearningPathVisualizer;
