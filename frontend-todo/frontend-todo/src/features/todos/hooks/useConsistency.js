import { useState, useEffect } from 'react';
import { todoApi } from '@/services/api/todoApi';
import { goalApi } from '../api/goalApi';
import { format, subDays, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

export const useConsistency = (months = 3) => {
  const [consistencyData, setConsistencyData] = useState({
    heatmap: {},
    streaks: {
      current: 0,
      longest: 0
    },
    stats: {
      totalActiveDays: 0,
      completionRate: 0,
      bestMonth: null,
      worstMonth: null
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calculateConsistency();
  }, []);

  const calculateConsistency = async () => {
    setLoading(true);
    try {
      const todos = await todoApi.getTodos();
      const goals = await goalApi.getGoals();

      // Generate date range for last N months
      const endDate = new Date();
      const startDate = subDays(endDate, months * 30);
      
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      const heatmap = {};
      const monthlyStats = {};
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;

      dateRange.forEach(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const month = format(date, 'yyyy-MM');

        // Count completions for this day
        const todosCompleted = todos.filter(t => 
          t.status === 'COMPLETED' && 
          t.completedAt?.startsWith(dateStr)
        ).length;

        const goalsCompleted = goals.filter(g => 
          g.completedDates?.includes(dateStr)
        ).length;

        const totalCompleted = todosCompleted + goalsCompleted;

        heatmap[dateStr] = {
          date,
          completed: totalCompleted > 0,
          count: totalCompleted,
          todos: todosCompleted,
          goals: goalsCompleted
        };

        // Track monthly stats
        if (!monthlyStats[month]) {
          monthlyStats[month] = {
            total: 0,
            activeDays: 0
          };
        }
        
        if (totalCompleted > 0) {
          monthlyStats[month].activeDays++;
          monthlyStats[month].total += totalCompleted;
        }

        // Calculate streaks
        if (totalCompleted > 0) {
          tempStreak++;
          longestStreak = Math.max(longestStreak, tempStreak);
          
          // Check if this is part of current streak
          if (format(date, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd') || 
              (currentStreak === 0 && date < endDate)) {
            currentStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
        }
      });

      // Find best/worst months
      let bestMonth = null;
      let worstMonth = null;
      let bestRate = 0;
      let worstRate = 100;

      Object.entries(monthlyStats).forEach(([month, stats]) => {
        const daysInMonth = eachDayOfInterval({
          start: startOfMonth(new Date(month)),
          end: endOfMonth(new Date(month))
        }).length;
        
        const rate = (stats.activeDays / daysInMonth) * 100;
        
        if (rate > bestRate) {
          bestRate = rate;
          bestMonth = month;
        }
        if (rate < worstRate) {
          worstRate = rate;
          worstMonth = month;
        }
      });

      const totalActiveDays = Object.values(heatmap).filter(d => d.completed).length;
      const completionRate = (totalActiveDays / dateRange.length) * 100;

      setConsistencyData({
        heatmap,
        streaks: {
          current: currentStreak,
          longest: longestStreak
        },
        stats: {
          totalActiveDays,
          completionRate,
          bestMonth,
          worstMonth,
          bestRate,
          worstRate
        },
        monthlyStats
      });

    } catch (error) {
      console.error('Failed to calculate consistency:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConsistencyColor = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 5) return 3;
    return 4;
  };

  const getStreakMessage = () => {
    const { current, longest } = consistencyData.streaks;
    
    if (current === 0) return "Start your streak today!";
    if (current < 3) return "Great start! 🔥";
    if (current < 7) return "You're on fire! 🔥🔥";
    if (current < 14) return "Incredible consistency! 🌟";
    if (current < 30) return "Legendary status! 👑";
    return "Absolutely unstoppable! 🚀";
  };

  return {
    ...consistencyData,
    loading,
    getConsistencyColor,
    getStreakMessage,
    refreshConsistency: calculateConsistency
  };
};