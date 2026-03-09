import { useState, useEffect } from 'react';
import { goalApi } from '../api/goalApi';
import { taskToast } from '@/shared/components/QuantumToaster';

export const useGoals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const data = await goalApi.getGoals();
      setGoals(data);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Failed to fetch goals:', err);
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData) => {
    try {
      const newGoal = await goalApi.createGoal(goalData);
      setGoals(prev => [...prev, newGoal]);
      taskToast.success('Goal created successfully');
      return newGoal;
    } catch (err) {
      taskToast.error('Failed to create goal');
      throw err;
    }
  };

  const updateGoal = async (id, goalData) => {
    try {
      const updated = await goalApi.updateGoal(id, goalData);
      setGoals(prev => prev.map(g => g.id === id ? updated : g));
      taskToast.success('Goal updated');
      return updated;
    } catch (err) {
      taskToast.error('Failed to update goal');
      throw err;
    }
  };

  const deleteGoal = async (id) => {
    try {
      await goalApi.deleteGoal(id);
      setGoals(prev => prev.filter(g => g.id !== id));
      taskToast.success('Goal deleted');
    } catch (err) {
      taskToast.error('Failed to delete goal');
      throw err;
    }
  };

  const getGoalProgress = async (id) => {
    try {
      return await goalApi.getGoalProgress(id);
    } catch (err) {
      console.error('Failed to get goal progress:', err);
      return null;
    }
  };

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    getGoalProgress,
    refreshGoals: fetchGoals
  };
};
