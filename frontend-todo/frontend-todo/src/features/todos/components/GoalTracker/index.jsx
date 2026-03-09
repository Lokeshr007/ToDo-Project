import React, { useState, useEffect, useCallback } from 'react';
import { Target, Plus } from 'lucide-react';
import { format, addDays, subDays, isBefore, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { goalApi } from '../../api/goalApi';
import { todoApi } from '@/services/api/todoApi';
import { taskToast } from '@/shared/components/QuantumToaster';

import GoalStats from './GoalStats';
import GoalItem from './GoalItem';
import GoalModal from './GoalModal';

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

  const fetchGoals = useCallback(async () => {
    try {
      const data = await goalApi.getGoals();
      setGoals(data);
    } catch (error) {
      console.error('Failed to fetch goals:', error);
      taskToast.error('Failed to load goals');
    }
  }, []);

  const fetchTodos = useCallback(async () => {
    try {
      const data = await todoApi.getTodos();
      setTodos(data);
    } catch (error) {
      console.error('Failed to fetch todos:', error);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
    fetchTodos();
  }, [fetchGoals, fetchTodos]);

  useEffect(() => {
    calculateStats();
    checkGoalProgress();
  }, [goals, todos]);

  const calculateStats = () => {
    const now = new Date();
    const activeGoals = goals.filter(g => 
      isBefore(now, parseISO(g.endDate)) || format(now, 'yyyy-MM-dd') === g.endDate
    );

    const completed = goals.filter(g => g.progress >= 100).length;
    const inProgress = goals.filter(g => g.progress > 0 && g.progress < 100).length;

    let streak = 0;
    const today = format(now, 'yyyy-MM-dd');
    const dailyGoals = goals.filter(g => g.type === 'daily');
    
    if (dailyGoals.length > 0) {
      const allCompletedToday = dailyGoals.every(g => 
        g.completedDates?.includes(today)
      );
      
      if (allCompletedToday) {
        streak = 1;
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
          const task = todos.find(t => String(t.id) === String(taskId));
          return task?.status === 'COMPLETED' && 
                 task?.completedAt?.startsWith(today);
        });

        if (completedToday && !goal.completedDates?.includes(today)) {
          updateGoalProgress(goal.id, {
            completedDates: [...(goal.completedDates || []), today],
            progress: calculateProgress({ ...goal, completedDates: [...(goal.completedDates || []), today] })
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
          const task = todos.find(t => String(t.id) === String(taskId));
          return task?.status === 'COMPLETED' && 
                 task?.completedAt?.startsWith(today);
        }).length || 0;
        return Math.min(100, (completedToday / (goal.linkedTasks?.length || 1)) * 100);

      case 'weekly':
        const weekStart = startOfWeek(new Date());
        const weekEnd = endOfWeek(new Date());
        const completedThisWeek = goal.linkedTasks?.filter(taskId => {
          const task = todos.find(t => String(t.id) === String(taskId));
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
      fetchGoals();
    } catch (error) {
      console.error('Failed to update goal progress:', error);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.target) {
      taskToast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingGoal) {
        const response = await goalApi.updateGoal(editingGoal.id, formData);
        setGoals(prev => prev.map(g => g.id === editingGoal.id ? response : g));
        taskToast.success('Goal updated successfully');
      } else {
        const goalData = {
          ...formData,
          target: parseInt(formData.target),
          progress: 0,
          createdAt: new Date().toISOString(),
          completedDates: []
        };
        const response = await goalApi.createGoal(goalData);
        setGoals(prev => [...prev, response]);
        taskToast.success('Goal created successfully');
      }
      setShowCreateModal(false);
      setEditingGoal(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save goal:', error);
      taskToast.error('Failed to save goal');
    }
  };

  const handleDelete = async (id) => {
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
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Section */}
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/20 rounded-xl border border-purple-500/30">
              <Target className="text-purple-400" size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Goal Tracker</h2>
              <p className="text-sm text-slate-400">Track and achieve your milestones</p>
            </div>
          </div>
          <button
            onClick={() => {
              setEditingGoal(null);
              resetForm();
              setShowCreateModal(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-900/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={20} />
            New Goal
          </button>
        </div>

        <GoalStats stats={stats} />

        {/* Period Filter */}
        <div className="flex flex-wrap gap-2 mt-8 p-1.5 bg-slate-900/50 rounded-xl w-fit border border-slate-700/50">
          {['day', 'week', 'month', 'year'].map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                selectedPeriod === period
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 gap-4">
        {goals
          .filter(goal => {
            if (selectedPeriod === 'day') return goal.type === 'daily';
            if (selectedPeriod === 'week') return goal.type === 'weekly';
            if (selectedPeriod === 'month') return goal.type === 'monthly';
            return true;
          })
          .map(goal => (
            <GoalItem
              key={goal.id}
              goal={goal}
              todos={todos}
              getGoalTypeColor={getGoalTypeColor}
              onEdit={(g) => {
                setEditingGoal(g);
                setFormData({
                  title: g.title,
                  description: g.description || '',
                  type: g.type,
                  target: g.target,
                  unit: g.unit,
                  startDate: g.startDate,
                  endDate: g.endDate,
                  linkedTasks: g.linkedTasks || [],
                  priority: g.priority,
                  color: g.color,
                  reminder: g.reminder || false,
                  reminderTime: g.reminderTime || '09:00'
                });
                setShowCreateModal(true);
              }}
              onDelete={handleDelete}
            />
          ))}

        {goals.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
            <div className="p-4 bg-slate-800 rounded-full mb-4">
              <Target size={40} className="text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium mb-1">No goals set yet</p>
            <p className="text-xs text-slate-500 mb-6">Start setting milestones to track your progress</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-purple-400 hover:text-purple-300 font-bold text-sm underline-offset-4 hover:underline"
            >
              Create your first goal
            </button>
          </div>
        )}
      </div>

      <GoalModal
        show={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingGoal(null);
          resetForm();
        }}
        editingGoal={editingGoal}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        todos={todos}
      />
    </div>
  );
};

export default GoalTracker;
