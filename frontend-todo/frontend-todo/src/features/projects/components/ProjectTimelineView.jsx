import { useState, useEffect } from 'react';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight, MessageSquare, Clock, User, AlertCircle } from 'lucide-react';
import API from '@/services/api';

const ProjectTimelineView = ({ projectId, themeStyles }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const response = await API.get(`/projects/${projectId}/timeline`);
        setTasks(response.data);
      } catch (error) {
        console.error('Failed to fetch timeline:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, [projectId]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getDayWidth = () => 40; // width of each day column in pixels

  const getTaskStyle = (task) => {
    const start = new Date(task.start);
    const end = new Date(task.end);
    
    // Calculate position
    const diffFromStart = Math.max(0, Math.floor((start - monthStart) / (1000 * 60 * 60 * 24)));
    const duration = Math.max(1, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
    
    return {
      left: `${diffFromStart * getDayWidth()}px`,
      width: `${duration * getDayWidth()}px`,
      background: task.color || '#6366f1',
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-full rounded-2xl border ${themeStyles.border} overflow-hidden bg-slate-900/40 backdrop-blur-md`}>
      {/* Timeline Controls */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
        <h3 className="text-lg font-semibold text-white">Project Timeline</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg p-1 border border-white/5">
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, -30))}
              className="p-1.5 hover:bg-white/5 rounded-md text-slate-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-3 text-sm font-medium text-white min-w-[120px] text-center">
              {format(currentDate, 'MMMM yyyy')}
            </span>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, 30))}
              className="p-1.5 hover:bg-white/5 rounded-md text-slate-400 hover:text-white transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Gantt Area */}
      <div className="flex-1 overflow-auto relative">
        <div className="inline-block min-w-full">
          {/* Calendar Header */}
          <div className="flex border-b border-white/5 sticky top-0 z-20 bg-slate-900">
            <div className="w-64 flex-shrink-0 border-r border-white/5 p-4 font-medium text-slate-400 text-xs uppercase tracking-wider bg-slate-900">
              Task Details
            </div>
            {days.map(day => (
              <div 
                key={day.toString()} 
                className={`flex-shrink-0 flex flex-col items-center justify-center border-r border-white/5 ${
                  isWeekend(day) ? 'bg-white/2' : ''
                }`}
                style={{ width: getDayWidth() }}
              >
                <span className="text-[10px] text-slate-500 font-medium">
                  {format(day, 'EEE')}
                </span>
                <span className={`text-xs mt-1 ${isSameDay(day, new Date()) ? 'bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-slate-300'}`}>
                  {format(day, 'd')}
                </span>
              </div>
            ))}
          </div>

          {/* Task Rows */}
          <div className="relative">
            {tasks.map((task, idx) => (
              <div key={task.id} className="flex border-b border-white/5 group hover:bg-white/2 transition-colors">
                {/* Task Info Cell */}
                <div className="w-64 flex-shrink-0 border-r border-white/5 p-3 sticky left-0 z-10 bg-slate-900 overflow-hidden">
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-white truncate group-hover:text-purple-400 transition-colors">
                      {task.name}
                    </span>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <User size={10} /> {task.assigneeName}
                      </span>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        task.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400' : 
                        task.status === 'IN_PROGRESS' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Cell */}
                <div className="relative flex-1" style={{ width: `${days.length * getDayWidth()}px` }}>
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex">
                    {days.map(day => (
                      <div 
                        key={day.toString()} 
                        className={`flex-shrink-0 border-r border-white/[0.03] h-full ${
                          isWeekend(day) ? 'bg-white/[0.01]' : ''
                        }`}
                        style={{ width: getDayWidth() }}
                      />
                    ))}
                  </div>

                  {/* Task Bar */}
                  <div 
                    className="absolute h-8 top-1.5 rounded-lg flex items-center px-3 shadow-lg group/bar relative overflow-hidden"
                    style={getTaskStyle(task)}
                  >
                    {/* Progress Fill */}
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-black/20" 
                      style={{ width: `${task.progress || 0}%` }}
                    />
                    <span className="text-xs font-bold text-white relative z-10 drop-shadow-md truncate">
                      {task.progress > 0 ? `${task.progress}%` : ''}
                    </span>
                    
                    {/* Hover Info Tooltip */}
                    <div className="absolute top-10 left-0 hidden group-hover/bar:flex flex-col bg-slate-800 border border-slate-700 p-2 rounded-lg z-50 shadow-2xl min-w-[150px]">
                      <span className="text-xs font-bold text-white">{task.name}</span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        {format(new Date(task.start), 'MMM dd')} - {format(new Date(task.end), 'MMM dd')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTimelineView;
