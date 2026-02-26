import { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Sun,
  Moon,
  Coffee,
  CheckCircle,
  AlertCircle,
  Zap,
  ChevronLeft,
  ChevronRight,
  Target,
  BarChart
} from 'lucide-react';
import { format, addDays, isWeekend } from 'date-fns';

function SmartScheduler({ tasks, onScheduleGenerated, onApplySchedule }) {
  const [schedule, setSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlots, setSelectedTimeSlots] = useState({});
  const [optimizations, setOptimizations] = useState([]);
  const [view, setView] = useState('week'); // week, day, insights

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      generateSchedule();
    }
  }, [tasks]);

  const generateSchedule = () => {
    // Group tasks by day
    const tasksByDay = {};
    tasks.forEach(task => {
      const day = task.dayNumber;
      if (!tasksByDay[day]) tasksByDay[day] = [];
      tasksByDay[day].push(task);
    });

    // Calculate daily hours
    const dailyHours = {};
    Object.entries(tasksByDay).forEach(([day, dayTasks]) => {
      dailyHours[day] = dayTasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    });

    // Find optimizations
    const newOptimizations = [];
    Object.entries(dailyHours).forEach(([day, hours]) => {
      if (hours > 6) {
        newOptimizations.push({
          day: parseInt(day),
          type: 'warning',
          message: `Day ${day} has ${hours.toFixed(1)} hours of work. Consider spreading across multiple days.`
        });
      } else if (hours < 2 && hours > 0) {
        newOptimizations.push({
          day: parseInt(day),
          type: 'info',
          message: `Day ${day} is light (${hours.toFixed(1)} hours). You could add more tasks.`
        });
      }
    });

    setOptimizations(newOptimizations);

    // Generate schedule days
    const scheduleDays = [];
    for (let day = 1; day <= 60; day++) {
      const date = addDays(new Date(), day - 1);
      scheduleDays.push({
        day,
        date: format(date, 'yyyy-MM-dd'),
        dayOfWeek: format(date, 'EEEE'),
        tasks: tasksByDay[day] || [],
        totalHours: dailyHours[day] || 0,
        isWeekend: isWeekend(date),
        isOverloaded: (dailyHours[day] || 0) > 6,
        isLight: (dailyHours[day] || 0) < 2 && (dailyHours[day] || 0) > 0
      });
    }

    const newSchedule = {
      days: scheduleDays,
      stats: {
        totalTasks: tasks.length,
        totalHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0),
        averageDailyHours: tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0) / 60,
        overloadedDays: Object.values(dailyHours).filter(h => h > 6).length,
        lightDays: Object.values(dailyHours).filter(h => h < 2 && h > 0).length
      }
    };

    setSchedule(newSchedule);
    onScheduleGenerated?.(newSchedule);
  };

  const getTimeSlotsForDay = (date) => {
    const slots = [];
    const dayTasks = schedule?.days.find(d => d.date === date)?.tasks || [];

    // Morning slot (9 AM - 12 PM)
    slots.push({
      period: 'Morning',
      start: '09:00',
      end: '12:00',
      hours: 3,
      tasks: dayTasks.slice(0, 2),
      available: true
    });

    // Afternoon slot (2 PM - 5 PM)
    slots.push({
      period: 'Afternoon',
      start: '14:00',
      end: '17:00',
      hours: 3,
      tasks: dayTasks.slice(2, 4),
      available: true
    });

    // Evening slot (7 PM - 10 PM)
    slots.push({
      period: 'Evening',
      start: '19:00',
      end: '22:00',
      hours: 3,
      tasks: dayTasks.slice(4),
      available: true
    });

    return slots;
  };

  const handleTimeSlotToggle = (date, slotIndex) => {
    const key = `${date}-${slotIndex}`;
    setSelectedTimeSlots(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleApplySchedule = () => {
    const selectedSlots = Object.entries(selectedTimeSlots)
      .filter(([_, selected]) => selected)
      .map(([key]) => {
        const [date, slotIndex] = key.split('-');
        const slot = getTimeSlotsForDay(date)[parseInt(slotIndex)];
        return { date, ...slot };
      });

    onApplySchedule?.(selectedSlots);
  };

  const renderWeekView = () => {
    const weekDays = schedule?.days.slice(0, 7) || [];

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => (
            <div
              key={day.day}
              className={`p-3 rounded-lg ${
                day.isOverloaded ? 'bg-red-500/20 border border-red-500/30' :
                day.isLight ? 'bg-yellow-500/20 border border-yellow-500/30' :
                'bg-slate-700/30'
              }`}
            >
              <p className="text-xs text-slate-400 mb-1">{day.dayOfWeek.slice(0, 3)}</p>
              <p className="text-lg font-bold text-white mb-1">{day.day}</p>
              <p className="text-sm text-slate-300">{day.totalHours.toFixed(1)}h</p>
              <p className="text-xs text-slate-400">{day.tasks.length} tasks</p>
            </div>
          ))}
        </div>

        {/* Daily Details */}
        <div className="mt-6">
          <h4 className="text-white font-medium mb-3">Today's Schedule</h4>
          <div className="space-y-3">
            {weekDays[0]?.tasks.map((task, index) => (
              <div
                key={index}
                className="p-3 bg-slate-700/30 rounded-lg flex items-center justify-between"
              >
                <div>
                  <p className="text-sm text-white font-medium">{task.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{task.description}</p>
                </div>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={10} />
                  {task.estimatedHours}h
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const today = format(selectedDate, 'yyyy-MM-dd');
    const dayData = schedule?.days.find(d => d.date === today);
    const timeSlots = getTimeSlotsForDay(today);

    return (
      <div className="space-y-6">
        {/* Date Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-lg font-bold text-white">{format(selectedDate, 'EEEE')}</p>
            <p className="text-sm text-slate-400">{format(selectedDate, 'MMMM d, yyyy')}</p>
          </div>
          <button
            onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day Summary */}
        {dayData && (
          <div className="bg-slate-700/30 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400">Total Hours</span>
              <span className="text-xl font-bold text-white">{dayData.totalHours.toFixed(1)}h</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tasks</span>
              <span className="text-xl font-bold text-white">{dayData.tasks.length}</span>
            </div>
          </div>
        )}

        {/* Time Slots */}
        <div className="space-y-3">
          {timeSlots.map((slot, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-colors ${
                selectedTimeSlots[`${today}-${index}`]
                  ? 'bg-purple-500/20 border-purple-500/30'
                  : 'bg-slate-700/30 border-slate-600/50 hover:border-purple-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {slot.period === 'Morning' && <Sun size={16} className="text-yellow-400" />}
                  {slot.period === 'Afternoon' && <Coffee size={16} className="text-blue-400" />}
                  {slot.period === 'Evening' && <Moon size={16} className="text-indigo-400" />}
                  <span className="text-white font-medium">{slot.period}</span>
                </div>
                <span className="text-sm text-slate-400">
                  {slot.start} - {slot.end}
                </span>
              </div>

              {slot.tasks.length > 0 ? (
                <div className="space-y-2 mb-3">
                  {slot.tasks.map((task, taskIndex) => (
                    <div key={taskIndex} className="text-sm text-slate-300">
                      • {task.title}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 mb-3">No tasks scheduled</p>
              )}

              <button
                onClick={() => handleTimeSlotToggle(today, index)}
                className={`w-full py-2 rounded-lg text-sm transition-colors ${
                  selectedTimeSlots[`${today}-${index}`]
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                }`}
              >
                {selectedTimeSlots[`${today}-${index}`] ? 'Selected' : 'Select Slot'}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderInsightsView = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-700/30 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <BarChart size={16} />
            <span className="text-xs">Avg Daily</span>
          </div>
          <p className="text-2xl font-bold text-white">
            {schedule?.stats.averageDailyHours.toFixed(1)}h
          </p>
        </div>
        <div className="bg-slate-700/30 p-4 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <AlertCircle size={16} />
            <span className="text-xs">Overloaded</span>
          </div>
          <p className="text-2xl font-bold text-white">{schedule?.stats.overloadedDays}</p>
        </div>
      </div>

      {/* Optimizations */}
      {optimizations.length > 0 && (
        <div className="bg-purple-500/10 border border-purple-500/30 p-4 rounded-lg">
          <h4 className="text-purple-400 font-medium mb-3 flex items-center gap-2">
            <Zap size={16} />
            Optimization Suggestions
          </h4>
          <div className="space-y-2">
            {optimizations.map((opt, index) => (
              <div
                key={index}
                className={`p-2 rounded-lg text-sm ${
                  opt.type === 'warning' 
                    ? 'bg-red-500/20 text-red-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}
              >
                {opt.message}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weekly Pattern */}
      <div className="bg-slate-700/30 p-4 rounded-lg">
        <h4 className="text-white font-medium mb-3">Weekly Pattern</h4>
        <div className="space-y-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const dayData = schedule?.days[index];
            return (
              <div key={day} className="flex items-center gap-2">
                <span className="w-12 text-sm text-slate-400">{day}</span>
                <div className="flex-1 h-2 bg-slate-600 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500"
                    style={{ width: `${((dayData?.totalHours || 0) / 8) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-white">{dayData?.totalHours.toFixed(1)}h</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!schedule) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 p-8 text-center">
        <div className="inline-flex p-4 bg-purple-500/20 rounded-full mb-4">
          <Calendar size={32} className="text-purple-400" />
        </div>
        <h3 className="text-white font-medium mb-2">Generate Your Schedule</h3>
        <p className="text-sm text-slate-400">
          Upload a plan or generate tasks first to see your personalized schedule
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl border border-slate-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
            <Calendar size={20} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Smart Schedule</h3>
            <p className="text-sm text-slate-400">Optimized for your learning style</p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 bg-slate-700/30 p-1 rounded-lg">
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              view === 'week'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              view === 'day'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Day
          </button>
          <button
            onClick={() => setView('insights')}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              view === 'insights'
                ? 'bg-purple-600 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'week' && renderWeekView()}
      {view === 'day' && renderDayView()}
      {view === 'insights' && renderInsightsView()}

      {/* Apply Schedule Button */}
      {view === 'day' && Object.keys(selectedTimeSlots).length > 0 && (
        <div className="mt-6 pt-6 border-t border-slate-700">
          <button
            onClick={handleApplySchedule}
            className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <CheckCircle size={18} />
            Apply Selected Schedule
          </button>
        </div>
      )}
    </div>
  );
}

export default SmartScheduler;