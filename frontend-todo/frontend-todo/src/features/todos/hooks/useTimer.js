import { useState, useEffect, useCallback } from 'react';
import API from '@/services/api';
import { taskToast } from '@/shared/components/QuantumToaster';

export const useTimer = () => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [loading, setLoading] = useState(false);

  // Check for active timer on mount
  useEffect(() => {
    checkActiveTimer();
  }, []);

  // Update elapsed time every second when timer is active
  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        if (activeTimer.startTime) {
          const start = new Date(activeTimer.startTime).getTime();
          const now = new Date().getTime();
          const elapsed = Math.floor((now - start) / 1000); // seconds
          setElapsedTime(elapsed);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  const checkActiveTimer = useCallback(async () => {
    try {
      const response = await API.get('/todos/time/active');
      if (response.data) {
        setActiveTimer(response.data);
      } else {
        setActiveTimer(null);
        setElapsedTime(0);
      }
    } catch (error) {
      console.error('Failed to check active timer:', error);
      setActiveTimer(null);
      setElapsedTime(0);
    }
  }, []);

  const startTimer = useCallback(async (todoId) => {
    setLoading(true);
    try {
      const response = await API.post(`/todos/${todoId}/time/start`);
      setActiveTimer(response.data);
      taskToast.success('Timer started');
      return response.data;
    } catch (error) {
      console.error('Failed to start timer:', error);
      taskToast.error(error.response?.data?.error || 'Failed to start timer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const stopTimer = useCallback(async (onSuccess) => {
    if (!activeTimer || !activeTimer.id) {
      console.error("No active timer or timer ID is missing");
      taskToast.error("No active timer found");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Stopping timer with ID:", activeTimer.id); // Debug log
      const response = await API.post(`/todos/time/${activeTimer.id}/stop`);
      setActiveTimer(null);
      setElapsedTime(0);
      taskToast.success('Timer stopped');
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Failed to stop timer:', error);
      console.error('Error response:', error.response?.data); // Debug log
      taskToast.error(error.response?.data?.error || 'Failed to stop timer');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [activeTimer]);

  return {
    activeTimer,
    elapsedTime,
    loading,
    startTimer,
    stopTimer,
    checkActiveTimer
  };
};
