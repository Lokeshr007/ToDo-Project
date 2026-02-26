// D:\AllProjects\ToDoProject\frontend-todo\frontend-todo\src\features\ai-assistant\hooks\useSmartScheduler.js
import { useState, useCallback, useEffect, useMemo } from 'react';
import { smartScheduler } from '../utils/smartScheduler';
import { addDays, format, differenceInDays } from 'date-fns';
import toast from 'react-hot-toast';

export const useSmartScheduler = (initialTasks = [], initialPreferences = {}) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [preferences, setPreferences] = useState(initialPreferences);
  const [schedule, setSchedule] = useState(null);
  const [optimizedTasks, setOptimizedTasks] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (tasks.length > 0) {
      analyzeSchedule();
    }
  }, [tasks, preferences]);

  const analyzeSchedule = useCallback(() => {
    setLoading(true);
    
    try {
      // Create optimal schedule
      const optimalSchedule = smartScheduler.createOptimalSchedule(tasks, preferences);
      setSchedule(optimalSchedule);

      // Optimize task order
      const optimized = smartScheduler.optimizeTaskOrder(tasks);
      setOptimizedTasks(optimized);

      // Detect conflicts
      const detectedConflicts = smartScheduler.detectConflicts(tasks);
      setConflicts(detectedConflicts);

      // Generate suggestions
      const optimizationSuggestions = smartScheduler.suggestOptimizations(tasks, preferences);
      setSuggestions(optimizationSuggestions);
    } catch (error) {
      console.error('Failed to analyze schedule:', error);
      toast.error('Failed to analyze schedule');
    } finally {
      setLoading(false);
    }
  }, [tasks, preferences]);

  const addTask = useCallback((task) => {
    setTasks(prev => [...prev, { ...task, id: task.id || `task-${Date.now()}` }]);
    toast.success('Task added to schedule');
  }, []);

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId || task.title === taskId 
        ? { ...task, ...updates } 
        : task
    ));
    toast.success('Task updated');
  }, []);

  const removeTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(task => 
      task.id !== taskId && task.title !== taskId
    ));
    toast.success('Task removed from schedule');
  }, []);

  const rescheduleTask = useCallback((taskId, newDate, newTime) => {
    const updated = smartScheduler.rescheduleTask(tasks, taskId, newDate, newTime);
    setTasks(updated);
    toast.success('Task rescheduled');
    return updated;
  }, [tasks]);

  const balanceWorkload = useCallback(() => {
    const balanced = smartScheduler.balanceWorkload(tasks, preferences.dailyHours || 4);
    setTasks(balanced);
    toast.success('Workload balanced across days');
    return balanced;
  }, [tasks, preferences]);

  const applySuggestion = useCallback((suggestion) => {
    const updated = smartScheduler.applySuggestion(tasks, suggestion);
    setTasks(updated);
    toast.success('Suggestion applied');
    return updated;
  }, [tasks]);

  const getDailyTasks = useCallback((date) => {
    return smartScheduler.getDailySchedule(tasks, date);
  }, [tasks]);

  const getWeeklyTasks = useCallback((startDate) => {
    return smartScheduler.getWeeklySchedule(tasks, startDate);
  }, [tasks]);

  const getProductiveHours = useCallback((day) => {
    return smartScheduler.suggestProductiveHours(day, preferences);
  }, [preferences]);

  const getBreaks = useCallback((dailyTasks) => {
    return smartScheduler.calculateOptimalBreaks(dailyTasks);
  }, []);

  const exportSchedule = useCallback((format = 'ical') => {
    return smartScheduler.exportSchedule(tasks, format);
  }, [tasks]);

  const updatePreferences = useCallback((newPreferences) => {
    setPreferences(prev => ({ ...prev, ...newPreferences }));
    toast.success('Preferences updated');
  }, []);

  const clearSchedule = useCallback(() => {
    setTasks([]);
    setSchedule(null);
    setOptimizedTasks([]);
    setConflicts([]);
    setSuggestions([]);
    toast.success('Schedule cleared');
  }, []);

  const getTaskStats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const pending = total - completed - inProgress;
    const totalHours = tasks.reduce((sum, t) => sum + (t.estimatedHours || 0), 0);
    
    return {
      total,
      completed,
      inProgress,
      pending,
      totalHours,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      averageHours: total > 0 ? totalHours / total : 0
    };
  }, [tasks]);

  const getUpcomingTasks = useMemo(() => {
    const today = new Date();
    const todayNum = 1; // Day 1
    
    return tasks
      .filter(t => (t.dayNumber || 1) >= todayNum)
      .sort((a, b) => (a.dayNumber || 1) - (b.dayNumber || 1))
      .slice(0, 5);
  }, [tasks]);

  const getOverdueTasks = useMemo(() => {
    const today = new Date();
    const todayNum = 1;
    
    return tasks.filter(t => 
      (t.dayNumber || 1) < todayNum && 
      t.status !== 'COMPLETED'
    );
  }, [tasks]);

  return {
    // State
    tasks,
    optimizedTasks,
    schedule,
    conflicts,
    suggestions,
    loading,
    selectedDate,
    
    // Stats
    taskStats: getTaskStats,
    upcomingTasks: getUpcomingTasks,
    overdueTasks: getOverdueTasks,
    
    // Actions
    addTask,
    updateTask,
    removeTask,
    rescheduleTask,
    balanceWorkload,
    applySuggestion,
    updatePreferences,
    clearSchedule,
    
    // Getters
    getDailyTasks,
    getWeeklyTasks,
    getProductiveHours,
    getBreaks,
    
    // Export
    exportSchedule,
    
    // Setters
    setSelectedDate,
    setTasks,
    setPreferences
  };
};