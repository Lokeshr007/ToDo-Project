import React, { useState, useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceContext';
import TimeBlockScheduler from '../components/TimeBlockScheduler';
import GoalTracker from '../components/GoalTracker';
import SmartReminder from '../components/SmartReminder';
import ConsistencyCalendar from '../components/ConsistencyCalendar';
import FocusMode from '../components/FocusMode';
import TaskAnalytics from '../components/TaskAnalytics';
import StreakCounter from '../components/StreakCounter';
import {
  Clock,
  Target,
  Bell,
  Calendar,
  Zap,
  BarChart3,
  Flame,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Brain,
  Timer
} from 'lucide-react';

const TimeCapsule = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { currentWorkspace } = useWorkspace();

  const tabs = [
    { id: 'schedule', label: 'Time Blocks', icon: Clock, color: 'purple' },
    { id: 'goals', label: 'Goals', icon: Target, color: 'green' },
    { id: 'reminders', label: 'Reminders', icon: Bell, color: 'yellow' },
    { id: 'consistency', label: 'Consistency', icon: Flame, color: 'orange' },
    { id: 'focus', label: 'Focus Mode', icon: Zap, color: 'blue' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'pink' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-800/30 backdrop-blur-xl sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="text-purple-400" size={24} />
              Time Capsule
            </h1>
            
            {/* Date Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <ChevronLeft size={18} className="text-slate-400" />
              </button>
              <span className="text-white font-medium">
                {selectedDate.toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </span>
              <button
                onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
                className="p-2 hover:bg-slate-700 rounded-lg"
              >
                <ChevronRight size={18} className="text-slate-400" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const colorClasses = {
                purple: isActive ? 'bg-purple-600 text-white' : 'text-purple-400 hover:bg-purple-600/20',
                green: isActive ? 'bg-green-600 text-white' : 'text-green-400 hover:bg-green-600/20',
                yellow: isActive ? 'bg-yellow-600 text-white' : 'text-yellow-400 hover:bg-yellow-600/20',
                orange: isActive ? 'bg-orange-600 text-white' : 'text-orange-400 hover:bg-orange-600/20',
                blue: isActive ? 'bg-blue-600 text-white' : 'text-blue-400 hover:bg-blue-600/20',
                pink: isActive ? 'bg-pink-600 text-white' : 'text-pink-400 hover:bg-pink-600/20'
              };

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all whitespace-nowrap ${
                    isActive 
                      ? colorClasses[tab.color] 
                      : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6">
        {/* Streak Counter - Always visible */}
        <div className="mb-6">
          <StreakCounter />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Feature */}
          <div className="lg:col-span-2">
            {activeTab === 'schedule' && (
              <TimeBlockScheduler selectedDate={selectedDate} />
            )}
            {activeTab === 'goals' && <GoalTracker />}
            {activeTab === 'reminders' && <SmartReminder />}
            {activeTab === 'consistency' && <ConsistencyCalendar />}
            {activeTab === 'focus' && <FocusMode />}
            {activeTab === 'analytics' && <TaskAnalytics />}
          </div>

          {/* Right Column - Insights */}
          <div className="space-y-4">
            {/* Daily Quote */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="text-purple-400" size={20} />
                <h3 className="text-white font-medium">Daily Insight</h3>
              </div>
              <p className="text-slate-300 italic">
                "The secret of getting ahead is getting started. The secret of getting started is breaking your complex overwhelming tasks into small manageable tasks, and then starting on the first one."
              </p>
              <p className="text-sm text-slate-400 mt-2">— Mark Twain</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
              <h3 className="text-white font-medium mb-3">Today's Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Productivity</span>
                    <span className="text-purple-400">78%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[78%] bg-purple-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Focus Time</span>
                    <span className="text-blue-400">4.5h / 8h</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[56%] bg-blue-500 rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-400">Tasks Completed</span>
                    <span className="text-green-400">6/10</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[60%] bg-green-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Next Upcoming */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
              <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                <Timer size={18} className="text-yellow-400" />
                Next Up
              </h3>
              <div className="space-y-2">
                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                  <p className="text-sm text-white">Daily Standup</p>
                  <p className="text-xs text-slate-400">10:30 AM - 11:00 AM</p>
                </div>
                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                  <p className="text-sm text-white">Code Review</p>
                  <p className="text-xs text-slate-400">2:00 PM - 3:00 PM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeCapsule;
