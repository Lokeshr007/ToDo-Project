import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  X,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Award,
  Flame,
  BarChart3,
  Edit2,
  Trash2,
  Save,
  ChevronDown,
  Zap
} from 'lucide-react';
import { format, addDays, subDays, differenceInDays, isBefore, isAfter, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { goalApi } from '../api/goalApi';
import { todoApi } from '@/services/api/todoApi';
import { taskToast } from '@/shared/components/QuantumToaster';

const GoalTracker = () => {
  const [goals, setGoals] = useState([]);
  const [todos, setTodos] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    inProgress: 0,
    streak: 0,
    consistency: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'daily', // daily, weekly, monthly, custom
    target: '',
    unit: 'tasks',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
    linkedTasks: [],
    priority: 'medium',
    color: '#8b5cf6',
    reminder: false,
    reminderTime: '09:00'
  });

  useEffect(() => {
    fetchGoals();
    fetchTodos();
  }, []);

  useEffect(() => {
    calculateStats();
    checkGoalProgress();
  }, [goals, todos]);

  const fetchGoals = async () => {
    try {
      const data = await goalApi.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      taskToast.error('Failed to load goals');
    }
  };

  const fetchTodos = async () => {
    try {
      const data = await todoApi.getTodos();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  };

  const calculateStats = () => {
    const now = new Date();
    const activeGoals = goals.filter(g => 
      isBefore(now, parseISO(g.endDate)) || format(now, 'yyyy-MM-dd') === g.endDate
    );

    const completed = goals.filter(g => g.progress >= 100).length;
    const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length;

    // Calculate streak
    let streak = 0;
    const today = format(now, 'yyyy-MM-dd');
    
    // Check daily completion for streak
    const dailyGoals = goals.filter(g => g.type === 'daily');
    if (dailyGoals.length > 0) {
      const allCompletedToday = dailyGoals.every(g => 
        g.completedDates?.includes(today)
      );
      
      if (allCompletedToday) {
        streak = 1;
        // Check previous days
        let checkDate = subDays(now, 1);
        while (true) {
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          const completedThatDay = dailyGoals.every(g => 
            g.completedDates?.includes(dateStr)
          );
          
          if (!completedThatDay) break;
          streak++;
          checkDate = subDays(checkDate, 1);
        }
      }
    }

    // Calculate consistency (last 30 days)
    const last30Days = Array.from({ length: 30 }, (_, i) => 
      format(subDays(now, i), 'yyyy-MM-dd')
    );
    
    let completedDays = 0;
    last30Days.forEach(date => {
      const completedThatDay = dailyGoals.every(g => 
        g.completedDates?.includes(date)
      );
      if (completedThatDay) completedDays++;
    });
    
    const consistency = Math.round((completedDays / 30) * 100);

    setStats({
      totalGoals: activeGoals.length,
      completedGoals: completed,
      inProgress: inProgress,
      streak,
      consistency
    });
  };

  const checkGoalProgress = () => {
    goals.forEach(goal => {
      if (goal.type === 'daily') {
        const today = format(new Date(), 'yyyy-MM-dd');
        const completedToday = goal.linkedTasks?.every(taskId => {
          const task = todos.find(t => t.id === taskId);
          return task?.status === 'COMPLETED' && 
                 task?.completedAt?.startsWith(today);
        });

        if (completedToday && !goal.completedDates?.includes(today)) {
          updateGoalProgress(goal.id, {
            completedDates: [...(goal.completedDates || []), today],
            progress: calculateProgress(goal)
          });
        }
      }
    });
  };

  const calculateProgress = (goal) => {
    switch(goal.type) {
      case 'daily':
        const today = format(new Date(), 'yyyy-MM-dd');
        const completedToday = goal.linkedTasks?.filter(taskId => {
          const task = todos.find(t => t.id === taskId);
          return task?.status === 'COMPLETED' && 
                 task?.completedAt?.startsWith(today);
        }).length || 0;
        return Math.min(100, (completedToday / (goal.linkedTasks?.length || 1)) * 100);

      case 'weekly':
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        const completedThisWeek = goal.linkedTasks?.filter(taskId => {
          const task = todos.find(t => t.id === taskId);
          return task?.status === 'COMPLETED' &&
                 isWithinInterval(parseISO(task.completedAt), { start: weekStart, end: weekEnd });
        }).length || 0;
        return Math.min(100, (completedThisWeek / (goal.target || 1)) * 100);

      default:
        return goal.progress || 0;
    }
  };

  const updateGoalProgress = async (id, updates) => {
    try {
      await goalApi.updateGoal(id, updates);
      fetchGoals(); // Refresh goals
    } catch (error) {
      console.error('Failed to update goal progress:', error);
    }
  };

  const createGoal = async () => {
    if (!formData.title.trim() || !formData.target) {
      taskToast.error('Please fill in all required fields');
      return;
    }

    try {
      const goalData = {
        ...formData,
        target: parseInt(formData.target),
        progress: 0,
        createdAt: new Date().toISOString(),
        completedDates: []
      };

      const response = await goalApi.createGoal(goalData);
      setGoals(prev => [...prev, response]);
      setShowCreateModal(false);
      resetForm();
      taskToast.success('Goal created successfully');

      // Schedule reminders
      if (formData.reminder) {
        scheduleGoalReminders(response);
      }
    } catch (error) {
      console.error('Failed to create goal:', error);
      taskToast.error('Failed to create goal');
    }
  };

  const updateGoal = async () => {
    if (!editingGoal) return;

    try {
      const response = await goalApi.updateGoal(editingGoal.id, formData);
      setGoals(prev => prev.map(g => g.id === editingGoal.id ? response : g));
      setEditingGoal(null);
      setShowCreateModal(false);
      resetForm();
      taskToast.success('Goal updated successfully');
    } catch (error) {
      console.error('Failed to update goal:', error);
      taskToast.error('Failed to update goal');
    }
  };

  const deleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;

    try {
      await goalApi.deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      taskToast.success('Goal deleted');
    } catch (error) {
      console.error('Failed to delete goal:', error);
      taskToast.error('Failed to delete goal');
    }
  };

  const scheduleGoalReminders = (goal) => {
    // Schedule daily reminder
    if (goal.reminder && goal.reminderTime) {
      const [hours, minutes] = goal.reminderTime.split(':');
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0);

      if (reminderTime > now) {
        setTimeout(() => {
          taskToast.custom((t) => (
            <div className="bg-slate-800 text-white px-4 py-3 rounded-lg shadow-xl border border-purple-500/30">
              <div className="flex items-center gap-3">
                <Target className="text-purple-400" size={20} />
                <div>
                  <p className="font-medium">Daily Goal Reminder</p>
                  <p className="text-sm text-slate-300">
                    Don't forget your goal: {goal.title}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Progress: {goal.progress}% complete
                  </p>
                </div>
              </div>
            </div>
          ), { duration: 10000 });
        }, reminderTime - now);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'daily',
      target: '',
      unit: 'tasks',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(addDays(new Date(), 7), 'yyyy-MM-dd'),
      linkedTasks: [],
      priority: 'medium',
      color: '#8b5cf6',
      reminder: false,
      reminderTime: '09:00'
    });
  };

  const getGoalTypeColor = (type) => {
    const colors = {
      daily: 'bg-blue-500/20 text-blue-400',
      weekly: 'bg-purple-500/20 text-purple-400',
      monthly: 'bg-green-500/20 text-green-400',
      custom: 'bg-orange-500/20 text-orange-400'
    };
    return colors[type] || colors.daily;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Target className="text-purple-400" size={24} />
            Goal Tracker
          </h2>
          <button
            onClick={() => {
              setEditingGoal(null);
              resetForm();
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
          >
            <Plus size={18} />
            New Goal
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-3">
          <div className="bg-slate-700/30 rounded-xl p-3">
            <p className="text-xs text-slate-400">Active Goals</p>
            <p className="text-2xl font-bold text-white">{stats.totalGoals}</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <p className="text-xs text-slate-400">Completed</p>
            <p className="text-2xl font-bold text-green-400">{stats.completedGoals}</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <p className="text-xs text-slate-400">In Progress</p>
            <p className="text-2xl font-bold text-yellow-400">{stats.inProgress}</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <div className="flex items-center gap-1">
              <Flame size={14} className="text-orange-400" />
              <p className="text-xs text-slate-400">Streak</p>
            </div>
            <p className="text-2xl font-bold text-orange-400">{stats.streak} days</p>
          </div>
          <div className="bg-slate-700/30 rounded-xl p-3">
            <p className="text-xs text-slate-400">Consistency</p>
            <p className="text-2xl font-bold text-purple-400">{stats.consistency}%</p>
          </div>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mt-4">
          {['day', 'week', 'month', 'year'].map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${
                selectedPeriod === period
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {goals
          .filter(goal => {
            // Filter by period
            if (selectedPeriod === 'day') return goal.type === 'daily';
            if (selectedPeriod === 'week') return goal.type === 'weekly';
            if (selectedPeriod === 'month') return goal.type === 'monthly';
            return true;
          })
          .map(goal => (
            <div
              key={goal.id}
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all"
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
                      <p className="text-sm text-slate-400 mb-3">{goal.description}</p>
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
                          const task = todos.find(t => t.id === taskId);
                          if (!task) return null;
                          
                          return (
                            <div key={taskId} className="flex items-center gap-2 text-xs">
                              <div className={`w-2 h-2 rounded-full ${
                                task.status === 'COMPLETED' ? 'bg-green-400' : 'bg-yellow-400'
                              }`} />
                              <span className={task.status === 'COMPLETED' ? 'text-green-400' : 'text-slate-300'}>
                                {task.title}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingGoal(goal);
                      setFormData({
                        title: goal.title,
                        description: goal.description || '',
                        type: goal.type,
                        target: goal.target,
                        unit: goal.unit,
                        startDate: goal.startDate,
                        endDate: goal.endDate,
                        linkedTasks: goal.linkedTasks || [],
                        priority: goal.priority,
                        color: goal.color,
                        reminder: goal.reminder || false,
                        reminderTime: goal.reminderTime || '09:00'
                      });
                      setShowCreateModal(true);
                    }}
                    className="p-2 hover:bg-slate-700 rounded-lg"
                  >
                    <Edit2 size={16} className="text-slate-400" />
                  </button>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-2 hover:bg-slate-700 rounded-lg"
                  >
                    <Trash2 size={16} className="text-red-400" />
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
          ))}

        {goals.length === 0 && (
          <div className="text-center py-12 bg-slate-800/30 rounded-2xl">
            <Target size={48} className="mx-auto text-slate-600 mb-3" />
            <p className="text-slate-400 mb-4">No goals set yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-purple-400 hover:text-purple-300"
            >
              Create your first goal
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-2xl p-6 w-full max-w-md border border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingGoal ? 'Edit Goal' : 'Create New Goal'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingGoal(null);
                  resetForm();
                }}
                className="p-1 hover:bg-slate-700 rounded"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Goal title *"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                autoFocus
              />

              <textarea
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="2"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Goal Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Target</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                    placeholder="e.g., 5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  placeholder="e.g., tasks, hours, pages"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">End Date</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Link to Tasks</label>
                <select
                  multiple
                  value={formData.linkedTasks}
                  onChange={(e) => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setFormData({ ...formData, linkedTasks: selected });
                  }}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-xl text-white h-32"
                >
                  {todos.map(todo => (
                    <option key={todo.id} value={todo.id}>{todo.title}</option>
                  ))}
                </select>
                <p className="text-xs text-slate-400 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="reminder"
                  checked={formData.reminder}
                  onChange={(e) => setFormData({ ...formData, reminder: e.target.checked })}
                  className="rounded border-slate-600"
                />
                <label htmlFor="reminder" className="text-sm text-slate-300">
                  Set daily reminder
                </label>
                
                {formData.reminder && (
                  <input
                    type="time"
                    value={formData.reminderTime}
                    onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
                    className="ml-2 px-2 py-1 bg-slate-700 border border-slate-600 rounded-lg text-sm text-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Color</label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-full h-10 bg-slate-700 border border-slate-600 rounded-xl cursor-pointer"
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingGoal(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-slate-400 hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={editingGoal ? updateGoal : createGoal}
                  disabled={!formData.title.trim() || !formData.target}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={16} />
                  {editingGoal ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalTracker;
