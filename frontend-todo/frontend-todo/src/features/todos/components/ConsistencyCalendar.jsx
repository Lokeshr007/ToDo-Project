import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, Award, Clock } from 'lucide-react';
import { format, subMonths, addMonths, eachDayOfInterval, startOfMonth, endOfMonth, isSameDay, isToday } from 'date-fns';
import { todoApi } from '@/services/api/todoApi';
import { goalApi } from '../api/goalApi';
import toast from 'react-hot-toast';

const ConsistencyCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activityData, setActivityData] = useState({});
  const [stats, setStats] = useState({
    totalActiveDays: 0,
    currentStreak: 0,
    bestStreak: 0,
    completionRate: 0,
    totalTasksCompleted: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, [currentDate]);

  const fetchActivityData = async () => {
    setLoading(true);
    try {
      // Fetch todos for the month
      const todos = await todoApi.getTodos();
      const goals = await goalApi.getGoals();
      
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      // Process activity data
      const activity = {};
      let totalCompleted = 0;
      let activeDays = 0;

      daysInMonth.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        
        // Check todos completed on this day
        const todosCompleted = todos.filter(todo => 
          todo.status === 'COMPLETED' && 
          todo.completedAt?.startsWith(dateStr)
        );

        // Check goals completed on this day
        const goalsCompleted = goals.filter(goal => 
          goal.completedDates?.includes(dateStr)
        );

        const completedCount = todosCompleted.length + goalsCompleted.length;
        
        activity[dateStr] = {
          date: day,
          completed: completedCount > 0,
          count: completedCount,
          todos: todosCompleted,
          goals: goalsCompleted
        };

        if (completedCount > 0) {
          activeDays++;
          totalCompleted += completedCount;
        }
      });

      // Calculate streaks
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      // Sort dates in reverse chronological order
      const sortedDates = Object.keys(activity).sort().reverse();

      for (const dateStr of sortedDates) {
        if (activity[dateStr].completed) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
          
          // Check if this is part of current streak (today or consecutive days ending today)
          if (isSameDay(new Date(dateStr), new Date()) || 
              (currentStreak === 0 && new Date(dateStr) < new Date())) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
        }
      }

      const completionRate = Math.round((activeDays / daysInMonth.length) * 100);

      setStats({
        totalActiveDays: activeDays,
        currentStreak,
        bestStreak,
        completionRate,
        totalTasksCompleted: totalCompleted
      });

      setActivityData(activity);

    } catch (error) {
      console.error('Failed to fetch activity data:', error);
      toast.error('Failed to load consistency data');
    } finally {
      setLoading(false);
    }
  };

  const getIntensityColor = (count) => {
    if (count === 0) return 'bg-slate-700';
    if (count === 1) return 'bg-green-900';
    if (count === 2) return 'bg-green-700';
    if (count === 3) return 'bg-green-500';
    return 'bg-green-400';
  };

  const getMonthDays = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDay = monthStart.getDay(); // 0 = Sunday
    
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Add empty cells for days before month starts
    const emptyCells = Array(startDay).fill(null);
    
    return [...emptyCells, ...days];
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-7 gap-2">
            {[...Array(35)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Calendar className="text-purple-400" size={24} />
          Consistency Calendar
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentDate(subMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-700 rounded-lg"
          >
            <ChevronLeft size={18} className="text-slate-400" />
          </button>
          <span className="text-white font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentDate(addMonths(currentDate, 1))}
            className="p-2 hover:bg-slate-700 rounded-lg"
          >
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-700/30 rounded-xl p-3">
          <p className="text-xs text-slate-400">Active Days</p>
          <p className="text-xl font-bold text-white">{stats.totalActiveDays}</p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-3">
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className="text-orange-400" />
            <p className="text-xs text-slate-400">Current Streak</p>
          </div>
          <p className="text-xl font-bold text-orange-400">{stats.currentStreak}d</p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-3">
          <div className="flex items-center gap-1">
            <Award size={14} className="text-yellow-400" />
            <p className="text-xs text-slate-400">Best Streak</p>
          </div>
          <p className="text-xl font-bold text-yellow-400">{stats.bestStreak}d</p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-3">
          <p className="text-xs text-slate-400">Completion</p>
          <p className="text-xl font-bold text-green-400">{stats.completionRate}%</p>
        </div>
      </div>

      {/* Calendar */}
      <div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map(day => (
            <div key={day} className="text-center text-xs text-slate-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {getMonthDays().map((day, index) => {
            if (!day) {
              return <div key={`empty-${index}`} className="h-10 bg-slate-700/20 rounded-lg" />;
            }

            const dateStr = format(day, 'yyyy-MM-dd');
            const dayData = activityData[dateStr];
            const isCurrentDay = isToday(day);

            return (
              <div
                key={dateStr}
                className={`h-10 rounded-lg ${getIntensityColor(dayData?.count || 0)} ${
                  isCurrentDay ? 'ring-2 ring-purple-500' : ''
                } relative group cursor-pointer transition-all hover:scale-105`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {format(day, 'd')}
                  </span>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-slate-800 text-white text-xs py-2 px-3 rounded-lg shadow-xl border border-slate-700 whitespace-nowrap">
                    <p className="font-medium mb-1">{format(day, 'EEEE, MMM d')}</p>
                    <p className="text-slate-300">
                      {dayData?.count || 0} tasks completed
                    </p>
                    {dayData?.todos?.length > 0 && (
                      <p className="text-green-400 text-xs mt-1">
                        ✓ {dayData.todos.length} todos
                      </p>
                    )}
                    {dayData?.goals?.length > 0 && (
                      <p className="text-purple-400 text-xs">
                        ⚡ {dayData.goals.length} goals
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-4 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-slate-700 rounded"></div>
          <span className="text-xs text-slate-400">No activity</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-900 rounded"></div>
          <span className="text-xs text-slate-400">Light</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-700 rounded"></div>
          <span className="text-xs text-slate-400">Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span className="text-xs text-slate-400">High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-400 rounded"></div>
          <span className="text-xs text-slate-400">Very High</span>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <p className="text-sm text-purple-300">
          🎯 You've been consistent for {stats.currentStreak} days! 
          {stats.completionRate > 70 
            ? " Amazing dedication!" 
            : stats.completionRate > 40 
            ? " Keep up the good work!" 
            : " Every day is a new opportunity!"}
        </p>
      </div>
    </div>
  );
};

export default ConsistencyCalendar;