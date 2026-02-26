import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertCircle, Calendar, Download } from 'lucide-react';
import { todoApi } from '@/services/api/todoApi';
import { goalApi } from '../api/goalApi';
import { format, subDays, differenceInDays, startOfWeek, endOfWeek } from 'date-fns';

const TaskAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    priorities: {},
    completionRate: 0,
    averageTime: 0,
    bestDay: null,
    worstDay: null,
    trends: {}
  });
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('week'); // week, month, year

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const todos = await todoApi.getTodos();
      const goals = await goalApi.getGoals();

      // Get date range
      const endDate = new Date();
      let startDate;
      let daysToAnalyze;

      switch(timeRange) {
        case 'week':
          startDate = subDays(endDate, 7);
          daysToAnalyze = 7;
          break;
        case 'month':
          startDate = subDays(endDate, 30);
          daysToAnalyze = 30;
          break;
        case 'year':
          startDate = subDays(endDate, 365);
          daysToAnalyze = 12; // months
          break;
        default:
          startDate = subDays(endDate, 7);
          daysToAnalyze = 7;
      }

      // Daily completion data
      const dailyData = [];
      const priorityStats = { HIGH: 0, MEDIUM: 0, NORMAL: 0, LOW: 0 };
      let totalCompleted = 0;
      let totalTasks = 0;
      let totalTimeSpent = 0;
      let timeTrackedCount = 0;

      for (let i = 0; i < daysToAnalyze; i++) {
        const date = subDays(endDate, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const completedOnDay = todos.filter(t => 
          t.status === 'COMPLETED' && 
          t.completedAt?.startsWith(dateStr)
        );

        const createdOnDay = todos.filter(t => 
          t.createdAt?.startsWith(dateStr)
        );

        dailyData.unshift({
          date: format(date, 'MMM d'),
          completed: completedOnDay.length,
          created: createdOnDay.length,
          dayOfWeek: format(date, 'EEE')
        });

        // Track priority stats
        completedOnDay.forEach(t => {
          priorityStats[t.priority] = (priorityStats[t.priority] || 0) + 1;
        });

        totalCompleted += completedOnDay.length;
        totalTasks += createdOnDay.length;

        // Time tracking
        completedOnDay.forEach(t => {
          if (t.timeTracked) {
            totalTimeSpent += t.timeTracked;
            timeTrackedCount++;
          }
        });
      }

      // Find best/worst days
      const sortedByCompletion = [...dailyData].sort((a, b) => b.completed - a.completed);
      const bestDay = sortedByCompletion[0];
      const worstDay = [...sortedByCompletion].reverse()[0];

      // Calculate trends
      const midPoint = Math.floor(dailyData.length / 2);
      const firstHalf = dailyData.slice(0, midPoint);
      const secondHalf = dailyData.slice(midPoint);
      
      const firstHalfAvg = firstHalf.reduce((sum, d) => sum + d.completed, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, d) => sum + d.completed, 0) / secondHalf.length;
      
      const trend = secondHalfAvg > firstHalfAvg ? 'improving' : 
                   secondHalfAvg < firstHalfAvg ? 'declining' : 'stable';

      // Completion rate
      const completionRate = totalTasks > 0 ? (totalCompleted / totalTasks) * 100 : 0;

      // Average time per task
      const avgTime = timeTrackedCount > 0 ? totalTimeSpent / timeTrackedCount : 0;

      setAnalytics({
        daily: dailyData,
        priorities: priorityStats,
        completionRate,
        averageTime: avgTime,
        bestDay,
        worstDay,
        trends: { trend, firstHalfAvg, secondHalfAvg },
        totalTasks,
        totalCompleted
      });

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'improving': return 'text-green-400';
      case 'declining': return 'text-red-400';
      default: return 'text-yellow-400';
    }
  };

  const getMaxValue = () => {
    return Math.max(...analytics.daily.map(d => d.completed), 5);
  };

  const exportAnalytics = () => {
    const dataStr = JSON.stringify(analytics, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Analytics exported');
  };

  if (loading) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-700 rounded"></div>
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
          <BarChart3 className="text-purple-400" size={24} />
          Task Analytics
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={exportAnalytics}
            className="p-2 hover:bg-slate-700 rounded-lg"
          >
            <Download size={18} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="bg-slate-700/30 rounded-xl p-3">
          <p className="text-xs text-slate-400">Completion Rate</p>
          <p className="text-xl font-bold text-green-400">
            {analytics.completionRate.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-3">
          <p className="text-xs text-slate-400">Tasks Completed</p>
          <p className="text-xl font-bold text-white">{analytics.totalCompleted}</p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-3">
          <p className="text-xs text-slate-400">Avg Time/Task</p>
          <p className="text-xl font-bold text-blue-400">
            {Math.round(analytics.averageTime / 60)}m
          </p>
        </div>
        <div className="bg-slate-700/30 rounded-xl p-3">
          <div className="flex items-center gap-1">
            <TrendingUp size={14} className={getTrendColor(analytics.trends.trend)} />
            <p className="text-xs text-slate-400">Trend</p>
          </div>
          <p className={`text-xl font-bold capitalize ${getTrendColor(analytics.trends.trend)}`}>
            {analytics.trends.trend}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-400 mb-3">Daily Completion</h3>
        <div className="flex items-end gap-1 h-32">
          {analytics.daily.map((day, index) => {
            const height = (day.completed / getMaxValue()) * 100;
            const isBest = analytics.bestDay?.date === day.date;
            const isWorst = analytics.worstDay?.date === day.date;

            return (
              <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div
                    className={`h-${Math.max(4, Math.floor(height / 8))} ${
                      isBest ? 'bg-green-500' : isWorst ? 'bg-red-500' : 'bg-purple-500'
                    } rounded-t-lg transition-all hover:opacity-80 cursor-pointer`}
                    style={{ height: `${height}%` }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-slate-800 text-white text-xs py-1 px-2 rounded shadow-xl whitespace-nowrap">
                        <p>{day.date} ({day.dayOfWeek})</p>
                        <p className="text-green-400">✓ {day.completed} completed</p>
                        <p className="text-blue-400">+ {day.created} created</p>
                      </div>
                    </div>
                  </div>
                </div>
                <span className="text-xs text-slate-500 mt-1">{day.dayOfWeek}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Priority Distribution */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Priority Distribution</h3>
          <div className="space-y-2">
            {Object.entries(analytics.priorities).map(([priority, count]) => {
              const total = Object.values(analytics.priorities).reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? (count / total) * 100 : 0;
              
              const colors = {
                HIGH: 'bg-red-500',
                MEDIUM: 'bg-yellow-500',
                NORMAL: 'bg-blue-500',
                LOW: 'bg-green-500'
              };

              return (
                <div key={priority}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">{priority}</span>
                    <span className="text-white">{count} tasks</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${colors[priority]}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best/Worst Days */}
        <div>
          <h3 className="text-sm font-medium text-slate-400 mb-3">Performance Insights</h3>
          <div className="space-y-3">
            {analytics.bestDay && analytics.bestDay.completed > 0 && (
              <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/30">
                <p className="text-xs text-green-400">Best Day</p>
                <p className="text-white font-medium">{analytics.bestDay.date}</p>
                <p className="text-sm text-green-400">
                  {analytics.bestDay.completed} tasks completed
                </p>
              </div>
            )}
            
            {analytics.worstDay && analytics.worstDay.completed === 0 && (
              <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
                <p className="text-xs text-yellow-400">Least Productive</p>
                <p className="text-white font-medium">{analytics.worstDay.date}</p>
                <p className="text-sm text-yellow-400">
                  No tasks completed
                </p>
              </div>
            )}

            <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/30">
              <p className="text-xs text-purple-400">Productivity Trend</p>
              <p className="text-sm text-white mt-1">
                {analytics.trends.trend === 'improving' && "You're getting more productive! 📈"}
                {analytics.trends.trend === 'declining' && "Time to refocus and push forward 💪"}
                {analytics.trends.trend === 'stable' && "Consistency is key! Keep it up! ⚡"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <Calendar size={16} className="text-purple-400" />
          <h3 className="text-sm font-medium text-white">Weekly Summary</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="text-slate-400">Total Tasks</p>
            <p className="text-white font-bold">{analytics.totalTasks}</p>
          </div>
          <div>
            <p className="text-slate-400">Completed</p>
            <p className="text-green-400 font-bold">{analytics.totalCompleted}</p>
          </div>
          <div>
            <p className="text-slate-400">Avg Per Day</p>
            <p className="text-blue-400 font-bold">
              {(analytics.totalCompleted / 7).toFixed(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAnalytics;