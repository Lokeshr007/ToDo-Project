import React, { useState, useEffect } from 'react';
import { Flame, Award, Calendar, TrendingUp } from 'lucide-react';
import { format, subDays, isSameDay } from 'date-fns';
import { todoApi } from '@/services/api/todoApi';
import { goalApi } from '../api/goalApi';

const StreakCounter = () => {
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [todayCompleted, setTodayCompleted] = useState(false);
  const [weeklyProgress, setWeeklyProgress] = useState([]);

  useEffect(() => {
    calculateStreak();
  }, []);

  const calculateStreak = async () => {
    try {
      const todos = await todoApi.getTodos();
      const goals = await goalApi.getGoals();
      
      // Get completed tasks for last 30 days
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = subDays(new Date(), i);
        return format(date, 'yyyy-MM-dd');
      });

      // Check completion per day
      let currentStreak = 0;
      let maxStreak = 0;
      const weeklyData = [];

      for (let i = 0; i < last30Days.length; i++) {
        const dateStr = last30Days[i];
        
        // Check if any tasks completed on this day
        const completedOnDay = todos.some(todo => 
          todo.status === 'COMPLETED' && 
          todo.completedAt?.startsWith(dateStr)
        );

        // Check if daily goals completed
        const dailyGoalsCompleted = goals
          .filter(g => g.type === 'daily')
          .every(g => g.completedDates?.includes(dateStr));

        const dayCompleted = completedOnDay || dailyGoalsCompleted;

        if (i < 7) { // Last 7 days for weekly progress
          weeklyData.unshift({
            date: dateStr,
            completed: dayCompleted
          });
        }

        if (dayCompleted) {
          currentStreak++;
          maxStreak = Math.max(maxStreak, currentStreak);
        } else {
          currentStreak = 0;
        }

        if (i === 0) {
          setTodayCompleted(dayCompleted);
        }
      }

      setStreak(currentStreak);
      setLongestStreak(maxStreak);
      setWeeklyProgress(weeklyData);

    } catch (error) {
      console.error('Failed to calculate streak:', error);
    }
  };

  const getStreakMessage = () => {
    if (streak === 0) return "Start your streak today!";
    if (streak < 3) return "Great start! Keep it up!";
    if (streak < 7) return "You're on fire! 🔥";
    if (streak < 30) return "Amazing consistency! 🌟";
    return "Legendary streak! 👑";
  };

  return (
    <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-xl rounded-2xl p-6 border border-orange-500/30">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Flame className="text-orange-400" size={24} />
          Streak Counter
        </h3>
        <div className="flex items-center gap-1">
          <Award size={16} className="text-yellow-400" />
          <span className="text-sm text-slate-300">Best: {longestStreak} days</span>
        </div>
      </div>

      {/* Main Streak Display */}
      <div className="text-center mb-4">
        <div className="text-5xl font-bold text-white mb-2">
          {streak}
          <span className="text-2xl text-slate-400 ml-1">days</span>
        </div>
        <p className="text-sm text-slate-300">{getStreakMessage()}</p>
      </div>

      {/* Today's Status */}
      <div className="mb-4 p-3 bg-slate-700/30 rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Today's Progress</span>
          {todayCompleted ? (
            <span className="text-sm text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              Completed
            </span>
          ) : (
            <span className="text-sm text-yellow-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
              Pending
            </span>
          )}
        </div>
      </div>

      {/* Weekly Progress */}
      <div>
        <p className="text-sm text-slate-400 mb-2">Last 7 days</p>
        <div className="flex gap-1">
          {weeklyProgress.map((day, index) => (
            <div key={index} className="flex-1">
              <div
                className={`h-16 rounded-lg ${
                  day.completed
                    ? 'bg-gradient-to-t from-orange-500 to-yellow-500'
                    : 'bg-slate-700'
                } transition-all hover:scale-105 cursor-pointer group relative`}
              >
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-slate-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap">
                  {format(new Date(day.date), 'EEE, MMM d')}
                  <br />
                  {day.completed ? '✓ Completed' : '○ Not completed'}
                </div>
              </div>
              <p className="text-xs text-center text-slate-500 mt-1">
                {format(new Date(day.date), 'EEE')[0]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Motivational Quote */}
      <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
        <p className="text-xs text-purple-300 italic">
          {streak === 0 && "Every master was once a beginner. Start today!"}
          {streak === 1 && "The first step is the hardest. You've got this!"}
          {streak === 2 && "Two days strong! Building momentum!"}
          {streak === 3 && "Three days! You're forming a habit!"}
          {streak >= 4 && streak < 7 && "Consistency is key! Keep going!"}
          {streak >= 7 && streak < 14 && "A week of excellence! You're unstoppable!"}
          {streak >= 14 && streak < 30 && "Two weeks of dedication! Incredible!"}
          {streak >= 30 && "A month of greatness! You're an inspiration!"}
        </p>
      </div>
    </div>
  );
};

export default StreakCounter;